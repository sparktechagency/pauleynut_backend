import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Campaign } from '../campaign/campaign.model';
import mongoose from 'mongoose';

export const getCampaignId = async (userId: mongoose.Types.ObjectId | string) => {
     if (!userId) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'User id is required');
     }
     const campaign = await Campaign.findOne({ createdBy: userId, isDeleted: false }).sort({ createdAt: -1 });
     return campaign?._id;
};
