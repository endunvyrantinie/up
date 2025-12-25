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
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-24">
      <InformationModal isOpen={showInfo} onClose={handleCloseInfo} />

      {/* Top Banner - Enhanced */}
      <div className="relative overflow-hidden">
        <div className="h-56 bg-gradient-to-br from-coffee-brown via-coffee-600 to-coffee-700 flex items-center justify-center relative">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>
          
          <div className="relative z-10 text-center">
            <div className="text-7xl mb-2 animate-pulse">☕</div>
            <h1 className="text-white text-xl font-bold">Coffee Rewards</h1>
            <p className="text-white/80 text-sm mt-1">Welcome back, {user.username}</p>
          </div>
        </div>
        
        {/* Top right buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <Link
            href="/daily-rewards"
            className="bg-white/95 backdrop-blur-sm text-coffee-brown px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-white hover:scale-105 transition-all duration-200 flex items-center gap-1"
          >
            <span>🎁</span>
            <span>Daily</span>
          </Link>
          <Link
            href="/customer-service"
            className="bg-white/95 backdrop-blur-sm text-coffee-brown px-4 py-2 rounded-full text-xs font-bold shadow-xl hover:bg-white hover:scale-105 transition-all duration-200 flex items-center gap-1"
          >
            <span>💬</span>
            <span>Support</span>
          </Link>
        </div>
        
        {/* Bottom accent bar */}
        <div className="h-1 bg-gradient-to-r from-coffee-brown via-coffee-600 to-coffee-brown"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8">
        {/* Action Buttons - Enhanced */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6 border border-coffee-100">
          <div className="flex justify-around">
            <Link
              href="/recharge"
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 text-4xl">
                💰
              </div>
              <span className="text-sm font-bold text-coffee-800 group-hover:text-coffee-brown transition">Recharge</span>
            </Link>
            <Link
              href="/withdraw"
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 text-4xl">
                💸
              </div>
              <span className="text-sm font-bold text-coffee-800 group-hover:text-coffee-brown transition">Withdrawal</span>
            </Link>
            <Link
              href="/customer-service"
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 text-4xl">
                💬
              </div>
              <span className="text-sm font-bold text-coffee-800 group-hover:text-coffee-brown transition">Service</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-coffee-50 rounded-2xl shadow-xl p-6 border-2 border-coffee-200 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-coffee-600 uppercase tracking-wide">Account Balance</p>
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-4xl font-bold text-coffee-800 mt-2">RM {stats.walletBalance.toFixed(2)}</p>
            <div className="mt-4 pt-4 border-t border-coffee-200">
              <p className="text-xs text-coffee-500">Available for withdrawal</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-6 border-2 border-green-200 hover:shadow-2xl transition-all duration-300">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">Today's Income</p>
                <span className="text-xl">📈</span>
              </div>
              <p className="text-3xl font-bold text-green-600">RM {stats.todayIncome.toFixed(2)}</p>
            </div>
            <div className="pt-4 border-t border-green-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-coffee-600 uppercase tracking-wide">Total Income</p>
                <span className="text-xl">💰</span>
              </div>
              <p className="text-3xl font-bold text-coffee-800">RM {stats.totalIncome.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Coffee Images Grid - Enhanced */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-24 border border-coffee-100">
          <h3 className="text-coffee-800 font-bold text-center mb-4 text-lg">Featured Products</h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-coffee-200 via-coffee-300 to-coffee-400 rounded-xl flex items-center justify-center text-5xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                ☕
              </div>
            ))}
          </div>
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

