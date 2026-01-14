import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status = formData.get('status') as string;
    const amount = formData.get('amount') as string;
    const userId = formData.get('order_id') as string; // This is the billExternalReferenceNo we sent

    // status '1' means success in ToyyibPay
    if (status === '1' && userId) {
      await connectDB();
      
      const depositAmount = parseFloat(amount);
      
      // Update User Balance
      const user = await User.findOne({ id: userId });
      if (user) {
        user.balance = (user.balance || 0) + depositAmount;
        await user.save();
        console.log(`Successfully updated balance for user ${userId}: +RM ${depositAmount}`);
      } else {
        console.error(`User not found for ID: ${userId}`);
      }
    }

    // ToyyibPay expects an 'OK' response
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('TOYYIBPAY_CALLBACK_ERROR:', error.message);
    return new NextResponse('Error', { status: 500 });
  }
}
