'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function MinePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      router.push('/login');
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
      <div className="bg-gradient-to-br from-coffee-brown to-coffee-700 text-white p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">☕</div>
          <p className="text-lg font-semibold">{user.username || user.email}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <p className="text-sm text-coffee-latte mb-1">Account balance</p>
          <p className="text-3xl font-bold">RM {user.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Action Icons */}
        <div className="flex justify-around mb-6">
          <Link href="/recharge" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
              💰
            </div>
            <span className="text-sm font-semibold text-coffee-800">Recharge</span>
          </Link>
          <Link href="/withdraw" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
              💸
            </div>
            <span className="text-sm font-semibold text-coffee-800">Withdrawal</span>
          </Link>
          <Link href="/transactions" className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg text-3xl">
              📜
            </div>
            <span className="text-sm font-semibold text-coffee-800">Account log</span>
          </Link>
        </div>

        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="space-y-1">
            <Link href="/team" className="flex items-center justify-between p-4 hover:bg-coffee-50 rounded-lg transition">
              <span className="font-semibold text-coffee-800">Inviting friends</span>
              <span className="text-coffee-600">→</span>
            </Link>
            <Link href="/platform-rules" className="flex items-center justify-between p-4 hover:bg-coffee-50 rounded-lg transition">
              <span className="font-semibold text-coffee-800">Platform rules</span>
              <span className="text-coffee-600">→</span>
            </Link>
            <Link href="/about" className="flex items-center justify-between p-4 hover:bg-coffee-50 rounded-lg transition">
              <span className="font-semibold text-coffee-800">About us</span>
              <span className="text-coffee-600">→</span>
            </Link>
            <Link href="/customer-service" className="flex items-center justify-between p-4 hover:bg-coffee-50 rounded-lg transition">
              <span className="font-semibold text-coffee-800">Customer service</span>
              <span className="text-coffee-600">→</span>
            </Link>
            <Link href="/bank-account" className="flex items-center justify-between p-4 hover:bg-coffee-50 rounded-lg transition">
              <span className="font-semibold text-coffee-800">Bank account management</span>
              <span className="text-coffee-600">→</span>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-600 transition"
        >
          Safe exit
        </button>
      </div>

      <BottomTabBar />
    </div>
  );
}

