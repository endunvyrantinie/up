'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function RechargePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const amountChips = [50, 100, 200, 400, 800, 1600, 3000, 6000, 12000];

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
    }
  };

  const handleRecharge = async () => {
    const rechargeAmount = selectedAmount || (amount ? parseFloat(amount) : 0);
    
    if (!rechargeAmount || rechargeAmount < 50 || isNaN(rechargeAmount)) {
      alert('Minimum deposit is RM 50');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: rechargeAmount }),
      });
      
      const data = await res.json();

      if (data.success && data.url) {
        // Redirecting to Stripe Checkout
        window.location.href = data.url; 
      } else {
        alert(data.error || 'Recharge failed');
      }
    } catch (error) {
      console.error('Recharge error:', error);
      alert('Recharge failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-28 swipeable">
      <div className="bg-gradient-to-r from-coffee-brown to-coffee-700 text-white p-6 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:text-coffee-200 transition flex items-center gap-2">
            <span>←</span> Back
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>💰</span> Recharge
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 -mt-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
          <p className="text-white/90 text-sm mb-2">Current Balance</p>
          <p className="text-4xl font-bold">RM {user.balance.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border-2 border-coffee-100">
          <h2 className="text-xl font-bold text-coffee-800 mb-2">Recharge Amount</h2>
          <p className="text-xs text-coffee-600 mb-6">Minimum deposit: RM 50</p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {amountChips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSelectedAmount(chip);
                  setAmount(chip.toString());
                }}
                className={`py-3 rounded-xl font-bold transition-all ${
                  selectedAmount === chip
                    ? 'bg-coffee-brown text-white shadow-lg'
                    : 'bg-coffee-50 text-coffee-800 border-2 border-coffee-200'
                }`}
              >
                RM {chip}
              </button>
            ))}
          </div>

          <div className="mb-6 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-600 font-bold">RM</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSelectedAmount(null);
              }}
              className="w-full pl-12 pr-4 py-4 border-2 border-coffee-300 rounded-xl text-lg font-semibold"
              placeholder="Enter amount"
            />
          </div>

          <button
            onClick={handleRecharge}
            disabled={loading || (!amount && !selectedAmount)}
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-5 rounded-xl font-bold text-lg shadow-xl active:scale-95 transition-all"
          >
            {loading ? "Connecting to Stripe..." : "Recharge Now"}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-coffee-100">
          <h3 className="text-xl font-bold text-coffee-800 mb-4">Recharge Rules</h3>
          <ul className="space-y-3 text-sm text-coffee-700">
            <li className="flex gap-2"><span>1.</span> Minimum deposit RM 50.</li>
            <li className="flex gap-2"><span>2.</span> Payments are processed securely via Stripe.</li>
            <li className="flex gap-2"><span>3.</span> Balance will update automatically after payment.</li>
          </ul>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}