import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, readReferrals, readTransactions, readVIPPurchases, readUsers, getReferralCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referrals = await readReferrals();
    const transactions = await readTransactions();
    const vipPurchases = await readVIPPurchases();
    const allUsers = await readUsers();

    // Get referral tree
    const level1Refs = referrals
      .filter((r: any) => r.referrerId === user.id && r.level === 1)
      .map((r: any) => {
        const referredUser = allUsers.find((u: any) => u.id === r.referredId);
        return {
          id: r.referredId,
          username: referredUser?.username || 'Unknown',
          phone: referredUser?.phone || referredUser?.email?.replace('@coffee.com', '') || 'N/A',
          commission: r.commission,
          createdAt: r.createdAt,
        };
      });

    // Get user transactions
    const userTransactions = transactions
      .filter((t: any) => t.userId === user.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50);

    // Get active VIP purchases
    const activeVIP = vipPurchases.filter((p: any) => 
      p.userId === user.id && new Date(p.expiresAt) > new Date()
    );

    // Calculate stats
    const totalDeposits = transactions
      .filter((t: any) => t.userId === user.id && t.type === 'deposit')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter((t: any) => t.userId === user.id && t.type === 'withdrawal')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalCommissions = referrals
      .filter((r: any) => r.referrerId === user.id)
      .reduce((sum: number, r: any) => sum + r.commission, 0);

    return NextResponse.json({
      user: {
        ...user,
        password: undefined,
      },
      referralTree: {
        level1: level1Refs,
        total: level1Refs.length,
      },
      transactions: userTransactions,
      activeVIP,
      stats: {
        totalDeposits,
        totalWithdrawals,
        totalCommissions,
        referralCount: await getReferralCount(user.id),
      },
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json({ error: 'Failed to fetch user details' }, { status: 500 });
  }
}
