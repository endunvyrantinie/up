import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateReferralCode } from '@/lib/auth';
import { readUsers, writeUsers, findUserByEmail, findUserByReferralCode, readReferrals, writeReferrals } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, referralCode } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const users = readUsers();
    
    if (findUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    let referralCodeToUse = generateReferralCode();
    
    // Ensure unique referral code
    while (findUserByReferralCode(referralCodeToUse)) {
      referralCodeToUse = generateReferralCode();
    }

    // Registration bonus: RM 12
    const registrationBonus = 12;

    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      referralCode: referralCodeToUse,
      referredBy: referralCode || undefined,
      balance: registrationBonus,
      vipLevel: 0,
      totalEarned: registrationBonus,
      totalWithdrawn: 0,
      dailyRewardsBalance: 0,
      dailyRewardsTotal: 0,
      hasSeenInfoModal: false,
      createdAt: new Date().toISOString(),
      checkInStreak: 0,
    };

    users.push(newUser);
    writeUsers(users);

    // Handle referral commissions if referred
    if (referralCode) {
      const referrerUser = findUserByReferralCode(referralCode);
      if (referrerUser) {
        const referrals = readReferrals();

        // Create referral records for 3 levels
        // Level 1 referral
        referrals.push({
          id: Date.now().toString(),
          referrerId: referrerUser.id,
          referredId: newUser.id,
          level: 1,
          commission: 0, // Will be calculated when VIP purchase happens
          createdAt: new Date().toISOString(),
        });

        // Level 2 referral (if referrer has a referrer)
        if (referrerUser.referredBy) {
          const level2Referrer = findUserByReferralCode(referrerUser.referredBy);
          if (level2Referrer) {
            referrals.push({
              id: (Date.now() + 1).toString(),
              referrerId: level2Referrer.id,
              referredId: newUser.id,
              level: 2,
              commission: 0,
              createdAt: new Date().toISOString(),
            });

            // Level 3 referral
            if (level2Referrer.referredBy) {
              const level3Referrer = findUserByReferralCode(level2Referrer.referredBy);
              if (level3Referrer) {
                referrals.push({
                  id: (Date.now() + 2).toString(),
                  referrerId: level3Referrer.id,
                  referredId: newUser.id,
                  level: 3,
                  commission: 0,
                  createdAt: new Date().toISOString(),
                });
              }
            }
          }
        }

        writeReferrals(referrals);
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        referralCode: newUser.referralCode,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

