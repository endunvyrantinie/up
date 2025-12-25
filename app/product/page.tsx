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
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-24">
      {/* Enhanced Top Card */}
      <div className="bg-gradient-to-r from-coffee-brown to-coffee-700 text-white p-6 shadow-2xl rounded-b-3xl mb-6">
        <div className="flex justify-between items-center">
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white/90 text-sm mb-1">💰 My Income</p>
            <p className="text-3xl font-bold">RM {user.totalEarned?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-white/90 text-sm mb-1">☕ Coffee Points</p>
            <p className="text-3xl font-bold">{user.totalInvested || 0}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        {/* VIP Plans List - Enhanced */}
        <div className="space-y-6">
          {VIP_PLANS.map((plan) => (
            <div key={plan.id} className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-coffee-200 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Image - Enhanced */}
                <div className="w-32 h-32 bg-gradient-to-br from-coffee-200 via-coffee-300 to-coffee-400 rounded-2xl flex items-center justify-center text-6xl flex-shrink-0 shadow-lg">
                  ☕
                </div>

                {/* Plan Details - Enhanced */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-coffee-800">{plan.name}</h3>
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                      {plan.validityDays} Days
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                      <p className="text-xs text-green-600 mb-1">💰 Total Income</p>
                      <p className="text-lg font-bold text-green-700">RM {plan.totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <p className="text-xs text-blue-600 mb-1">📈 Daily Income</p>
                      <p className="text-lg font-bold text-blue-700">RM {plan.dailyIncome.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-coffee-50 rounded-xl p-4 mb-3 border border-coffee-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-coffee-600">Price:</span>
                      <span className="text-2xl font-bold text-coffee-800">RM {plan.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-coffee-500 bg-coffee-50 rounded-lg p-2">
                    ⏰ Earnings will be automatically settled 24 hours after purchase
                  </p>
                </div>

                {/* Buy Button - Enhanced */}
                <div className="flex items-center md:items-end">
                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={purchasing === plan.id || user.balance < plan.price}
                    className="w-full md:w-auto bg-gradient-to-r from-coffee-brown to-coffee-600 text-white px-8 py-4 rounded-xl font-bold hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {purchasing === plan.id ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Processing...</span>
                      </>
                    ) : user.balance < plan.price ? (
                      <>
                        <span>❌</span>
                        <span>Insufficient</span>
                      </>
                    ) : (
                      <>
                        <span>🛒</span>
                        <span>Buy Now</span>
                      </>
                    )}
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

