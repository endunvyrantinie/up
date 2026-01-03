import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, updateUser, createTransaction } from '@/lib/db';

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

    const user = await findUserById(decoded.userId);
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
    const streak = user.checkInStreak || 0;
    const newStreak = lastCheckIn && new Date(today) > new Date(lastCheckIn + 'T00:00:00') && 
      (new Date(today).getTime() - new Date(lastCheckIn + 'T00:00:00').getTime()) < 2 * 24 * 60 * 60 * 1000
      ? streak + 1 : 1;

    // Update user
    const updatedUser = await updateUser(user.id, {
      balance: user.balance + reward,
      totalEarned: user.totalEarned + reward,
      dailyRewardsBalance: (user.dailyRewardsBalance || 0) + reward,
      dailyRewardsTotal: (user.dailyRewardsTotal || 0) + reward,
      lastCheckIn: new Date().toISOString(),
      checkInStreak: newStreak,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Create transaction
    await createTransaction({
      id: Date.now().toString(),
      userId: user.id,
      type: 'daily_reward',
      amount: reward,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Daily check-in reward (Streak: ${newStreak})`,
    });

    return NextResponse.json({ 
      success: true, 
      reward,
      streak: newStreak,
      balance: updatedUser.balance 
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 });
  }
}

