import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, isAdmin } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // Admin login
    if (isAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@coffee.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (email === adminEmail && password === adminPassword) {
        const token = generateToken('admin', true);
        return NextResponse.json({ 
          success: true, 
          token,
          user: { id: 'admin', email: adminEmail, isAdmin: true }
        });
      }
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    // User login
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken(user.id, false);
    
    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        referralCode: user.referralCode,
        balance: user.balance,
        vipLevel: user.vipLevel,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

