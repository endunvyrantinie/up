import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { transactionId, action } = await request.json();

    await connectDB();
    const transaction = await Transaction.findOne({ id: transactionId });
    if (!transaction || transaction.status !== 'pending') return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });

    if (action === 'approve') {
      transaction.status = 'approved';
      transaction.approveDate = new Date().toISOString();
    } else if (action === 'reject') {
      transaction.status = 'rejected';
      const user = await User.findOne({ id: transaction.userId });
      if (user) {
        user.balance += transaction.amount;
        user.totalWithdrawn -= transaction.amount;
        await user.save();
      }
    }

    await transaction.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
