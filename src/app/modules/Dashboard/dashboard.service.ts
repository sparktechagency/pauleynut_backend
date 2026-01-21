import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import AppError from '../../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Transaction } from '../Transaction/Transaction.model';
import { InvitationHistory } from '../InvitationHistory/InvitationHistory.model';
import { Campaign } from '../campaign/campaign.model';

const overview = async (user: JwtPayload, query: Record<string, any>) => {
     const userData = await User.findById(user.id);
     if (!userData) {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'User Not found');
     }
     if (user.role !== 'SUPER_ADMIN') {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'Only admin can access this route');
     }

     // Get year from query or use current year
     const year = query.year ? parseInt(query.year) : new Date().getFullYear();

     // Total fund raised
     const totalFundRaise = await User.aggregate([
          {
               $group: {
                    _id: null,
                    totalFundRaise: {
                         $sum: '$totalRaised',
                    },
               },
          },
     ]);

     const totalDonar = await Transaction.countDocuments();
     const invited = await InvitationHistory.countDocuments();
     const activeCamping = await Campaign.countDocuments({ campaignStatus: 'active' });

     const donationGrowth = await getDonationGrowthData(year);

     const camping = await Campaign.find().select('title campaignStatus total_donated overall_raised targetAmount total_invitees');

     return {
          totalFundRaise: totalFundRaise[0]?.totalFundRaise,
          totalDonar,
          invited,
          activeCamping,
          campaignList: camping,
          donationGrowth,
     };
};

const getDonationGrowthData = async (year: number) => {
     const startDate = new Date(year, 0, 1);
     const endDate = new Date(year, 11, 31, 23, 59, 59);

     const monthlyDonations = await Transaction.aggregate([
          {
               $match: {
                    createdAt: {
                         $gte: startDate,
                         $lte: endDate,
                    },
               },
          },
          {
               $group: {
                    _id: {
                         month: { $month: '$createdAt' },
                    },
                    totalAmount: { $sum: '$amountPaid' },
               },
          },
          {
               $sort: { '_id.month': 1 },
          },
     ]);

     const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
     const monthlyData = monthNames.map((name, index) => {
          const monthData = monthlyDonations.find((d) => d._id.month === index + 1);
          return {
               month: name,
               amount: monthData?.totalAmount || 0,
          };
     });

     const peakMonth = monthlyData.reduce((max, current) => (current.amount > max.amount ? current : max));

     return {
          year,
          data: monthlyData,
          peakMonth: {
               month: peakMonth.month,
               amount: peakMonth.amount,
          },
     };
};

export const DashboardService = {
     overview,
     getDonationGrowthData,
};
