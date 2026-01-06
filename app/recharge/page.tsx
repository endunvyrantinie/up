import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Fetch keys inside the function to avoid Build/Stripe errors
    const secretKey = process.env.TOYYIBPAY_SECRET_KEY;
    const categoryCode = process.env.TOYYIBPAY_CATEGORY_CODE;

    if (!secretKey || !categoryCode) {
      console.error("Environment variables missing: TOYYIBPAY_SECRET_KEY or TOYYIBPAY_CATEGORY_CODE");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    // 2. Parse the incoming request from your frontend
    const { amount, email, name, phone } = await req.json();

    // 3. Prepare the form-data for ToyyibPay
    const body = new URLSearchParams();
    body.append('userSecretKey', secretKey);
    body.append('categoryCode', categoryCode);
    body.append('billName', "D' Mannee Wallet Recharge");
    body.append('billDescription', `Credits for ${email}`);
    body.append('billPriceSetting', '1');
    body.append('billPayorInfo', '1');
    body.append('billAmount', (amount * 100).toString()); // RM to Cents (e.g., 1.00 = 100)
    body.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    body.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/toyyibpay`);
    body.append('billExternalReferenceNo', `REF-${Date.now()}`);
    body.append('billTo', name || 'Customer');
    body.append('billEmail', email || 'no-reply@dmannee.com');
    body.append('billPhone', phone || '0123456789');

    // 4. Hit the ToyyibPay API
    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: body,
    });

    const data = await response.json();

    // 5. Check if ToyyibPay successfully generated a BillCode
    if (data[0] && data[0].BillCode) {
      return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` });
    } else {
      console.error('ToyyibPay API Error Response:', data);
      return NextResponse.json({ 
        error: "ToyyibPay could not generate a payment link.", 
        details: data 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('System Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}