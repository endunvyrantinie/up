import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    if (!secretKey || !categoryCode) {
      return NextResponse.json({ error: 'Config Missing: Check Vercel Env Vars' }, { status: 500 });
    }

    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) return NextResponse.json({ error: 'Please login again' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ id: decoded.userId });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { amount } = await req.json();
    if (!amount || amount < 30) return NextResponse.json({ error: 'Minimum RM 30.00' }, { status: 400 });

    // --- EMAIL FIX START ---
    // Ensure email is a string, trimmed of spaces, and valid
    let userEmail = (user.email || 'customer@gmail.com').toString().trim();
    
    // Basic regex to check if email format is actually valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      userEmail = 'customer@gmail.com'; // Fallback to a safe valid email
    }
    // --- EMAIL FIX END ---

    const formData = new URLSearchParams();
    formData.append('userSecretKey', secretKey);
    formData.append('categoryCode', categoryCode);
    formData.append('billName', 'Wallet Recharge');
    formData.append('billDescription', `Recharge for ${user.username || 'User'}`);
    formData.append('billPriceSetting', '1');
    formData.append('billPayorInfo', '1');
    formData.append('billAmount', (amount * 100).toString()); 
    formData.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/home?status=success`);
    formData.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/recharge/callback`);
    formData.append('billExternalReferenceNo', decoded.userId);
    formData.append('billTo', (user.username || 'Customer').toString().trim());
    formData.append('billEmail', userEmail); // Using the cleaned email
    formData.append('billPhone', '0123456789');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    } );

    const result = await response.json();
    
    console.log('ToyyibPay Response:', result);

    if (result && result[0] && result[0].BillCode) {
      return NextResponse.json({ url: `https://toyyibpay.com/${result[0].BillCode}` } );
    }

    const errorMessage = result?.msg || (Array.isArray(result) && result[0]?.msg) || 'Failed to create bill';
    return NextResponse.json({ error: errorMessage }, { status: 500 });

  } catch (error: any) {
    console.error('System Error:', error);
    return NextResponse.json({ error: 'System error: ' + error.message }, { status: 500 });
  }
}
