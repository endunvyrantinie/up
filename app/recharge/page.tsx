'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RechargeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.user) setUser(data.user);
      } catch (err) { console.error('Failed to fetch user'); }
    };
    fetchUser();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { setMessage({ type: 'error', text: 'Please login first' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(amount), email: user?.email, name: user?.username }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; } 
      else { setMessage({ type: 'error', text: data.error || 'Payment failed' }); }
    } catch (err) { setMessage({ type: 'error', text: 'System error' }); } 
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-stone-800">☕ Wallet Recharge</h2>
        {message.text && <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message.text}</div>}
        <form onSubmit={handlePay} className="space-y-4">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-2">
            <p className="text-xs text-stone-500 uppercase font-bold mb-1">Current Balance</p>
            <p className="text-2xl font-black text-stone-900">RM {user?.balance?.toFixed(2) || '0.00'}</p>
          </div>
          <input type="number" placeholder="Enter Amount (RM)" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-4 border rounded-xl outline-none" required min="1" />
          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold">{loading ? 'Processing...' : 'Pay with Online Banking'}</button>
        </form>
      </div>
    </div>
  );
}

export default function RechargePage() {
  return <Suspense fallback={<div>Loading...</div>}><RechargeContent /></Suspense>;
}
