import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readUsers, readReferrals, getReferralCount } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const users = readUsers();
    const referrals = readReferrals();

    const usersWithStats = users.map(user => ({
      ...user,
      password: undefined, // Don't send password
      referralCount: getReferralCount(user.id),
      totalCommissions: referrals
        .filter(r => r.referrerId === user.id)
        .reduce((sum, r) => sum + r.commission, 0),
    }));

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

