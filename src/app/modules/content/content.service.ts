import { StatusCodes } from 'http-status-codes';
import { IContent, IContentResponse } from './content.interface';
import { Content } from './content.model';
import AppError from '../../../errors/AppError';
import { FilterQuery } from 'mongoose';
import { Campaign } from '../campaign/campaign.model';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Transaction } from '../Transaction/Transaction.model';
import { InvitationHistory } from '../InvitationHistory/InvitationHistory.model';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from './content.enum';
import { scheduleQueue } from '../../../utils/scheduleQueue';
import { getNextCronTime, getTimeUntil } from '../../../helpers/nextCron';

const getContent = async () => {
     const result = await Content.findOne();

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     return result.toJSON();
};

const upsertContent = async (payload: Partial<IContent>) => {
     try {
          // Find existing content
          const existingContent = await Content.findOne();

          if (!existingContent) {
               const newContent = await Content.create(payload);

               // Setup notification jobs for new content
               if (newContent.notificationStrategy) {
                    await setupNotificationJobs(newContent.notificationStrategy);
               }

               return {
                    data: newContent.toJSON(),
                    isNew: true,
               };
          } else {
               // Merge founder data if it exists in payload
               if (payload.founders && payload.founders.length > 0) {
                    const existingFounder = existingContent.founders?.[0];
                    const newFounder = payload.founders[0];

                    if (existingFounder) {
                         // Merge: keep existing values, only update what's provided in payload
                         payload.founders[0] = {
                              name: newFounder.name || existingFounder.name,
                              role: newFounder.role || existingFounder.role,
                              bio: newFounder.bio || existingFounder.bio,
                              image: newFounder.image || existingFounder.image,
                         };
                    }
               }

               const updatedContent = await Content.findByIdAndUpdate(existingContent._id, payload, { new: true, runValidators: true });

               // If notification strategy updated, refresh jobs
               if (payload.notificationStrategy && updatedContent) {
                    await removeExistingNotificationJobs();
                    await setupNotificationJobs(updatedContent.notificationStrategy);
               }

               return {
                    data: updatedContent?.toJSON(),
                    isNew: false,
               };
          }
     } catch (error) {
          console.error('❌ Error in upsertContent:', error);
          throw error;
     }
};

// ============ Setup Notification Jobs ============
async function setupNotificationJobs(notificationStrategy: IContent['notificationStrategy']) {
     try {
          // 1. Progress Alert Job
          if (notificationStrategy.progressAlert) {
               await addProgressAlertJob(notificationStrategy);
          }

          // 2. Low Progress Warning
          if (notificationStrategy.lowProgressWarning) {
               await addLowProgressWarningJob();
          }

          // 3. Campaign Expired Alert
          if (notificationStrategy.campaignExpiredAlert) {
               await addCampaignExpiredAlertJob();
          }

          console.log('✅ Notification jobs setup completed');
     } catch (error) {
          console.error('❌ Error setting up notification jobs:', error);
          throw error;
     }
}

// ============ Progress Alert Job ============
async function addProgressAlertJob(notificationStrategy: IContent['notificationStrategy']) {
     const { frequency, day, time } = notificationStrategy.progressAlertSchedule;

     const [hour, minute] = time ? time.split(':') : ['09', '00'];
     let cronExpression: string;

     if (frequency === progressAlertFrequeincyEnum.weekly) {
          // Weekly: প্রতি সপ্তাহে নির্দিষ্ট দিনে
          const dayNumber = getDayNumber(day!);
          cronExpression = `${minute} ${hour} * * ${dayNumber}`;
     } else if (frequency === progressAlertFrequeincyEnum.monthly) {
          // ✅ Monthly: প্রতি মাসের 1 তারিখে
          cronExpression = `${minute} ${hour} 1 * *`;
     } else if (frequency === progressAlertFrequeincyEnum.biweekly) {
          // Bi-weekly: মাসের 1 এবং 15 তারিখে
          cronExpression = `${minute} ${hour} 1,15 * *`;
     } else {
          // Default: Bi-weekly
          cronExpression = `${minute} ${hour} 1,15 * *`;
     }

     await scheduleQueue.add(
          'sendProgressAlert',
          {
               message: notificationStrategy.progressAlertMessage,
               frequency,
               campaignId: notificationStrategy.campaignId,
          },
          {
               repeat: {
                    pattern: cronExpression,
               },
               jobId: 'progress-alert-job',
          },
     );

     const nextRunTime = getNextCronTime(cronExpression);
     console.log(`📅 Progress Alert scheduled: ${cronExpression}`);
     console.log(
          `⏰ Next run: ${nextRunTime.toLocaleString('en-US', {
               timeZone: 'Asia/Dhaka',
               dateStyle: 'full',
               timeStyle: 'long',
          })}`,
     );
     console.log(`⏱️ Time until next run: ${getTimeUntil(nextRunTime)}`);
}

