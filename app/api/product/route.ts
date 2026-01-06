import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let products = await readProducts();
    if (!products || products.length === 0) {
      // Provide defaults if database is empty
      products = [
        { id: 'VIP1', name: 'VIP1', price: 30, dailyIncome: 8, totalIncome: 720, validityDays: 90 },
        { id: 'VIP2', name: 'VIP2', price: 100, dailyIncome: 18, totalIncome: 1620, validityDays: 90 },
        // ... (add other VIP levels here)
      ];
    }
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
