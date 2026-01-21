import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ITransaction } from './Transaction.interface';
import { Transaction } from './Transaction.model';
import QueryBuilder from '../../builder/QueryBuilder';
import sendSMS from '../../../shared/sendSMS';
import { Campaign } from '../campaign/campaign.model';
import { User } from '../user/user.model';
import { InvitationHistoryService } from '../InvitationHistory/InvitationHistory.service';
import { InvitationHistory } from '../InvitationHistory/InvitationHistory.model';

const createTransaction = async (payload: ITransaction): Promise<ITransaction> => {
     const isExistCampaign = await Campaign.findById(payload.campaignId);
     if (!isExistCampaign) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Campaign not found.');
     }
     payload.campaignTitle = isExistCampaign.title;
     const result = await Transaction.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found.');
     }
     return result;
};

const getAllTransactions = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: ITransaction[] }> => {
     const queryBuilder = new QueryBuilder(Transaction.find().populate('donorId', 'name contact email image createdAt userLevel').populate('campaignId', 'title'), query);
     const result = await queryBuilder.filter().search(['campaignTitle', 'transactionId']).sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedTransactions = async (): Promise<ITransaction[]> => {
     const result = await Transaction.find();
     return result;
};

const updateTransaction = async (id: string, payload: Partial<ITransaction>): Promise<ITransaction | null> => {
     const isExist = await Transaction.findById(id);
     if (!isExist) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found.');
     }
     return await Transaction.findByIdAndUpdate(id, payload, { new: true });
};

const deleteTransaction = async (id: string): Promise<ITransaction | null> => {
     const result = await Transaction.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteTransaction = async (id: string): Promise<ITransaction | null> => {
     const result = await Transaction.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found.');
     }
     return result;
};

const getTransactionById = async (id: string): Promise<ITransaction | null> => {
     const result = await Transaction.findById(id);
     return result;
};

const sendSuccessMessage = async (id: string, payload: { message: string }): Promise<ITransaction | null> => {
     const isExistTransaction = await Transaction.findById(id);
     if (!isExistTransaction) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found.');
     }

     await sendSMS(isExistTransaction.donorPhone!, payload.message);

     return isExistTransaction;
};

const getAllInvitaAndTransactionsOfUser = async (userId: string, query: any & { iPage: number; iLimit: number; iSearchTerm: string }) => {
     console.log('🚀 ~ getAllInvitaAndTransactionsOfUser ~ query:', query);
     const isExistUser = await User.findById(userId);
     if (!isExistUser) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
     }

     const { result: userInvita, meta } = await InvitationHistoryService.getAllInvitationHistorys({
          invitationFromPhone: isExistUser.contact!,
          page: query.iPage || 1,
          limit: query.iLimit || 10,
          searchTerm: query.iSearchTerm || undefined,
     });

     delete query.iPage;
     delete query.iLimit;
     delete query.iSearchTerm;
     const userTransactions = await getAllTransactions(query);

     return { user: isExistUser, invitationHistorys: { meta, userInvita }, transactions: userTransactions };
};

export const TransactionService = {
     createTransaction,
     getAllTransactions,
     getAllUnpaginatedTransactions,
     updateTransaction,
     deleteTransaction,
     hardDeleteTransaction,
     getTransactionById,
     sendSuccessMessage,
     getAllInvitaAndTransactionsOfUser,
};
