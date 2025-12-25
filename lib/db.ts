import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REFERRALS_FILE = path.join(DATA_DIR, 'referrals.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const VIP_PURCHASES_FILE = path.join(DATA_DIR, 'vip_purchases.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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

export interface User {
  id: string;
  username: string;
  email: string;
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
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  description?: string;
}

export interface VIPPurchase {
  id: string;
  userId: string;
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

// Write functions
export const writeUsers = (users: User[]) => {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

export const writeReferrals = (referrals: Referral[]) => {
  fs.writeFileSync(REFERRALS_FILE, JSON.stringify(referrals, null, 2));
};

export const writeTransactions = (transactions: Transaction[]) => {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
};

export const writeVIPPurchases = (purchases: VIPPurchase[]) => {
  fs.writeFileSync(VIP_PURCHASES_FILE, JSON.stringify(purchases, null, 2));
};

// Helper functions
export const findUserByEmail = (email: string): User | undefined => {
  const users = readUsers();
  return users.find(u => u.email === email);
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

