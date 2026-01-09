import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-28' as any,
});

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();

    // 1. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'], // Enables Credit Cards + Malaysian Banks
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'VIP Coffee Credits',
              description: `Recharge for User ID: ${userId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert RM to Cents (RM1.00 = 100)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge`,
      metadata: { userId }, // Store userId so you know who paid later
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}