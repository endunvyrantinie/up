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

    const { amount, paymentMethod, accountInfo } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // 24-hour delay logic (basic implementation)
    const minWithdrawal = 12; // Minimum withdrawal amount
    if (amount < minWithdrawal) {
      return NextResponse.json({ error: `Minimum withdrawal is RM ${minWithdrawal}` }, { status: 400 });
    }

    // Calculate 16% tax
    const tax = amount * 0.16;
    const amountAfterTax = amount - tax;

    user.balance -= amount;
    user.totalWithdrawn += amount;
    writeUsers(users);

    // Generate QR Code
    let qrCodeDataURL = '';
    try {
      qrCodeDataURL = await generateQRCode(amount);
    } catch (error) {
      console.error('QR generation failed, continuing without QR');
    }

    const transactions = readTransactions();
    transactions.push({
      id: Date.now().toString(),
      userId: user.id,
      type: 'withdrawal',
      amount,
      amountAfterTax,
      tax,
      status: 'pending', // Will be processed after 24 hours (mocked)
      createdAt: new Date().toISOString(),
      description: `Withdrawal request - ${paymentMethod || 'N/A'}`,
      qrCode: qrCodeDataURL,
    });
    writeTransactions(transactions);

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted. Processing will take 24 hours.',
      balance: user.balance,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}

