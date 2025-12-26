import fs from 'fs';
import path from 'path';
import os from 'os';

// Use /tmp directory in Vercel (read-write), otherwise use project data directory
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel 
  ? path.join(os.tmpdir(), 'coffee-rewards-data')
  : path.join(process.cwd(), 'data');

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REFERRALS_FILE = path.join(DATA_DIR, 'referrals.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const VIP_PURCHASES_FILE = path.join(DATA_DIR, 'vip_purchases.json');
const BANK_ACCOUNTS_FILE = path.join(DATA_DIR, 'bank_accounts.json');
const PAYMENT_CHANNELS_FILE = path.join(DATA_DIR, 'payment_channels.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directory:', error);
  }
}

// Initialize files if they don't exist
const initFile = (filePath: string, defaultValue: any) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
};

initFile(USERS_FILE, []);
initFile(REFERRALS_FILE, []);
initFile(TRANSACTIONS_FILE, []);
initFile(VIP_PURCHASES_FILE, []);
initFile(BANK_ACCOUNTS_FILE, [
  { id: '1', name: 'Bank Account 1', bank: 'Maybank', account: '1234567890', accountHolder: 'Coffee Rewards Sdn Bhd', swift: '', isActive: true },
  { id: '2', name: 'Bank Account 2', bank: 'CIMB', account: '0987654321', accountHolder: 'Coffee Rewards Sdn Bhd', swift: '', isActive: true },
]);
initFile(PAYMENT_CHANNELS_FILE, [
  { id: '1', name: 'Payment Channel 1', type: 'bank', details: 'Secure & Fast', instructions: '', isActive: true },
]);
initFile(BANK_ACCOUNTS_FILE, [
  { id: '1', name: 'Bank Account 1', bank: 'Maybank', account: '1234567890', accountHolder: 'Coffee Rewards Sdn Bhd', swift: '', isActive: true },
  { id: '2', name: 'Bank Account 2', bank: 'CIMB', account: '0987654321', accountHolder: 'Coffee Rewards Sdn Bhd', swift: '', isActive: true },
]);
initFile(PAYMENT_CHANNELS_FILE, [
  { id: '1', name: 'Payment Channel 1', type: 'bank', details: 'Secure & Fast', instructions: '', isActive: true },
]);

export interface User {
  id: string;
  username: string;
  phone: string; // Phone number instead of email
  email?: string; // Keep for backward compatibility, but not required
  password: string; // hashed
  referralCode: string;
  referredBy?: string; // referral code of referrer
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
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  level: number; // 1, 2, or 3
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

// Read functions
export const readUsers = (): User[] => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const readReferrals = (): Referral[] => {
  try {
    const data = fs.readFileSync(REFERRALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const readTransactions = (): Transaction[] => {
  try {
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const readVIPPurchases = (): VIPPurchase[] => {
  try {
    const data = fs.readFileSync(VIP_PURCHASES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

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
  type: string; // 'bank', 'ewallet', 'crypto', etc.
  details: string;
  instructions?: string;
  isActive: boolean;
}

export const readBankAccounts = (): BankAccount[] => {
  try {
    const data = fs.readFileSync(BANK_ACCOUNTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const writeBankAccounts = (accounts: BankAccount[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(BANK_ACCOUNTS_FILE, JSON.stringify(accounts, null, 2));
  } catch (error) {
    console.error('Error writing bank accounts:', error);
    throw error;
  }
};

export const readPaymentChannels = (): PaymentChannel[] => {
  try {
    const data = fs.readFileSync(PAYMENT_CHANNELS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const writePaymentChannels = (channels: PaymentChannel[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PAYMENT_CHANNELS_FILE, JSON.stringify(channels, null, 2));
  } catch (error) {
    console.error('Error writing payment channels:', error);
    throw error;
  }
};

// Write functions
export const writeUsers = (users: User[]) => {
  try {
    // Ensure directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users:', error);
    throw error;
  }
};

export const writeReferrals = (referrals: Referral[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REFERRALS_FILE, JSON.stringify(referrals, null, 2));
  } catch (error) {
    console.error('Error writing referrals:', error);
    throw error;
  }
};

export const writeTransactions = (transactions: Transaction[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
  } catch (error) {
    console.error('Error writing transactions:', error);
    throw error;
  }
};

export const writeVIPPurchases = (purchases: VIPPurchase[]) => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(VIP_PURCHASES_FILE, JSON.stringify(purchases, null, 2));
  } catch (error) {
    console.error('Error writing VIP purchases:', error);
    throw error;
  }
};

// Helper functions
export const findUserByEmail = (email: string): User | undefined => {
  const users = readUsers();
  return users.find(u => u.email === email);
};

export const findUserByPhone = (phone: string): User | undefined => {
  const users = readUsers();
  // Normalize phone for comparison
  const normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
  
  return users.find(u => {
    const userPhone = (u.phone || '').replace(/\s+/g, '').replace(/-/g, '');
    const userUsername = (u.username || '').replace(/\s+/g, '').replace(/-/g, '');
    return userPhone === normalizedPhone || 
           userPhone === phone || 
           userUsername === normalizedPhone || 
           userUsername === phone ||
           u.phone === phone ||
           u.username === phone;
  });
};

export const findUserByReferralCode = (code: string): User | undefined => {
  const users = readUsers();
  return users.find(u => u.referralCode === code);
};

export const findUserById = (id: string): User | undefined => {
  const users = readUsers();
  return users.find(u => u.id === id);
};

export const getReferralTree = (userId: string, level: number = 1): string[] => {
  const referrals = readReferrals();
  const directRefs = referrals
    .filter(r => r.referrerId === userId && r.level === 1)
    .map(r => r.referredId);
  
  if (level >= 3) return directRefs;
  
  const allRefs = [...directRefs];
  directRefs.forEach(refId => {
    allRefs.push(...getReferralTree(refId, level + 1));
  });
  
  return allRefs;
};

export const getReferralCount = (userId: string, level: number = 1): number => {
  const referrals = readReferrals();
  return referrals.filter(r => r.referrerId === userId && r.level === level).length;
};

// Referral tree item interface
export interface ReferralTreeItem {
  id: string;
  username: string;
  level: number;
  commission: number;
  createdAt: string;
}

