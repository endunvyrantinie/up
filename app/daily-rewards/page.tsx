'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DailyRewardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

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

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully claimed RM ${data.reward.toFixed(2)}!`);
        fetchUser();
      } else {
        alert(data.error || 'Already claimed today');
      }
    } catch (error) {
      alert('Failed to claim rewards');
    } finally {
      setClaiming(false);
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

  const canClaim = !user.lastCheckIn || new Date(user.lastCheckIn).toISOString().split('T')[0] !== new Date().toISOString().split('T')[0];
  const availableRewards = user.dailyRewardsBalance || 0;
  const totalRewards = user.dailyRewardsTotal || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 pb-20">
      <div className="bg-coffee-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:underline">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Daily Rewards</h1>
          <div></div>
        </div>
      </div>

      {/* Header Image */}
      <div className="h-48 bg-gradient-to-br from-coffee-brown to-coffee-700 flex items-center justify-center">
        <div className="text-6xl text-white opacity-80">☕</div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-2xl font-bold text-coffee-800 mb-2">Daily rewards: RM 0.50</p>
          </div>
          
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-coffee-200">
            <div>
              <p className="text-sm text-coffee-600 mb-1">Available balance</p>
              <p className="text-2xl font-bold text-coffee-800">RM {availableRewards.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-coffee-600 mb-1">Total rewards received</p>
              <p className="text-2xl font-bold text-green-600">RM {totalRewards.toFixed(2)}</p>
            </div>
          </div>

          <button
            onClick={handleClaim}
            disabled={!canClaim || claiming}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              canClaim && !claiming
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {claiming ? 'Processing...' : canClaim ? 'Get rewards' : 'Already claimed today'}
          </button>
        </div>

        {/* Rules Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-coffee-800 mb-4">Rules</h3>
          <div className="space-y-2 text-sm text-coffee-700">
            <p>1. You can check in once a day.</p>
            <p>2. You can check in again the following day.</p>
            <p>3. The check-in bonus is RM 0.50.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

