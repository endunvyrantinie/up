import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // 1. Validate Secret Key
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server Configuration: Missing Stripe Key" }, { status: 500 });
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia' as any,
    });

    // 2. Parse Body with Error Handling
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body sent from frontend" }, { status: 400 });
    }

    const { amount, userId } = body;

    // 3. Strict Check for Data
    if (!amount || !userId) {
      console.error("❌ Missing Data in Request:", body);
      return NextResponse.json({ 
        error: `Missing ${!amount ? 'Amount' : 'User ID'}`,
        debug: body 
      }, { status: 400 });
    }

    // 4. Auto-detect Domain for Redirects
    const { origin } = new URL(req.url);

    // 5. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'], // Enables Malaysian Banking
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'VIP Coffee Credits',
              description: `Top-up for User: ${userId}`,
            },
            unit_amount: Math.round(Number(amount) * 100), // RM to Cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/recharge`,
      metadata: { 
        userId: String(userId) 
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('🔴 Stripe Server Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}