import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get('status') as string;
    const billCode = formData.get('billcode') as string;
    const amount = formData.get('amount') as string;
    const userId = formData.get('order_id') as string;

    if (status === '1' && userId) {
      await connectDB();
      const user = await User.findOne({ id: userId });
      if (user) {
        user.balance += parseFloat(amount);
        await user.save();
        await Transaction.create({
          id: `TP-${billCode}`,
          userId: userId,
          type: 'deposit',
          amount: parseFloat(amount),
          status: 'completed',
          description: 'ToyyibPay Automated Recharge',
          createdAt: new Date().toISOString(),
        });
      }
    }
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error', { status: 500 });
  }
}
