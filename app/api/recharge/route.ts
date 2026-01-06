import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, email, name, phone } = await req.json();

    // TOYYIBPAY REQUIRES THIS SPECIFIC FORMAT (Form Data)
    const details = new URLSearchParams();
    details.append('userSecretKey', process.env.TOYYIBPAY_SECRET_KEY || '');
    details.append('categoryCode', process.env.TOYYIBPAY_CATEGORY_CODE || '');
    details.append('billName', "D' Mannee Wallet Topup");
    details.append('billDescription', `Topup for ${email}`);
    details.append('billPriceSetting', '1');
    details.append('billPayorInfo', '1'); // ADDED: Required by ToyyibPay
    details.append('billAmount', (amount * 100).toString()); // RM to Cents
    details.append('billReturnUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/success`);
    details.append('billCallbackUrl', `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/toyyibpay`);
    details.append('billExternalReferenceNo', `RECH-${Date.now()}`);
    details.append('billTo', name || 'Customer');
    details.append('billEmail', email || 'no-reply@dmannee.com');
    details.append('billPhone', phone || '0123456789');
    details.append('billPaymentChannel', '0'); // ADDED: 0 for FPX (Online Banking)

    const response = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: details,
    } );

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error('ToyyibPay HTTP Error:', errorText);
      return NextResponse.json({ error: "ToyyibPay Server Error" }, { status: 500 });
    }

    const data = await response.json();

    // ToyyibPay returns an array of objects on success
    if (Array.isArray(data) && data[0]?.BillCode) {
      return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` } );
    } else {
      // If it's not an array or missing BillCode, it's usually a configuration error
      console.error('ToyyibPay Reject:', data);
      const errorMessage = Array.isArray(data) ? data[0]?.err_msg : "Invalid API Configuration";
      return NextResponse.json({ error: errorMessage || "Configuration Error" }, { status: 400 });
    }
  } catch (error: any) {
    console.error('System Error:', error);
    return NextResponse.json({ error: "System Error" }, { status: 500 });
  }
}
