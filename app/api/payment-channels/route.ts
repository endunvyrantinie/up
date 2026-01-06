import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // We are manually defining the channel to ensure ToyyibPay shows up 
    // for D' Mannee Resources regardless of database settings.
    const channels = [
      {
        id: 'toyyibpay',
        name: 'Online Banking (ToyyibPay)',
        description: 'Pay via FPX, GXBank, or Aeon Bank',
        isActive: true,
        icon: 'bank' // Or a URL to a bank icon
      }
    ];

    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching payment channels:', error);
    return NextResponse.json({ error: 'Failed to fetch payment channels' }, { status: 500 });
  }
}