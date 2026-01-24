import { Types } from 'mongoose';
import { ReferralModel } from './Referral.Model';

export async function getDownlineAggregation(rootPhone: string, campaignId: string, maxLevels: number = 5) {
     const result = await ReferralModel.aggregate([
          { $match: { campaignId: new Types.ObjectId(campaignId), phone: rootPhone } },

          {
               $graphLookup: {
                    from: 'Referral',
                    startWith: '$phone',
                    connectFromField: 'phone',
                    connectToField: 'parentPhone',
                    as: 'downline',
                    maxDepth: maxLevels,
                    depthField: 'level',
               },
          },

          { $unwind: { path: '$downline', preserveNullAndEmptyArrays: true } },

          {
               $group: {
                    _id: '$downline.level',
                    invited: { $sum: 1 },
                    donated: {
                         $sum: { $cond: [{ $gt: ['$downline.donationAmount', 0] }, 1, 0] },
                    },
                    funds: { $sum: '$downline.donationAmount' },
               },
          },

          { $sort: { _id: 1 } },
          {
               $project: {
                    _id: 0,
                    level: '$_id',
                    invited: 1,
                    donated: 1,
                    funds: 1,
               },
          },
     ]);

     // L0 (root নিজে) যোগ করা
     const root = await ReferralModel.findOne({ campaignId, phone: rootPhone });
     if (!root) throw new Error('Root not found');

     const finalLevels = [
          {
               level: 0,
               invited: root.invitedPhones.length,
               donated: root.donationAmount > 0 ? 1 : 0,
               funds: root.donationAmount,
          },
          ...result,
     ];

     // Total ক্যালকুলেট
     let totalInvited = root.invitedPhones.length;
     let totalDonated = root.donationAmount > 0 ? 1 : 0;
     let totalFunds = root.donationAmount;

     result.forEach((lvl: any) => {
          totalInvited += lvl.invited;
          totalDonated += lvl.donated;
          totalFunds += lvl.funds;
     });

     return {
          levels: finalLevels,
          total: { invited: totalInvited, donated: totalDonated, funds: totalFunds },
     };
}
