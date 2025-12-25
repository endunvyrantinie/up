import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readUsers, readReferrals, readTransactions, readVIPPurchases } from '@/lib/db';

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

    const users = readUsers();
    const referrals = readReferrals();
    const transactions = readTransactions();
    const vipPurchases = readVIPPurchases();

    // Calculate statistics
    const totalUsers = users.length;
    const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
    const totalEarned = users.reduce((sum, u) => sum + u.totalEarned, 0);
    const totalWithdrawn = users.reduce((sum, u) => sum + u.totalWithdrawn, 0);
    const totalReferrals = referrals.length;
    const totalCommissions = referrals.reduce((sum, r) => sum + r.commission, 0);
    const totalTransactions = transactions.length;
    const activeVIP = vipPurchases.filter(p => new Date(p.expiresAt) > new Date()).length;
    
    // VIP level distribution
    const vipDistribution = {
      level0: users.filter(u => u.vipLevel === 0).length,
      level1: users.filter(u => u.vipLevel === 1).length,
      level2: users.filter(u => u.vipLevel === 2).length,
      level3: users.filter(u => u.vipLevel === 3).length,
      level4: users.filter(u => u.vipLevel === 4).length,
    };

    // Transaction types
    const transactionTypes = {
      deposit: transactions.filter(t => t.type === 'deposit').length,
      withdrawal: transactions.filter(t => t.type === 'withdrawal').length,
      commission: transactions.filter(t => t.type === 'commission').length,
      daily_reward: transactions.filter(t => t.type === 'daily_reward').length,
      vip_return: transactions.filter(t => t.type === 'vip_return').length,
    };

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = users.filter(u => new Date(u.createdAt) > sevenDaysAgo).length;

    // Pending withdrawals
    const pendingWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
    const pendingAmount = transactions
      .filter(t => t.type === 'withdrawal' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    // Top referrers
    const topReferrers = users
      .map(u => ({
        username: u.username,
        referralCount: referrals.filter(r => r.referrerId === u.id).length,
        commissions: referrals.filter(r => r.referrerId === u.id).reduce((sum, r) => sum + r.commission, 0),
      }))
      .sort((a, b) => b.referralCount - a.referralCount)
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

