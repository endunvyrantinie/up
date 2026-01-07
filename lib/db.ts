// MongoDB-based database operations
import connectDB from './mongodb';
import User, { IUser } from '@/models/User';
import Transaction, { ITransaction } from '@/models/Transaction';
import Referral, { IReferral } from '@/models/Referral';
import VIPPurchase, { IVIPPurchase } from '@/models/VIPPurchase';
import BankAccount, { IBankAccount } from '@/models/BankAccount';
import PaymentChannel, { IPaymentChannel } from '@/models/PaymentChannel';
import Settings, { ISettings } from '@/models/Settings';
import Product, { IProduct } from '@/models/Product';

// Export interfaces for backward compatibility
export interface User {
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

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  level: number;
  commission: number;
  createdAt: string;
}

export interface Transaction {
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
  user?: any;
}

export interface VIPPurchase {
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

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  account: string;
  accountHolder: string;
  swift?: string;
  isActive: boolean;
}

export interface PaymentChannel {
  id: string;
  name: string;
  type: string;
  details: string;
  instructions?: string;
  isActive: boolean;
}

export interface Settings {
  telegramSupport: string;
  telegramChannel: string;
  telegramGroup: string;
  qrDataFormat?: string;
  qrDarkColor?: string;
  qrLightColor?: string;
  qrWidth?: number;
  qrMargin?: number;
  uploadedQRCode?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  validityDays: number;
}

// Helper to convert MongoDB document to plain object
const toPlainObject = (doc: any): any => {
  if (!doc) return null;
  if (doc.toObject) return doc.toObject();
  return doc;
};

