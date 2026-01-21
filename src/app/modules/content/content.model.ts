import { Schema, Types, model } from 'mongoose';
import { IContent, ContentModel } from './content.interface';
import { UserLevel } from '../user/user.enum';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from './content.enum';

const founderSchema = new Schema(
     {
          name: { type: String },
          role: { type: String },
          bio: { type: String },
          image: { type: String },
     },
     { _id: false },
);

const userLevelStrategySchema = new Schema({
     level: { type: String, required: true, enum: Object.values(UserLevel) },
     title: { type: String, required: true },
     description: { type: String, required: true },
     benefits: { type: String },
     targetInvitation: { type: Number, required: true },
     targetDonation: { type: Number, required: true },
     targetRaising: { type: Number, required: true },
});

const privacyPolicySchema = new Schema(
     {
          whatWeCollect: { type: String, required: true },
          howWeUseIt: { type: String, required: true },
          yourAnonymity: { type: String, required: true },
          whoSeesYourInfo: { type: String, required: true },
          security: { type: String, required: true },
          yourChoices: { type: String, required: true },
     },
     { _id: false },
);

const contentSchema = new Schema<IContent, ContentModel>(
     {
          // App Information
          appName: { type: String, required: true },
          logo: { type: String, required: true },
          type: { type: String, default: 'content' },

          // About Section
          founders: [founderSchema],
          ourMission: { type: String, required: true },
          howWeOperate: { type: String, required: true },
          introduction: { type: String, required: true },
          // about the case
          title: { type: String, required: true },
          subTitle: { type: String, required: true },
          organizationName: { type: String, required: true },
          established: { type: Date, required: true },
          network: { type: String, required: true },
          missionSummary: { type: String, required: true },
          aboutRefugeForWomen: { type: String, required: true },
          foundersQuote: { type: String, required: true },
          images: [{ type: String }],

          // Statistics
          citiesServed: { type: Number },
          yearsOfOperation: { type: Number },
          survivorsSupported: { type: Number },

          // User Level Strategy
          userLevelStrategy: [userLevelStrategySchema],

          // notificationStrategy
          notificationStrategy: {
               campaignExpiredAlert: { type: Boolean, default: true },
               lowProgressWarning: { type: Boolean, default: true },
               mileStoneAlert: { type: Boolean, default: true },
               mileStoneAlertMessage: { type: String, default: 'Campaign Milestone Alert' },
               progressAlert: { type: Boolean, default: true },
               progressAlertMessage: { type: String, default: 'Campaign Progress Alert' },
               progressAlertSchedule: {
                    frequency: { type: String, enum: Object.values(progressAlertFrequeincyEnum) },
                    day: { type: String, enum: Object.values(progressAlertDayEnum) },
                    time: { type: String, default: '10:00' },
               },
               campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
          },

          // Media
          gallery: [{ type: String }],

          //privacyPolicySchema
          privacyPolicy: privacyPolicySchema,
     },
     {
          timestamps: true,
          toJSON: {
               virtuals: true,
               transform: function (doc, ret) {
                    const transformed = { ...ret };
                    transformed.id = transformed._id;
                    return transformed;
               },
          },
     },
);

export const Content = model<IContent, ContentModel>('Content', contentSchema);
