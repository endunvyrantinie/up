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
      // Clear all tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      // Force redirect to login
      window.location.href = '/login';
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
      {/* Enhanced Top Card - Mobile Optimized */}
      <div className="bg-gradient-to-br from-coffee-brown via-coffee-600 to-coffee-700 text-white p-6 sm:p-8 mb-4 sm:mb-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-24 translate-x-24 sm:-translate-y-32 sm:translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-36 h-36 sm:w-48 sm:h-48 bg-white/10 rounded-full translate-y-18 -translate-x-18 sm:translate-y-24 sm:-translate-x-24"></div>
        
        <div className="relative z-10 text-center mb-4 sm:mb-6">
          <div className="text-5xl sm:text-7xl mb-2 sm:mb-3 animate-pulse">☕</div>
          <p className="text-lg sm:text-xl font-bold mb-1 truncate max-w-[90%] mx-auto">{user.username || user.email}</p>
          <p className="text-white/80 text-xs sm:text-sm">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center border-2 border-white/30 relative z-10">
          <p className="text-white/90 text-xs sm:text-sm mb-2">💰 Account Balance</p>
          <p className="text-3xl sm:text-4xl font-bold">RM {user.balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 sm:pb-24">
        {/* Enhanced Action Icons - Mobile Optimized */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-coffee-100">
          <div className="flex justify-around">
            <Link href="/recharge" className="flex flex-col items-center gap-2 sm:gap-3 group active:scale-95 transition-transform">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-active:scale-110 transition-all duration-300 text-3xl sm:text-4xl touch-manipulation">
                💰
              </div>
              <span className="text-xs sm:text-sm font-bold text-coffee-800 group-active:text-coffee-brown transition">Recharge</span>
            </Link>
            <Link href="/withdraw" className="flex flex-col items-center gap-2 sm:gap-3 group active:scale-95 transition-transform">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-active:scale-110 transition-all duration-300 text-3xl sm:text-4xl touch-manipulation">
                💸
              </div>
              <span className="text-xs sm:text-sm font-bold text-coffee-800 group-active:text-coffee-brown transition">Withdrawal</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-2 sm:gap-3 group active:scale-95 transition-transform">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-active:scale-110 transition-all duration-300 text-3xl sm:text-4xl touch-manipulation">
                📜
              </div>
              <span className="text-xs sm:text-sm font-bold text-coffee-800 group-active:text-coffee-brown transition">Account Log</span>
            </Link>
          </div>
        </div>

        {/* Enhanced Menu List */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-2 border-coffee-100">
          <h3 className="text-lg font-bold text-coffee-800 mb-4 px-2">Menu</h3>
          <div className="space-y-2">
            {[
              { href: '/team', label: 'Inviting friends', icon: '👥' },
              { href: '/platform-rules', label: 'Platform rules', icon: '📋' },
              { href: '/about', label: 'About us', icon: 'ℹ️' },
              { href: '/customer-service', label: 'Customer service', icon: '💬' },
              { href: '/bank-account', label: 'Bank account management', icon: '🏦' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-4 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition-all duration-300 transform hover:scale-[1.02] group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-semibold text-coffee-800 group-hover:text-coffee-brown transition">{item.label}</span>
                </div>
                <span className="text-coffee-600 text-xl group-hover:text-coffee-brown group-hover:translate-x-1 transition">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Enhanced Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-5 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Safe Exit</span>
        </button>
      </div>

      <BottomTabBar />
    </div>
  );
}

