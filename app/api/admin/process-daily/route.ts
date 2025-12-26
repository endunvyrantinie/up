import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readVIPPurchases, writeVIPPurchases, readUsers, writeUsers, readTransactions, writeTransactions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
    const transactions = readTransactions();
    const now = new Date();

    let processedCount = 0;
    let totalAmount = 0;

    // Process all active VIP purchases
    for (const purchase of purchases) {
      const expiresAt = new Date(purchase.expiresAt);
      
      // Check if purchase is still active
      if (expiresAt > now && purchase.daysRemaining > 0) {
        const user = users.find(u => u.id === purchase.userId);
        if (user) {
          // Add daily return to user balance
          user.balance += purchase.dailyReturn;
          user.totalEarned += purchase.dailyReturn;
          
          // Decrease days remaining
          purchase.daysRemaining -= 1;
          
          // Create transaction record
          transactions.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            userId: user.id,
            type: 'vip_return',
            amount: purchase.dailyReturn,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `Daily VIP return - ${purchase.productId || 'VIP'}`,
          });

          processedCount++;
          totalAmount += purchase.dailyReturn;
        }
      }
    }

    writeVIPPurchases(purchases);
    writeUsers(users);
    writeTransactions(transactions);

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} VIP purchases. Total amount: RM ${totalAmount.toFixed(2)}`,
      processedCount,
      totalAmount,
    });
  } catch (error) {
    console.error('Error processing daily returns:', error);
    return NextResponse.json({ error: 'Failed to process daily returns' }, { status: 500 });
  }
}

