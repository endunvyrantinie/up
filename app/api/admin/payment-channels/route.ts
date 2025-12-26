import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readPaymentChannels, writePaymentChannels, PaymentChannel } from '@/lib/db';

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

    const channels = readPaymentChannels();
    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Error fetching payment channels:', error);
    return NextResponse.json({ error: 'Failed to fetch payment channels' }, { status: 500 });
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
    const { name, type, details, instructions, isActive } = body;

    if (!name || !type || !details) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const channels = readPaymentChannels();
    const newChannel: PaymentChannel = {
      id: Date.now().toString(),
      name,
      type,
      details,
      instructions: instructions || '',
      isActive: isActive !== undefined ? isActive : true,
    };

    channels.push(newChannel);
    writePaymentChannels(channels);

    return NextResponse.json({ success: true, channel: newChannel });
  } catch (error: any) {
    console.error('Error creating payment channel:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create payment channel' }, { status: 500 });
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
    const { id, name, type, details, instructions, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const channels = readPaymentChannels();
    const index = channels.findIndex(c => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    channels[index] = {
      ...channels[index],
      name: name || channels[index].name,
      type: type || channels[index].type,
      details: details || channels[index].details,
      instructions: instructions !== undefined ? instructions : channels[index].instructions,
      isActive: isActive !== undefined ? isActive : channels[index].isActive,
    };

    writePaymentChannels(channels);

    return NextResponse.json({ success: true, channel: channels[index] });
  } catch (error: any) {
    console.error('Error updating payment channel:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update payment channel' }, { status: 500 });
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
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    const channels = readPaymentChannels();
    const filtered = channels.filter(c => c.id !== id);

    if (filtered.length === channels.length) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    writePaymentChannels(filtered);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment channel:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete payment channel' }, { status: 500 });
  }
}

