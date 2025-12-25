'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';
import InformationModal from '@/components/InformationModal';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [stats, setStats] = useState({
    walletBalance: 0,
    todayIncome: 0,
    totalIncome: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
    
    // Check if should show info modal
    if (searchParams.get('showInfo') === 'true') {
      setShowInfo(true);
    }
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
        setStats({
          walletBalance: data.user.balance || 0,
          todayIncome: data.user.todayIncome || 0,
          totalIncome: data.user.totalEarned || 0,
        });
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInfo = async () => {
    setShowInfo(false);
    // Mark as seen in backend
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/user/mark-info-seen', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to mark info as seen');
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
      <InformationModal isOpen={showInfo} onClose={handleCloseInfo} />

      {/* Top Banner */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-coffee-brown to-coffee-700 flex items-center justify-center">
          <div className="text-6xl text-white opacity-80">☕</div>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <Link
            href="/daily-rewards"
            className="bg-white/90 text-coffee-brown px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-white transition"
          >
            Daily rewards
          </Link>
          <Link
            href="/customer-service"
            className="bg-white/90 text-coffee-brown px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-white transition"
          >
            Support
          </Link>
        </div>
        <div className="h-2 bg-coffee-brown"></div>
      </div>

      {/* Action Buttons */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-around mb-6">
          <Link
            href="/recharge"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
              💰
            </div>
            <span className="text-sm font-semibold text-coffee-800">Recharge</span>
          </Link>
          <Link
            href="/withdraw"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
              💸
            </div>
            <span className="text-sm font-semibold text-coffee-800">Withdrawal</span>
          </Link>
          <Link
            href="/customer-service"
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
              💬
            </div>
            <span className="text-sm font-semibold text-coffee-800">Customer Service</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-coffee-brown">
            <p className="text-sm text-coffee-600 mb-2">Account balance</p>
            <p className="text-3xl font-bold text-coffee-800">RM {stats.walletBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="mb-3">
              <p className="text-sm text-coffee-600 mb-1">Today's income</p>
              <p className="text-2xl font-bold text-green-600">RM {stats.todayIncome.toFixed(2)}</p>
            </div>
            <div className="pt-3 border-t border-coffee-200">
              <p className="text-sm text-coffee-600 mb-1">Cumulative income</p>
              <p className="text-2xl font-bold text-coffee-800">RM {stats.totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Coffee Images Grid */}
        <div className="grid grid-cols-3 gap-2 mb-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gradient-to-br from-coffee-200 to-coffee-300 rounded-lg flex items-center justify-center text-4xl"
            >
              ☕
            </div>
          ))}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800 text-xl">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

