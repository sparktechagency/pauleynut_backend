import { Schema, model } from 'mongoose';
import { IContent, ContentModel } from './content.interface';
import { UserLevel } from '../user/user.enum';
import { progressAlertDayEnum, progressAlertFrequeincyEnum } from './content.enum';

const founderSchema = new Schema(
     {
          name: { type: String, required: true },
          role: { type: String, required: true },
          bio: { type: String, required: true },
          image: { type: String, required: true },
     },
     { _id: false },
);

const userLevelStrategySchema = new Schema(
     {
          level: { type: String, required: true, enum: Object.values(UserLevel) },
          title: { type: String, required: true },
          description: { type: String, required: true },
          benefits: [{ type: String }],
          targetInvitation: { type: Number, required: true },
          targetDonation: { type: Number, required: true },
          targetRaising: { type: Number, required: true },
     },
     { _id: false },
);

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
          aboutRefugeForWomen: { type: String, required: true },
          introduction: { type: String, required: true },

          // Statistics
          citiesServed: { type: Number, required: true },
          yearsOfOperation: { type: Number, required: true },
          survivorsSupported: { type: Number, required: true },

          // User Level Strategy
          userLevelStrategy: [userLevelStrategySchema],

          // notificationStrategy
          notificationStrategy: {
               campaignExpiredAlert: Boolean,
               lowProgressWarning: Boolean,
               mileStoneAlert: Boolean,
               mileStoneAlertMessage: String,
               progressAlert: Boolean,
               progressAlertMessage: String,
               progressAlertSchedule: {
                    frequency: { type: String, enum: Object.values(progressAlertFrequeincyEnum), required: true },
                    day: { type: String, enum: Object.values(progressAlertDayEnum), required: true },
                    time: { type: String, default: '10:00' },
               },
          },

          // Media
          gallery: [{ type: String }],

          // Privacy Policy
          privacyPolicy: { type: privacyPolicySchema, required: true },
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
