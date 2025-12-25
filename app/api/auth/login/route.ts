import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, isAdmin } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Invalid admin email or password' }, { status: 401 });
    }

    // User login
    try {
      const user = findUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
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
          vipLevel: user.vipLevel || 0,
          isAdmin: false,
        }
      });
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error?.message || String(error) || 'Login failed';
    
    if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}

