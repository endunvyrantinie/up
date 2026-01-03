import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentChannel extends Document {
  id: string;
  name: string;
  type: string; // 'bank', 'ewallet', 'crypto', etc.
  details: string;
  instructions?: string;
  isActive: boolean;
}

const PaymentChannelSchema = new Schema<IPaymentChannel>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  details: { type: String, required: true },
  instructions: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: false,
});

const PaymentChannel: Model<IPaymentChannel> = mongoose.models.PaymentChannel || mongoose.model<IPaymentChannel>('PaymentChannel', PaymentChannelSchema);

export default PaymentChannel;


