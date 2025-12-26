import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readVIPPurchases, readUsers } from '@/lib/db';

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

    const purchases = readVIPPurchases();
    const users = readUsers();

    // Add user info to purchases
    const purchasesWithUser = purchases.map(purchase => {
      const user = users.find(u => u.id === purchase.userId);
      return {
        ...purchase,
        username: user?.username || 'Unknown',
        phone: user?.phone || 'N/A',
      };
    });

    return NextResponse.json({ purchases: purchasesWithUser });
  } catch (error) {
    console.error('Error fetching VIP purchases:', error);
    return NextResponse.json({ error: 'Failed to fetch VIP purchases' }, { status: 500 });
  }
}

