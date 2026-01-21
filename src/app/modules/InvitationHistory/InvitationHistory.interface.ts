import { Types } from 'mongoose';
import { InvitationType } from './InvitationHistory.enum';

export interface IInvitationHistory {
     type: InvitationType;
     campaignId: Types.ObjectId;
     campaignTitle: string;
     isDonated?: boolean;
     referralLink?: string;
     invitationFromUser: Types.ObjectId;
     invitationFromPhone: string;
     invitationForPhone: string;
     invitationForName: string;
     isDeleted: boolean;
     deletedAt?: Date;
     createdAt: Date;
     updatedAt: Date;
}

export type IInvitationHistoryFilters = {
     searchTerm?: string;
     type?: InvitationType;
     campaignId?: string;
     invitationFromUser?: string;
     invitationFromPhone?: string;
     invitationForPhone?: string;
};
