import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, email, name, phone } = await req.json();
    const body = new URLSearchParams();
    body.append('userSecretKey', process.env.TOYYIBPAY_SECRET_KEY!);
    body.append('categoryCode', process.env.TOYYIBPAY_CATEGORY_CODE!);
    body.append('billName', "D' Mannee Wallet Topup"); // Identifies as Topup
    body.append('billDescription', `Topup for ${email}`);
    body.append('billPriceSetting', '1');
    body.append('billAmount', (amount * 100).toString()); 
    body.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    body.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/toyyibpay`);
    body.append('billExternalReferenceNo', `RECHARGE-${Date.now()}`);
    body.append('billTo', name || 'Customer');
    body.append('billEmail', email || 'no-reply@dmannee.com');
    body.append('billPhone', phone || '0123456789');

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: body,
    });

    const data = await response.json();
    if (data[0]?.BillCode) return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` });
    return NextResponse.json({ error: "Failed", details: data }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}