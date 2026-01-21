import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { User } from './user.model';
import AppError from '../../../errors/AppError';
import { ContentService } from '../content/content.service';
import { IUser } from './user.interface';

// Calculate and update user level based on current metrics
const calculateAndUpdateUserLevel = async (userId: string) => {
     // Get the user
     const isExistUser = await User.findById(userId);
     if (!isExistUser) {
          throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exist!");
     }

     // Get user level strategies
     const userLevelStrategy = await ContentService.getUserLevelStrategies();

     if (userLevelStrategy && Array.isArray(userLevelStrategy) && userLevelStrategy.length > 0) {
          const userTotalRaised = isExistUser.totalRaised || 0;
          const userTotalDonated = isExistUser.totalDonated || 0;
          const userTotalInvited = isExistUser.totalInvited || 0;

          // Find the appropriate level based on total raised, donated, and invited
          const userLevelTobeUpdatedTo = userLevelStrategy.find(
               (strategy: any) => userTotalRaised >= strategy?.targetRaising && userTotalDonated >= strategy?.targetDonation && userTotalInvited >= strategy?.targetInvitation,
          );

          let updatedUser: any = isExistUser;

          if (userLevelTobeUpdatedTo && userLevelTobeUpdatedTo.level !== isExistUser.userLevel) {
               // Update user level if it's different and meets criteria
               await User.updateOne({ _id: isExistUser._id }, { userLevel: userLevelTobeUpdatedTo.level });
               updatedUser = await User.findById(userId);
          }

          // Check if user has an invitor and update their level too
          if (isExistUser.invitedBy) {
               const isExistInvitorUser = await User.findById(isExistUser.invitedBy);
               if (isExistInvitorUser) {
                    const invitorTotalRaised = isExistInvitorUser.totalRaised || 0;
                    const invitorTotalDonated = isExistInvitorUser.totalDonated || 0;
                    const invitorTotalInvited = isExistInvitorUser.totalInvited || 0;

                    // Find the appropriate level for the invitor
                    const invitorLevelTobeUpdatedTo = userLevelStrategy.find(
                         (strategy: any) => invitorTotalRaised >= strategy?.targetRaising && invitorTotalDonated >= strategy?.targetDonation && invitorTotalInvited >= strategy?.targetInvitation,
                    );

                    if (invitorLevelTobeUpdatedTo && invitorLevelTobeUpdatedTo.level !== isExistInvitorUser.userLevel) {
                         await User.updateOne({ _id: isExistInvitorUser._id }, { userLevel: invitorLevelTobeUpdatedTo.level });
                    }
               }
          }

          return updatedUser;
     } else {
          console.log('User level strategy is empty or not found');
          return isExistUser;
     }
};

// Get user level status with current metrics and next level requirements
const getUserLevelStatus = async (userId: string) => {
     const user = await User.findById(userId);
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, "User doesn't exist!");
     }

     const userLevelStrategy = await ContentService.getUserLevelStrategies();

     if (!userLevelStrategy || !Array.isArray(userLevelStrategy) || userLevelStrategy.length === 0) {
          return {
               currentLevel: user.userLevel,
               currentMetrics: {
                    totalRaised: user.totalRaised || 0,
                    totalDonated: user.totalDonated || 0,
                    totalInvited: user.totalInvited || 0,
               },
               nextLevel: null,
               progressToNext: null,
          };
     }

     // Sort levels by their requirements (assuming L0 < L1 < L2 < etc.)
     const sortedStrategies = userLevelStrategy.sort((a: any, b: any) => {
          const levelOrder = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
          return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
     });

     const currentLevelIndex = sortedStrategies.findIndex((strategy: any) => strategy.level === user.userLevel);
     const nextLevelStrategy = sortedStrategies[currentLevelIndex + 1];

     const currentMetrics = {
          totalRaised: user.totalRaised || 0,
          totalDonated: user.totalDonated || 0,
          totalInvited: user.totalInvited || 0,
     };

     let progressToNext = null;
     if (nextLevelStrategy) {
          progressToNext = {
               level: nextLevelStrategy.level,
               title: nextLevelStrategy.title,
               requirements: {
                    targetRaising: nextLevelStrategy.targetRaising,
                    targetDonation: nextLevelStrategy.targetDonation,
                    targetInvitation: nextLevelStrategy.targetInvitation,
               },
               progress: {
                    raisedProgress: Math.min((currentMetrics.totalRaised / nextLevelStrategy.targetRaising) * 100, 100),
                    donatedProgress: Math.min((currentMetrics.totalDonated / nextLevelStrategy.targetDonation) * 100, 100),
                    invitedProgress: Math.min((currentMetrics.totalInvited / nextLevelStrategy.targetInvitation) * 100, 100),
               },
               canLevelUp:
                    currentMetrics.totalRaised >= nextLevelStrategy.targetRaising &&
                    currentMetrics.totalDonated >= nextLevelStrategy.targetDonation &&
                    currentMetrics.totalInvited >= nextLevelStrategy.targetInvitation,
          };
     }

     return {
          currentLevel: user.userLevel,
          currentMetrics,
          nextLevel: nextLevelStrategy
               ? {
                      level: nextLevelStrategy.level,
                      title: nextLevelStrategy.title,
                      description: nextLevelStrategy.description,
                      benefits: nextLevelStrategy.benefits,
                 }
               : null,
          progressToNext,
     };
};

export const UserLevelService = {
     calculateAndUpdateUserLevel,
     getUserLevelStatus,
};
