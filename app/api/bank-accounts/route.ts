import { NextRequest, NextResponse } from 'next/server';
import { readBankAccounts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const accounts = readBankAccounts().filter(a => a.isActive);
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 });
  }
}

