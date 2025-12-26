'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomTabBar from '@/components/BottomTabBar';
import { ReferralTreeItem } from '@/lib/db';

interface User {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  balance: number;
}

export default function TeamPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralStats, setReferralStats] = useState({
    validUsers: 0,
    totalIncome: 0,
    level1: { count: 0, income: 0 },
    level2: { count: 0, income: 0 },
    level3: { count: 0, income: 0 },
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
    fetchReferralStats();
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

  const fetchReferralStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/referrals/tree', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data) {
        setReferralStats({
          validUsers: data.level1.length + data.level2.length + data.level3.length,
          totalIncome: (data.level1.reduce((s: number, r: ReferralTreeItem) => s + r.commission, 0) +
                       data.level2.reduce((s: number, r: ReferralTreeItem) => s + r.commission, 0) +
                       data.level3.reduce((s: number, r: ReferralTreeItem) => s + r.commission, 0)),
          level1: { count: data.level1.length, income: data.level1.reduce((s: number, r: ReferralTreeItem) => s + r.commission, 0) },
          level2: { count: data.level2.length, income: data.level2.reduce((s: number, r: ReferralTreeItem) => s + r.commission, 0) },
          level3: { count: data.level3.length, income: data.level3.reduce((s: number, r: ReferralTreeItem) => s + r.commission, 0) },
        });
      }
    } catch (error) {
      console.error('Failed to fetch referral stats');
    }
  };

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/r?v=${user?.referralCode || ''}`;

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
      {/* Top Section - Mobile Optimized */}
      <div className="bg-coffee-brown text-white p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-4">
          <p className="text-xs sm:text-sm text-coffee-latte mb-2">Invitation code</p>
          <p className="text-xl sm:text-2xl font-bold">{user.referralCode}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-white/20 text-white text-sm px-3 py-2 rounded border-0 focus:outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert('Link copied!');
              }}
              className="bg-white text-coffee-brown px-4 py-2 rounded font-semibold text-sm hover:bg-coffee-latte transition"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-coffee-600 mb-1">Valid users</p>
            <p className="text-2xl font-bold text-coffee-800">{referralStats.validUsers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <p className="text-sm text-coffee-600 mb-1">Total income</p>
            <p className="text-2xl font-bold text-green-600">RM {referralStats.totalIncome.toFixed(2)}</p>
          </div>
        </div>

        {/* Level Sections */}
        {[
          { level: 1, rate: 28, stats: referralStats.level1 },
          { level: 2, rate: 1, stats: referralStats.level2 },
          { level: 3, rate: 1, stats: referralStats.level3 },
        ].map(({ level, rate, stats }) => (
          <div key={level} className="bg-white rounded-xl shadow-lg p-5 mb-4">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-coffee-200">
              <span className="font-bold text-coffee-800">LV{level}</span>
              <span className="text-sm text-coffee-600">Commission rate: {rate}%</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-coffee-600 mb-1">Valid users</p>
                <p className="text-xl font-bold text-coffee-800">{stats.count}</p>
              </div>
              <div>
                <p className="text-sm text-coffee-600 mb-1">Income</p>
                <p className="text-xl font-bold text-green-600">RM {stats.income.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Invitation Reward Info */}
        <div className="bg-white rounded-xl shadow-lg p-5 mt-6">
          <h3 className="font-bold text-coffee-800 mb-3">Invitation reward</h3>
          <div className="space-y-2 text-sm text-coffee-700">
            <p>• If a friend you invite registers and invests, you instantly receive a <span className="font-bold">28% bonus</span>.</p>
            <p>• Level 2: <span className="font-bold">1% bonus</span>.</p>
            <p>• Level 3: <span className="font-bold">1% bonus</span>.</p>
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

