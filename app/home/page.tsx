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
    if (searchParams.get('showInfo') === 'true') setShowInfo(true);
  }, []);

  const fetchUser = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.code === 'USER_NOT_FOUND' && retryCount < 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUser(retryCount + 1);
        }
        if (res.status === 401 || retryCount >= 1) {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setStats({
          walletBalance: data.user.balance || 0,
          todayIncome: data.user.todayIncome || 0,
          totalIncome: data.user.totalEarned || 0,
        });
      }
    } catch (error) {
      router.push('/login');
    } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 to-coffee-200 pb-28">
      <InformationModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      <div className="h-64 bg-coffee-brown flex items-center justify-center relative shadow-2xl">
        <div className="text-center px-4">
          <div className="text-6xl mb-2 animate-bounce">☕</div>
          <h1 className="text-white text-xl font-bold">Coffee Rewards</h1>
          <p className="text-white/90 text-sm">Welcome back, {user.username}</p>
        </div>
      </div>
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 flex justify-around">
          <Link href="/recharge" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-3xl">💰</div>
            <span className="text-xs font-bold">Recharge</span>
          </Link>
          <Link href="/withdraw" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl">💸</div>
            <span className="text-xs font-bold">Withdrawal</span>
          </Link>
          <Link href="/customer-service" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center text-3xl">💬</div>
            <span className="text-xs font-bold">Service</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-coffee-200">
            <p className="text-xs font-bold text-coffee-600 uppercase">Account Balance</p>
            <p className="text-3xl font-bold text-coffee-800">RM {stats.walletBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-green-200">
            <p className="text-xs font-bold text-green-600 uppercase">Today's Income</p>
            <p className="text-3xl font-bold text-green-600">RM {stats.todayIncome.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}

export default function HomePage() {
  return <Suspense fallback={<div>Loading...</div>}><HomeContent /></Suspense>;
}
