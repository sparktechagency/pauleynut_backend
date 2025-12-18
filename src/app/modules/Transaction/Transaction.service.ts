import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { ITransaction } from './Transaction.interface';
import { Transaction } from './Transaction.model';
import QueryBuilder from '../../builder/QueryBuilder';
import sendSMS from '../../../shared/sendSMS';

const createTransaction = async (payload: ITransaction): Promise<ITransaction> => {
     const result = await Transaction.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Transaction not found.');
     }
     return result;
};

const getAllTransactions = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: ITransaction[] }> => {
     const queryBuilder = new QueryBuilder(Transaction.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
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

export const TransactionService = {
     createTransaction,
     getAllTransactions,
     getAllUnpaginatedTransactions,
     updateTransaction,
     deleteTransaction,
     hardDeleteTransaction,
     getTransactionById,
     sendSuccessMessage,
};
