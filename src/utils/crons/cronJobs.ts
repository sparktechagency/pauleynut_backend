// import cron from 'node-cron';
// import { User } from '../../app/modules/user/user.model';
// import figlet from 'figlet';
// import chalk from 'chalk';
// import { Content } from '../../app/modules/content/content.model';
// import { Campaign } from '../../app/modules/campaign/campaign.model';
// import { Transaction } from '../../app/modules/Transaction/Transaction.model';
// import { USER_ROLES } from '../../enums/user';
// import sendSMS from '../../shared/sendSMS';
// // ====== CRON JOB SCHEDULERS ======

// const scheduleExpireNotification = () => {
//      // Run every minute for testing, adjust for your needs (e.g., '0 9 * * *' for 9 AM daily)
//      cron.schedule('*/1 * * * *', async () => {
//           try {
//                console.log('🔔 Checking for campaigns expiring within 24 hours...');

//                const now = new Date();
//                const tomorrow = new Date(now);
//                tomorrow.setDate(tomorrow.getDate() + 1); // 24 hours from now
//                tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

//                const notificationStrategy = await Content.findOne().select('notificationStrategy').lean();
//                if (!notificationStrategy) {
//                     console.log('❌ Notification strategy not found');
//                     return;
//                }

//                if (notificationStrategy?.notificationStrategy?.campaignExpiredAlert) {
//                     // Find campaigns expiring within the next 24 hours
//                     const expiredCampaigns = await Campaign.find({
//                          campaignStatus: 'active',
//                          endDate: { $lte: tomorrow, $gte: now }, // Expiring within 24 hours
//                     })
//                          .select('title contactPerson_phone endDate _id')
//                          .lean();

//                     if (expiredCampaigns.length === 0) {
//                          console.log('❌ No campaigns expiring within the next 24 hours');
//                          return;
//                     }

//                     console.log(`📧 Found ${expiredCampaigns.length} campaigns expiring within 24 hours`);

//                     // Get all donors for these campaigns
//                     const campaignIds = expiredCampaigns.map((campaign) => campaign._id);
//                     const donorsOfTheCampaign = await Transaction.find({
//                          campaignId: { $in: campaignIds },
//                     })
//                          .select('donorPhone campaignId')
//                          .lean();

//                     // Group donors by campaignId for easy lookup
//                     const donorsByCampaign = donorsOfTheCampaign.reduce<{ [key: string]: string[] }>((acc, transaction) => {
//                          const campaignId = transaction.campaignId.toString();
//                          if (!acc[campaignId]) {
//                               acc[campaignId] = [];
//                          }
//                          acc[campaignId].push(transaction.donorPhone);
//                          return acc;
//                     }, {});

//                     // Prepare messages for campaign contacts and donors
//                     const messagesToSend = [];

//                     // Send messages to contact persons (they need to know about their campaigns)
//                     for (const campaign of expiredCampaigns) {
//                          const message = `⚠️ Your campaign "${campaign.title}" is expiring soon! Please take action before it ends.`;
//                          messagesToSend.push({
//                               phone: campaign.contactPerson_phone,
//                               message,
//                          });
//                     }

//                     // Send messages to donors (they need to know about campaigns they donated to)
//                     for (const campaign of expiredCampaigns) {
//                          const donors = donorsByCampaign[campaign._id.toString()];
//                          if (donors) {
//                               const message = `⚠️ The campaign "${campaign.title}" you donated to is expiring soon! Please take action before it ends.`;
//                               donors.forEach((donorPhone) => {
//                                    messagesToSend.push({
//                                         phone: donorPhone,
//                                         message,
//                                    });
//                               });
//                          }
//                     }

//                     // Include admins with a message listing all expired campaign names
//                     interface IAdminUser {
//                          _id: any;
//                          phone?: string;
//                     }

//                     const adminUsers: IAdminUser[] = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } })
//                          .select('phone')
//                          .lean();
//                     if (adminUsers.length > 0) {
//                          const expiredCampaignNames = expiredCampaigns.map((campaign) => `- ${campaign.title}`).join('\n');
//                          const adminMessage = `⚠️ The following campaigns are expiring soon:\n${expiredCampaignNames}\n\nPlease review and take necessary actions.`;

