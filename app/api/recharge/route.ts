import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, readUsers, writeUsers, readTransactions, writeTransactions } from '@/lib/db';
import { generateQRCode } from '@/lib/qrCode';

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

    // Generate QR code for payment
    const qrCode = await generateQRCode(amount);

    // For MVP: create pending transaction (not immediately added to wallet)
    const transactions = readTransactions();
    const transactionId = Date.now().toString();
    transactions.push({
      id: transactionId,
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'pending', // Changed to pending - admin needs to approve
      createdAt: new Date().toISOString(),
      description: 'Recharge deposit',
      qrCode: qrCode, // Store QR code in transaction
    });
    writeTransactions(transactions);

    return NextResponse.json({ 
      success: true, 
      message: 'QR code generated. Please scan to complete payment.',
      qrCode: qrCode,
      amount: amount,
      transactionId: transactionId
    });
  } catch (error) {
    console.error('Recharge error:', error);
    return NextResponse.json({ error: 'Recharge failed' }, { status: 500 });
  }
}

