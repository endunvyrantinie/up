import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  // 1. Check for the Secret Key
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    console.error("❌ ERROR: STRIPE_SECRET_KEY is missing from Railway variables.");
    return NextResponse.json({ error: "Server config error" }, { status: 500 });
  }

  // 2. Initialize Stripe
  const stripe = new Stripe(apiKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const { amount, userId } = await req.json();

    // 3. Auto-detect the website URL (Fixes the "Expired Session" error)
    const origin = req.headers.get('origin');
    
    // Fallback if origin is somehow missing (safety net)
    const baseUrl = origin || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 4. Create the Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'], // Enables Malaysian Banking
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'VIP Coffee Credits',
              description: `Top-up for ID: ${userId}`,
            },
            unit_amount: Math.round(amount * 100), // RM to Cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // We use the detected baseUrl to ensure the link is always valid
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/recharge`,
      metadata: { 
        userId: userId.toString() 
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}