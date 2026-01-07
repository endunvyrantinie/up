import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { 
  findUserById, 
  updateUser, 
  readReferrals, 
  updateReferral, 
  createTransaction, 
  createVIPPurchase,
  readVIPPurchases
} from '@/lib/db';
import { VIPPurchase } from '@/lib/db';

export const dynamic = 'force-dynamic';

// VIP level calculation based on total investment
const getVIPLevel = (totalInvestment: number): number => {
  if (totalInvestment >= 12000) return 9;
  if (totalInvestment >= 6000) return 8;
  if (totalInvestment >= 3000) return 7;
  if (totalInvestment >= 1600) return 6;
  if (totalInvestment >= 800) return 5;
  if (totalInvestment >= 400) return 4;
  if (totalInvestment >= 200) return 3;
  if (totalInvestment >= 100) return 2;
  if (totalInvestment >= 30) return 1;
  return 0;
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

    // 1. Create VIP purchase record
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();
    const purchase: VIPPurchase = {
      id: `PUR-${Date.now()}`,
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

    // 2. Calculate new VIP level
    const allPurchases = await readVIPPurchases();
    const userPurchases = allPurchases.filter((p: VIPPurchase) => p.userId === user.id);
    const totalInvestment = userPurchases.reduce((sum: number, p: VIPPurchase) => sum + p.amount, 0);
    const newVIPLevel = getVIPLevel(totalInvestment);

    // 3. Update user balance and stats
    await updateUser(user.id, {
      balance: user.balance - amount,
      totalInvested: (user.totalInvested || 0) + amount,
      vipLevel: newVIPLevel,
    });

    // 4. Create transaction record for the purchase
    await createTransaction({
      id: `TX-${Date.now()}`,
      userId: user.id,
      type: 'vip_return', // Using vip_return or similar to track investment
      amount: -amount,
      status: 'completed',
      createdAt: new Date().toISOString(),
      description: `Purchased ${productId}`,
    });

    // 5. Distribute Commissions (3 Levels)
    const referrals = await readReferrals();
    
    // Level 1 Commission (28%)
    const level1Ref = referrals.find((r: any) => r.referredId === user.id && r.level === 1);
    if (level1Ref) {
      const level1User = await findUserById(level1Ref.referrerId);
      if (level1User) {
        const commission = amount * 0.28;
        await updateReferral(level1Ref.id, { commission: (level1Ref.commission || 0) + commission });
        await updateUser(level1User.id, {
          balance: level1User.balance + commission,
          totalEarned: level1User.totalEarned + commission,
        });
        await createTransaction({
          id: `COM1-${Date.now()}`,
          userId: level1User.id,
          type: 'commission',
          amount: commission,
          status: 'completed',
          createdAt: new Date().toISOString(),
          description: `L1 Commission from ${user.username}`,
        });

        // Level 2 Commission (1%)
        const level2Ref = referrals.find((r: any) => r.referredId === user.id && r.level === 2);
        if (level2Ref) {
          const level2User = await findUserById(level2Ref.referrerId);
          if (level2User) {
            const commission2 = amount * 0.01;
            await updateReferral(level2Ref.id, { commission: (level2Ref.commission || 0) + commission2 });
            await updateUser(level2User.id, {
              balance: level2User.balance + commission2,
              totalEarned: level2User.totalEarned + commission2,
            });
            await createTransaction({
              id: `COM2-${Date.now()}`,
              userId: level2User.id,
              type: 'commission',
              amount: commission2,
              status: 'completed',
              createdAt: new Date().toISOString(),
              description: `L2 Commission from ${user.username}`,
            });

            // Level 3 Commission (1%)
            const level3Ref = referrals.find((r: any) => r.referredId === user.id && r.level === 3);
            if (level3Ref) {
              const level3User = await findUserById(level3Ref.referrerId);
              if (level3User) {
                const commission3 = amount * 0.01;
                await updateReferral(level3Ref.id, { commission: (level3Ref.commission || 0) + commission3 });
                await updateUser(level3User.id, {
                  balance: level3User.balance + commission3,
                  totalEarned: level3User.totalEarned + commission3,
                });
                await createTransaction({
                  id: `COM3-${Date.now()}`,
                  userId: level3User.id,
                  type: 'commission',
                  amount: commission3,
                  status: 'completed',
                  createdAt: new Date().toISOString(),
                  description: `L3 Commission from ${user.username}`,
                });
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
