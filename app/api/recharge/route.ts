import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// We removed the apiVersion line here to fix the Vercel build error
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    const session = await stripe.checkout.sessions.create({
      // 'fpx' is the standard for Malaysian bank transfers and QR flows
      payment_method_types: ['fpx'],

      // Pre-filling this hides the email input for the user
      customer_email: 'no-reply@customer.com', 

      line_items: [
        {
          price_data: {
            currency: 'myr', // Must stay 'myr' for DuitNow/FPX to work
            product_data: {
              name: 'Wallet Recharge',
            },
            unit_amount: amount * 100, // Converts RM to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}