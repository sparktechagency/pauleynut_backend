import cron from 'node-cron';
import { Content } from '../../app/modules/content/content.model';
import { getCronExpression } from './cron.util';
import { Campaign } from '../../app/modules/campaign/campaign.model';
import sendSMS from '../../shared/sendSMS';

let lastSentAt: Date | null = null;

const shouldSend = (frequency: 'weekly' | 'biweekly' | 'monthly') => {
     if (!lastSentAt) return true;

     const now = new Date();
     const diffDays = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60 * 24);

     if (frequency === 'weekly') return diffDays >= 7;
     if (frequency === 'biweekly') return diffDays >= 14;
     if (frequency === 'monthly') return diffDays >= 30;

     return false;
};

export const scheduleWeeklyProgressAlert = async () => {
     const config = await Content.findOne().select('notificationStrategy').lean();

     if (!config?.notificationStrategy?.progressAlert) return;

     const { progressAlertMessage: weeklyProgressAlertMessage, progressAlertSchedule: weeklyProgressAlertSchedule } = config.notificationStrategy;

     const cronExpression = getCronExpression(weeklyProgressAlertSchedule.frequency, weeklyProgressAlertSchedule.day, 10);

     cron.schedule(cronExpression, async () => {
          try {
               if (!shouldSend(weeklyProgressAlertSchedule.frequency)) return;

               console.log('📊 Sending progress alerts...');

               const campaigns = await Campaign.find({
                    campaignStatus: 'active',
               })
                    .select('title contactPerson_phone overall_raised targetAmount')
                    .lean();

               for (const campaign of campaigns) {
                    const progress = campaign.targetAmount > 0 ? Math.round((campaign.overall_raised / campaign.targetAmount) * 100) : 0;

                    const message = weeklyProgressAlertMessage.replace('{campaign_name}', campaign.title).replace('{progress}', progress.toString());

                    await sendSMS(campaign.contactPerson_phone, message);
               }

               lastSentAt = new Date();
               console.log('✅ Weekly progress alerts sent');
          } catch (error) {
               console.error('❌ Weekly progress alert error:', error);
          }
     });
};
