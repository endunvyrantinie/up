import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  id: string; // Single document with id: 'main'
  telegramSupport: string;
  telegramChannel: string;
  telegramGroup: string;
  qrDataFormat?: string;
  qrDarkColor?: string;
  qrLightColor?: string;
  qrWidth?: number;
  qrMargin?: number;
  uploadedQRCode?: string; // Base64 string
}

const SettingsSchema = new Schema<ISettings>({
  id: { type: String, required: true, unique: true, default: 'main' },
  telegramSupport: { type: String, default: 'https://t.me/coffeesupport' },
  telegramChannel: { type: String, default: 'https://t.me/coffeerewards' },
  telegramGroup: { type: String, default: 'https://t.me/coffeerewardsgroup' },
  qrDataFormat: { type: String, default: 'COFFEEPAY-{amount}-{timestamp}' },
  qrDarkColor: { type: String, default: '#8B4513' },
  qrLightColor: { type: String, default: '#FFFFFF' },
  qrWidth: { type: Number, default: 300 },
  qrMargin: { type: Number, default: 2 },
  uploadedQRCode: { type: String },
}, {
  timestamps: false,
});

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;


