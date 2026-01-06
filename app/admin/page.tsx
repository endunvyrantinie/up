'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) { setIsLoggedIn(true); fetchData(); }
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchStats(), fetchUsers(), fetchTransactions()]);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setStats(data);
    } catch (error) { console.error('Failed to fetch stats'); }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) { console.error('Failed to fetch users'); }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/transactions', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
    } catch (error) { console.error('Failed to fetch transactions'); }
  };

  const handleWithdrawAction = async (transactionId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/admin/withdraw/action', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await res.json();
      if (data.success) { alert(`Withdrawal ${action}d successfully!`); fetchData(); }
      else { alert(data.error || 'Action failed'); }
    } catch (error) { alert('Connection error'); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginData, isAdmin: true }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchData();
      } else { setLoginError(data.error || 'Invalid credentials'); }
    } catch (error) { setLoginError('Connection error'); }
    finally { setLoginLoading(false); }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          {loginError && <p className="text-red-500 text-sm mb-4 text-center">{loginError}</p>}
          <input type="email" placeholder="Admin Email" className="w-full p-4 border rounded-xl mb-4" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
          <input type="password" placeholder="Password" className="w-full p-4 border rounded-xl mb-6" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
          <button type="submit" disabled={loginLoading} className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold">
            {loginLoading ? 'Logging in...' : 'Login'}
          </button>
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
        {activeTab === 'transactions' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Withdrawal Requests</h2>
            <div className="space-y-4">
              {transactions.filter(t => t.type === 'withdrawal').map(t => (
                <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">RM {t.amount.toFixed(2)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.status}</span>
                    </div>
                    <p className="text-sm text-stone-600">User: <span className="font-semibold">{t.user?.username}</span></p>
                    <div className="mt-2 p-3 bg-stone-50 rounded-xl text-xs border border-stone-100">
                      <p>🏦 <span className="font-bold">{t.user?.bankName || 'N/A'}</span></p>
                      <p>👤 <span className="font-bold">{t.user?.accountName || 'N/A'}</span></p>
                      <p>🔢 <span className="font-bold">{t.user?.accountNumber || 'N/A'}</span></p>
                    </div>
                  </div>
                  {t.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleWithdrawAction(t.id, 'approve')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition">Approve</button>
                      <button onClick={() => handleWithdrawAction(t.id, 'reject')} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
