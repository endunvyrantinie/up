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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    const plan = VIP_PLANS.find(p => p.id === planId);
    if (!plan) return;

    if (user.balance < plan.price) {
      alert('Insufficient balance');
      return;
    }

    if (!confirm(`Purchase ${plan.name} for RM ${plan.price}?`)) return;

    setPurchasing(planId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vip/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: planId,
          amount: plan.price,
          dailyIncome: plan.dailyIncome,
          validityDays: plan.validityDays,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Purchase successful!');
        fetchUser();
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (error) {
      alert('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 pb-20">
      {/* Top Card */}
      <div className="bg-white rounded-b-2xl shadow-lg p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-coffee-600 mb-1">My income</p>
            <p className="text-2xl font-bold text-coffee-800">RM {user.totalEarned?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-coffee-600 mb-1">My coffee points</p>
            <p className="text-2xl font-bold text-coffee-800">{user.totalInvested || 0}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* VIP Plans List */}
        <div className="space-y-4">
          {VIP_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg p-5 border border-coffee-200">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-lg flex items-center justify-center text-4xl flex-shrink-0">
                  ☕
                </div>

                {/* Plan Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-coffee-800 mb-3">{plan.name}</h3>
                  <div className="space-y-2 text-sm text-coffee-700">
                    <p>Validity period: <span className="font-semibold">{plan.validityDays} days</span></p>
                    <p>Total income: <span className="font-semibold text-green-600">RM {plan.totalIncome.toFixed(2)}</span></p>
                    <p>Daily income: <span className="font-semibold text-green-600">RM {plan.dailyIncome.toFixed(2)}</span></p>
                    <p>Price: <span className="font-semibold text-coffee-800">RM {plan.price.toFixed(2)}</span></p>
                    <p className="text-xs text-coffee-500 mt-2">
                      Earnings will be automatically settled 24 hours after purchase
                    </p>
                  </div>
                </div>

                {/* Buy Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id || user.balance < plan.price}
                    className="bg-coffee-brown text-white px-6 py-3 rounded-lg font-semibold hover:bg-coffee-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {purchasing === plan.id ? 'Processing...' : 'Buy'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

