import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readPaymentChannels, createPaymentChannel, updatePaymentChannel, deletePaymentChannel, PaymentChannel } from '@/lib/db';

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

    const channels = await readPaymentChannels();
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

    const newChannel: PaymentChannel = {
      id: Date.now().toString(),
      name,
      type,
      details,
      instructions: instructions || '',
      isActive: isActive !== undefined ? isActive : true,
    };

    const createdChannel = await createPaymentChannel(newChannel);

    return NextResponse.json({ success: true, channel: createdChannel });
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

    const channels = await readPaymentChannels();
    const existingChannel = channels.find((c: any) => c.id === id);

    if (!existingChannel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    const updatedChannel = await updatePaymentChannel(id, {
      name: name || existingChannel.name,
      type: type || existingChannel.type,
      details: details || existingChannel.details,
      instructions: instructions !== undefined ? instructions : existingChannel.instructions,
      isActive: isActive !== undefined ? isActive : existingChannel.isActive,
    });

    if (!updatedChannel) {
      return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 });
    }

    return NextResponse.json({ success: true, channel: updatedChannel });
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

    const success = await deletePaymentChannel(id);

    if (!success) {
      return NextResponse.json({ error: 'Channel not found or failed to delete' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting payment channel:', error);
    return NextResponse.json({ error: error?.message || 'Failed to delete payment channel' }, { status: 500 });
  }
}
