import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserById, readReferrals, readUsers, ReferralTreeItem } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const referrals = readReferrals();
    const users = readUsers();

    // Get direct referrals (level 1)
    const level1Refs: ReferralTreeItem[] = referrals
      .filter(r => r.referrerId === user.id && r.level === 1)
      .map(r => {
        const referredUser = users.find(u => u.id === r.referredId);
        return {
          id: r.referredId,
          username: referredUser?.username || 'Unknown',
          level: 1,
          commission: r.commission,
          createdAt: r.createdAt,
        } as ReferralTreeItem;
      });

    // Get level 2 referrals
    const level2Refs: ReferralTreeItem[] = [];
    level1Refs.forEach(l1 => {
      const l2 = referrals
        .filter(r => r.referrerId === l1.id && r.level === 1)
        .map(r => {
          const referredUser = users.find(u => u.id === r.referredId);
          return {
            id: r.referredId,
            username: referredUser?.username || 'Unknown',
            level: 2,
            commission: referrals
              .filter(ref => ref.referredId === r.referredId && ref.referrerId === user.id && ref.level === 2)[0]?.commission || 0,
            createdAt: r.createdAt,
          } as ReferralTreeItem;
        });
      level2Refs.push(...l2);
    });

    // Get level 3 referrals
    const level3Refs: ReferralTreeItem[] = [];
    level2Refs.forEach(l2 => {
      const l3 = referrals
        .filter(r => r.referrerId === l2.id && r.level === 1)
        .map(r => {
          const referredUser = users.find(u => u.id === r.referredId);
          return {
            id: r.referredId,
            username: referredUser?.username || 'Unknown',
            level: 3,
            commission: referrals
              .filter(ref => ref.referredId === r.referredId && ref.referrerId === user.id && ref.level === 3)[0]?.commission || 0,
            createdAt: r.createdAt,
          } as ReferralTreeItem;
        });
      level3Refs.push(...l3);
    });

    return NextResponse.json({
      level1: level1Refs,
      level2: level2Refs,
      level3: level3Refs,
      total: level1Refs.length + level2Refs.length + level3Refs.length,
    });
  } catch (error) {
    console.error('Referral tree error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral tree' }, { status: 500 });
  }
}

