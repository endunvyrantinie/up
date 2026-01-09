import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jwtVerify } from 'jose';

// Using a stable, verified API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.id as string;

    const { amount } = await req.json();

    // Updated minimum amount to RM 30.00
    if (!amount || amount < 30) {
      return NextResponse.json({ error: 'Minimum recharge is RM 30.00' }, { status: 400 });
    }

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
            unit_amount: Math.round(amount * 100), // Stripe uses cents/sen
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/home?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge?status=cancel`,
      metadata: {
        userId: userId,
        type: 'recharge',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
