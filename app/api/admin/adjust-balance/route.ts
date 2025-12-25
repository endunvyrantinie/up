import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, readUsers, writeUsers, readTransactions, writeTransactions } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { userId, amount, reason } = await request.json();

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.balance += amount;
    if (amount > 0) {
      user.totalEarned += amount;
    }
    writeUsers(users);

    const transactions = readTransactions();
    transactions.push({
      id: Date.now().toString(),
      userId: user.id,
      type: amount > 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(amount),
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Admin adjustment: ${reason || 'Manual balance adjustment'}`,
    });
    writeTransactions(transactions);

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        balance: user.balance,
      }
    });
  } catch (error) {
    console.error('Admin adjust balance error:', error);
    return NextResponse.json({ error: 'Failed to adjust balance' }, { status: 500 });
  }
}

