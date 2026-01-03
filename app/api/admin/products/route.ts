import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { readProducts, updateProduct } from '@/lib/db';

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

    const products = await readProducts();
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

    const products = await readProducts();
    const product = products.find((p: any) => p.id === productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate totalIncome if dailyIncome or validityDays changed
    const totalIncome = updates.dailyIncome && updates.validityDays
      ? updates.dailyIncome * updates.validityDays
      : updates.dailyIncome
      ? updates.dailyIncome * (product.validityDays || 90)
      : updates.validityDays
      ? (product.dailyIncome || 0) * updates.validityDays
      : product.totalIncome;

    const updatedProduct = await updateProduct(productId, {
      ...updates,
      totalIncome,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      message: 'Product updated successfully'
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
