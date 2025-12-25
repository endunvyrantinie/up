import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readUsers, writeUsers, readReferrals, writeReferrals, readTransactions, writeTransactions, readVIPPurchases, writeVIPPurchases, VIPPurchase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// VIP level calculation (simplified - based on total investment)
const getVIPLevel = (totalInvestment: number): number => {
  if (totalInvestment >= 2000) return 3; // GOLD
  if (totalInvestment >= 500) return 2; // SILVER
  if (totalInvestment >= 100) return 1; // BRONZE
  return 0; // IRON
};

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, amount, dailyIncome, validityDays } = await request.json();

    if (!productId || !amount || !dailyIncome || !validityDays) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Deduct amount from wallet
    user.balance -= amount;
    user.totalInvested = (user.totalInvested || 0) + amount;

    // Create VIP purchase/investment
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
    const purchase: VIPPurchase = {
      id: Date.now().toString(),
      userId: user.id,
      productId,
      vipLevel: user.vipLevel,
      amount,
      dailyReturn: dailyIncome,
      daysRemaining: validityDays,
      createdAt,
      expiresAt,
    };

    const purchases = readVIPPurchases();
    purchases.push(purchase);
    writeVIPPurchases(purchases);

    // Update user VIP level based on total investment
    const userPurchases = purchases.filter(p => p.userId === user.id);
    const totalInvestment = userPurchases.reduce((sum, p) => sum + p.amount, 0);
    user.vipLevel = getVIPLevel(totalInvestment);
    user.totalEarned += amount;
    writeUsers(users);

    // Calculate and distribute commissions to referrers
    const referrals = readReferrals();
    const transactions = readTransactions();
    
    if (user.referredBy) {
      const level1Ref = referrals.find(r => r.referredId === user.id && r.level === 1);
      if (level1Ref) {
        const level1User = users.find(u => u.id === level1Ref.referrerId);
        if (level1User) {
          // Level 1: 28% commission
          const commission = amount * 0.28;
          level1Ref.commission += commission;
          level1User.balance += commission;
          level1User.totalEarned += commission;
          
          transactions.push({
            id: Date.now().toString(),
            userId: level1User.id,
            type: 'commission',
            amount: commission,
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: `Level 1 commission from ${user.username}`,
          });

          // Level 2 commission
          if (level1User.referredBy) {
            const level2Ref = referrals.find(r => r.referredId === user.id && r.level === 2);
            if (level2Ref) {
              const level2User = users.find(u => u.id === level2Ref.referrerId);
              if (level2User) {
                // Level 2: 1% commission
                const commission2 = amount * 0.01;
                level2Ref.commission += commission2;
                level2User.balance += commission2;
                level2User.totalEarned += commission2;
                
                transactions.push({
                  id: (Date.now() + 1).toString(),
                  userId: level2User.id,
                  type: 'commission',
                  amount: commission2,
                  status: 'completed',
                  createdAt: new Date().toISOString(),
                  description: `Level 2 commission from ${user.username}`,
                });

                // Level 3 commission
                if (level2User.referredBy) {
                  const level3Ref = referrals.find(r => r.referredId === user.id && r.level === 3);
                  if (level3Ref) {
                    const level3User = users.find(u => u.id === level3Ref.referrerId);
                    if (level3User) {
                      // Level 3: 1% commission
                      const commission3 = amount * 0.01;
                      level3Ref.commission += commission3;
                      level3User.balance += commission3;
                      level3User.totalEarned += commission3;
                      
                      transactions.push({
                        id: (Date.now() + 2).toString(),
                        userId: level3User.id,
                        type: 'commission',
                        amount: commission3,
                        status: 'completed',
                        createdAt: new Date().toISOString(),
                        description: `Level 3 commission from ${user.username}`,
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    writeReferrals(referrals);
    writeUsers(users);
    writeTransactions(transactions);

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('VIP purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}

