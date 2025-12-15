import { Document, Model, ObjectId } from 'mongoose';

export type Founder = {
     name: string;
     role: string;
     bio: string;
     image: string;
};

export type UserLevelStrategy = {
     level: number;
     title: string;
     description: string;
     benefits: string[];
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
     aboutRefugeForWomen: string;
     introduction: string;

     // Statistics
     citiesServed: number;
     yearsOfOperation: number;
     survivorsSupported: number;

     // User Level Strategy
     userLevelStrategy: UserLevelStrategy[];

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
