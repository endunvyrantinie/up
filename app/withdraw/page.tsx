'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);

  useEffect(() => {
    fetchUser();
    fetchWithdrawals();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (error) { router.push('/login'); }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) {
        setWithdrawals(data.transactions.filter((t: any) => t.type === 'withdrawal'));
      }
    } catch (error) { console.error('Failed to fetch withdrawals'); }
  };

  const handleWithdraw = async () => {
    const withdrawalAmount = parseFloat(amount);
    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount < 12) {
      alert('Minimum withdrawal is RM 12');
      return;
    }
    if (user && withdrawalAmount > user.balance) {
      alert('Insufficient balance');
      return;
    }
    if (!user.bankName || !user.accountNumber) {
      if (confirm('Please set your bank details in profile first. Go to bank settings?')) {
        router.push('/bank-account');
      }
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: withdrawalAmount }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Withdrawal request submitted!');
        setAmount('');
        fetchUser();
        fetchWithdrawals();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (error) { alert('Withdrawal failed'); }
    finally { setLoading(false); }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen-safe bg-stone-50 pb-28">
      <div className="bg-stone-900 text-white p-6 shadow-xl">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/home" className="text-xl">←</Link>
          <h1 className="text-xl font-bold">Withdrawal</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-stone-900 rounded-3xl shadow-2xl p-8 mb-6 text-white">
          <p className="text-stone-400 text-sm mb-1">Available Balance</p>
          <p className="text-4xl font-bold">RM {user.balance.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-stone-200 mb-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Withdraw Funds</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Amount (Min RM 12)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-400">RM</span>
                <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full pl-12 pr-4 py-4 border-2 border-stone-100 rounded-xl focus:border-stone-900 outline-none" />
              </div>
            </div>
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-500">Bank Name:</span>
                <span className="font-bold text-stone-800">{user.bankName || 'Not Set'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Account No:</span>
                <span className="font-bold text-stone-800">{user.accountNumber || 'Not Set'}</span>
              </div>
            </div>
            <button onClick={handleWithdraw} disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition disabled:opacity-50">
              {loading ? 'Processing...' : 'Request Withdrawal'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-stone-200">
          <h2 className="text-lg font-bold text-stone-800 mb-4">Withdrawal History</h2>
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <p className="text-center text-stone-400 py-4">No withdrawal history</p>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <p className="font-bold text-stone-800">RM {w.amount.toFixed(2)}</p>
                    <p className="text-xs text-stone-400">{new Date(w.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    w.status === 'approved' || w.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
