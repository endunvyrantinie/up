import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readTransactions, updateTransaction } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const transactions = await readTransactions();
    const transaction = transactions.find((t: any) => t.id === transactionId);

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.type !== 'withdrawal') {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json({ error: 'Transaction is not pending' }, { status: 400 });
    }

    // Update transaction status
    const updatedTransaction = await updateTransaction(transactionId, {
      status: 'approved',
      approveDate: new Date().toISOString(),
    });

    if (!updatedTransaction) {
      return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal approved successfully',
      transaction: {
        id: updatedTransaction.id,
        status: updatedTransaction.status,
        approveDate: updatedTransaction.approveDate,
      }
    });
  } catch (error: any) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json({ error: 'Failed to approve withdrawal' }, { status: 500 });
  }
}
