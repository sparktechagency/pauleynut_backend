import { z } from 'zod';
import { paymentStatusType } from './Transaction.interface';
import { query } from 'winston';

const createTransactionZodSchema = z.object({
     body: z.object({
          donorId: z.string({ required_error: 'Donor ID is required' }),
          donorPhone: z.string({ required_error: 'Donor phone is required' }),
          paymentMethod: z.string({ required_error: 'Payment method is required' }),
          transactionId: z.string({ required_error: 'Transaction ID is required' }),
          amountPaid: z.number({ required_error: 'Amount paid is required' }),
          campaignId: z.string({ required_error: 'Campaign ID is required' }),
          campaignTitle: z.string().optional(),
          paymentStatus: z.nativeEnum(paymentStatusType, { required_error: 'Payment status is required' }),
     }),
});

const updateTransactionZodSchema = z.object({
     body: z.object({
          donorId: z.string().optional(),
          donorPhone: z.string().optional(),
          paymentMethod: z.string().optional(),
          transactionId: z.string().optional(),
          amountPaid: z.number().optional(),
          campaignId: z.string().optional(),
          paymentStatus: z.nativeEnum(paymentStatusType).optional(),
     }),
});

const sendSuccessMessageZodSchema = z.object({
     params: z.object({
          transactionId: z.string({ required_error: 'Transaction ID is required' }),
     }),
     body: z.object({
          message: z.string({ required_error: 'Message is required' }),
     }),
});

const getAllInvitaAndTransactionsOfUserZodSchema = z.object({
     query: z.object({
          iLimit: z.string().optional(),
          iPage: z.string().optional(),
          iSearchTerm: z.string().optional(),
     }),
});

export const TransactionValidation = {
     createTransactionZodSchema,
     updateTransactionZodSchema,
     sendSuccessMessageZodSchema,
     getAllInvitaAndTransactionsOfUserZodSchema,
};