// ============ Low Progress Warning Job ============
async function addLowProgressWarningJob() {
     const cronExpression = '0 10 * * *';

     await scheduleQueue.add(
          'checkLowProgress',
          {},
          {
               repeat: {
                    pattern: cronExpression,
               },
               jobId: 'low-progress-warning-job',
          },
     );

     // ✅ Log next run time
     const nextRunTime = getNextCronTime(cronExpression);
     console.log('⚠️ Low Progress Warning scheduled: Daily at 10 AM');
     console.log(
          `⏰ Next run: ${nextRunTime.toLocaleString('en-US', {
               timeZone: 'Asia/Dhaka',
               dateStyle: 'full',
               timeStyle: 'long',
          })}`,
     );
     console.log(`⏱️ Time until next run: ${getTimeUntil(nextRunTime)}`);
}

// ============ Campaign Expired Alert Job ============

async function addCampaignExpiredAlertJob() {
     const cronExpression = '0 8 * * *';
     await scheduleQueue.add(
          'checkExpiredCampaigns',
          {},
          {
               repeat: {
                    pattern: cronExpression,
               },
               jobId: 'campaign-expired-alert-job',
          },
     );

     // ✅ Log next run time
     const nextRunTime = getNextCronTime(cronExpression);
     console.log('⏰ Campaign Expired Alert scheduled: Daily at 8 AM');
     console.log(
          `⏰ Next run: ${nextRunTime.toLocaleString('en-US', {
               timeZone: 'Asia/Dhaka',
               dateStyle: 'full',
               timeStyle: 'long',
          })}`,
     );
     console.log(`⏱️ Time until next run: ${getTimeUntil(nextRunTime)}`);
}

// ============ Remove Old Jobs ============
async function removeExistingNotificationJobs() {
     try {
          const repeatableJobs = await scheduleQueue.getRepeatableJobs();

          const jobIds = ['progress-alert-job', 'low-progress-warning-job', 'campaign-expired-alert-job'];

          for (const job of repeatableJobs) {
               // Check if job.key contains any of our job IDs
               const shouldRemove = jobIds.some((id) => job.key.includes(id));

               if (shouldRemove) {
                    await scheduleQueue.removeRepeatableByKey(job.key);
                    console.log(`🗑️ Removed job: ${job.key}`);
               }
          }
     } catch (error) {
          console.error('❌ Error removing jobs:', error);
     }
}

// ============ Helper Function ============
function getDayNumber(day: progressAlertDayEnum): number {
     const dayMap: Record<progressAlertDayEnum, number> = {
          [progressAlertDayEnum.monday]: 1,
          [progressAlertDayEnum.tuesday]: 2,
          [progressAlertDayEnum.wednesday]: 3,
          [progressAlertDayEnum.thursday]: 4,
          [progressAlertDayEnum.friday]: 5,
          [progressAlertDayEnum.saturday]: 6,
          [progressAlertDayEnum.sunday]: 0,
     };
     return dayMap[day];
}

// -------------------------------------------------

// Helper function to build date range filter
const buildDateRangeFilter = (startDate?: string, endDate?: string) => {
     const filter: any = {};

     if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) {
               filter.createdAt.$gte = startOfDay(parseISO(startDate)).toISOString();
          }
          if (endDate) {
               filter.createdAt.$lte = endOfDay(parseISO(endDate)).toISOString();
          }
     }

     return filter;
};

