import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { amount, email, name, phone } = await req.json();
    const orderId = `RECH-${Date.now()}`;

    // 1. Try to save to database, but DON'T stop if it fails
    try {
      await connectDB();
      await Transaction.create({
        id: orderId,
        userId: decoded.userId,
        type: 'recharge',
        amount: Number(amount),
        status: 'pending',
        description: 'Wallet Topup',
        createdAt: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Database save skipped:', dbError);
      // We continue anyway so the user can still pay
    }

    // 2. Prepare ToyyibPay details
    const details = new URLSearchParams();
    details.append('userSecretKey', process.env.TOYYIBPAY_SECRET_KEY || '');
    details.append('categoryCode', process.env.TOYYIBPAY_CATEGORY_CODE || '');
    details.append('billName', "Wallet Topup");
    details.append('billDescription', "Topup");
    details.append('billPriceSetting', '1');
    details.append('billPayorInfo', '1');
    details.append('billAmount', (Number(amount) * 100).toFixed(0));
    details.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    details.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/toyyibpay`);
    details.append('billExternalReferenceNo', orderId);
    details.append('billTo', name || 'Customer');
    details.append('billEmail', email || 'user@dmannee.com');
    details.append('billPhone', phone || '0123456789');
    details.append('billPaymentChannel', '0'); 

    // 3. Call ToyyibPay
    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: details,
    } );

    const data = await response.json();
    
    if (Array.isArray(data) && data[0]?.BillCode) {
      return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` } );
    } else {
      const errMsg = Array.isArray(data) ? data[0]?.err_msg : "Invalid API Response";
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }
  } catch (error: any) {
    // 4. Final fallback error message
    return NextResponse.json({ error: "Payment Gateway Busy. Try again." }, { status: 500 });
  }
}
