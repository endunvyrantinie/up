import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateReferralCode } from '@/lib/auth';
import { 
  findUserByPhone, 
  findUserByReferralCode, 
  findUserById, 
  readReferrals, 
  createUser, 
  createReferral 
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phone, password, referralCode } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    const existingUser = await findUserByPhone(normalizedPhone);
    
    if (existingUser) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    let referralCodeToUse = generateReferralCode();
    
    while (await findUserByReferralCode(referralCodeToUse)) {
      referralCodeToUse = generateReferralCode();
    }

    const registrationBonus = 12;
    const newUser: any = {
      id: Date.now().toString(),
      username: normalizedPhone,
      phone: normalizedPhone,
      email: `${normalizedPhone}@coffee.com`,
      password: hashedPassword,
      referralCode: referralCodeToUse,
      referredBy: referralCode || undefined,
      balance: registrationBonus,
      vipLevel: 0,
      totalEarned: registrationBonus,
      totalWithdrawn: 0,
      createdAt: new Date().toISOString(),
    };

    const createdUser = await createUser(newUser);
    
    if (referralCode) {
      const referrerUser = await findUserByReferralCode(referralCode);
      if (referrerUser) {
        // Create Level 1 referral
        await createReferral({
          id: `REF1-${Date.now()}`,
          referrerId: referrerUser.id,
          referredId: createdUser.id,
          level: 1,
          commission: 0,
          createdAt: new Date().toISOString(),
        });

        // Level 2 & 3 logic...
        if (referrerUser.referredBy) {
          const level2Ref = await findUserByReferralCode(referrerUser.referredBy);
          if (level2Ref) {
            await createReferral({
              id: `REF2-${Date.now()}`,
              referrerId: level2Ref.id,
              referredId: createdUser.id,
              level: 2,
              commission: 0,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error: any) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
