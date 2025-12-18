import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IInvitationHistory } from './InvitationHistory.interface';
import { Campaign } from '../campaign/campaign.model';
import { InvitationHistory } from './InvitationHistory.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createInvitationHistory = async (payload: IInvitationHistory): Promise<IInvitationHistory> => {
     const isExistCampaign = await Campaign.findById(payload.campaignId);
     if (!isExistCampaign) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.');
     }
     const result = await InvitationHistory.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'InvitationHistory not found.');
     }
     return result;
};

const getAllInvitationHistorys = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IInvitationHistory[] }> => {
     const queryBuilder = new QueryBuilder(InvitationHistory.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedInvitationHistorys = async (): Promise<IInvitationHistory[]> => {
     const result = await InvitationHistory.find();
     return result;
};

const updateInvitationHistory = async (id: string, payload: Partial<IInvitationHistory>): Promise<IInvitationHistory | null> => {
     const isExist = await InvitationHistory.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'InvitationHistory not found.');
     }
     return await InvitationHistory.findByIdAndUpdate(id, payload, { new: true });
};

const deleteInvitationHistory = async (id: string): Promise<IInvitationHistory | null> => {
     const result = await InvitationHistory.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'InvitationHistory not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteInvitationHistory = async (id: string): Promise<IInvitationHistory | null> => {
     const result = await InvitationHistory.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'InvitationHistory not found.');
     }
     return result;
};

const getInvitationHistoryById = async (id: string): Promise<IInvitationHistory | null> => {
     const result = await InvitationHistory.findById(id);
     return result;
};

export const InvitationHistoryService = {
     createInvitationHistory,
     getAllInvitationHistorys,
     getAllUnpaginatedInvitationHistorys,
     updateInvitationHistory,
     deleteInvitationHistory,
     hardDeleteInvitationHistory,
     getInvitationHistoryById,
};
