import { Schema, model } from 'mongoose';
import { IInvitationHistory } from './InvitationHistory.interface';
import { InvitationType } from './InvitationHistory.enum';

const InvitationHistorySchema = new Schema<IInvitationHistory>(
     {
          type: {
               type: String,
               enum: Object.values(InvitationType),
               required: [true, 'Invitation type is required'],
          },
          campaignId: {
               type: Schema.Types.ObjectId,
               ref: 'Campaign',
               required: [true, 'Campaign ID is required'],
          },
          isDonated: {
               type: Boolean,
          },
          referralLink: {
               type: String,
               trim: true,
          },
          campaignTitle: {
               type: String,
          },
          invitationFromUser: {
               type: Schema.Types.ObjectId,
               ref: 'User',
               required: [true, 'Inviting user ID is required'],
          },
          invitationFromPhone: {
               type: String,
               required: [true, 'Inviting phone number is required'],
               trim: true,
          },
          invitationForPhone: {
               type: String,
               required: [true, 'Recipient phone number is required'],
               trim: true,
          },
          invitationForName: {
               type: String,
               required: [true, 'Recipient name is required'],
               trim: true,
          },
          isDeleted: {
               type: Boolean,
               default: false,
          },
          deletedAt: {
               type: Date,
          },
     },
     {
          timestamps: true,
          toJSON: {
               virtuals: true,
          },
     },
);

// Add indexes for frequently queried fields
InvitationHistorySchema.index({ campaignId: 1 });
InvitationHistorySchema.index({ invitationFromUser: 1 });
InvitationHistorySchema.index({ invitationForPhone: 1 });

// Soft delete middleware
InvitationHistorySchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

InvitationHistorySchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

InvitationHistorySchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const InvitationHistory = model<IInvitationHistory>('InvitationHistory', InvitationHistorySchema);
