import { Schema, model } from 'mongoose';
import { IContent, ContentModel } from './content.interface';

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
          level: { type: Number, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
          benefits: [{ type: String }],
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
