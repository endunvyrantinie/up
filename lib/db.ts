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
      // Create default settings
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
      await Settings.create(defaultSettings);
      // Read it back as lean
      settings = await Settings.findOne({ id: 'main' }).lean();
    }
    
    return toPlainObject(settings) as Settings;
  } catch (error) {
    console.error('Error reading settings:', error);
    // Return defaults on error
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

// Write functions
export const writeUsers = async (users: User[]): Promise<void> => {
  try {
    await connectDB();
    // For bulk operations, we'll use upsert for each user
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

export const writeReferrals = async (referrals: Referral[]): Promise<void> => {
  try {
    await connectDB();
    for (const referral of referrals) {
      await Referral.findOneAndUpdate(
        { id: referral.id },
        { $set: referral },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error writing referrals:', error);
    throw error;
  }
};

export const writeTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await connectDB();
    for (const transaction of transactions) {
      await Transaction.findOneAndUpdate(
        { id: transaction.id },
        { $set: transaction },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error writing transactions:', error);
    throw error;
  }
};

export const writeVIPPurchases = async (purchases: VIPPurchase[]): Promise<void> => {
  try {
    await connectDB();
    for (const purchase of purchases) {
      await VIPPurchase.findOneAndUpdate(
        { id: purchase.id },
        { $set: purchase },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error writing VIP purchases:', error);
    throw error;
  }
};

export const writeBankAccounts = async (accounts: BankAccount[]): Promise<void> => {
  try {
    await connectDB();
    for (const account of accounts) {
      await BankAccount.findOneAndUpdate(
        { id: account.id },
        { $set: account },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error writing bank accounts:', error);
    throw error;
  }
};

export const writePaymentChannels = async (channels: PaymentChannel[]): Promise<void> => {
  try {
    await connectDB();
    for (const channel of channels) {
      await PaymentChannel.findOneAndUpdate(
        { id: channel.id },
        { $set: channel },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error writing payment channels:', error);
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

// Helper functions
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

export const findUserByPhone = async (phone: string): Promise<User | undefined> => {
  try {
    await connectDB();
    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    
    // Try multiple matching strategies
    const user = await User.findOne({
      $or: [
        { phone: normalizedPhone },
        { phone: phone },
        { username: normalizedPhone },
        { username: phone },
      ]
    }).lean();
    
    if (user) {
      return toPlainObject(user) as User;
    }
    
    // Try without + prefix
    const phoneWithoutPlus = normalizedPhone.replace(/^\+/, '');
    const userWithoutPlus = await User.findOne({
      $or: [
        { phone: { $regex: phoneWithoutPlus } },
        { username: { $regex: phoneWithoutPlus } },
      ]
    }).lean();
    
    return toPlainObject(userWithoutPlus) as User | undefined;
  } catch (error) {
    console.error('Error finding user by phone:', error);
    return undefined;
  }
};

export const findUserByReferralCode = async (code: string): Promise<User | undefined> => {
  try {
    await connectDB();
    const user = await User.findOne({ referralCode: code }).lean();
    return toPlainObject(user) as User | undefined;
  } catch (error) {
    console.error('Error finding user by referral code:', error);
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

export const getReferralTree = async (userId: string, level: number = 1): Promise<string[]> => {
  try {
    await connectDB();
    const referrals = await Referral.find({ 
      referrerId: userId, 
      level: 1 
    }).lean();
    
    const directRefs = referrals.map((r: any) => r.referredId);
    
    if (level >= 3) return directRefs;
    
    const allRefs = [...directRefs];
    for (const refId of directRefs) {
      const subRefs = await getReferralTree(refId, level + 1);
      allRefs.push(...subRefs);
    }
    
    return allRefs;
  } catch (error) {
    console.error('Error getting referral tree:', error);
    return [];
  }
};

export const readProducts = async (): Promise<Product[]> => {
  try {
    await connectDB();
    const products = await Product.find({}).lean();
    if (products.length === 0) {
      // Initialize default products
      const defaultProducts = [
        { id: 'VIP1', name: 'VIP1', price: 50, dailyIncome: 8, totalIncome: 720, validityDays: 90 },
        { id: 'VIP2', name: 'VIP2', price: 100, dailyIncome: 18, totalIncome: 1620, validityDays: 90 },
        { id: 'VIP3', name: 'VIP3', price: 200, dailyIncome: 38, totalIncome: 3420, validityDays: 90 },
        { id: 'VIP4', name: 'VIP4', price: 400, dailyIncome: 80, totalIncome: 7200, validityDays: 90 },
        { id: 'VIP5', name: 'VIP5', price: 800, dailyIncome: 168, totalIncome: 15120, validityDays: 90 },
        { id: 'VIP6', name: 'VIP6', price: 1600, dailyIncome: 352, totalIncome: 31680, validityDays: 90 },
        { id: 'VIP7', name: 'VIP7', price: 3000, dailyIncome: 680, totalIncome: 61200, validityDays: 90 },
        { id: 'VIP8', name: 'VIP8', price: 6000, dailyIncome: 1400, totalIncome: 126000, validityDays: 90 },
        { id: 'VIP9', name: 'VIP9', price: 12000, dailyIncome: 2880, totalIncome: 259200, validityDays: 90 },
      ];
      await Product.insertMany(defaultProducts);
      return defaultProducts as Product[];
    }
    return products.map((p: any) => toPlainObject(p)) as Product[];
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
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

// Referral tree item interface
export interface ReferralTreeItem {
  id: string;
  username: string;
  level: number;
  commission: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  validityDays: number;
}

// MongoDB-specific helper functions
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
