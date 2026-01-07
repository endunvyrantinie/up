'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';

export default function ProductPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([
    // HARDCODED FALLBACKS INSIDE THE PAGE TO ENSURE THEY NEVER DISAPPEAR
    { id: 'VIP1', name: 'VIP1', price: 30, dailyIncome: 8, totalIncome: 720, validityDays: 90 },
    { id: 'VIP2', name: 'VIP2', price: 100, dailyIncome: 18, totalIncome: 1620, validityDays: 90 },
    { id: 'VIP3', name: 'VIP3', price: 200, dailyIncome: 38, totalIncome: 3420, validityDays: 90 },
    { id: 'VIP4', name: 'VIP4', price: 400, dailyIncome: 80, totalIncome: 7200, validityDays: 90 },
    { id: 'VIP5', name: 'VIP5', price: 800, dailyIncome: 168, totalIncome: 15120, validityDays: 90 },
    { id: 'VIP6', name: 'VIP6', price: 1600, dailyIncome: 352, totalIncome: 31680, validityDays: 90 },
    { id: 'VIP7', name: 'VIP7', price: 3000, dailyIncome: 680, totalIncome: 61200, validityDays: 90 },
    { id: 'VIP8', name: 'VIP8', price: 6000, dailyIncome: 1400, totalIncome: 126000, validityDays: 90 },
    { id: 'VIP9', name: 'VIP9', price: 12000, dailyIncome: 2880, totalIncome: 259200, validityDays: 90 },
  ]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeVIPs, setActiveVIPs] = useState<string[]>([]);

  useEffect(() => {
    fetchUser();
    fetchProducts();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.user.activeVIP) setActiveVIPs([data.user.activeVIP]);
      }
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (e) { console.error(e); }
  };

  const handlePurchase = async (planId: string) => {
    const plan = products.find(p => p.id === planId);
    if (!plan || !user) return;

    if (user.balance < plan.price) {
      const needed = plan.price - user.balance;
      alert(`Insufficient balance. You need RM ${needed.toFixed(2)} more.`);
      router.push(`/recharge?amount=${needed.toFixed(2)}`);
      return;
    }

    setPurchasing(planId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vip/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ productId: plan.id, amount: plan.price, dailyIncome: plan.dailyIncome, validityDays: plan.validityDays })
      });
      if (res.ok) {
        alert('Purchase successful!');
        router.push('/home');
      } else {
        const err = await res.json();
        alert(err.error || 'Purchase failed');
      }
    } catch (e) { alert('System error'); }
    finally { setPurchasing(null); }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <div className="bg-stone-900 text-white p-6 rounded-b-[3rem] shadow-xl mb-8">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <p className="text-stone-400 text-xs uppercase font-bold tracking-widest mb-1">My Wallet</p>
            <p className="text-3xl font-black">RM {user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black">VIP Plans</h1>
            <p className="text-stone-400 text-xs">D' Mannee Resources</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {products.map((plan) => {
          const isActivated = activeVIPs.includes(plan.id);
          return (
            <div key={plan.id} className={`bg-white rounded-3xl shadow-lg p-6 border-2 ${isActivated ? 'border-green-500' : 'border-stone-100'} relative`}>
              {isActivated && <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-[10px] font-bold">ACTIVATED</div>}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-3xl">☕</div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-800">{plan.name}</h3>
                    <p className="text-sm text-stone-500">Price: RM {plan.price.toFixed(2)} | Daily: <span className="text-green-600 font-bold">RM {plan.dailyIncome.toFixed(2)}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id || isActivated}
                  className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold transition ${isActivated ? 'bg-green-500 text-white' : 'bg-stone-900 text-white hover:bg-stone-800'}`}
                >
                  {purchasing === plan.id ? '...' : isActivated ? 'Purchased' : 'Purchase'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <BottomTabBar />
    </div>
  );
}
