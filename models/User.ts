import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  username: string;
  phone: string;
  email?: string;
  password: string;
  referralCode: string;
  referredBy?: string;
  balance: number;
  vipLevel: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalInvested?: number;
  createdAt: string;
  lastCheckIn?: string;
  checkInStreak?: number;
  dailyRewardsBalance?: number;
  dailyRewardsTotal?: number;
  hasSeenInfoModal?: boolean;
  isAdmin?: boolean;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, sparse: true },
  password: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true, index: true },
  referredBy: { type: String },
  balance: { type: Number, default: 0 },
  vipLevel: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },
  createdAt: { type: String, required: true },
  lastCheckIn: { type: String },
  checkInStreak: { type: Number, default: 0 },
  dailyRewardsBalance: { type: Number, default: 0 },
  dailyRewardsTotal: { type: Number, default: 0 },
  hasSeenInfoModal: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
}, {
  timestamps: false,
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
