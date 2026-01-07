import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { bankName, accountName, accountNumber } = await request.json();

    if (!bankName || !accountName || !accountNumber) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { id: decoded.id || decoded.userId },
      { $set: { bankName, accountName, accountNumber } },
      { new: true }
    );

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update bank error:', error);
    return NextResponse.json({ error: 'Failed to update bank details' }, { status: 500 });
  }
}
