import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel 
  ? path.join(os.tmpdir(), 'coffee-rewards-data')
  : path.join(process.cwd(), 'data');

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Initialize products file if it doesn't exist
if (!fs.existsSync(PRODUCTS_FILE)) {
  try {
    const defaultProducts = [
      { id: 'VIP1', name: 'VIP1', price: 50, dailyIncome: 8, totalIncome: 720, validityDays: 90 },
      { id: 'VIP2', name: 'VIP2', price: 100, dailyIncome: 18, totalIncome: 1620, validityDays: 90 },
      { id: 'VIP3', name: 'VIP3', price: 200, dailyIncome: 38, totalIncome: 3420, validityDays: 90 },
      { id: 'VIP4', name: 'VIP4', price: 400, dailyIncome: 80, totalIncome: 7200, validityDays: 90 },
      { id: 'VIP5', name: 'VIP5', price: 800, dailyIncome: 168, totalIncome: 15120, validityDays: 90 },
      { id: 'VIP6', name: 'VIP6', price: 1600, dailyIncome: 352, totalIncome: 31680, validityDays: 90 },
      { id: 'VIP7', name: 'VIP7', price: 3000, dailyIncome: 680, totalIncome: 61200, validityDays: 90 },
      { id: 'VIP8', name: 'VIP8', price: 6000, dailyIncome: 1400, totalIncome: 126000, validityDays: 90 },
      { id: 'VIP9', name: 'VIP9', price: 12000, dailyIncome: 2880, totalIncome: 259200, validityDays: 90 },
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(defaultProducts, null, 2));
  } catch (error) {
    console.error('Failed to initialize products file:', error);
  }
}

const readProducts = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const writeProducts = (products: any[]) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error writing products:', error);
    throw error;
  }
};

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

    const products = readProducts();
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
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

    const { productId, updates } = await request.json();

    if (!productId || !updates) {
      return NextResponse.json({ error: 'Product ID and updates are required' }, { status: 400 });
    }

    const products = readProducts();
    const productIndex = products.findIndex((p: any) => p.id === productId);

    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update product
    products[productIndex] = {
      ...products[productIndex],
      ...updates,
      // Recalculate totalIncome if dailyIncome or validityDays changed
      totalIncome: updates.dailyIncome && updates.validityDays
        ? updates.dailyIncome * updates.validityDays
        : updates.dailyIncome
        ? updates.dailyIncome * (products[productIndex].validityDays || 90)
        : updates.validityDays
        ? (products[productIndex].dailyIncome || 0) * updates.validityDays
        : products[productIndex].totalIncome,
    };

    writeProducts(products);

    return NextResponse.json({ 
      success: true, 
      product: products[productIndex],
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

