import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateReferralCode } from '@/lib/auth';
import { findUserByPhone, findUserByReferralCode, findUserById, readReferrals, writeReferrals, createUser, createReferral } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { phone, password, referralCode } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
    }

    // Normalize phone number (remove all non-digit characters except +)
    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    
    // Check if phone already exists (try normalized and original)
    const existingUser1 = await findUserByPhone(normalizedPhone);
    const existingUser2 = await findUserByPhone(phone);
    
    if (existingUser1 || existingUser2) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    let referralCodeToUse = generateReferralCode();
    
    // Ensure unique referral code
    while (await findUserByReferralCode(referralCodeToUse)) {
      referralCodeToUse = generateReferralCode();
    }

    // Registration bonus: RM 12
    const registrationBonus = 12;

    const newUser = {
      id: Date.now().toString(),
      username: normalizedPhone, // Use normalized phone as username
      phone: normalizedPhone, // Store normalized phone
      email: `${phone}@coffee.com`, // Keep for backward compatibility
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

    // Create user in MongoDB
    const createdUser = await createUser(newUser);
    
    if (createdUser) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ User registered successfully: ${createdUser.id} (${createdUser.phone || createdUser.username})`);
      }
    } else {
      console.error('❌ User registration failed - user not created');
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }

    // Handle referral commissions if referred
    if (referralCode) {
      const referrerUser = await findUserByReferralCode(referralCode);
      if (referrerUser) {
        // Create referral records for 3 levels
        // Level 1 referral
        await createReferral({
          id: Date.now().toString(),
          referrerId: referrerUser.id,
          referredId: createdUser.id,
          level: 1,
          commission: 0, // Will be calculated when VIP purchase happens
          createdAt: new Date().toISOString(),
        });

        // Level 2 referral (if referrer has a referrer)
        if (referrerUser.referredBy) {
          const level2Referrer = await findUserByReferralCode(referrerUser.referredBy);
          if (level2Referrer) {
            await createReferral({
              id: (Date.now() + 1).toString(),
              referrerId: level2Referrer.id,
              referredId: createdUser.id,
              level: 2,
              commission: 0,
              createdAt: new Date().toISOString(),
            });

            // Level 3 referral
            if (level2Referrer.referredBy) {
              const level3Referrer = await findUserByReferralCode(level2Referrer.referredBy);
              if (level3Referrer) {
                await createReferral({
                  id: (Date.now() + 2).toString(),
                  referrerId: level3Referrer.id,
                  referredId: createdUser.id,
                  level: 3,
                  commission: 0,
                  createdAt: new Date().toISOString(),
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: createdUser.id,
        username: createdUser.username,
        phone: createdUser.phone,
        referralCode: createdUser.referralCode,
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    const errorMessage = error?.message || String(error) || 'Registration failed';
    
    // Check for file system errors
    if (errorMessage.includes('ENOENT') || errorMessage.includes('EACCES') || errorMessage.includes('EPERM') || errorMessage.includes('EROFS')) {
      console.error('File system error:', errorMessage);
      return NextResponse.json({ 
        error: 'Database write error. This is a known limitation on Vercel. Please use a database like MongoDB for production.'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: errorMessage || 'Registration failed. Please try again.'
    }, { status: 500 });
  }
}

