import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { TransactionService } from './Transaction.service';

const createTransaction = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionService.createTransaction(req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transaction created successfully',
          data: result,
     });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionService.getAllTransactions(req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transactions retrieved successfully',
          data: result,
     });
});

const getAllUnpaginatedTransactions = catchAsync(async (req: Request, res: Response) => {
     const result = await TransactionService.getAllUnpaginatedTransactions();

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transactions retrieved successfully',
          data: result,
     });
});

const updateTransaction = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TransactionService.updateTransaction(id, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transaction updated successfully',
          data: result || undefined,
     });
});

const deleteTransaction = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TransactionService.deleteTransaction(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transaction deleted successfully',
          data: result || undefined,
     });
});

const hardDeleteTransaction = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TransactionService.hardDeleteTransaction(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transaction deleted successfully',
          data: result || undefined,
     });
});

const getTransactionById = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await TransactionService.getTransactionById(id);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Transaction retrieved successfully',
          data: result || undefined,
     });
});

const sendSuccessMessage = catchAsync(async (req: Request, res: Response) => {
     const { transactionId } = req.params;
     const result = await TransactionService.sendSuccessMessage(transactionId, req.body);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Success message sent successfully',
          data: result || undefined,
     });
});

// const getAllInvitaAndTransactionsOfUser
const getAllInvitaAndTransactionsOfUser = catchAsync(async (req: Request, res: Response) => {
     const { userId } = req.params;
     const result = await TransactionService.getAllInvitaAndTransactionsOfUser(userId, req.query);

     sendResponse(res, {
          statusCode: 200,
          success: true,
          message: 'Invita and transactions retrieved successfully',
          data: result,
     });
});

export const TransactionController = {
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