// Get time-range-based statistics
const getTimeRangeStats = async (startDate?: string, endDate?: string) => {
     const dateFilter = buildDateRangeFilter(startDate, endDate);

     // Get total funds raised
     const transactions = await Transaction.aggregate([{ $match: dateFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
     const totalFundsRaised = transactions[0]?.total || 0;

     // Get unique donors count
     const uniqueDonors = await Transaction.distinct('user', dateFilter);
     const totalDonors = uniqueDonors.length;

     // Get active campaigns count
     const activeCampaigns = await Campaign.countDocuments({
          ...dateFilter,
          status: 'active',
     });

     // Get total invitees
     const totalInvitees = await InvitationHistory.countDocuments(dateFilter);

     return {
          totalFundsRaised,
          totalDonors,
          activeCampaigns,
          totalInvitees,
     };
};

// Get donation growth data for a time range
const getDonationGrowthData = async (startDate?: string, endDate?: string) => {
     const dateFilter = buildDateRangeFilter(startDate, endDate);

     // Group donations by month
     const donationData = await Transaction.aggregate([
          {
               $match: {
                    ...dateFilter,
                    status: 'completed',
               },
          },
          {
               $group: {
                    _id: {
                         year: { $year: '$createdAt' },
                         month: { $month: '$createdAt' },
                    },
                    monthStart: {
                         $first: {
                              $dateFromParts: {
                                   year: { $year: '$createdAt' },
                                   month: { $month: '$createdAt' },
                                   day: 1,
                              },
                         },
                    },
                    totalAmount: { $sum: '$amount' },
                    transactionCount: { $sum: 1 },
               },
          },
          {
               $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
               },
          },
          {
               $project: {
                    _id: 0,
                    month: {
                         $dateToString: {
                              format: '%Y-%m',
                              date: '$monthStart',
                         },
                    },
                    totalAmount: 1,
                    transactionCount: 1,
               },
          },
     ]);

     // Calculate running total
     let runningTotal = 0;
     const growthData = donationData.map((item) => {
          runningTotal += item.totalAmount;
          return {
               month: item.month,
               monthlyAmount: item.totalAmount,
               totalAmount: runningTotal,
               transactionCount: item.transactionCount,
          };
     });

     return growthData;
};

// User Level Strategy CRUD operations
const createUserLevelStrategy = async (strategyData: any) => {
     const content = await Content.findOne();
     if (!content) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     // Add the new strategy to the userLevelStrategy array
     content.userLevelStrategy.push(strategyData);
     await content.save();

     // Return the newly added strategy
     const newStrategy = content.userLevelStrategy[content.userLevelStrategy.length - 1];
     return newStrategy;
};

const getUserLevelStrategies = async () => {
     const content = await Content.findOne();
     if (!content) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     return content.userLevelStrategy;
};

const getUserLevelStrategyById = async (strategyId: string) => {
     const content = await Content.findOne();
     if (!content) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     const strategy = content.userLevelStrategy.find((strategy: any) => strategy._id.toString() === strategyId);
     if (!strategy) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User level strategy not found');
     }

     return strategy;
};

const updateUserLevelStrategy = async (strategyId: string, strategyData: any) => {
     const content = await Content.findOne();
     if (!content) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     const strategyIndex = content.userLevelStrategy.findIndex((strategy: any) => strategy._id && strategy._id.toString() === strategyId);
     if (strategyIndex === -1) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User level strategy not found');
     }

     // Update the strategy
     Object.assign(content.userLevelStrategy[strategyIndex], strategyData);
     await content.save();

     return content.userLevelStrategy[strategyIndex];
};

const deleteUserLevelStrategy = async (strategyId: string) => {
     const content = await Content.findOne();
     if (!content) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     const strategyIndex = content.userLevelStrategy.findIndex((strategy: any) => strategy._id && strategy._id.toString() === strategyId);
     if (strategyIndex === -1) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User level strategy not found');
     }

     // Remove the strategy
     const deletedStrategy = content.userLevelStrategy.splice(strategyIndex, 1)[0];
     await content.save();

     return deletedStrategy;
};

export const ContentService = {
     upsertContent,
     getContent,
     getTimeRangeStats,
     getDonationGrowthData,
     createUserLevelStrategy,
     getUserLevelStrategies,
     getUserLevelStrategyById,
     updateUserLevelStrategy,
     deleteUserLevelStrategy,
};
