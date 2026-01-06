import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Get keys ONLY when the function is called
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    // 2. Check if keys exist to prevent a crash
    if (!secretKey || !categoryCode) {
      return NextResponse.json({ error: "System is still being configured. Please try again later." }, { status: 500 });
    }

    const { amount, email, name, phone } = await req.json();

    const body = new URLSearchParams();
    body.append('userSecretKey', secretKey);
    body.append('categoryCode', categoryCode);
    body.append('billName', "D' Mannee Wallet Recharge");
    body.append('billDescription', `Credits for ${email}`);
    body.append('billPriceSetting', '1');
    body.append('billAmount', (amount * 100).toString());
    body.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    body.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/toyyibpay`);
    body.append('billExternalReferenceNo', `REF-${Date.now()}`);
    body.append('billTo', name || 'Customer');
    body.append('billEmail', email || 'no-reply@dmannee.com');
    body.append('billPhone', phone || '0123456789');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: body,
    });

    const data = await response.json();

    if (data[0] && data[0].BillCode) {
      return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` });
    } else {
      throw new Error("ToyyibPay couldn't generate a link.");
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}