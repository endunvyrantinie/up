import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // 1. Check if Secret Key exists
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      console.error("CRITICAL: STRIPE_SECRET_KEY is missing in Railway variables");
      return NextResponse.json({ error: "Server Key Missing" }, { status: 500 });
    }

    // 2. Initialize Stripe
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia' as any,
    });

    // 3. Parse Body Safely
    const body = await req.json().catch(() => ({}));
    const { amount, userId } = body;

    if (!amount || !userId) {
      return NextResponse.json({ error: "Amount or UserID missing" }, { status: 400 });
    }

    // 4. Force a clean URL (This prevents the "Expired Session" error)
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const cleanOrigin = `${protocol}://${host}`;

    console.log("Creating Session for Origin:", cleanOrigin);

    // 5. Create the Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'fpx'],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: 'VIP Coffee Credits',
              description: `User: ${userId}`,
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${cleanOrigin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cleanOrigin}/recharge`,
      metadata: { 
        userId: String(userId) 
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('SERVER CRASH LOG:', error.message);
    return NextResponse.json({ error: "System Error: " + error.message }, { status: 500 });
  }
}