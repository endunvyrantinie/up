import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { 
  findUserById, 
  updateUser, 
  readReferrals, 
  updateReferral, 
  createTransaction, 
  createVIPPurchase,
  readVIPPurchases,
  findUserByReferralCode,
  createReferral
} from '@/lib/db';
import { VIPPurchase } from '@/lib/db';

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

    const user = await findUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

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

    await createVIPPurchase(purchase);

    // Get all user purchases to calculate total investment
    const purchases = await readVIPPurchases();
    const userPurchases = purchases.filter((p: VIPPurchase) => p.userId === user.id);
    const totalInvestment = userPurchases.reduce((sum: number, p: VIPPurchase) => sum + p.amount, 0);
    const newVIPLevel = getVIPLevel(totalInvestment);

    // Update user
    await updateUser(user.id, {
      balance: user.balance - amount,
      totalInvested: (user.totalInvested || 0) + amount,
      vipLevel: newVIPLevel,
      totalEarned: user.totalEarned + amount,
    });

    // Calculate and distribute commissions to referrers
    const referrals = await readReferrals();
    
    if (user.referredBy) {
      const level1Ref = referrals.find((r: any) => r.referredId === user.id && r.level === 1);
      if (level1Ref) {
        const level1User = await findUserById(level1Ref.referrerId);
        if (level1User) {
          // Level 1: 28% commission
          const commission = amount * 0.28;
          await updateReferral(level1Ref.id, { commission: level1Ref.commission + commission });
          await updateUser(level1User.id, {
            balance: level1User.balance + commission,
            totalEarned: level1User.totalEarned + commission,
          });
          
          await createTransaction({
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
            const level2Ref = referrals.find((r: any) => r.referredId === user.id && r.level === 2);
            if (level2Ref) {
              const level2User = await findUserById(level2Ref.referrerId);
              if (level2User) {
                // Level 2: 1% commission
                const commission2 = amount * 0.01;
                await updateReferral(level2Ref.id, { commission: level2Ref.commission + commission2 });
                await updateUser(level2User.id, {
                  balance: level2User.balance + commission2,
                  totalEarned: level2User.totalEarned + commission2,
                });
                
                await createTransaction({
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
                  const level3Ref = referrals.find((r: any) => r.referredId === user.id && r.level === 3);
                  if (level3Ref) {
                    const level3User = await findUserById(level3Ref.referrerId);
                    if (level3User) {
                      // Level 3: 1% commission
                      const commission3 = amount * 0.01;
                      await updateReferral(level3Ref.id, { commission: level3Ref.commission + commission3 });
                      await updateUser(level3User.id, {
                        balance: level3User.balance + commission3,
                        totalEarned: level3User.totalEarned + commission3,
                      });
                      
                      await createTransaction({
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

    return NextResponse.json({ success: true, purchase });
  } catch (error) {
    console.error('VIP purchase error:', error);
    return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
  }
}
