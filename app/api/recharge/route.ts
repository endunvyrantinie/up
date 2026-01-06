import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { amount, email, name, phone } = await req.json();
    const orderId = `RECH-${Date.now()}`;

    await connectDB();

    // Create a pending transaction in our database
    await Transaction.create({
      id: orderId,
      userId: decoded.userId,
      type: 'deposit',
      amount: amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      description: 'ToyyibPay Wallet Topup'
    });

    const details = new URLSearchParams();
    details.append('userSecretKey', process.env.TOYYIBPAY_SECRET_KEY || '');
    details.append('categoryCode', process.env.TOYYIBPAY_CATEGORY_CODE || '');
    details.append('billName', "D' Mannee Wallet Topup");
    details.append('billDescription', `Topup for ${email}`);
    details.append('billPriceSetting', '1');
    details.append('billPayorInfo', '1');
    details.append('billAmount', (amount * 100).toString());
    details.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    details.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/toyyibpay`);
    details.append('billExternalReferenceNo', orderId);
    details.append('billTo', name || 'Customer');
    details.append('billEmail', email || 'no-reply@dmannee.com');
    details.append('billPhone', phone || '0123456789');
    details.append('billPaymentChannel', '2');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: details,
    } );

    const data = await response.json();
    if (Array.isArray(data) && data[0]?.BillCode) {
      return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` } );
    } else {
      return NextResponse.json({ error: data[0]?.err_msg || "Configuration Error" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}
