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

    const { amount } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum deposit is RM 50' }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For MVP: immediately add to wallet (mock)
    user.balance += amount;
    user.totalEarned += amount;
    writeUsers(users);

    const transactions = readTransactions();
    transactions.push({
      id: Date.now().toString(),
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: 'Recharge deposit',
    });
    writeTransactions(transactions);

    return NextResponse.json({ 
      success: true, 
      message: 'Recharge successful',
      balance: user.balance 
    });
  } catch (error) {
    console.error('Recharge error:', error);
    return NextResponse.json({ error: 'Recharge failed' }, { status: 500 });
  }
}

