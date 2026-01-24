// src/models/Referral.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IReferral extends Document {
     campaignId: Types.ObjectId;
     phone: string; // এটাই এখন প্রাইমারি আইডেন্টিফায়ার (unique per campaign)
     parentPhone?: string; // parent-এর phone (root-এর জন্য null/undefined)
     donationAmount: number; // এই নোড থেকে কত টাকা ডোনেট করেছে (0 হলে ignore)
     invitedPhones: string[]; // এই নোড যাদের ইনভাইট করেছে (array of phones)
     createdAt: Date;
     lastDonatedAt?: Date; // optional: শেষ ডোনেশনের সময়
}

const ReferralSchema = new Schema<IReferral>({
     campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
     phone: {
          type: String,
          required: true,
          trim: true,
          // validate BD phone or international as needed
     },
     parentPhone: { type: String, trim: true },
     donationAmount: { type: Number, default: 0, min: 0 },
     invitedPhones: { type: [String], default: [] },
     createdAt: { type: Date, default: Date.now },
     lastDonatedAt: { type: Date },
});

// Compound unique index: একই ক্যাম্পেইনে একই ফোন একবারই থাকবে
ReferralSchema.index({ campaignId: 1, phone: 1 }, { unique: true });

export const ReferralModel = model<IReferral>('Referral', ReferralSchema);
