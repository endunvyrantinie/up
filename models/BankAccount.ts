import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAccount extends Document {
  id: string;
  name: string;
  bank: string;
  account: string;
  accountHolder: string;
  swift?: string;
  isActive: boolean;
}

const BankAccountSchema = new Schema<IBankAccount>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  bank: { type: String, required: true },
  account: { type: String, required: true },
  accountHolder: { type: String, required: true },
  swift: { type: String },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: false,
});

const BankAccount: Model<IBankAccount> = mongoose.models.BankAccount || mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);

export default BankAccount;


