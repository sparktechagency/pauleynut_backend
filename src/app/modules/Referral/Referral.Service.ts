import { IReferral, ReferralModel } from './Referral.Model';
import { getDownlineAggregation } from './Referral.Utils';

export class ReferralService {
     // src/services/ReferralService.ts
     async invite(parentPhone: string, newPhone: string, campaignId: string): Promise<IReferral> {
          // 1. Parent খুঁজে বের করা
          const parent = await ReferralModel.findOne({ campaignId, phone: parentPhone });
          if (!parent) throw new Error('Parent not found');

          // 2. Max 12 invite চেক
          if (parent.invitedPhones.length >= 12) {
               throw new Error('Maximum 12 invites allowed per person');
          }

          //   // 3. নতুন phone ইতিমধ্যে আছে কি না চেক
          //   const existing = await ReferralModel.findOne({ campaignId, phone: newPhone });
          //   if (existing) throw new Error('This phone is already invited in this campaign');

          // 4. নতুন referral node তৈরি (donation 0 দিয়ে)
          const newReferral = await ReferralModel.create({
               campaignId,
               phone: newPhone,
               parentPhone,
               donationAmount: 0,
               invitedPhones: [],
          });

          // 5. Parent-এর invitedPhones-এ যোগ করা
          parent.invitedPhones.push(newPhone);
          await parent.save();

          return newReferral;
     }

     async donate(phone: string, campaignId: string, amount: number): Promise<void> {
          const referral = await ReferralModel.findOne({ campaignId, phone });
          if (!referral) throw new Error('Referral not found for this phone');

          referral.donationAmount += amount;
          referral.lastDonatedAt = new Date();
          await referral.save();
     }

     // Get downline stats up to 5 levels
     async getDownlineStats(phone: string, campaignId: string, maxLevels: number = 5): Promise<any> {
          // Get the root user first
          const rootUser = await ReferralModel.findOne({ campaignId, phone });
          if (!rootUser) throw new Error('User not found');

          // Initialize levels array
          const levels = [];
          let cumulativeFunds = rootUser.donationAmount || 0; // Start with user's own donation

          // Level 0 - the user himself
          levels.push({
               level: 0,
               invited: rootUser.invitedPhones.length,
               donated: rootUser.donationAmount > 0 ? 1 : 0,
               funds: cumulativeFunds,
          });

          // BFS traversal for each level
          let currentLevelPhones = rootUser.invitedPhones;

          for (let level = 1; level <= maxLevels && currentLevelPhones.length > 0; level++) {
               const usersAtLevel = await ReferralModel.find({
                    campaignId,
                    phone: { $in: currentLevelPhones },
               });

               let invitedAtLevel = 0;
               let donatedAtLevel = 0;
               let fundsAtLevel = 0;
               let nextLevelPhones: string[] = [];

               for (const user of usersAtLevel) {
                    // Count this user's direct invites
                    invitedAtLevel += user.invitedPhones.length;

                    // Check if this user donated
                    if (user.donationAmount > 0) {
                         donatedAtLevel++;
                         fundsAtLevel += user.donationAmount;
                    }

                    // Collect phones for next level
                    nextLevelPhones.push(...user.invitedPhones);
               }

               // Update cumulative funds
               cumulativeFunds += fundsAtLevel;

               // Add level data
               levels.push({
                    level,
                    invited: invitedAtLevel,
                    donated: donatedAtLevel,
                    funds: cumulativeFunds,
               });

               // Move to next level
               currentLevelPhones = nextLevelPhones;
          }

          // Calculate totals
          const totals = levels.reduce(
               (acc, level) => {
                    acc.invited += level.invited;
                    acc.donated += level.donated;
                    return acc;
               },
               { invited: 0, donated: 0, funds: cumulativeFunds },
          );

          return {
               levels,
               total: totals,
          };
     }

     // Get personal impact (like second screenshot)
     async getPersonalImpact(phone: string, campaignId: string): Promise<any> {
          const stats = await this.getDownlineStats(phone, campaignId);
          const referral = await ReferralModel.findOne({ campaignId, phone });
          if (!referral) throw new Error('Referral not found');
          const totalFunds = referral.donationAmount + stats.total.funds;
          return {
               fundsRaised: totalFunds,
               invited: stats.total.invited,
               donated: stats.total.donated + (referral.donationAmount > 0 ? 1 : 0),
          };
     }

     async getDownlineStatsTree(phone: string, campaignId: string, maxLevels: number = 5): Promise<any> {
          return await getDownlineAggregation(phone, campaignId, maxLevels);
     }
}
