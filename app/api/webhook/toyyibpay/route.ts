import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const amount = session.amount_total ? session.amount_total / 100 : 0;

      if (userId) {
        await connectDB();
        const user = await User.findOne({ id: userId });
        if (user) {
          user.balance += amount;
          await user.save();
          await Transaction.create({
            id: `STR-${session.id}`,
            userId: userId,
            type: 'deposit',
            amount: amount,
            status: 'completed',
            description: 'Stripe Automated Recharge',
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
