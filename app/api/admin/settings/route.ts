import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/db';

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

    const settings = readSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
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
    const { 
      telegramSupport, 
      telegramChannel, 
      telegramGroup,
      qrDataFormat,
      qrDarkColor,
      qrLightColor,
      qrWidth,
      qrMargin
    } = body;

    // Read existing settings to preserve QR settings if not provided
    const existingSettings = readSettings();

    const settings = {
      telegramSupport: (telegramSupport || existingSettings.telegramSupport || '').trim(),
      telegramChannel: (telegramChannel || existingSettings.telegramChannel || '').trim(),
      telegramGroup: (telegramGroup || existingSettings.telegramGroup || '').trim(),
      // QR Code settings (optional)
      qrDataFormat: qrDataFormat || existingSettings.qrDataFormat || 'COFFEEPAY-{amount}-{timestamp}',
      qrDarkColor: qrDarkColor || existingSettings.qrDarkColor || '#8B4513',
      qrLightColor: qrLightColor || existingSettings.qrLightColor || '#FFFFFF',
      qrWidth: qrWidth ? parseInt(qrWidth) : (existingSettings.qrWidth || 300),
      qrMargin: qrMargin ? parseInt(qrMargin) : (existingSettings.qrMargin || 2),
    };

    writeSettings(settings);

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update settings' }, { status: 500 });
  }
}

