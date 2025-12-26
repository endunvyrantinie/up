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
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-coffee-800">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-2 mt-4 border-b border-coffee-200 overflow-x-auto">
            {(['dashboard', 'users', 'transactions', 'daily', 'products', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-coffee-600 border-b-2 border-coffee-600'
                    : 'text-coffee-400'
                }`}
              >
                {tab === 'dashboard' ? '📊 Dashboard' : tab === 'products' ? '📦 Products' : tab === 'settings' ? '⚙️ Settings' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-coffee-600 text-sm font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-coffee-800">{stats.overview?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-coffee-600 text-sm font-semibold mb-2">Total Balance</h3>
              <p className="text-3xl font-bold text-coffee-800">RM {stats.overview?.totalBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-coffee-600 text-sm font-semibold mb-2">Pending Withdrawals</h3>
              <p className="text-3xl font-bold text-coffee-800">{stats.overview?.pendingWithdrawals || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-coffee-600 text-sm font-semibold mb-2">Pending Amount</h3>
              <p className="text-3xl font-bold text-coffee-800">RM {stats.overview?.pendingAmount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="mb-4 flex gap-4">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-coffee-300 rounded-lg"
              />
              <select
                value={vipFilter}
                onChange={(e) => setVipFilter(e.target.value)}
                className="px-4 py-2 border border-coffee-300 rounded-lg"
              >
                <option value="all">All VIP Levels</option>
                <option value="0">VIP 0</option>
                <option value="1">VIP 1</option>
                <option value="2">VIP 2</option>
                <option value="3">VIP 3</option>
              </select>
            </div>

            <div className="mb-4 p-4 bg-coffee-50 rounded-lg">
              <h3 className="font-semibold text-coffee-800 mb-2">Bulk Bonus</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={bulkBonusAmount}
                  onChange={(e) => setBulkBonusAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-coffee-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={bulkBonusReason}
                  onChange={(e) => setBulkBonusReason(e.target.value)}
                  className="flex-1 px-4 py-2 border border-coffee-300 rounded-lg"
                />
                <button
                  onClick={handleBulkBonus}
                  className="bg-coffee-600 text-white px-6 py-2 rounded-lg hover:bg-coffee-700"
                >
                  Add to All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-coffee-200">
                    <th className="text-left p-2">Username</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">VIP</th>
                    <th className="text-left p-2">Referrals</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-coffee-100">
                      <td className="p-2">{user.username}</td>
                      <td className="p-2">RM {user.balance.toFixed(2)}</td>
                      <td className="p-2">VIP {user.vipLevel}</td>
                      <td className="p-2">{user.referralCount || 0}</td>
                      <td className="p-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-coffee-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-coffee-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">All Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-coffee-200">
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Amount</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 50).map((t) => (
                    <tr key={t.id} className="border-b border-coffee-100">
                      <td className="p-2">{t.type}</td>
                      <td className="p-2">RM {t.amount.toFixed(2)}</td>
                      <td className="p-2">{t.status}</td>
                      <td className="p-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'daily' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">Daily VIP Returns</h2>
            <p className="text-coffee-600 mb-4">Process daily VIP returns manually</p>
            <button className="bg-coffee-600 text-white px-6 py-3 rounded-lg hover:bg-coffee-700">
              Process Daily Returns
            </button>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">VIP Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border border-coffee-200 rounded-lg p-4">
                  <h3 className="font-bold text-coffee-800">{product.name}</h3>
                  <p>Price: RM {product.price}</p>
                  <p>Daily: RM {product.dailyIncome}</p>
                  <p>Days: {product.validityDays}</p>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setProductForm({
                        price: product.price.toString(),
                        dailyIncome: product.dailyIncome.toString(),
                        validityDays: product.validityDays.toString(),
                      });
                    }}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-coffee-800 mb-4">🏦 Bank Accounts Management</h2>
              <p className="text-coffee-600 mb-6">Manage bank accounts for withdrawal</p>
              <BankAccountsManager />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-coffee-800 mb-4">💳 Payment Channels Management</h2>
              <p className="text-coffee-600 mb-6">Manage payment channels for recharge</p>
              <PaymentChannelsManager />
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-coffee-800 mb-4">💬 Customer Support Settings</h2>
              <p className="text-coffee-600 mb-6">Manage Telegram links for customer support</p>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingAccount ? 'Edit' : 'Add'} Bank Account</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Bank"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={formData.account}
                onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Account Holder"
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="SWIFT (optional)"
                value={formData.swift}
                onChange={(e) => setFormData({ ...formData, swift: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 bg-coffee-600 text-white py-2 rounded-lg">Save</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button
        onClick={handleCreate}
        className="mb-4 bg-coffee-600 text-white px-4 py-2 rounded-lg hover:bg-coffee-700"
      >
        + Add Payment Channel
      </button>
      <div className="space-y-3">
        {channels.map((channel) => (
          <div key={channel.id} className="border border-coffee-200 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p><strong>Name:</strong> {channel.name}</p>
              <p><strong>Type:</strong> {channel.type}</p>
              <p><strong>Details:</strong> {channel.details}</p>
              <span className={`px-2 py-1 rounded text-xs ${channel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {channel.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(channel)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
              <button onClick={() => handleDelete(channel.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{editingChannel ? 'Edit' : 'Add'} Payment Channel</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
              <div className="flex gap-3">
                <button onClick={handleSave} className="flex-1 bg-coffee-600 text-white py-2 rounded-lg">Save</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
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
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings.telegramSupport || !settings.telegramChannel || !settings.telegramGroup) {
      alert('All fields are required');
      return;
    }

    setSaving(true);
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
        alert('Settings saved successfully!');
        fetchSettings();
      } else {
        alert(data.error || 'Failed to save settings');
      }
    } catch (error) {
      alert('Connection error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-coffee-800 mb-2">
          📞 Telegram Support URL
        </label>
        <input
          type="url"
          value={settings.telegramSupport}
          onChange={(e) => setSettings({ ...settings, telegramSupport: e.target.value })}
          className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="https://t.me/your_support_username"
        />
        <p className="text-xs text-coffee-500 mt-1">Link to Telegram support/contact</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-coffee-800 mb-2">
          📢 Telegram Channel URL
        </label>
        <input
          type="url"
          value={settings.telegramChannel}
          onChange={(e) => setSettings({ ...settings, telegramChannel: e.target.value })}
          className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="https://t.me/your_channel_username"
        />
        <p className="text-xs text-coffee-500 mt-1">Link to Telegram channel</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-coffee-800 mb-2">
          👥 Telegram Group URL
        </label>
        <input
          type="url"
          value={settings.telegramGroup}
          onChange={(e) => setSettings({ ...settings, telegramGroup: e.target.value })}
          className="w-full px-4 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
          placeholder="https://t.me/your_group_username"
        />
        <p className="text-xs text-coffee-500 mt-1">Link to Telegram group</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-coffee-600 text-white px-4 py-3 rounded-lg hover:bg-coffee-700 transition disabled:opacity-50 font-semibold"
      >
        {saving ? 'Saving...' : '💾 Save Settings'}
      </button>
    </div>
  );
}
