import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, getReferralCount, readReferrals, readVIPPurchases } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.isAdmin) {
      return NextResponse.json({ 
        user: { id: 'admin', isAdmin: true },
        isAdmin: true 
      });
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referralCount = getReferralCount(user.id);
    const referrals = readReferrals();
    const userReferrals = referrals.filter(r => r.referrerId === user.id);
    const totalCommissions = userReferrals.reduce((sum, r) => sum + r.commission, 0);

    const vipPurchases = readVIPPurchases();
    const activeVIP = vipPurchases.filter(p => p.userId === user.id && new Date(p.expiresAt) > new Date());

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        balance: user.balance,
        vipLevel: user.vipLevel,
        totalEarned: user.totalEarned,
        totalWithdrawn: user.totalWithdrawn,
        referralCount,
        totalCommissions,
        lastCheckIn: user.lastCheckIn,
        checkInStreak: user.checkInStreak || 0,
        activeVIP,
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

