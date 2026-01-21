import { Schema, model } from 'mongoose';
import { ITransaction, paymentStatusType } from './Transaction.interface';

const TransactionSchema = new Schema<ITransaction>(
     {
          donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          donorPhone: { type: String, required: true },
          paymentMethod: { type: String, required: true },
          campaignTitle: {
               type: String,
          },
          transactionId: { type: String, required: true, unique: true },
          amountPaid: { type: Number, required: true },
          campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
          paymentStatus: { type: String, enum: Object.values(paymentStatusType), required: true },
          isDeleted: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);
// pre hooks
TransactionSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

TransactionSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

TransactionSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
