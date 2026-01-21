import { Document, Model, ObjectId } from 'mongoose';
import { UserLevel } from '../user/user.enum';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from './content.enum';
import { Types } from 'mongoose';

export type Founder = {
     name: string;
     role: string;
     bio: string;
     image: string;
};

export type UserLevelStrategy = {
     level: UserLevel;
     title: string;
     description: string;
     benefits?: string;
     targetInvitation: number;
     targetDonation: number;
     targetRaising: number;
};

export type PrivacyPolicy = {
     whatWeCollect: string;
     howWeUseIt: string;
     yourAnonymity: string;
     whoSeesYourInfo: string;
     security: string;
     yourChoices: string;
};

export interface IContent extends Document {
     // App Information
     appName: string;
     logo: string;
     type: string;

     // About Section
     founders: Founder[];
     ourMission: string;
     howWeOperate: string;
     introduction: string;
     foundersQuote: string;
     // About the case Content
     title: string;
     subTitle: string;
     organizationName: string;
     established: Date;
     network: string;
     missionSummary: string;
     aboutRefugeForWomen: string;
     images: string[];


     // Statistics
     citiesServed: number;
     yearsOfOperation: number;
     survivorsSupported: number;

     // User Level Strategy
     userLevelStrategy: UserLevelStrategy[];


     // cront notification Strategy ⏰
     notificationStrategy: {
          campaignExpiredAlert: boolean;
          lowProgressWarning: boolean;
          mileStoneAlert: boolean; // true
          mileStoneAlertMessage: string;
          progressAlert: boolean; // true
          progressAlertMessage: string;
          progressAlertSchedule: {
               frequency: progressAlertFrequeincyEnum;
               day: progressAlertDayEnum;
               time?: string;
          };
          campaignId: Types.ObjectId;
     };

     // Media
     gallery: string[];

     // Privacy Policy
     privacyPolicy: PrivacyPolicy;
}

export type ContentModel = Model<IContent>;

export type IContentResponse = Omit<IContent, keyof Document> & {
     _id: ObjectId;
     createdAt: Date;
     updatedAt: Date;
};
