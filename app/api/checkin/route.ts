import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, readUsers, writeUsers, readTransactions, writeTransactions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn).toISOString().split('T')[0] : null;

    if (lastCheckIn === today) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 });
    }

    // Daily reward: RM 0.50
    const reward = 0.50;

    user.balance += reward;
    user.totalEarned += reward;
    user.dailyRewardsBalance = (user.dailyRewardsBalance || 0) + reward;
    user.dailyRewardsTotal = (user.dailyRewardsTotal || 0) + reward;
    user.lastCheckIn = new Date().toISOString();
    const streak = user.checkInStreak || 0;
    user.checkInStreak = lastCheckIn && new Date(today) > new Date(lastCheckIn + 'T00:00:00') && 
      (new Date(today).getTime() - new Date(lastCheckIn + 'T00:00:00').getTime()) < 2 * 24 * 60 * 60 * 1000
      ? streak + 1 : 1;

    writeUsers(users);

    const transactions = readTransactions();
    transactions.push({
      id: Date.now().toString(),
      userId: user.id,
      type: 'daily_reward',
      amount: reward,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Daily check-in reward (Streak: ${user.checkInStreak})`,
    });
    writeTransactions(transactions);

    return NextResponse.json({ 
      success: true, 
      reward,
      streak: user.checkInStreak,
      balance: user.balance 
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 });
  }
}

