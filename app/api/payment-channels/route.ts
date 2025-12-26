import { NextRequest, NextResponse } from 'next/server';
import { readPaymentChannels } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const channels = readPaymentChannels().filter(c => c.isActive);
    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching payment channels:', error);
    return NextResponse.json({ error: 'Failed to fetch payment channels' }, { status: 500 });
  }
}

