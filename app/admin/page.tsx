'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions' | 'products'>('dashboard');

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsLoggedIn(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    // Fetch Stats
    const statsRes = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
    const statsData = await statsRes.json();
    setStats(statsData);

    // Fetch Users
    const usersRes = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
    const usersData = await usersRes.json();
    setUsers(usersData.users || []);

    // Fetch Transactions
    const transRes = await fetch('/api/admin/transactions', { headers: { 'Authorization': `Bearer ${token}` } });
    const transData = await transRes.json();
    setTransactions(transData.transactions || []);
  };

  const handleWithdrawAction = async (transactionId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    const token = localStorage.getItem('adminToken');
    const res = await fetch('/api/admin/withdraw/action', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, action }),
    });
    if (res.ok) {
      alert(`Withdrawal ${action}d!`);
      fetchData();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...loginData, isAdmin: true }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      setIsLoggedIn(true);
      fetchData();
    } else {
      setLoginError(data.error || 'Login failed');
    }
    setLoginLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          {loginError && <p className="text-red-500 text-sm mb-4 text-center">{loginError}</p>}
          <input type="email" placeholder="Admin Email" className="w-full p-4 border rounded-xl mb-4" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
          <input type="password" placeholder="Password" className="w-full p-4 border rounded-xl mb-6" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
          <button type="submit" className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <div className="w-64 bg-stone-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-xl ${activeTab === 'dashboard' ? 'bg-stone-800' : ''}`}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left p-3 rounded-xl ${activeTab === 'users' ? 'bg-stone-800' : ''}`}>👥 Users</button>
          <button onClick={() => setActiveTab('transactions')} className={`w-full text-left p-3 rounded-xl ${activeTab === 'transactions' ? 'bg-stone-800' : ''}`}>💳 Transactions</button>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-500 p-6 rounded-2xl text-white shadow-lg">
              <p className="opacity-80">Total Users</p>
              <p className="text-3xl font-bold">{stats.overview?.totalUsers || 0}</p>
            </div>
            <div className="bg-green-500 p-6 rounded-2xl text-white shadow-lg">
              <p className="opacity-80">Total Balance</p>
              <p className="text-3xl font-bold">RM {stats.overview?.totalBalance?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-orange-500 p-6 rounded-2xl text-white shadow-lg">
              <p className="opacity-80">Total Withdrawn</p>
              <p className="text-3xl font-bold">RM {stats.overview?.totalWithdrawn?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        )}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
            {transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').map(t => (
              <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center">
                <div>
                  <p className="font-bold text-xl text-red-600">RM {t.amount.toFixed(2)}</p>
                  <p className="text-sm text-stone-600">User: {t.user?.username || 'Unknown'}</p>
                  <div className="mt-2 p-3 bg-stone-50 rounded-lg text-xs">
                    <p>🏦 Bank: {t.user?.bankName || 'N/A'}</p>
                    <p>👤 Name: {t.user?.accountName || 'N/A'}</p>
                    <p>🔢 Account: {t.user?.accountNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleWithdrawAction(t.id, 'approve')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Approve</button>
                  <button onClick={() => handleWithdrawAction(t.id, 'reject')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
