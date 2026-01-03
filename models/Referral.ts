import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
  id: string;
  referrerId: string;
  referredId: string;
  level: number; // 1, 2, or 3
  commission: number;
  createdAt: string;
}

const ReferralSchema = new Schema<IReferral>({
  id: { type: String, required: true, unique: true },
  referrerId: { type: String, required: true, index: true },
  referredId: { type: String, required: true, index: true },
  level: { type: Number, required: true, min: 1, max: 3 },
  commission: { type: Number, default: 0 },
  createdAt: { type: String, required: true },
}, {
  timestamps: false,
});

const Referral: Model<IReferral> = mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;


