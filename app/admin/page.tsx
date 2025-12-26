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
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'daily' | 'products' | 'settings'>('dashboard');
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({ price: '', dailyIncome: '', validityDays: '' });
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vipFilter, setVipFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaction[]>([]);
  const [bulkBonusAmount, setBulkBonusAmount] = useState('');
  const [bulkBonusReason, setBulkBonusReason] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>('all');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>('all');
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsLoggedIn(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchStats(),
      fetchUsers(),
      fetchTransactions(),
      fetchProducts(),
      fetchPendingWithdrawals(),
    ]);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.overview) {
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
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

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products');
    }
  };

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      localStorage.clear();
      sessionStorage.clear();
      await new Promise(resolve => setTimeout(resolve, 50));

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          isAdmin: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchData();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Connection error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/admin';
  };

  const handleAdjustBalance = async () => {
    if (!selectedUser || !adjustAmount) return;

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
        alert('Balance adjusted successfully!');
        setAdjustAmount('');
        setAdjustReason('');
        setSelectedUser(null);
        fetchUsers();
        fetchStats();
      } else {
        alert(data.error || 'Failed to adjust balance');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleBulkBonus = async () => {
    if (!bulkBonusAmount) {
      alert('Please enter an amount');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/bulk-bonus', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(bulkBonusAmount),
          reason: bulkBonusReason || 'Bulk bonus',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Bulk bonus added successfully!');
        setBulkBonusAmount('');
        setBulkBonusReason('');
        fetchUsers();
        fetchStats();
      } else {
        alert(data.error || 'Failed to add bulk bonus');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleApproveWithdrawal = async (transactionId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/approve-withdrawal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Withdrawal approved!');
        fetchPendingWithdrawals();
        fetchTransactions();
        fetchStats();
      } else {
        alert(data.error || 'Failed to approve withdrawal');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem('adminToken');
      const updates: any = {};
      if (productForm.price) updates.price = parseFloat(productForm.price);
      if (productForm.dailyIncome) updates.dailyIncome = parseFloat(productForm.dailyIncome);
      if (productForm.validityDays) updates.validityDays = parseInt(productForm.validityDays);

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: editingProduct.id,
          updates,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Product updated successfully!');
        setEditingProduct(null);
        setProductForm({ price: '', dailyIncome: '', validityDays: '' });
        fetchProducts();
      } else {
        alert(data.error || 'Failed to update product');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVip = vipFilter === 'all' || user.vipLevel.toString() === vipFilter;
    return matchesSearch && matchesVip;
  });

  const usersPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-coffee-800 mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500"
                required
              />
            </div>
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {loginError}
              </div>
            )}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-coffee-600 text-white py-3 rounded-xl font-semibold hover:bg-coffee-700 transition disabled:opacity-50"
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-coffee-50 to-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-coffee-800 to-coffee-900 text-white shadow-2xl">
          <div className="p-6 border-b border-coffee-700">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">☕</span>
              <span>Admin Panel</span>
            </h1>
            <p className="text-coffee-300 text-sm mt-1">Coffee Rewards System</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {([
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'users', label: '👥 Users', icon: '👥' },
              { id: 'transactions', label: '💳 Transactions', icon: '💳' },
              { id: 'daily', label: '📅 Daily Returns', icon: '📅' },
              { id: 'products', label: '📦 Products', icon: '📦' },
              { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-coffee-800 shadow-lg transform scale-105'
                    : 'text-coffee-200 hover:bg-coffee-700 hover:text-white'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-semibold">{tab.label.replace(/^[^\s]+\s/, '')}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-coffee-700">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header (Mobile) */}
          <div className="lg:hidden bg-white shadow-lg border-b border-coffee-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-coffee-800 flex items-center gap-2">
                <span>☕</span>
                <span>Admin Panel</span>
              </h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
              >
                Logout
              </button>
            </div>
            
            {/* Mobile Tabs */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {(['dashboard', 'users', 'transactions', 'daily', 'products', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
                    activeTab === tab
                      ? 'bg-coffee-600 text-white shadow-md'
                      : 'bg-coffee-100 text-coffee-700'
                  }`}
                >
                  {tab === 'dashboard' ? '📊' : tab === 'users' ? '👥' : tab === 'transactions' ? '💳' : tab === 'daily' ? '📅' : tab === 'products' ? '📦' : '⚙️'}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Total Users</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-4xl font-bold">{stats.overview?.totalUsers || 0}</p>
                <p className="text-xs opacity-75 mt-2">Registered users</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Total Balance</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-4xl font-bold">RM {stats.overview?.totalBalance?.toFixed(2) || '0.00'}</p>
                <p className="text-xs opacity-75 mt-2">All user balances</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Total Earned</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-4xl font-bold">RM {stats.overview?.totalEarned?.toFixed(2) || '0.00'}</p>
                <p className="text-xs opacity-75 mt-2">Total earnings</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold opacity-90">Total Withdrawn</h3>
                  <span className="text-2xl">💸</span>
                </div>
                <p className="text-4xl font-bold">RM {stats.overview?.totalWithdrawn?.toFixed(2) || '0.00'}</p>
                <p className="text-xs opacity-75 mt-2">Total withdrawals</p>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <h3 className="text-coffee-600 text-sm font-semibold mb-2">Active VIP</h3>
                <p className="text-3xl font-bold text-coffee-800">{stats.overview?.activeVIP || 0}</p>
                <p className="text-xs text-coffee-500 mt-1">Active investments</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <h3 className="text-coffee-600 text-sm font-semibold mb-2">Total Referrals</h3>
                <p className="text-3xl font-bold text-coffee-800">{stats.overview?.totalReferrals || 0}</p>
                <p className="text-xs text-coffee-500 mt-1">Referral connections</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                <h3 className="text-coffee-600 text-sm font-semibold mb-2">Total Commissions</h3>
                <p className="text-3xl font-bold text-coffee-800">RM {stats.overview?.totalCommissions?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-coffee-500 mt-1">Commission paid</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="text-coffee-600 text-sm font-semibold mb-2">Pending Withdrawals</h3>
                <p className="text-3xl font-bold text-coffee-800">{stats.overview?.pendingWithdrawals || 0}</p>
                <p className="text-xs text-coffee-500 mt-1">Awaiting approval</p>
              </div>
            </div>

            {/* Pending Withdrawals Alert */}
            {stats.overview?.pendingWithdrawals > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-red-800 mb-2">⚠️ Pending Withdrawals</h3>
                    <p className="text-red-700">
                      <strong>{stats.overview.pendingWithdrawals}</strong> withdrawal(s) pending approval
                    </p>
                    <p className="text-red-600 mt-1">
                      Total amount: <strong>RM {stats.overview.pendingAmount?.toFixed(2) || '0.00'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Review Now
                  </button>
                </div>
              </div>
            )}

            {/* VIP Distribution */}
            {stats.vipDistribution && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-coffee-800 mb-4">VIP Level Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats.vipDistribution).map(([level, count]: [string, any]) => (
                    <div key={level} className="text-center p-4 bg-coffee-50 rounded-lg">
                      <p className="text-2xl font-bold text-coffee-800">{count}</p>
                      <p className="text-sm text-coffee-600 mt-1">{level.replace('level', 'VIP ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Types */}
            {stats.transactionTypes && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-coffee-800 mb-4">Transaction Types</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(stats.transactionTypes).map(([type, count]: [string, any]) => (
                    <div key={type} className="p-4 bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-lg border border-coffee-200">
                      <p className="text-2xl font-bold text-coffee-800">{count}</p>
                      <p className="text-sm text-coffee-600 mt-1 capitalize">{type.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Referrers */}
            {stats.topReferrers && stats.topReferrers.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-coffee-800 mb-4">🏆 Top Referrers</h3>
                <div className="space-y-3">
                  {stats.topReferrers.map((referrer: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-coffee-50 to-coffee-100 rounded-lg border border-coffee-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-coffee-500 to-coffee-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-coffee-800">{referrer.username}</p>
                          <p className="text-sm text-coffee-600">{referrer.referralCount} referrals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-coffee-800">RM {referrer.commissions?.toFixed(2) || '0.00'}</p>
                        <p className="text-xs text-coffee-500">Commissions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-4">📊 Quick Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold">Recent Users (7 days)</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.overview?.recentUsers || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 font-semibold">Total Transactions</p>
                  <p className="text-2xl font-bold text-green-800">{stats.overview?.totalTransactions || 0}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-600 font-semibold">Pending Amount</p>
                  <p className="text-2xl font-bold text-purple-800">RM {stats.overview?.pendingAmount?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="🔍 Search by username, phone, or referral code..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 pl-10 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                  />
                  <span className="absolute left-3 top-3.5 text-coffee-400">🔍</span>
                </div>
                <select
                  value={vipFilter}
                  onChange={(e) => {
                    setVipFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white"
                >
                  <option value="all">All VIP Levels</option>
                  <option value="0">VIP 0</option>
                  <option value="1">VIP 1</option>
                  <option value="2">VIP 2</option>
                  <option value="3">VIP 3</option>
                </select>
              </div>

              {/* Bulk Bonus Section */}
              <div className="p-5 bg-gradient-to-r from-coffee-50 to-coffee-100 rounded-xl border-2 border-coffee-200">
                <h3 className="font-bold text-coffee-800 mb-3 flex items-center gap-2">
                  <span>🎁</span>
                  <span>Bulk Bonus - Add to All Users</span>
                </h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="number"
                    placeholder="Amount (RM)"
                    value={bulkBonusAmount}
                    onChange={(e) => setBulkBonusAmount(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                  <input
                    type="text"
                    placeholder="Reason (optional)"
                    value={bulkBonusReason}
                    onChange={(e) => setBulkBonusReason(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                  <button
                    onClick={handleBulkBonus}
                    className="bg-gradient-to-r from-coffee-600 to-coffee-700 text-white px-8 py-3 rounded-lg hover:from-coffee-700 hover:to-coffee-800 transition font-semibold shadow-lg"
                  >
                    ➕ Add to All ({filteredUsers.length} users)
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-coffee-200">
                <h2 className="text-2xl font-bold text-coffee-800">
                  Users ({filteredUsers.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-coffee-50 to-coffee-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-coffee-800">User</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Phone</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Balance</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">VIP</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Referrals</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Commissions</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Earned</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-coffee-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((user) => (
                        <tr key={user.id} className="border-b border-coffee-100 hover:bg-coffee-50 transition">
                          <td className="p-4">
                            <div>
                              <p className="font-semibold text-coffee-800">{user.username}</p>
                              <p className="text-xs text-coffee-500">{user.referralCode}</p>
                            </div>
                          </td>
                          <td className="p-4 text-coffee-700">{user.email?.replace('@coffee.com', '') || user.username}</td>
                          <td className="p-4">
                            <span className="font-bold text-green-600">RM {user.balance.toFixed(2)}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.vipLevel === 0 ? 'bg-gray-100 text-gray-700' :
                              user.vipLevel === 1 ? 'bg-blue-100 text-blue-700' :
                              user.vipLevel === 2 ? 'bg-purple-100 text-purple-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              VIP {user.vipLevel}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-semibold text-coffee-800">{user.referralCount || 0}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-purple-600 font-semibold">RM {(user.totalCommissions || 0).toFixed(2)}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-green-600 font-semibold">RM {(user.totalEarned || 0).toFixed(2)}</span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition font-semibold shadow-md"
                            >
                              ⚙️ Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-coffee-200 flex items-center justify-between">
                  <p className="text-sm text-coffee-600">
                    Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-coffee-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-coffee-50 transition font-semibold"
                    >
                      ← Previous
                    </button>
                    <span className="px-4 py-2 bg-coffee-100 rounded-lg font-semibold text-coffee-800">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-coffee-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-coffee-50 transition font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Pending Withdrawals Section */}
            {pendingWithdrawals.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Pending Withdrawals ({pendingWithdrawals.length})</span>
                </h2>
                <div className="space-y-3">
                  {pendingWithdrawals.slice(0, 5).map((t) => {
                    const user = users.find(u => u.id === t.userId);
                    return (
                      <div key={t.id} className="bg-white rounded-lg p-4 border-2 border-red-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-coffee-800">{user?.username || 'Unknown'}</p>
                          <p className="text-sm text-coffee-600">
                            Amount: <span className="font-bold text-red-600">RM {t.amount.toFixed(2)}</span>
                            {t.amountAfterTax && (
                              <span className="ml-2">
                                (After tax: <span className="font-semibold">RM {t.amountAfterTax.toFixed(2)}</span>)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-coffee-500">{new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleApproveWithdrawal(t.id)}
                          className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                        >
                          ✅ Approve
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Transactions */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-coffee-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-coffee-800">All Transactions</h2>
                <button
                  onClick={() => {
                    // Export CSV
                    const csv = [
                      ['Type', 'User', 'Amount', 'Status', 'Date'].join(','),
                      ...transactions.map(t => {
                        const user = users.find(u => u.id === t.userId);
                        return [
                          t.type,
                          user?.username || 'Unknown',
                          t.amount.toFixed(2),
                          t.status,
                          new Date(t.createdAt).toLocaleString()
                        ].join(',');
                      })
                    ].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                  }}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
                >
                  📥 Export CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-coffee-50 to-coffee-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-coffee-800">Type</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">User</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Amount</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Status</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Date</th>
                      <th className="text-left p-4 font-semibold text-coffee-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 100).map((t) => {
                      const user = users.find(u => u.id === t.userId);
                      return (
                        <tr key={t.id} className="border-b border-coffee-100 hover:bg-coffee-50 transition">
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              t.type === 'deposit' ? 'bg-blue-100 text-blue-700' :
                              t.type === 'withdrawal' ? 'bg-red-100 text-red-700' :
                              t.type === 'commission' ? 'bg-purple-100 text-purple-700' :
                              t.type === 'daily_reward' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {t.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 text-coffee-700">{user?.username || 'Unknown'}</td>
                          <td className="p-4">
                            <span className={`font-bold ${
                              t.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {t.type === 'withdrawal' ? '-' : '+'}RM {t.amount.toFixed(2)}
                            </span>
                            {t.amountAfterTax && (
                              <p className="text-xs text-coffee-500">After tax: RM {t.amountAfterTax.toFixed(2)}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              t.status === 'completed' || t.status === 'approved' ? 'bg-green-100 text-green-700' :
                              t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-coffee-600">{new Date(t.createdAt).toLocaleString()}</td>
                          <td className="p-4">
                            {t.type === 'withdrawal' && t.status === 'pending' && (
                              <button
                                onClick={() => handleApproveWithdrawal(t.id)}
                                className="bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600 transition"
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <DailyVIPManager />
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-coffee-800">VIP Products Management</h2>
              <p className="text-coffee-600">Manage VIP investment packages</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gradient-to-br from-coffee-50 to-coffee-100 border-2 border-coffee-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-coffee-800">{product.name}</h3>
                    <span className="text-4xl">☕</span>
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-coffee-600 font-semibold">Price:</span>
                      <span className="text-xl font-bold text-coffee-800">RM {product.price}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-coffee-600 font-semibold">Daily Income:</span>
                      <span className="text-lg font-bold text-green-600">RM {product.dailyIncome}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <span className="text-coffee-600 font-semibold">Validity:</span>
                      <span className="text-lg font-bold text-coffee-800">{product.validityDays} days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                      <span className="text-green-700 font-semibold">Total Income:</span>
                      <span className="text-xl font-bold text-green-700">RM {product.totalIncome}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setProductForm({
                        price: product.price.toString(),
                        dailyIncome: product.dailyIncome.toString(),
                        validityDays: product.validityDays.toString(),
                      });
                    }}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold shadow-lg"
                  >
                    ✏️ Edit Product
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Settings Header */}
            <div className="bg-gradient-to-r from-coffee-600 to-coffee-700 text-white rounded-2xl shadow-xl p-6">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <span>⚙️</span>
                <span>System Settings</span>
              </h1>
              <p className="text-coffee-100">Manage all system configurations and settings</p>
            </div>

            {/* Bank Accounts Management */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🏦</span>
                <div>
                  <h2 className="text-2xl font-bold text-coffee-800">Bank Accounts Management</h2>
                  <p className="text-coffee-600 text-sm">Manage bank accounts for user withdrawals</p>
                </div>
              </div>
              <BankAccountsManager />
            </div>

            {/* Payment Channels Management */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💳</span>
                <div>
                  <h2 className="text-2xl font-bold text-coffee-800">Payment Channels Management</h2>
                  <p className="text-coffee-600 text-sm">Manage payment channels for user recharges</p>
                </div>
              </div>
              <PaymentChannelsManager />
            </div>

            {/* Customer Support Settings */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💬</span>
                <div>
                  <h2 className="text-2xl font-bold text-coffee-800">Customer Support Settings</h2>
                  <p className="text-coffee-600 text-sm">Manage Telegram links for customer support</p>
                </div>
              </div>
              <SupportSettingsManager />
            </div>
          </div>
        )}

        {selectedUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-4">Adjust Balance: {selectedUser.username}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-coffee-800 mb-2">Amount (positive to add, negative to deduct)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-800 mb-2">Reason</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAdjustBalance}
                    className="flex-1 bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setAdjustAmount('');
                      setAdjustReason('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-coffee-800 mb-4">Edit {editingProduct.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-coffee-800 mb-2">Price (RM)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-800 mb-2">Daily Income (RM)</label>
                  <input
                    type="number"
                    value={productForm.dailyIncome}
                    onChange={(e) => setProductForm({ ...productForm, dailyIncome: e.target.value })}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-coffee-800 mb-2">Validity Days</label>
                  <input
                    type="number"
                    value={productForm.validityDays}
                    onChange={(e) => setProductForm({ ...productForm, validityDays: e.target.value })}
                    className="w-full px-4 py-2 border border-coffee-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateProduct}
                    className="flex-1 bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BankAccountsManager() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    account: '',
    accountHolder: '',
    swift: '',
    isActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/bank-accounts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAccount(null);
    setFormData({ name: '', bank: '', account: '', accountHolder: '', swift: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bank: account.bank,
      account: account.account,
      accountHolder: account.accountHolder,
      swift: account.swift || '',
      isActive: account.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const method = editingAccount ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/bank-accounts', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAccount ? { ...formData, id: editingAccount.id } : formData),
      });

      const data = await res.json();
      if (data.success || data.account) {
        alert('Bank account saved!');
        setShowModal(false);
        fetchAccounts();
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/bank-accounts?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        alert('Deleted!');
        fetchAccounts();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button
        onClick={handleCreate}
        className="mb-4 bg-coffee-600 text-white px-4 py-2 rounded-lg hover:bg-coffee-700"
      >
        + Add Bank Account
      </button>
      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="border border-coffee-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p><strong>Bank:</strong> {account.bank}</p>
              <p><strong>Account:</strong> {account.account}</p>
              <p><strong>Holder:</strong> {account.accountHolder}</p>
              <span className={`px-2 py-1 rounded text-xs ${account.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {account.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(account)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
              <button onClick={() => handleDelete(account.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-slideUp">
            <div className="bg-gradient-to-r from-coffee-600 to-coffee-700 text-white p-4 rounded-2xl mb-6 -m-6">
              <h3 className="text-2xl font-bold">{editingAccount ? '✏️ Edit' : '➕ Add'} Bank Account</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Account Name</label>
                <input
                  type="text"
                  placeholder="e.g., Primary Account"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g., Maybank"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g., 1234567890"
                  value={formData.account}
                  onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Account Holder</label>
                <input
                  type="text"
                  placeholder="e.g., Coffee Rewards Sdn Bhd"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">SWIFT Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., MBBEMYKL"
                  value={formData.swift}
                  onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-mono"
                />
              </div>
              <label className="flex items-center gap-3 p-4 bg-coffee-50 rounded-xl cursor-pointer hover:bg-coffee-100 transition">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-coffee-600 rounded focus:ring-coffee-500"
                />
                <span className="font-semibold text-coffee-800">Active (visible to users)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSave} 
                  className="flex-1 bg-gradient-to-r from-coffee-600 to-coffee-700 text-white py-3 rounded-xl hover:from-coffee-700 hover:to-coffee-800 transition font-semibold shadow-lg"
                >
                  💾 Save
                </button>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentChannelsManager() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    details: '',
    instructions: '',
    isActive: true,
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/payment-channels', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.channels) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Failed to fetch payment channels');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingChannel(null);
    setFormData({ name: '', type: '', details: '', instructions: '', isActive: true });
    setShowModal(true);
  };

  const handleEdit = (channel: any) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      type: channel.type,
      details: channel.details,
      instructions: channel.instructions || '',
      isActive: channel.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const method = editingChannel ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/payment-channels', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingChannel ? { ...formData, id: editingChannel.id } : formData),
      });

      const data = await res.json();
      if (data.success || data.channel) {
        alert('Payment channel saved!');
        setShowModal(false);
        fetchChannels();
      } else {
        alert(data.error || 'Failed to save');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/payment-channels?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        alert('Deleted!');
        fetchChannels();
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      alert('Connection error');
    }
  };

  if (loading) return <div className="text-center py-8 text-coffee-600">Loading payment channels...</div>;

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreate}
        className="w-full md:w-auto bg-gradient-to-r from-coffee-600 to-coffee-700 text-white px-6 py-3 rounded-xl hover:from-coffee-700 hover:to-coffee-800 transition font-semibold shadow-lg flex items-center justify-center gap-2"
      >
        <span className="text-xl">➕</span>
        <span>Add Payment Channel</span>
      </button>
      
      {channels.length === 0 ? (
        <div className="text-center py-12 bg-coffee-50 rounded-xl border-2 border-dashed border-coffee-300">
          <p className="text-coffee-600 font-semibold">No payment channels yet</p>
          <p className="text-coffee-500 text-sm mt-1">Click "Add Payment Channel" to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="bg-gradient-to-br from-white to-coffee-50 border-2 border-coffee-200 rounded-xl p-5 shadow-lg hover:shadow-xl transition transform hover:scale-105">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-coffee-800 mb-2">{channel.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-coffee-600 font-semibold">Type:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{channel.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-coffee-600 font-semibold">Details:</span>
                      <span className="text-coffee-800">{channel.details}</span>
                    </div>
                    {channel.instructions && (
                      <div className="mt-2 p-2 bg-coffee-100 rounded text-xs text-coffee-700">
                        {channel.instructions}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  channel.isActive 
                    ? 'bg-green-100 text-green-700 border-2 border-green-300' 
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                }`}>
                  {channel.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleEdit(channel)} 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold text-sm"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(channel.id)} 
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-slideUp max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-coffee-600 to-coffee-700 text-white p-4 rounded-2xl mb-6 -m-6">
              <h3 className="text-2xl font-bold">{editingChannel ? '✏️ Edit' : '➕ Add'} Payment Channel</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g., Bank Transfer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Type</label>
                <input
                  type="text"
                  placeholder="e.g., bank, e-wallet, crypto"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Details</label>
                <input
                  type="text"
                  placeholder="e.g., Secure & Fast"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Instructions (Optional)</label>
                <textarea
                  placeholder="Payment instructions for users..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-3 p-4 bg-coffee-50 rounded-xl cursor-pointer hover:bg-coffee-100 transition">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-coffee-600 rounded focus:ring-coffee-500"
                />
                <span className="font-semibold text-coffee-800">Active (visible to users)</span>
              </label>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSave} 
                  className="flex-1 bg-gradient-to-r from-coffee-600 to-coffee-700 text-white py-3 rounded-xl hover:from-coffee-700 hover:to-coffee-800 transition font-semibold shadow-lg"
                >
                  💾 Save
                </button>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupportSettingsManager() {
  const [settings, setSettings] = useState({
    telegramSupport: '',
    telegramChannel: '',
    telegramGroup: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.settings) {
        setSettings({
          telegramSupport: data.settings.telegramSupport || '',
          telegramChannel: data.settings.telegramChannel || '',
          telegramGroup: data.settings.telegramGroup || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings');
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.telegramSupport || !settings.telegramChannel || !settings.telegramGroup) {
      setError('All fields are required');
      setSuccess('');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Settings saved successfully!');
        setError('');
        fetchSettings();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
        setSuccess('');
      }
    } catch (error) {
      setError('Connection error. Please try again.');
      setSuccess('');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
        <p className="text-coffee-600 mt-4 font-semibold">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <span className="text-xl">✅</span>
          <span className="font-semibold">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Telegram Support URL */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
        <label className="block text-sm font-bold text-coffee-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📞</span>
          <span>Telegram Support URL</span>
        </label>
        <input
          type="text"
          value={settings.telegramSupport}
          onChange={(e) => {
            setSettings({ ...settings, telegramSupport: e.target.value });
            setError('');
          }}
          className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
          placeholder="https://t.me/your_support_username"
        />
        <p className="text-xs text-coffee-600 mt-2 ml-1">Link to Telegram support/contact for users</p>
      </div>

      {/* Telegram Channel URL */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5">
        <label className="block text-sm font-bold text-coffee-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">📢</span>
          <span>Telegram Channel URL</span>
        </label>
        <input
          type="text"
          value={settings.telegramChannel}
          onChange={(e) => {
            setSettings({ ...settings, telegramChannel: e.target.value });
            setError('');
          }}
          className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium"
          placeholder="https://t.me/your_channel_username"
        />
        <p className="text-xs text-coffee-600 mt-2 ml-1">Link to Telegram channel for announcements</p>
      </div>

      {/* Telegram Group URL */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5">
        <label className="block text-sm font-bold text-coffee-800 mb-3 flex items-center gap-2">
          <span className="text-2xl">👥</span>
          <span>Telegram Group URL</span>
        </label>
        <input
          type="text"
          value={settings.telegramGroup}
          onChange={(e) => {
            setSettings({ ...settings, telegramGroup: e.target.value });
            setError('');
          }}
          className="w-full px-4 py-3 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 font-medium"
          placeholder="https://t.me/your_group_username"
        />
        <p className="text-xs text-coffee-600 mt-2 ml-1">Link to Telegram group for community</p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-gradient-to-r from-coffee-600 to-coffee-700 text-white px-6 py-4 rounded-xl hover:from-coffee-700 hover:to-coffee-800 transition font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transform hover:scale-105 active:scale-95"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span className="text-2xl">💾</span>
            <span>Save Settings</span>
          </>
        )}
      </button>

      {/* Preview Section */}
      {(settings.telegramSupport || settings.telegramChannel || settings.telegramGroup) && (
        <div className="bg-coffee-50 border-2 border-coffee-200 rounded-xl p-5 mt-4">
          <h3 className="text-sm font-bold text-coffee-800 mb-3 flex items-center gap-2">
            <span>👁️</span>
            <span>Preview</span>
          </h3>
          <div className="space-y-2 text-sm">
            {settings.telegramSupport && (
              <div className="flex items-center gap-2">
                <span className="text-coffee-600 font-semibold">Support:</span>
                <a href={settings.telegramSupport} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {settings.telegramSupport}
                </a>
              </div>
            )}
            {settings.telegramChannel && (
              <div className="flex items-center gap-2">
                <span className="text-coffee-600 font-semibold">Channel:</span>
                <a href={settings.telegramChannel} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {settings.telegramChannel}
                </a>
              </div>
            )}
            {settings.telegramGroup && (
              <div className="flex items-center gap-2">
                <span className="text-coffee-600 font-semibold">Group:</span>
                <a href={settings.telegramGroup} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                  {settings.telegramGroup}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Daily VIP Manager Component
function DailyVIPManager() {
  const [vipPurchases, setVipPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVIPPurchases();
  }, []);

  const fetchVIPPurchases = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/vip-purchases', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.purchases) {
        setVipPurchases(data.purchases);
      }
    } catch (error) {
      console.error('Failed to fetch VIP purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessDaily = async () => {
    if (!confirm('Process daily VIP returns for all active purchases?')) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/process-daily', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Daily returns processed successfully!');
        fetchVIPPurchases();
        // Refresh stats
        window.location.reload();
      } else {
        alert(data.error || 'Failed to process daily returns');
      }
    } catch (error) {
      alert('Connection error');
    } finally {
      setProcessing(false);
    }
  };

  const activePurchases = vipPurchases.filter(p => {
    const expiresAt = new Date(p.expiresAt);
    return expiresAt > new Date() && p.daysRemaining > 0;
  });

  const totalDailyReturns = activePurchases.reduce((sum, p) => sum + p.dailyReturn, 0);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Process Button */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Daily VIP Returns Processing</h2>
            <p className="text-green-700">
              <strong>{activePurchases.length}</strong> active VIP purchases
            </p>
            <p className="text-green-600 mt-1">
              Total daily returns: <strong>RM {totalDailyReturns.toFixed(2)}</strong>
            </p>
          </div>
          <button
            onClick={handleProcessDaily}
            disabled={processing || activePurchases.length === 0}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? '⏳ Processing...' : '✅ Process Daily Returns'}
          </button>
        </div>
      </div>

      {/* Active VIP Purchases */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-coffee-200">
          <h3 className="text-xl font-bold text-coffee-800">Active VIP Purchases ({activePurchases.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-coffee-50 to-coffee-100">
              <tr>
                <th className="text-left p-4 font-semibold text-coffee-800">User</th>
                <th className="text-left p-4 font-semibold text-coffee-800">Product</th>
                <th className="text-left p-4 font-semibold text-coffee-800">Amount</th>
                <th className="text-left p-4 font-semibold text-coffee-800">Daily Return</th>
                <th className="text-left p-4 font-semibold text-coffee-800">Days Remaining</th>
                <th className="text-left p-4 font-semibold text-coffee-800">Expires</th>
              </tr>
            </thead>
            <tbody>
              {activePurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-coffee-500">
                    No active VIP purchases
                  </td>
                </tr>
              ) : (
                activePurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-coffee-100 hover:bg-coffee-50 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-coffee-800">{purchase.username}</p>
                        <p className="text-xs text-coffee-500">{purchase.phone}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {purchase.productId || 'VIP'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-coffee-800">RM {purchase.amount.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-green-600">RM {purchase.dailyReturn.toFixed(2)}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                        {purchase.daysRemaining} days
                      </span>
                    </td>
                    <td className="p-4 text-sm text-coffee-600">
                      {new Date(purchase.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
