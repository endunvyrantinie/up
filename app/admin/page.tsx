'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction } from '@/lib/db';

interface User {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  balance: number;
  vipLevel: number;
  totalEarned: number;
  totalWithdrawn: number;
  referralCount: number;
  totalCommissions: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'daily'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [processingDaily, setProcessingDaily] = useState(false);
  const [stats, setStats] = useState<{
    overview?: {
      totalUsers?: number;
      totalBalance?: number;
      totalEarned?: number;
      totalWithdrawn?: number;
      totalReferrals?: number;
      totalCommissions?: number;
      totalTransactions?: number;
      activeVIP?: number;
      recentUsers?: number;
      pendingWithdrawals?: number;
      pendingAmount?: number;
    };
    vipDistribution?: Record<string, number>;
    topReferrers?: Array<{ username: string; referralCount: number; commissions: number }>;
    transactionTypes?: Record<string, number>;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVIP, setFilterVIP] = useState<number | 'all'>('all');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      fetchUsers();
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginData, isAdmin: true }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchUsers();
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions');
    }
  };

  const handleProcessDaily = async () => {
    alert('Daily processing is handled automatically. No manual action needed.');
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'dashboard') {
      fetchStats();
      fetchUsers();
    } else if (activeTab === 'users') {
      fetchPendingWithdrawals();
    }
  }, [activeTab]);

  const fetchPendingWithdrawals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) {
        const pending = data.transactions.filter((t: Transaction) => 
          t.type === 'withdrawal' && t.status === 'pending'
        );
        setPendingWithdrawals(pending);
      }
    } catch (error) {
      console.error('Failed to fetch pending withdrawals');
    }
  };

  const handleBulkBonus = async () => {
    if (!bulkAmount || parseFloat(bulkAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!confirm(`Add $${bulkAmount} to all ${users.length} users?`)) return;

    try {
      const token = localStorage.getItem('adminToken');
      // This would be a new API endpoint
      alert('Bulk bonus feature - API endpoint needed');
      setShowBulkActions(false);
      setBulkAmount('');
      setBulkReason('');
      fetchUsers();
    } catch (error) {
      alert('Failed to add bulk bonus');
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ['Username', 'Email', 'Balance', 'VIP', 'Referrals', 'Commissions'].join(','),
      ...users.map(u => [
        u.username,
        u.email,
        u.balance.toFixed(2),
        `VIP ${u.vipLevel}`,
        u.referralCount,
        u.totalCommissions.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVIP = filterVIP === 'all' || user.vipLevel === filterVIP;
    return matchesSearch && matchesVIP;
  });

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) {
      alert('Please select a user and enter an amount');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/adjust-balance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseFloat(adjustAmount),
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Balance adjusted successfully');
        setAdjustAmount('');
        setAdjustReason('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert(data.error || 'Failed to adjust balance');
      }
    } catch (error) {
      alert('Failed to adjust balance');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUsers([]);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-coffee-800 mb-2">Admin Login</h1>
            <p className="text-coffee-600">Access admin panel</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Admin Email"
              required
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
            />
            <button
              type="submit"
              className="w-full bg-coffee-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-coffee-700 transition"
            >
              Login
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => router.push('/')} className="text-coffee-600 text-sm hover:underline">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 pb-20">
      <div className="bg-coffee-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button onClick={handleLogout} className="text-sm hover:underline">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="flex border-b border-coffee-200 overflow-x-auto">
            {(['dashboard', 'users', 'transactions', 'daily'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-coffee-600 border-b-2 border-coffee-600'
                    : 'text-coffee-400'
                }`}
              >
                {tab === 'dashboard' ? '📊 Dashboard' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && stats && stats.overview && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600 mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-coffee-800">{stats.overview?.totalUsers || 0}</p>
                    <p className="text-xs text-green-600 mt-1">+{stats.overview?.recentUsers || 0} this week</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600 mb-1">Total Balance</p>
                    <p className="text-3xl font-bold text-coffee-800">RM {(stats.overview?.totalBalance || 0).toFixed(2)}</p>
                    <p className="text-xs text-coffee-500 mt-1">Across all users</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600 mb-1">Total Earned</p>
                    <p className="text-3xl font-bold text-coffee-800">RM {(stats.overview?.totalEarned || 0).toFixed(2)}</p>
                    <p className="text-xs text-coffee-500 mt-1">All time</p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-coffee-600 mb-1">Active VIP</p>
                    <p className="text-3xl font-bold text-coffee-800">{stats.overview?.activeVIP || 0}</p>
                    <p className="text-xs text-coffee-500 mt-1">Active packages</p>
                  </div>
                  <div className="text-4xl">⭐</div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-coffee-600 mb-1">Total Referrals</p>
                <p className="text-2xl font-bold text-coffee-800">{stats.overview?.totalReferrals || 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-coffee-600 mb-1">Total Commissions</p>
                <p className="text-2xl font-bold text-coffee-800">RM {(stats.overview?.totalCommissions || 0).toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-coffee-600 mb-1">Total Transactions</p>
                <p className="text-2xl font-bold text-coffee-800">{stats.overview?.totalTransactions || 0}</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-4">
                <p className="text-sm text-coffee-600 mb-1">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-red-600">{stats.overview?.pendingWithdrawals || 0}</p>
                <p className="text-xs text-coffee-500">RM {(stats.overview?.pendingAmount || 0).toFixed(2)}</p>
              </div>
            </div>

            {/* VIP Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-4">VIP Level Distribution</h3>
              <div className="grid grid-cols-5 gap-4">
                {[0, 1, 2, 3, 4].map(level => (
                  <div key={level} className="text-center">
                    <div className="bg-coffee-50 rounded-lg p-4">
                      <p className="text-sm text-coffee-600 mb-1">VIP {level}</p>
                      <p className="text-2xl font-bold text-coffee-800">{(stats.vipDistribution?.[`level${level}` as keyof typeof stats.vipDistribution] as number) || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-4">🏆 Top Referrers</h3>
              <div className="space-y-3">
                {(stats.topReferrers || []).map((ref, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-coffee-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-coffee-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-coffee-800">{ref.username}</p>
                        <p className="text-sm text-coffee-600">{ref.referralCount} referrals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">RM {ref.commissions.toFixed(2)}</p>
                      <p className="text-xs text-coffee-500">Commissions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Types */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-4">Transaction Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-coffee-600 mb-1">Deposits</p>
                  <p className="text-xl font-bold text-blue-600">{stats.transactionTypes?.deposit || 0}</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-coffee-600 mb-1">Withdrawals</p>
                  <p className="text-xl font-bold text-red-600">{stats.transactionTypes?.withdrawal || 0}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-coffee-600 mb-1">Commissions</p>
                  <p className="text-xl font-bold text-green-600">{stats.transactionTypes?.commission || 0}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-coffee-600 mb-1">Daily Rewards</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.transactionTypes?.daily_reward || 0}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-coffee-600 mb-1">VIP Returns</p>
                  <p className="text-xl font-bold text-purple-600">{stats.transactionTypes?.vip_return || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search by username, email, or referral code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
                  />
                </div>
                <div className="md:w-48">
                  <select
                    value={filterVIP}
                    onChange={(e) => setFilterVIP(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
                  >
                    <option value="all">All VIP Levels</option>
                    <option value="0">VIP 0</option>
                    <option value="1">VIP 1</option>
                    <option value="2">VIP 2</option>
                    <option value="3">VIP 3</option>
                    <option value="4">VIP 4</option>
                  </select>
                </div>
                <div className="text-sm text-coffee-600 flex items-center">
                  Showing {filteredUsers.length} of {users.length} users
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                >
                  ⚙️ Bulk Actions
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={() => {
                    fetchUsers();
                    fetchStats();
                  }}
                  className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 text-sm font-semibold"
                >
                  🔄 Refresh
                </button>
              </div>
              
              {showBulkActions && (
                <div className="mt-4 p-4 bg-coffee-50 rounded-lg border border-coffee-200">
                  <h4 className="font-semibold text-coffee-800 mb-3">Add Bonus to All Users</h4>
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="number"
                      placeholder="Amount (e.g., 0.10)"
                      value={bulkAmount}
                      onChange={(e) => setBulkAmount(e.target.value)}
                      className="flex-1 px-4 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-900"
                    />
                    <input
                      type="text"
                      placeholder="Reason (e.g., Holiday Gift)"
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                      className="flex-1 px-4 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-900"
                    />
                    <button
                      onClick={handleBulkBonus}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      ➕ Add Bonus
                    </button>
                    <button
                      onClick={() => {
                        setShowBulkActions(false);
                        setBulkAmount('');
                        setBulkReason('');
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Withdrawal Queue */}
            {pendingWithdrawals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-5 mb-4 border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold text-coffee-800 mb-4 flex items-center gap-2">
                  ⏳ Pending Withdrawals (24h Auto-Approve)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-yellow-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-semibold text-coffee-800">User</th>
                        <th className="text-right py-2 px-3 font-semibold text-coffee-800">Amount</th>
                        <th className="text-right py-2 px-3 font-semibold text-coffee-800">Time Left</th>
                        <th className="text-center py-2 px-3 font-semibold text-coffee-800">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingWithdrawals.map((w: Transaction) => {
                        const hoursLeft = 24 - ((Date.now() - new Date(w.createdAt).getTime()) / (1000 * 60 * 60));
                        const timeLeft = hoursLeft > 0 
                          ? `${Math.floor(hoursLeft)}h ${Math.floor((hoursLeft % 1) * 60)}m`
                          : 'Ready';
                        
                        return (
                          <tr key={w.id} className="border-b border-coffee-100">
                            <td className="py-2 px-3">{w.userId}</td>
                            <td className="py-2 px-3 text-right font-semibold text-coffee-800">${w.amount.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right text-yellow-600 font-medium">{timeLeft}</td>
                            <td className="py-2 px-3 text-center">
                              <button className="text-green-600 hover:underline text-xs">Approve</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-coffee-800">All Users</h2>
                <div className="text-sm text-coffee-600">
                  Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-coffee-200 bg-coffee-50">
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">Balance</th>
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">VIP</th>
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">Referrals</th>
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">Commissions</th>
                      <th className="text-left py-3 px-4 font-semibold text-coffee-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-coffee-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((user) => (
                    <tr key={user.id} className="border-b border-coffee-100 hover:bg-coffee-50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-coffee-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-coffee-800">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-coffee-700">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-coffee-800">${user.balance.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.vipLevel === 0 ? 'bg-gray-100 text-gray-600' :
                          user.vipLevel === 1 ? 'bg-orange-100 text-orange-600' :
                          user.vipLevel === 2 ? 'bg-gray-200 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.vipLevel === 0 ? '⚪ IRON' :
                           user.vipLevel === 1 ? '🥉 BRONZE' :
                           user.vipLevel === 2 ? '🥈 SILVER' : '🥇 GOLD'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-coffee-800">{user.referralCount}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-green-600 font-semibold">${user.totalCommissions.toFixed(2)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUserDetails(user);
                              setShowUserDetails(true);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 font-semibold"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="px-3 py-1 bg-coffee-600 text-white rounded text-xs hover:bg-coffee-700 font-semibold"
                          >
                            💰 Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredUsers.length > itemsPerPage && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-coffee-200 text-coffee-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-coffee-300"
                  >
                    ← Prev
                  </button>
                  <span className="text-coffee-600">
                    Page {currentPage} of {Math.ceil(filteredUsers.length / itemsPerPage)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), p + 1))}
                    disabled={currentPage >= Math.ceil(filteredUsers.length / itemsPerPage)}
                    className="px-4 py-2 bg-coffee-200 text-coffee-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-coffee-300"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUserDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-coffee-800 text-white p-6 rounded-t-2xl flex justify-between items-center">
                <h3 className="text-2xl font-bold">User Details</h3>
                <button
                  onClick={() => {
                    setShowUserDetails(false);
                    setSelectedUserDetails(null);
                  }}
                  className="text-white hover:text-coffee-200 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-coffee-600 text-white rounded-full flex items-center justify-center font-bold text-3xl">
                    {selectedUserDetails.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-coffee-800">{selectedUserDetails.username}</h4>
                    <p className="text-coffee-600">{selectedUserDetails.email}</p>
                    <p className="text-sm text-coffee-500">Referral Code: {selectedUserDetails.referralCode}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-coffee-50 rounded-lg p-4">
                    <p className="text-sm text-coffee-600 mb-1">Balance</p>
                    <p className="text-2xl font-bold text-coffee-800">${selectedUserDetails.balance.toFixed(2)}</p>
                  </div>
                  <div className="bg-coffee-50 rounded-lg p-4">
                    <p className="text-sm text-coffee-600 mb-1">VIP Level</p>
                    <p className="text-2xl font-bold text-coffee-800">VIP {selectedUserDetails.vipLevel}</p>
                  </div>
                  <div className="bg-coffee-50 rounded-lg p-4">
                    <p className="text-sm text-coffee-600 mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-green-600">${selectedUserDetails.totalEarned.toFixed(2)}</p>
                  </div>
                  <div className="bg-coffee-50 rounded-lg p-4">
                    <p className="text-sm text-coffee-600 mb-1">Total Withdrawn</p>
                    <p className="text-2xl font-bold text-red-600">${selectedUserDetails.totalWithdrawn.toFixed(2)}</p>
                  </div>
                  <div className="bg-coffee-50 rounded-lg p-4">
                    <p className="text-sm text-coffee-600 mb-1">Referrals</p>
                    <p className="text-2xl font-bold text-coffee-800">{selectedUserDetails.referralCount}</p>
                  </div>
                  <div className="bg-coffee-50 rounded-lg p-4">
                    <p className="text-sm text-coffee-600 mb-1">Commissions</p>
                    <p className="text-2xl font-bold text-green-600">${selectedUserDetails.totalCommissions.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUser(selectedUserDetails);
                      setSelectedUserDetails(null);
                    }}
                    className="flex-1 bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition"
                  >
                    💰 Adjust Balance
                  </button>
                  <button
                    onClick={() => {
                      setShowUserDetails(false);
                      setSelectedUserDetails(null);
                    }}
                    className="flex-1 bg-coffee-200 text-coffee-800 py-3 rounded-lg font-semibold hover:bg-coffee-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-coffee-800 mb-4">
              Adjust Balance for {selectedUser.username}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-coffee-600 mb-1">Current Balance: ${selectedUser.balance.toFixed(2)}</p>
              </div>
              <input
                type="number"
                placeholder="Amount (positive to add, negative to subtract)"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAdjustBalance}
                  className="flex-1 bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition"
                >
                  Adjust Balance
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setAdjustAmount('');
                    setAdjustReason('');
                  }}
                  className="flex-1 bg-coffee-200 text-coffee-800 py-3 rounded-lg font-semibold hover:bg-coffee-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">All Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-coffee-200">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Type</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-coffee-400">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-coffee-100">
                        <td className="py-2 px-2">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2 px-2">{tx.userId}</td>
                        <td className="py-2 px-2 capitalize">{tx.type.replace('_', ' ')}</td>
                        <td className="py-2 px-2 font-semibold">${tx.amount.toFixed(2)}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-coffee-600">{tx.description || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">Daily VIP Returns Processing</h2>
            <div className="bg-coffee-50 rounded-lg p-6 mb-4">
              <p className="text-coffee-700 mb-4">
                This will process daily returns for all active VIP investments. 
                Each active VIP package will receive its daily return based on the investment amount and VIP level.
              </p>
              <p className="text-sm text-coffee-600 mb-4">
                <strong>Note:</strong> This should be run once per day. In production, this would be automated via a cron job.
              </p>
              <button
                onClick={handleProcessDaily}
                disabled={processingDaily}
                className="w-full bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition disabled:opacity-50"
              >
                {processingDaily ? 'Processing...' : 'Process Daily VIP Returns'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