//                          adminUsers.forEach((admin) => {
//                               if (admin.phone) {
//                                    messagesToSend.push({
//                                         phone: admin.phone,
//                                         message: adminMessage,
//                                    });
//                               }
//                          });
//                     }

//                     // Send SMS to all recipients (both contacts and donors)
//                     for (const { phone, message } of messagesToSend) {
//                          await sendSMS(phone, message); // Assuming sendSMS is an SMS sending function
//                          console.log(`📲 Sent SMS to ${phone}: ${message}`);
//                     }

//                     console.log('✅ Campaign expired alert sent to relevant recipients');
//                }
//           } catch (error) {
//                console.error('❌ Error in campaign expired check:', error);
//           }
//      });
// };

// const scheduleLowProgressWarning = () => {
//      // Run every day at 10 AM
//      cron.schedule('0 10 * * *', async () => {
//           try {
//                console.log('🔔 Checking for campaigns with low progress and 1 week left...');

//                const now = new Date();
//                const oneWeekFromNow = new Date(now);
//                oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7); // 1 week from now
//                oneWeekFromNow.setHours(23, 59, 59, 999); // End of the 1 week from now

//                const notificationStrategy = await Content.findOne().select('notificationStrategy').lean();
//                if (!notificationStrategy) {
//                     console.log('❌ Notification strategy not found');
//                     return;
//                }

//                if (notificationStrategy?.notificationStrategy?.lowProgressWarning) {
//                     const campaigns = await Campaign.find({
//                          campaignStatus: 'active',
//                          endDate: { $lte: oneWeekFromNow, $gte: now },
//                     })
//                          .select('title contactPerson_phone endDate _id targetAmount overall_raised')
//                          .lean();

//                     // Find campaigns with less than 25% progress and ending within 1 week

//                     const lowProgressCampaigns = campaigns
//                          .map((campaign) => {
//                               const progress = campaign.targetAmount > 0 ? Math.round((campaign.overall_raised / campaign.targetAmount) * 100) : 0;

//                               return {
//                                    ...campaign,
//                                    progress,
//                               };
//                          })
//                          .filter((campaign) => campaign.progress < 25);

//                     if (lowProgressCampaigns.length === 0) {
//                          console.log('❌ No campaigns with low progress and ending within 1 week');
//                          return;
//                     }

//                     console.log(`📧 Found ${lowProgressCampaigns.length} campaigns with low progress`);

//                     // Get all donors for these campaigns
//                     const campaignIds = lowProgressCampaigns.map((campaign) => campaign._id);
//                     const donorsOfTheCampaign = await Transaction.find({
//                          campaignId: { $in: campaignIds },
//                     })
//                          .select('donorPhone campaignId')
//                          .lean();

//                     // Group donors by campaignId for easy lookup
//                     const donorsByCampaign = donorsOfTheCampaign.reduce<{ [key: string]: string[] }>((acc, transaction) => {
//                          const campaignId = transaction.campaignId.toString();
//                          if (!acc[campaignId]) {
//                               acc[campaignId] = [];
//                          }
//                          acc[campaignId].push(transaction.donorPhone);
//                          return acc;
//                     }, {});

//                     // Prepare messages for campaign contacts and donors
//                     const messagesToSend = [];

//                     // Send messages to contact persons (they need to know about their campaigns)
//                     for (const campaign of lowProgressCampaigns) {
//                          const message = `⚠️ Your campaign "${campaign.title}" has low progress (${campaign.progress}%) and is ending soon! Please take action to improve its performance.`;
//                          messagesToSend.push({
//                               phone: campaign.contactPerson_phone,
//                               message,
//                          });
//                     }

//                     // Send messages to donors (they need to know about campaigns they donated to)
//                     for (const campaign of lowProgressCampaigns) {
//                          const donors = donorsByCampaign[campaign._id.toString()];
//                          if (donors) {
//                               const message = `⚠️ The campaign "${campaign.title}" you donated to has low progress (${campaign.progress}%) and is ending soon! Please consider supporting it further.`;
//                               donors.forEach((donorPhone) => {
//                                    messagesToSend.push({
//                                         phone: donorPhone,
//                                         message,
//                                    });
//                               });
//                          }
//                     }

