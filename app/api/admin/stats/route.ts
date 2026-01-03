import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readUsers, readReferrals, readTransactions, readVIPPurchases } from '@/lib/db';

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

    const users = await readUsers();
    const referrals = await readReferrals();
    const transactions = await readTransactions();
    const vipPurchases = await readVIPPurchases();

    // Calculate statistics
    const totalUsers = users.length;
    const totalBalance = users.reduce((sum: number, u: any) => sum + u.balance, 0);
    const totalEarned = users.reduce((sum: number, u: any) => sum + u.totalEarned, 0);
    const totalWithdrawn = users.reduce((sum: number, u: any) => sum + u.totalWithdrawn, 0);
    const totalReferrals = referrals.length;
    const totalCommissions = referrals.reduce((sum: number, r: any) => sum + r.commission, 0);
    const totalTransactions = transactions.length;
    const activeVIP = vipPurchases.filter((p: any) => new Date(p.expiresAt) > new Date()).length;
    
    // VIP level distribution
    const vipDistribution = {
      level0: users.filter((u: any) => u.vipLevel === 0).length,
      level1: users.filter((u: any) => u.vipLevel === 1).length,
      level2: users.filter((u: any) => u.vipLevel === 2).length,
      level3: users.filter((u: any) => u.vipLevel === 3).length,
      level4: users.filter((u: any) => u.vipLevel === 4).length,
    };

    // Transaction types
    const transactionTypes = {
      deposit: transactions.filter((t: any) => t.type === 'deposit').length,
      withdrawal: transactions.filter((t: any) => t.type === 'withdrawal').length,
      commission: transactions.filter((t: any) => t.type === 'commission').length,
      daily_reward: transactions.filter((t: any) => t.type === 'daily_reward').length,
      vip_return: transactions.filter((t: any) => t.type === 'vip_return').length,
    };

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = users.filter((u: any) => new Date(u.createdAt) > sevenDaysAgo).length;

    // Pending withdrawals
    const pendingWithdrawals = transactions.filter((t: any) => t.type === 'withdrawal' && t.status === 'pending').length;
    const pendingAmount = transactions
      .filter((t: any) => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Top referrers
    const topReferrers = users
      .map((u: any) => ({
        username: u.username,
        referralCount: referrals.filter((r: any) => r.referrerId === u.id).length,
        commissions: referrals.filter((r: any) => r.referrerId === u.id).reduce((sum: number, r: any) => sum + r.commission, 0),
      }))
      .sort((a: any, b: any) => b.referralCount - a.referralCount)
      .slice(0, 5);

    return NextResponse.json({
      overview: {
        totalUsers,
        totalBalance,
        totalEarned,
        totalWithdrawn,
        totalReferrals,
        totalCommissions,
        totalTransactions,
        activeVIP,
        recentUsers,
        pendingWithdrawals,
        pendingAmount,
      },
      vipDistribution,
      transactionTypes,
      topReferrers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
