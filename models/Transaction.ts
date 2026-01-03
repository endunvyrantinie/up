import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'commission' | 'daily_reward' | 'vip_return';
  amount: number;
  amountAfterTax?: number;
  tax?: number;
  status: 'pending' | 'completed' | 'failed' | 'approved' | 'rejected';
  createdAt: string;
  description?: string;
  qrCode?: string;
  approveDate?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['deposit', 'withdrawal', 'commission', 'daily_reward', 'vip_return']
  },
  amount: { type: Number, required: true },
  amountAfterTax: { type: Number },
  tax: { type: Number },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'completed', 'failed', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: String, required: true },
  description: { type: String },
  qrCode: { type: String },
  approveDate: { type: String },
}, {
  timestamps: false,
});

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;


