import { Types } from 'mongoose';

export enum paymentStatusType {
     PENDING = 'pending',
     COMPLETED = 'completed',
     FAILED = 'failed',
     REFUNDED = 'refunded',
}

export interface ITransaction {
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
     donorId: Types.ObjectId;
     donorPhone: string;
     paymentMethod: string;
     transactionId: string;
     amountPaid: number;
     campaignId: Types.ObjectId;
     campaignTitle: string;
     paymentStatus: paymentStatusType;
}

export type ITransactionFilters = {
     searchTerm?: string;
};
