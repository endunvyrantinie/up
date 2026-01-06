import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  // ADD THESE FIELDS:
  bankName: { type: String, default: '' },
  accountName: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  // ... (keep all your other existing fields like referralCode, etc.)
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
