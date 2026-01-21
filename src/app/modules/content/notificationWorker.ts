import { Worker, Job } from 'bullmq';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { Campaign } from '../campaign/campaign.model';
import { Content } from './content.model';
import { scheduleQueue } from '../../../utils/scheduleQueue';
import redisConnection from '../../../config/redis';
import sendSMS from '../../../shared/sendSMS';
import { Types } from 'mongoose';
import { query } from 'winston';
import { CampaignStatus } from '../campaign/campaign.enum';


// notificationWorker.ts

export const startNotificationWorker = () => {
    const worker = new Worker(
        'scheduleQueue',
        async (job: Job) => {
            const now = new Date();
            // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            // console.log(`⏰ JOB TRIGGERED AT: ${now.toLocaleString('en-US', {
            //     timeZone: 'Asia/Dhaka',
            //     year: 'numeric',
            //     month: 'long',
            //     day: 'numeric',
            //     hour: '2-digit',
            //     minute: '2-digit',
            //     second: '2-digit'
            // })}`);
            // console.log(`📬 Processing Job: ${job.name}`);
            // console.log(`🆔 Job ID: ${job.id}`);
            // console.log(`📊 Job Data:`, JSON.stringify(job.data, null, 2));
            // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            try {
                switch (job.name) {
                    case 'sendProgressAlert':
                        await handleProgressAlert(job.data);
                        break;

                    case 'checkLowProgress':
                        await handleLowProgressWarning();
                        break;

                    case 'checkExpiredCampaigns':
                        await handleExpiredCampaigns();
                        break;

                    case 'sendMilestoneAlert':
                        await handleMilestoneAlert(job.data);
                        break;

                    default:
                        console.log(`❓ Unknown job: ${job.name}`);
                }

                console.log(`✅ Job ${job.name} completed successfully at ${new Date().toLocaleTimeString()}`);

            } catch (error) {
                console.error(`❌ Job ${job.name} failed:`, error);
                throw error;
            }
        },
        {
            connection: redisConnection,
            concurrency: 5,
        }
    );

    worker.on('completed', (job) => {
        console.log(`✅✅✅ Job ${job.id} (${job.name}) COMPLETED at ${new Date().toLocaleString()}`);
    });

    worker.on('failed', (job, err) => {
        console.error(`❌❌❌ Job ${job?.id} (${job?.name}) FAILED at ${new Date().toLocaleString()}:`, err.message);
    });

    console.log('🔄 Notification worker started and listening...');
    return worker;
};

// ============ Handlers ============
async function handleProgressAlert(data: any) {
    const { message, campaignId } = data;

    // 🔹 Build base query
    const query: any = {
        campaignStatus: CampaignStatus.ACTIVE,
        endDate: { $gt: new Date() },
        isDeleted: false,
    };

    // 🔹 If specific campaign selected
    if (campaignId) {
        if (!Types.ObjectId.isValid(campaignId)) {
            return;
        }
        query._id = new Types.ObjectId(campaignId);
    }


    // 🔹 Fetch campaigns
    const campaigns = await Campaign.find(query).populate('createdBy');

    if (!campaigns.length) {
        return;
    }

    // 🔹 Loop through campaigns
    for (const campaign of campaigns) {
        if (!campaign.targetAmount || !campaign.overall_raised) {
            continue;
        }

        // ✅ Correct progress calculation
        const progress =
            (campaign.overall_raised / campaign.targetAmount) * 100;

        const finalMessage = message.replace(
            '{progress}',
            progress.toFixed(1)
        );

        // 🔹 Send SMS
        if (campaign.contactPerson_phone) {
            try {
                await sendSMS(campaign.contactPerson_phone, finalMessage);
            } catch (error) {
                console.error(
                    `❌ Failed to send SMS to ${campaign.contactPerson_phone}:`,
                    error
                );
            }
        } else {
            console.log(`⚠️ No contact phone for campaign: ${campaign.title}`);
        }

        // 🔹 Send in-app notification
        if (campaign.createdBy?._id) {
            await sendNotifications({
                userId: campaign.createdBy._id,
                type: 'PROGRESS_ALERT',
                title: 'Campaign Progress Update',
                message: finalMessage,
                data: {
                    campaignId: campaign._id,
                    progress: progress.toFixed(1),
                },
            });
        }
    }

    console.log(`✅ Sent progress alerts for ${campaigns.length} campaign(s)`);
}

async function handleLowProgressWarning() {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const campaigns = await Campaign.find({
        campaignStatus: 'active',
        endDate: {
            $gte: new Date(),
            $lte: oneWeekFromNow
        }
    }).populate('createdBy');

    let warningCount = 0;
    for (const campaign of campaigns) {
        const progress = (campaign.currentAmount / campaign.goalAmount) * 100;

        if (progress < 25) {
            await sendNotifications({
                userId: campaign.createdBy._id,
                type: 'LOW_PROGRESS_WARNING',
                title: '⚠️ Low Campaign Progress',
                message: `"${campaign.title}" is below 25% with 1 week left`,
                data: { campaignId: campaign._id, progress }
            });
            warningCount++;
        }
    }

    console.log(`⚠️ Sent ${warningCount} low progress warnings`);
}

async function handleExpiredCampaigns() {
    const campaigns = await Campaign.find({
        status: 'active',
        endDate: { $lt: new Date() }
    }).populate('createdBy');

    for (const campaign of campaigns) {
        await Campaign.findByIdAndUpdate(campaign._id, { status: 'expired' });

        await sendNotifications({
            userId: campaign.createdBy._id,
            type: 'CAMPAIGN_EXPIRED',
            title: '⏰ Campaign Expired',
            message: `"${campaign.title}" has ended`,
            data: { campaignId: campaign._id }
        });
    }

    console.log(`⏰ ${campaigns.length} campaigns expired`);
}

// Milestone trigger (call from donation handler)
export async function triggerMilestoneAlert(
    campaignId: string,
    milestone: number
) {
    await scheduleQueue.add('sendMilestoneAlert', {
        campaignId,
        milestone
    });
}

async function handleMilestoneAlert(data: any) {
    const { campaignId, milestone } = data;
    const content = await Content.findOne();

    const campaign = await Campaign.findById(campaignId).populate('createdBy');
    if (!campaign) return;

    await sendNotifications({
        userId: campaign.createdBy._id,
        type: 'MILESTONE_ALERT',
        title: '🎉 Milestone Reached!',
        message: content?.notificationStrategy.mileStoneAlertMessage
            .replace('{milestone}', milestone.toString()) ||
            `Congratulations! ${milestone}% achieved!`,
        data: { campaignId, milestone }
    });

    console.log(`🎉 Milestone ${milestone}% for ${campaignId}`);
}