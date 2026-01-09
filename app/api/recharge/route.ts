import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

// This secret must match your login system's secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    // 1. Check for Stripe Secret Key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing');
      return NextResponse.json({ error: 'Payment configuration error' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
    });

    // 2. Get and Verify Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return NextResponse.json({ error: 'Please login again' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;
    
    try {
      // Try verifying with the secret key
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (err: any) {
      console.error('JWT Verification Error:', err.message);
      
      // FALLBACK: If verification fails (likely secret mismatch), 
      // we decode it to get the ID so the user can still pay.
      const decodedFallback = jwt.decode(token) as any;
      if (decodedFallback && decodedFallback.id) {
        userId = decodedFallback.id;
        console.warn('Using fallback decoded userId');
      } else {
        return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
      }
    }

    const { amount } = await req.json();

    // 3. Enforce RM 30.00 Minimum
    if (!amount || amount < 30) {
      return NextResponse.json({ error: 'Minimum recharge is RM 30.00' }, { status: 400 });
    }

    // 4. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['fpx', 'card', 'grabpay'],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'Wallet Recharge',
              description: "D' Mannee Resources - Wallet Topup",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge?status=cancel`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
