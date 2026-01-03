import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, readSettings, createTransaction, updateUser } from '@/lib/db';
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

    const user = await findUserById(decoded.userId);
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

    // Update user balance
    const updatedUser = await updateUser(user.id, {
      balance: user.balance - amount,
      totalWithdrawn: user.totalWithdrawn + amount,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user balance' }, { status: 500 });
    }

    // Generate QR Code with transaction info
    const transactionId = Date.now().toString();
    let qrCodeDataURL = '';
    
    // Check if uploaded QR code exists, otherwise generate one
    const settings = await readSettings();
    
    if (settings.uploadedQRCode) {
      // Use uploaded QR code
      qrCodeDataURL = settings.uploadedQRCode;
    } else {
      // Generate QR code
      try {
        qrCodeDataURL = await generateQRCode(amount, {
          userId: user.id,
          transactionId: transactionId,
          type: 'withdrawal',
        });
      } catch (error) {
        console.error('QR generation failed, continuing without QR');
      }
    }

    await createTransaction({
      id: transactionId,
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

    return NextResponse.json({ 
      success: true, 
      message: 'Withdrawal request submitted. Processing will take 24 hours.',
      balance: updatedUser.balance,
      qrCode: qrCodeDataURL,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}

