import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15', // Or your specific version
});

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    // 1. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      // We use 'fpx' only to trigger the Malaysian Bank/QR selection screen
      payment_method_types: ['fpx'],

      // This hides the email field by providing a placeholder
      // User won't be asked to type anything
      customer_email: 'customer@no-email-provided.com', 

      line_items: [
        {
          price_data: {
            currency: 'myr', // MUST be MYR for DuitNow/FPX
            product_data: {
              name: 'Wallet Recharge',
              description: 'Instant credits for your account',
            },
            unit_amount: amount * 100, // Converts RM to cents (e.g. 50 RM = 5000)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Ensure these URLs match your website
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/recharge`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}