import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // ToyyibPay sends data as Form Data
    const formData = await req.formData();
    const status = formData.get('status');
    const billcode = formData.get('billcode');
    const order_id = formData.get('order_id'); // This is our RECH-timestamp
    const amount = formData.get('amount');
    
    console.log('ToyyibPay Webhook Received:', { status, billcode, order_id, amount });

    // Status '1' means success in ToyyibPay
    if (status === '1') {
      // 1. Find the pending transaction
      const transaction = await Transaction.findOne({ id: order_id });
      
      if (!transaction) {
        console.error('Transaction not found:', order_id);
        return new NextResponse('Transaction not found', { status: 404 });
      }

      if (transaction.status === 'completed') {
        return new NextResponse('OK', { status: 200 });
      }

      // 2. Update transaction status
      transaction.status = 'completed';
      await transaction.save();

      // 3. Update user balance
      const user = await User.findOne({ id: transaction.userId });
      if (user) {
        user.balance += parseFloat(amount as string);
        await user.save();
        console.log(`Balance updated for user ${user.id}. New balance: ${user.balance}`);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
