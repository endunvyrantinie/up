import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readUsers, writeUsers, readTransactions, writeTransactions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { amount, reason } = await request.json();

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const users = readUsers();
    const bonusAmount = parseFloat(amount);
    const transactions = readTransactions();

    // Add bonus to all users
    for (const user of users) {
      user.balance = (user.balance || 0) + bonusAmount;
      user.totalEarned = (user.totalEarned || 0) + bonusAmount;

      // Create transaction record
      transactions.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        type: 'commission',
        amount: bonusAmount,
        status: 'completed',
        createdAt: new Date().toISOString(),
        description: reason || `Bulk bonus: RM ${bonusAmount.toFixed(2)}`,
      });
    }

    writeUsers(users);
    writeTransactions(transactions);

    return NextResponse.json({
      success: true,
      message: `Added RM ${bonusAmount.toFixed(2)} to ${users.length} users`,
      usersAffected: users.length,
    });
  } catch (error: any) {
    console.error('Bulk bonus error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to add bulk bonus' 
    }, { status: 500 });
  }
}

