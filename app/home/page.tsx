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

  const fetchUser = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('No token found, redirecting to login');
        }
        router.push('/login');
        return;
      }
      
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store', // Prevent caching issues
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth check failed:', { 
            status: res.status, 
            error: errorData.error,
            code: errorData.code,
            retryCount
          });
        }
        
        // If it's a "user not found" error and we haven't retried, try once more
        if (errorData.code === 'USER_NOT_FOUND' && retryCount < 1) {
          console.log('Retrying user fetch...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          return fetchUser(retryCount + 1);
        }
        
        // Token invalid or expired, or user not found after retry
        // Only logout if it's a 401 (unauthorized) or after retry failed
        if (res.status === 401 || retryCount >= 1) {
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
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
      } else {
        console.error('No user data in response:', data);
        // Retry once if no user data
        if (retryCount < 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUser(retryCount + 1);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        router.push('/login');
      }
    } catch (error) {
      console.error('Fetch user error:', error);
      // Retry once on network errors
      if (retryCount < 1) {
        console.log('Retrying after network error...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUser(retryCount + 1);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
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
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-28 swipeable">
      <InformationModal isOpen={showInfo} onClose={handleCloseInfo} />

      {/* Top Banner - Ultra Enhanced */}
      <div className="relative overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-coffee-brown via-coffee-600 to-coffee-700 flex items-center justify-center relative shadow-2xl">
          {/* Animated decorative circles */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          
          <div className="relative z-10 text-center px-4">
            <div className="text-6xl sm:text-8xl mb-2 sm:mb-3 animate-bounce" style={{ animationDuration: '2s' }}>☕</div>
            <h1 className="text-white text-xl sm:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">Coffee Rewards</h1>
            <p className="text-white/90 text-sm sm:text-base mt-1 sm:mt-2 font-semibold truncate max-w-[90%] mx-auto">Welcome back, {user.username || 'User'}</p>
            <div className="mt-2 sm:mt-3 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-[10px] sm:text-xs">Online</span>
            </div>
          </div>
        </div>
        
        {/* Top right buttons - Mobile Optimized */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-1 sm:gap-2 z-20">
          <Link
            href="/daily-rewards"
            className="bg-white/95 backdrop-blur-md text-coffee-brown px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold shadow-2xl active:bg-white active:scale-110 transition-all duration-300 flex items-center gap-1 sm:gap-2 border-2 border-white/50 touch-manipulation min-h-[36px]"
          >
            <span className="text-sm sm:text-lg">🎁</span>
            <span className="hidden sm:inline">Daily</span>
          </Link>
          <Link
            href="/customer-service"
            className="bg-white/95 backdrop-blur-md text-coffee-brown px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-bold shadow-2xl active:bg-white active:scale-110 transition-all duration-300 flex items-center gap-1 sm:gap-2 border-2 border-white/50 touch-manipulation min-h-[36px]"
          >
            <span className="text-sm sm:text-lg">💬</span>
            <span className="hidden sm:inline">Support</span>
          </Link>
        </div>
        
        {/* Bottom accent bar with gradient */}
        <div className="h-2 bg-gradient-to-r from-coffee-brown via-coffee-600 to-coffee-brown shadow-lg"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-8">
        {/* Action Buttons - Mobile Optimized */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 mb-6 border-2 border-coffee-100 mobile-card">
          <div className="flex justify-around gap-2 sm:gap-4">
            <Link
              href="/recharge"
              className="flex flex-col items-center gap-2 sm:gap-4 group flex-1 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl group-active:scale-110 transition-all duration-300 text-3xl sm:text-5xl relative overflow-hidden touch-manipulation">
                <div className="absolute inset-0 bg-white/20 rounded-2xl sm:rounded-3xl transform scale-0 group-active:scale-100 transition-transform duration-300"></div>
                <span className="relative z-10">💰</span>
              </div>
              <span className="text-xs sm:text-base font-bold text-coffee-800 group-active:text-green-600 transition-all duration-300">Recharge</span>
            </Link>
            <Link
              href="/withdraw"
              className="flex flex-col items-center gap-2 sm:gap-4 group flex-1 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl group-active:scale-110 transition-all duration-300 text-3xl sm:text-5xl relative overflow-hidden touch-manipulation">
                <div className="absolute inset-0 bg-white/20 rounded-2xl sm:rounded-3xl transform scale-0 group-active:scale-100 transition-transform duration-300"></div>
                <span className="relative z-10">💸</span>
              </div>
              <span className="text-xs sm:text-base font-bold text-coffee-800 group-active:text-blue-600 transition-all duration-300">Withdrawal</span>
            </Link>
            <Link
              href="/customer-service"
              className="flex flex-col items-center gap-2 sm:gap-4 group flex-1 active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl group-active:scale-110 transition-all duration-300 text-3xl sm:text-5xl relative overflow-hidden touch-manipulation">
                <div className="absolute inset-0 bg-white/20 rounded-2xl sm:rounded-3xl transform scale-0 group-active:scale-100 transition-transform duration-300"></div>
                <span className="relative z-10">💬</span>
              </div>
              <span className="text-xs sm:text-base font-bold text-coffee-800 group-active:text-purple-600 transition-all duration-300">Service</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-gradient-to-br from-white via-coffee-50 to-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border-2 border-coffee-200 mobile-card relative overflow-hidden touch-manipulation">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-coffee-100/30 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-[10px] sm:text-xs font-bold text-coffee-600 uppercase tracking-wider">Account Balance</p>
                <span className="text-2xl sm:text-3xl animate-pulse">💳</span>
              </div>
              <p className="text-3xl sm:text-5xl font-bold text-coffee-800 mt-2 sm:mt-3 mb-3 sm:mb-4 drop-shadow-sm">RM {stats.walletBalance.toFixed(2)}</p>
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t-2 border-coffee-200">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-[10px] sm:text-xs text-coffee-500 font-semibold">Available for withdrawal</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white via-green-50 to-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border-2 border-green-200 active:shadow-3xl active:scale-[1.02] transition-all duration-300 relative overflow-hidden touch-manipulation">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-green-100/30 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
            <div className="relative z-10">
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-[10px] sm:text-xs font-bold text-green-600 uppercase tracking-wider">Today's Income</p>
                  <span className="text-xl sm:text-2xl animate-bounce">📈</span>
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-green-600 drop-shadow-sm">RM {stats.todayIncome.toFixed(2)}</p>
              </div>
              <div className="pt-4 sm:pt-6 border-t-2 border-green-200">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-[10px] sm:text-xs font-bold text-coffee-600 uppercase tracking-wider">Total Income</p>
                  <span className="text-xl sm:text-2xl">💰</span>
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-coffee-800 drop-shadow-sm">RM {stats.totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coffee Images Grid - Mobile Optimized */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 mb-20 sm:mb-24 border-2 border-coffee-100 active:shadow-3xl transition-all duration-300">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
            <span className="text-xl sm:text-2xl">⭐</span>
            <h3 className="text-coffee-800 font-bold text-base sm:text-xl">Featured Products</h3>
            <span className="text-xl sm:text-2xl">⭐</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-gradient-to-br from-coffee-200 via-coffee-300 to-coffee-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-4xl sm:text-6xl shadow-lg active:shadow-2xl active:scale-110 transition-all duration-300 cursor-pointer relative overflow-hidden group touch-manipulation"
              >
                <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl transform scale-0 group-active:scale-100 transition-transform duration-300"></div>
                <span className="relative z-10 group-active:scale-125 transition-transform duration-300">☕</span>
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

