'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';

export default function ProductPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeVIPs, setActiveVIPs] = useState<string[]>([]);

  useEffect(() => {
    const init = async () => {
      await fetchUser();
      await fetchProducts();
      setLoading(false);
    };
    init();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/auth/me', { 
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        // Extract active VIP product IDs
        if (data.user.activeVIP) {
          setActiveVIPs(data.user.activeVIP.map((v: any) => v.productId));
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

  const handlePurchase = async (planId: string) => {
    const plan = products.find(p => p.id === planId);
    if (!plan) return;

    // 1. Check if balance is enough
    if (user.balance < plan.price) {
      if (confirm(`Insufficient balance. Your balance is RM ${user.balance.toFixed(2)}. Would you like to recharge RM ${plan.price.toFixed(2)} to purchase ${plan.name}?`)) {
        // Redirect to recharge page with the required amount pre-filled
        router.push(`/recharge?amount=${plan.price}`);
      }
      return;
    }

    // 2. Confirm Purchase
    if (!confirm(`Confirm purchase of ${plan.name} for RM ${plan.price.toFixed(2)}?`)) return;

    setPurchasing(planId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vip/purchase', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          productId: planId, 
          amount: plan.price, 
          dailyIncome: plan.dailyIncome, 
          validityDays: plan.validityDays 
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Purchase successful! Product activated.');
        // 3. Redirect to Home Page upon completion
        router.push('/home');
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (error) {
      alert('Connection error. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Header Section */}
      <div className="bg-stone-900 text-white p-8 rounded-b-[3rem] shadow-xl mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-stone-400 text-xs uppercase font-bold tracking-widest">My Wallet</p>
            <p className="text-3xl font-black">RM {user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black">VIP Plans</h1>
            <p className="text-stone-400 text-xs">D' Mannee Resources</p>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {products.map((plan) => {
          const isActivated = activeVIPs.includes(plan.id);
          return (
            <div 
              key={plan.id} 
              className={`bg-white p-6 rounded-3xl shadow-sm border-2 transition-all ${
                isActivated ? 'border-green-500 bg-green-50/30' : 'border-stone-100 hover:border-stone-200'
              } relative overflow-hidden`}
            >
              {/* Activation Badge */}
              {isActivated && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-6 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                  ACTIVATED
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-6 items-center">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl ${
                  isActivated ? 'bg-green-100' : 'bg-stone-100'
                }`}>
                  ☕
                </div>

                {/* Details */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black text-stone-900">{plan.name}</h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 mt-2">
                    <p className="text-sm font-bold text-stone-500">
                      Price: <span className="text-stone-900">RM {plan.price.toFixed(2)}</span>
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      Daily: RM {plan.dailyIncome.toFixed(2)}
                    </p>
                    <p className="text-sm font-bold text-stone-500">
                      Total: RM {plan.totalIncome.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id || isActivated}
                  className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black transition transform active:scale-95 ${
                    isActivated 
                      ? 'bg-green-500 text-white cursor-default' 
                      : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-200'
                  }`}
                >
                  {purchasing === plan.id ? 'Processing...' : isActivated ? 'Purchased' : 'Purchase'}
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
