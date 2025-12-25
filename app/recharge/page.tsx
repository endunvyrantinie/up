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
    const rechargeAmount = selectedAmount || parseFloat(amount);
    
    if (!rechargeAmount || rechargeAmount < 50) {
      alert('Minimum deposit is RM 50');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // For MVP, immediately add to wallet (mock)
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: rechargeAmount }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Recharge successful! RM ${rechargeAmount.toFixed(2)} added to your wallet.`);
        setAmount('');
        setSelectedAmount(null);
        fetchUser();
      } else {
        alert(data.error || 'Recharge failed');
      }
    } catch (error) {
      alert('Recharge failed');
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
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 pb-20">
      <div className="bg-coffee-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:underline">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Recharge</h1>
          <div></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-coffee-800 mb-4">Recharge amount (Minimum RM 50)</h2>
          
          {/* Amount Chips */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {amountChips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSelectedAmount(chip);
                  setAmount(chip.toString());
                }}
                className={`py-3 px-4 rounded-lg font-semibold transition ${
                  selectedAmount === chip
                    ? 'bg-coffee-brown text-white'
                    : 'bg-coffee-50 text-coffee-800 hover:bg-coffee-100'
                }`}
              >
                RM {chip}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-coffee-800 mb-2">
              RM Please enter recharge amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setSelectedAmount(null);
              }}
              className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
            />
          </div>

          {/* Recharge Channel */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-coffee-800 mb-2">
              Recharge channel
            </label>
            <div className="bg-coffee-50 border border-coffee-300 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-coffee-800">Payment Channel 1</span>
                <span className="text-coffee-600">✓</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRecharge}
            disabled={loading || (!amount && !selectedAmount)}
            className="w-full bg-coffee-brown text-white py-4 rounded-lg font-bold text-lg hover:bg-coffee-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Recharge now'}
          </button>
        </div>

        {/* Recharge Rules */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-coffee-800 mb-4">Recharge rules</h3>
          <ul className="space-y-2 text-sm text-coffee-700">
            <li>1. Minimum deposit is 50.</li>
            <li>2. Verify account information before transferring.</li>
            <li>3. If funds are delayed, contact online service.</li>
            <li>4. Never transfer to strangers.</li>
            <li>5. Officials never ask for password.</li>
          </ul>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

