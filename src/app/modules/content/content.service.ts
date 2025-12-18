import { StatusCodes } from 'http-status-codes';
import { IContent, IContentResponse } from './content.interface';
import { Content } from './content.model';
import AppError from '../../../errors/AppError';
import { FilterQuery } from 'mongoose';
import { Campaign } from '../campaign/campaign.model';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Transaction } from '../Transaction/Transaction.model';
import { InvitationHistory } from '../InvitationHistory/InvitationHistory.model';

const createContent = async (payload: IContent) => {
     // Check if content already exists
     const existingContent = await Content.findOne();
     if (existingContent) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Content already exists. Use update instead.');
     }

     const result = await Content.create(payload);
     return result.toJSON();
};

const getContent = async () => {
     const result = await Content.findOne();

     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Content not found');
     }

     return result.toJSON();
};

const updateContent = async (payload: Partial<IContent>) => {
     // Find the existing content
     const existingContent = await Content.findOne();

     if (!existingContent) {
          // If no content exists, create new one
          const newContent = await Content.create(payload);
          return newContent.toJSON();
     }

     // Update existing content
     Object.assign(existingContent, payload);
     await existingContent.save();

     return existingContent.toJSON();
};

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
export const ContentService = {
     createContent,
     getContent,
     updateContent,
     getTimeRangeStats,
     getDonationGrowthData,
};
