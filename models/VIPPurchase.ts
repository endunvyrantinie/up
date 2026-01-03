import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVIPPurchase extends Document {
  id: string;
  userId: string;
  productId?: string;
  vipLevel: number;
  amount: number;
  dailyReturn: number;
  daysRemaining: number;
  createdAt: string;
  expiresAt: string;
}

const VIPPurchaseSchema = new Schema<IVIPPurchase>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  productId: { type: String },
  vipLevel: { type: Number, required: true },
  amount: { type: Number, required: true },
  dailyReturn: { type: Number, required: true },
  daysRemaining: { type: Number, required: true },
  createdAt: { type: String, required: true },
  expiresAt: { type: String, required: true },
}, {
  timestamps: false,
});

const VIPPurchase: Model<IVIPPurchase> = mongoose.models.VIPPurchase || mongoose.model<IVIPPurchase>('VIPPurchase', VIPPurchaseSchema);

export default VIPPurchase;


