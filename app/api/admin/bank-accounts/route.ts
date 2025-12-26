import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readBankAccounts, writeBankAccounts, BankAccount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const accounts = readBankAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { name, bank, account, accountHolder, swift, isActive } = body;

    if (!name || !bank || !account || !accountHolder) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const accounts = readBankAccounts();
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      name,
      bank,
      account,
      accountHolder,
      swift: swift || '',
      isActive: isActive !== undefined ? isActive : true,
    };

    accounts.push(newAccount);
    writeBankAccounts(accounts);

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error: any) {
    console.error('Error creating bank account:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create bank account' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, bank, account, accountHolder, swift, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accounts = readBankAccounts();
    const index = accounts.findIndex(a => a.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    accounts[index] = {
      ...accounts[index],
      name: name || accounts[index].name,
      bank: bank || accounts[index].bank,
      account: account || accounts[index].account,
      accountHolder: accountHolder || accounts[index].accountHolder,
      swift: swift !== undefined ? swift : accounts[index].swift,
      isActive: isActive !== undefined ? isActive : accounts[index].isActive,
    };

    writeBankAccounts(accounts);

    return NextResponse.json({ success: true, account: accounts[index] });
  } catch (error: any) {
    console.error('Error updating bank account:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update bank account' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const accounts = readBankAccounts();
    const filtered = accounts.filter(a => a.id !== id);

    if (filtered.length === accounts.length) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    writeBankAccounts(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting bank account:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete bank account' }, { status: 500 });
  }
}

