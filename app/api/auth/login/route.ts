import { NextRequest, NextResponse } from 'next/server';
import { comparePassword, generateToken } from '@/lib/auth';
import { findUserByEmail, findUserByPhone } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, email, password, isAdmin } = body;

    // Support both phone and email for backward compatibility
    const loginIdentifier = phone || email;

    if (!loginIdentifier || !password) {
      return NextResponse.json({ error: 'Phone number and password are required' }, { status: 400 });
    }

    // Admin login (still uses email)
    if (isAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@coffee.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      if (loginIdentifier === adminEmail && password === adminPassword) {
        const token = generateToken('admin', true);
        return NextResponse.json({ 
          success: true, 
          token,
          user: { id: 'admin', email: adminEmail, isAdmin: true }
        });
      }
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    // User login - try phone first, then email for backward compatibility
    try {
      // Normalize phone number (remove all non-digit characters except +)
      const normalizedPhone = loginIdentifier.replace(/[^\d+]/g, '');
      
      // Try multiple matching strategies
      let user = await findUserByPhone(normalizedPhone);
      if (!user) {
        user = await findUserByPhone(loginIdentifier);
      }
      if (!user) {
        // Fallback to email for existing users
        user = await findUserByEmail(loginIdentifier);
      }
      
      if (!user) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Login failed: User not found', { 
            loginIdentifier, 
            normalizedPhone,
          });
        }
        return NextResponse.json({ error: 'User not found. Please check your phone number or register first.' }, { status: 401 });
      }

      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Login failed: Invalid password for user:', user.id);
        }
        return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 });
      }

      // Generate fresh token
      const token = generateToken(user.id, false);
      
      if (!token) {
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        token,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone || user.username,
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

