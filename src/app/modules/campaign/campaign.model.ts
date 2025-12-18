import { Schema, model } from 'mongoose';
import { ICampaign } from './campaign.interface';
import { CampaignStatus } from './campaign.enum';

const CampaignSchema = new Schema<ICampaign>(
     {
          targetAmount: { type: Number, required: true, min: 0 },
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
          createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          overall_raised: { type: Number, default: 0, min: 0 },
          description: { type: String, required: true },
          title: { type: String, required: true, trim: true },
          address: { type: String, required: true },
          donor_name: { type: String, required: true },
          dafPartner: { type: String, default: '' },
          internalTrackingId: { type: String, unique: true, sparse: true },
          campaignStatus: {
               type: String,
               enum: Object.values(CampaignStatus),
               default: CampaignStatus.ACTIVE,
          },
          alert: { type: String },
          message: { type: String },
          total_invitees: { type: Number, default: 0, min: 0 },
          organization_name: { type: String, required: true },
          organization_network: { type: String, default: '' },
          organization_type: { type: String, default: '' },
          organization_taxId: { type: String, default: '' },
          organization_website: { type: String, default: '' },
          organization_address: { type: String, default: '' },
          contactPerson_name: { type: String, required: true },
          contactPerson_title: { type: String, default: '' },
          contactPerson_email: { type: String, required: true, lowercase: true, trim: true },
          contactPerson_phone: { type: String, default: '' },
          cause_title: { type: String, required: true },
          cause_description: { type: String, required: true },
          cause_mission: { type: String, default: '' },
          cause_image: { type: String, default: '' },
          isDeleted: { type: Boolean, default: false },
          milestoneNotified: { type: Boolean, default: false },
          deletedAt: { type: Date },
     },
     { timestamps: true },
);

// Indexes for better query performance
CampaignSchema.index({ campaignStatus: 1 });
CampaignSchema.index({ startDate: 1, endDate: 1 });
CampaignSchema.index({ createdBy: 1 });
CampaignSchema.index({ contactPerson_email: 1 });

// Soft delete middleware
CampaignSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

CampaignSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

CampaignSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});

export const Campaign = model<ICampaign>('Campaign', CampaignSchema);
