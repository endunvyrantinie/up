'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';
import { VIP_PLANS } from '@/lib/vipPlans';

export default function ProductPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeVIPs, setActiveVIPs] = useState<string[]>([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        if (data.user.activeVIP) setActiveVIPs(data.user.activeVIP.map((v: any) => v.productId));
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); } finally { setLoading(false); }
  };

  const handlePurchase = async (planId: string) => {
    const plan = VIP_PLANS.find(p => p.id === planId);
    if (!plan) return;

    if (user.balance < plan.price) {
      if (confirm(`Insufficient balance. Go to recharge RM ${plan.price.toFixed(2)}?`)) {
        router.push(`/recharge?amount=${plan.price}`);
      }
      return;
    }

    if (!confirm(`Purchase ${plan.name} for RM ${plan.price}?`)) return;

    setPurchasing(planId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vip/purchase', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: planId, amount: plan.price, dailyIncome: plan.dailyIncome, validityDays: plan.validityDays }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Purchase successful!');
        router.push('/home');
      } else { alert(data.error || 'Purchase failed'); }
    } catch (error) { alert('Purchase failed'); } finally { setPurchasing(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 to-coffee-200 pb-28">
      <div className="bg-coffee-brown text-white p-6 shadow-2xl rounded-b-3xl mb-6">
        <p className="text-white/90 text-sm">💰 My Balance</p>
        <p className="text-3xl font-bold">RM {user.balance?.toFixed(2) || '0.00'}</p>
      </div>
      <div className="container mx-auto px-4 space-y-6">
        {VIP_PLANS.map((plan) => {
          const isActivated = activeVIPs.includes(plan.id);
          return (
            <div key={plan.id} className={`bg-white rounded-3xl shadow-2xl p-6 border-2 ${isActivated ? 'border-green-500' : 'border-coffee-200'} relative`}>
              {isActivated && <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-[10px] font-bold">ACTIVATED</div>}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-24 h-24 bg-coffee-200 rounded-2xl flex items-center justify-center text-4xl mx-auto md:mx-0">☕</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-coffee-800">{plan.name}</h3>
                  <p className="text-sm text-coffee-600">Price: RM {plan.price.toFixed(2)}</p>
                  <p className="text-sm text-green-600 font-bold">Daily: RM {plan.dailyIncome.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={purchasing === plan.id || isActivated}
                  className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white ${isActivated ? 'bg-green-500' : 'bg-coffee-brown'}`}
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
