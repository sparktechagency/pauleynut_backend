import { Document, Types } from 'mongoose';
import { CampaignStatus } from './campaign.enum';

export interface ICampaign extends Document {
     targetAmount: number;
     startDate: Date;
     endDate: Date;
     createdBy: Types.ObjectId;
     overall_raised: number;
     description: string;
     title: string;
     alert?: string;
     message?: string;
     address: string;
     donor_name: string;
     dafPartner: string;
     internalTrackingId: string;
     campaignStatus: CampaignStatus;
     total_invitees: number;
     organization_name: string;
     organization_network: string;
     organization_type: string;
     organization_taxId: string;
     organization_website: string;
     organization_address: string;
     contactPerson_name: string;
     contactPerson_title: string;
     contactPerson_email: string;
     contactPerson_phone: string;
     cause_title: string;
     cause_description: string;
     cause_mission: string;
     cause_image: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     milestoneNotified: boolean;
     deletedAt?: Date;
}

export type ICampaignFilters = {
     searchTerm?: string;
     campaignStatus?: CampaignStatus;
     startDate?: string;
     endDate?: string;
     minAmount?: number;
     maxAmount?: number;
};
