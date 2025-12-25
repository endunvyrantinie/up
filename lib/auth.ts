import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: string, isAdmin: boolean = false): string => {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: string; isAdmin: boolean } | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; isAdmin: boolean };
    return decoded;
  } catch {
    return null;
  }
};

export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