//                     // Include admins with a message listing all low progress campaign names
//                     interface IAdminUser {
//                          _id: any;
//                          phone?: string;
//                     }

//                     const adminUsers: IAdminUser[] = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } })
//                          .select('phone')
//                          .lean();
//                     if (adminUsers.length > 0) {
//                          const lowProgressCampaignNames = lowProgressCampaigns.map((campaign) => `- ${campaign.title}`).join('\n');
//                          const adminMessage = `⚠️ The following campaigns have low progress and are ending soon:\n${lowProgressCampaignNames}\n\nPlease review and take necessary actions.`;

//                          adminUsers.forEach((admin) => {
//                               if (admin.phone) {
//                                    messagesToSend.push({
//                                         phone: admin.phone,
//                                         message: adminMessage,
//                                    });
//                               }
//                          });
//                     }

//                     // Send SMS to all recipients (both contacts and donors)
//                     for (const { phone, message } of messagesToSend) {
//                          await sendSMS(phone, message); // Assuming sendSMS is an SMS sending function
//                          console.log(`📲 Sent SMS to ${phone}: ${message}`);
//                     }

//                     console.log('✅ Low progress alert sent to relevant recipients');
//                }
//           } catch (error) {
//                console.error('❌ Error in low progress check:', error);
//           }
//      });
// };

// const scheduleMilestoneAlert = () => {
//      cron.schedule('0 10 * * *', async () => {
//           try {
//                console.log('🏁 Checking campaign milestone (goal reached)...');

//                const notificationStrategy = await Content.findOne().select('notificationStrategy').lean();

//                if (!notificationStrategy?.notificationStrategy?.mileStoneAlert) {
//                     return;
//                }

//                const messageTemplate =
//                     notificationStrategy.notificationStrategy.mileStoneAlertMessage || 'Congratulations! We’ve reached the “{milestone_name}” milestone for the “{campaign_name}” campaign!';

//                // Find campaigns that reached target but not notified yet
//                const campaigns = await Campaign.find({
//                     campaignStatus: 'active',
//                     milestoneNotified: { $ne: true },
//                     $expr: { $gte: ['$overall_raised', '$targetAmount'] },
//                })
//                     .select('title contactPerson_phone overall_raised targetAmount _id')
//                     .lean();

//                if (campaigns.length === 0) {
//                     console.log('❌ No campaigns reached milestone');
//                     return;
//                }

//                const messagesToSend: { phone: string; message: string }[] = [];

//                for (const campaign of campaigns) {
//                     const message = messageTemplate.replace('{milestone_name}', 'Goal Achieved').replace('{campaign_name}', campaign.title);

//                     messagesToSend.push({
//                          phone: campaign.contactPerson_phone,
//                          message,
//                     });
//                }

//                // Send SMS
//                for (const { phone, message } of messagesToSend) {
//                     await sendSMS(phone, message);
//                     console.log(`📲 Milestone SMS sent to ${phone}`);
//                }

//                // Mark campaigns as notified
//                await Campaign.updateMany({ _id: { $in: campaigns.map((c) => c._id) } }, { $set: { milestoneNotified: true } });

//                console.log('✅ Milestone alerts sent successfully');
//           } catch (error) {
//                console.error('❌ Error in milestone alert job:', error);
//           }
//      });
// };

// scheduleExpireNotification();
// scheduleLowProgressWarning();
// scheduleMilestoneAlert();
// // ASCII Art Title
// figlet('OOAAOW', (err, data) => {
//      if (err) {
//           console.log('Something went wrong...');
//           console.dir(err);
//           return;
//      }

//      // Print the title with color
//      console.log(chalk.green(data));

//      // Print version info and system details with color
//      console.log(chalk.cyan('VERSION INFO:'));
//      console.log(chalk.yellow('Template: 1.0'));
//      console.log(chalk.magenta('Node.js: v20.11.1'));
//      console.log(chalk.blue('OS: ubuntu'));
// });
// const setupTimeManagement = () => {
//      console.log('🚀 Setting up trial management cron jobs...');
//      // Start all cron jobs
//      scheduleExpireNotification(); // Daily at 9 AM
// };
// export default setupTimeManagement;
