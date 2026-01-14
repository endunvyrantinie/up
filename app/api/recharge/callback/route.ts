import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get('status') as string;
    const amount = formData.get('amount') as string;
    const userId = formData.get('order_id') as string;

    if (status === '1' && userId) {
      await connectDB();
      const user = await User.findOne({ id: userId });
      if (user) {
        user.balance = (user.balance || 0) + parseFloat(amount);
        await user.save();
      }
    }
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    return new NextResponse('Error', { status: 500 });
  }
}
