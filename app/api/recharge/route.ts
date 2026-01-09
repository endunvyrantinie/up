import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';

// 1. Fix: Use a stable Stripe API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: NextRequest) {
  try {
    // 2. Fix: Use jsonwebtoken instead of jose to stop the "Module not found" error
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      userId = decoded.id;
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { amount } = await req.json();

    // 3. Fix: Set minimum recharge to RM 30.00
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