// Read functions
export const readUsers = async (): Promise<User[]> => {
  try {
    await connectDB();
    const users = await User.find({}).lean();
    return users.map((u: any) => toPlainObject(u)) as User[];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const readReferrals = async (): Promise<Referral[]> => {
  try {
    await connectDB();
    const referrals = await Referral.find({}).lean();
    return referrals.map((r: any) => toPlainObject(r)) as Referral[];
  } catch (error) {
    console.error('Error reading referrals:', error);
    return [];
  }
};

export const readTransactions = async (): Promise<Transaction[]> => {
  try {
    await connectDB();
    const transactions = await Transaction.find({}).lean();
    return transactions.map((t: any) => toPlainObject(t)) as Transaction[];
  } catch (error) {
    console.error('Error reading transactions:', error);
    return [];
  }
};

export const readVIPPurchases = async (): Promise<VIPPurchase[]> => {
  try {
    await connectDB();
    const purchases = await VIPPurchase.find({}).lean();
    return purchases.map((p: any) => toPlainObject(p)) as VIPPurchase[];
  } catch (error) {
    console.error('Error reading VIP purchases:', error);
    return [];
  }
};

export const readBankAccounts = async (): Promise<BankAccount[]> => {
  try {
    await connectDB();
    const accounts = await BankAccount.find({}).lean();
    return accounts.map((a: any) => toPlainObject(a)) as BankAccount[];
  } catch (error) {
    console.error('Error reading bank accounts:', error);
    return [];
  }
};

export const readPaymentChannels = async (): Promise<PaymentChannel[]> => {
  try {
    await connectDB();
    const channels = await PaymentChannel.find({}).lean();
    return channels.map((c: any) => toPlainObject(c)) as PaymentChannel[];
  } catch (error) {
    console.error('Error reading payment channels:', error);
    return [];
  }
};

export const readSettings = async (): Promise<Settings> => {
  try {
    await connectDB();
    let settings = await Settings.findOne({ id: 'main' }).lean();
    
    if (!settings) {
      const defaultSettings = {
        id: 'main',
        telegramSupport: process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || 'https://t.me/coffeesupport',
        telegramChannel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/coffeerewards',
        telegramGroup: process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || 'https://t.me/coffeerewardsgroup',
        qrDataFormat: 'COFFEEPAY-{amount}-{timestamp}',
        qrDarkColor: '#8B4513',
        qrLightColor: '#FFFFFF',
        qrWidth: 300,
        qrMargin: 2,
        uploadedQRCode: undefined,
      };
      await Settings.create(defaultSettings );
      settings = await Settings.findOne({ id: 'main' }).lean();
    }
    
    return toPlainObject(settings) as Settings;
  } catch (error) {
    console.error('Error reading settings:', error);
    return {
      telegramSupport: process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || 'https://t.me/coffeesupport',
      telegramChannel: process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || 'https://t.me/coffeerewards',
      telegramGroup: process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || 'https://t.me/coffeerewardsgroup',
      qrDataFormat: 'COFFEEPAY-{amount}-{timestamp}',
      qrDarkColor: '#8B4513',
      qrLightColor: '#FFFFFF',
      qrWidth: 300,
      qrMargin: 2,
      uploadedQRCode: undefined,
    };
  }
};

export const readProducts = async ( ): Promise<Product[]> => {
  try {
    await connectDB();
    const products = await Product.find({}).lean();
    return products.map((p: any) => toPlainObject(p)) as Product[];
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
};

// Write functions
export const writeUsers = async (users: User[]): Promise<void> => {
  try {
    await connectDB();
    for (const user of users) {
      await User.findOneAndUpdate(
        { id: user.id },
        { $set: user },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error writing users:', error);
    throw error;
  }
};

export const writeSettings = async (settings: Settings): Promise<void> => {
  try {
    await connectDB();
    await Settings.findOneAndUpdate(
      { id: 'main' },
      { $set: { ...settings, id: 'main' } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error writing settings:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, updateData: Partial<Product>): Promise<Product | null> => {
  try {
    await connectDB();
    const product = await Product.findOneAndUpdate(
      { id: productId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(product) as Product | null;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const createUser = async (userData: User): Promise<User> => {
  try {
    await connectDB();
    const user = await User.create(userData);
    return toPlainObject(user) as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (userId: string, updateData: Partial<User>): Promise<User | null> => {
  try {
    await connectDB();
    const user = await User.findOneAndUpdate(
      { id: userId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(user) as User | null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const createTransaction = async (transactionData: Transaction): Promise<Transaction> => {
  try {
    await connectDB();
    const transaction = await Transaction.create(transactionData);
    return toPlainObject(transaction) as Transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (transactionId: string, updateData: Partial<Transaction>): Promise<Transaction | null> => {
  try {
    await connectDB();
    const transaction = await Transaction.findOneAndUpdate(
      { id: transactionId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(transaction) as Transaction | null;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
};

export const createVIPPurchase = async (purchaseData: VIPPurchase): Promise<VIPPurchase> => {
  try {
    await connectDB();
    const purchase = await VIPPurchase.create(purchaseData);
    return toPlainObject(purchase) as VIPPurchase;
  } catch (error) {
    console.error('Error creating VIP purchase:', error);
    throw error;
  }
};

export const updateVIPPurchase = async (purchaseId: string, updateData: Partial<VIPPurchase>): Promise<VIPPurchase | null> => {
  try {
    await connectDB();
    const purchase = await VIPPurchase.findOneAndUpdate(
      { id: purchaseId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(purchase) as VIPPurchase | null;
  } catch (error) {
    console.error('Error updating VIP purchase:', error);
    return null;
  }
};

export const createBankAccount = async (accountData: BankAccount): Promise<BankAccount> => {
  try {
    await connectDB();
    const account = await BankAccount.create(accountData);
    return toPlainObject(account) as BankAccount;
  } catch (error) {
    console.error('Error creating bank account:', error);
    throw error;
  }
};

export const updateBankAccount = async (accountId: string, updateData: Partial<BankAccount>): Promise<BankAccount | null> => {
  try {
    await connectDB();
    const account = await BankAccount.findOneAndUpdate(
      { id: accountId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(account) as BankAccount | null;
  } catch (error) {
    console.error('Error updating bank account:', error);
    return null;
  }
};

export const deleteBankAccount = async (accountId: string): Promise<boolean> => {
  try {
    await connectDB();
    await BankAccount.findOneAndDelete({ id: accountId });
    return true;
  } catch (error) {
    console.error('Error deleting bank account:', error);
    return false;
  }
};

export const createPaymentChannel = async (channelData: PaymentChannel): Promise<PaymentChannel> => {
  try {
    await connectDB();
    const channel = await PaymentChannel.create(channelData);
    return toPlainObject(channel) as PaymentChannel;
  } catch (error) {
    console.error('Error creating payment channel:', error);
    throw error;
  }
};

export const updatePaymentChannel = async (channelId: string, updateData: Partial<PaymentChannel>): Promise<PaymentChannel | null> => {
  try {
    await connectDB();
    const channel = await PaymentChannel.findOneAndUpdate(
      { id: channelId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(channel) as PaymentChannel | null;
  } catch (error) {
    console.error('Error updating payment channel:', error);
    return null;
  }
};

export const deletePaymentChannel = async (channelId: string): Promise<boolean> => {
  try {
    await connectDB();
    await PaymentChannel.findOneAndDelete({ id: channelId });
    return true;
  } catch (error) {
    console.error('Error deleting payment channel:', error);
    return false;
  }
};

export const createReferral = async (referralData: Referral): Promise<Referral> => {
  try {
    await connectDB();
    const referral = await Referral.create(referralData);
    return toPlainObject(referral) as Referral;
  } catch (error) {
    console.error('Error creating referral:', error);
    throw error;
  }
};

export const updateReferral = async (referralId: string, updateData: Partial<Referral>): Promise<Referral | null> => {
  try {
    await connectDB();
    const referral = await Referral.findOneAndUpdate(
      { id: referralId },
      { $set: updateData },
      { new: true }
    ).lean();
    return toPlainObject(referral) as Referral | null;
  } catch (error) {
    console.error('Error updating referral:', error);
    return null;
  }
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    await connectDB();
    const user = await User.findOne({ email }).lean();
    return toPlainObject(user) as User | undefined;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return undefined;
  }
};

export const findUserById = async (id: string): Promise<User | undefined> => {
  try {
    await connectDB();
    const user = await User.findOne({ id }).lean();
    return toPlainObject(user) as User | undefined;
  } catch (error) {
    console.error('Error finding user by id:', error);
    return undefined;
  }
};

export const findUserByPhone = async (phone: string): Promise<User | undefined> => {
  try {
    await connectDB();
    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: phone },
        { username: normalizedPhone },
        { username: phone },
      ]
    }).lean();
    return toPlainObject(user) as User | undefined;
  } catch (error) {
    console.error('Error finding user by phone:', error);
    return undefined;
  }
};

export const findUserByReferralCode = async (referralCode: string): Promise<User | undefined> => {
  try {
    await connectDB();
    const user = await User.findOne({ referralCode }).lean();
    return toPlainObject(user) as User | undefined;
  } catch (error) {
    console.error('Error finding user by referral code:', error);
    return undefined;
  }
};

export const getReferralCount = async (userId: string, level: number = 1): Promise<number> => {
  try {
    await connectDB();
    const count = await Referral.countDocuments({ 
      referrerId: userId, 
      level 
    });
    return count;
  } catch (error) {
    console.error('Error getting referral count:', error);
    return 0;
  }
};
