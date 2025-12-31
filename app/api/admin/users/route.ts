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

    // Read users with retry logic for serverless environments
    let users = readUsers();
    
    // If no users found, try reading again (for file system sync issues)
    if (users.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('No users found, retrying read...');
      }
      // Small delay to allow file system to sync
      await new Promise(resolve => setTimeout(resolve, 100));
      users = readUsers();
    }
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Admin users API: Found ${users.length} users`);
    }
    
    const referrals = readReferrals();

    const usersWithStats = users.map(user => ({
      ...user,
      password: undefined, // Don't send password
      referralCount: getReferralCount(user.id),
      totalCommissions: referrals
        .filter(r => r.referrerId === user.id)
        .reduce((sum, r) => sum + r.commission, 0),
    }));

    return NextResponse.json({ 
      users: usersWithStats,
      total: usersWithStats.length 
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

