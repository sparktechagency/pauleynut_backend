import { Schema, model } from "mongoose";

export enum SettingType {
  PrivacyPolicy = "privacy_policy"
}

export interface ISettings {
  type: SettingType;
  title: string;
  content: string;
}


const PrivacyPolicySchema = new Schema(
  {
    type: { type: String, enum: SettingType, required: true },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);


export const PrivacyPolicy = model("PrivacyPolicy", PrivacyPolicySchema);
