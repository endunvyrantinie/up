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

    const { amount } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum deposit is RM 50' }, { status: 400 });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For MVP: create pending transaction (not immediately added to wallet)
    const transactionId = Date.now().toString();
    
    // Check if uploaded QR code exists, otherwise generate one
    const settings = await readSettings();
    let qrCode: string;
    
    if (settings.uploadedQRCode) {
      // Use uploaded QR code
      qrCode = settings.uploadedQRCode;
    } else {
      // Generate QR code for payment with transaction info
      qrCode = await generateQRCode(amount, {
        userId: user.id,
        transactionId: transactionId,
        type: 'recharge',
      });
    }
    
    await createTransaction({
      id: transactionId,
      userId: user.id,
      type: 'deposit',
      amount,
      status: 'pending', // Changed to pending - admin needs to approve
      createdAt: new Date().toISOString(),
      description: 'Recharge deposit',
      qrCode: qrCode, // Store QR code in transaction
    });

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

