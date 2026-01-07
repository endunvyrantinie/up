import { NextResponse } from 'next/server';
import { readProducts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Try to get products from database
    let products = await readProducts();
    
    // 2. If database is empty, use these defaults
    if (!products || products.length === 0) {
      products = [
        { id: 'VIP1', name: 'VIP1', price: 30, dailyIncome: 8, totalIncome: 720, validityDays: 90 },
        { id: 'VIP2', name: 'VIP2', price: 100, dailyIncome: 18, totalIncome: 1620, validityDays: 90 },
        { id: 'VIP3', name: 'VIP3', price: 200, dailyIncome: 38, totalIncome: 3420, validityDays: 90 },
        { id: 'VIP4', name: 'VIP4', price: 400, dailyIncome: 80, totalIncome: 7200, validityDays: 90 },
        { id: 'VIP5', name: 'VIP5', price: 800, dailyIncome: 168, totalIncome: 15120, validityDays: 90 },
        { id: 'VIP6', name: 'VIP6', price: 1600, dailyIncome: 352, totalIncome: 31680, validityDays: 90 },
        { id: 'VIP7', name: 'VIP7', price: 3000, dailyIncome: 680, totalIncome: 61200, validityDays: 90 },
        { id: 'VIP8', name: 'VIP8', price: 6000, dailyIncome: 1400, totalIncome: 126000, validityDays: 90 },
        { id: 'VIP9', name: 'VIP9', price: 12000, dailyIncome: 2880, totalIncome: 259200, validityDays: 90 },
      ];
    }
    
    return NextResponse.json({ products });
  } catch (error) {
    // 3. Emergency fallback
    const fallbackProducts = [
      { id: 'VIP1', name: 'VIP1', price: 30, dailyIncome: 8, totalIncome: 720, validityDays: 90 },
      { id: 'VIP2', name: 'VIP2', price: 100, dailyIncome: 18, totalIncome: 1620, validityDays: 90 },
      { id: 'VIP3', name: 'VIP3', price: 200, dailyIncome: 38, totalIncome: 3420, validityDays: 90 },
      { id: 'VIP4', name: 'VIP4', price: 400, dailyIncome: 80, totalIncome: 7200, validityDays: 90 },
      { id: 'VIP5', name: 'VIP5', price: 800, dailyIncome: 168, totalIncome: 15120, validityDays: 90 },
      { id: 'VIP6', name: 'VIP6', price: 1600, dailyIncome: 352, totalIncome: 31680, validityDays: 90 },
      { id: 'VIP7', name: 'VIP7', price: 3000, dailyIncome: 680, totalIncome: 61200, validityDays: 90 },
      { id: 'VIP8', name: 'VIP8', price: 6000, dailyIncome: 1400, totalIncome: 126000, validityDays: 90 },
      { id: 'VIP9', name: 'VIP9', price: 12000, dailyIncome: 2880, totalIncome: 259200, validityDays: 90 },
    ];
    return NextResponse.json({ products: fallbackProducts });
  }
}
