import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readUsers, readReferrals, getReferralCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

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

    // Read users
    const users = await readUsers();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Admin users API: Found ${users.length} users`);
    }
    
    const referrals = await readReferrals();

    const usersWithStats = await Promise.all(users.map(async (user) => ({
      ...user,
      password: undefined, // Don't send password
      referralCount: await getReferralCount(user.id),
      totalCommissions: referrals
        .filter((r: any) => r.referrerId === user.id)
        .reduce((sum: number, r: any) => sum + r.commission, 0),
    })));

    return NextResponse.json({ 
      users: usersWithStats,
      total: usersWithStats.length 
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

