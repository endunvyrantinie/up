'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RechargeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [amount, setAmount] = useState(searchParams.get('amount') || '30'); // Default to 30
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

  const handleStripePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) { setMessage({ type: 'error', text: 'Please login first' }); return; }

    // Enforce RM 30 Minimum
    if (parseFloat(amount) < 30) {
      setMessage({ type: 'error', text: 'Minimum recharge is RM 30.00' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/recharge/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setMessage({ type: 'error', text: data.error || 'Payment failed' });
    } catch (err) {
      setMessage({ type: 'error', text: 'System error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-stone-100">
        <h2 className="text-2xl font-black text-center mb-6 text-stone-900">☕ Wallet Recharge</h2>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleStripePay} className="space-y-4">
          <div className="bg-stone-900 text-white p-6 rounded-2xl mb-4">
            <p className="text-xs opacity-70 uppercase font-bold mb-1">Current Balance</p>
            <p className="text-3xl font-black">RM {user?.balance?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-stone-700 ml-1">Recharge Amount (RM)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-stone-900 transition"
              required
              min="30"
            />
            <p className="text-[10px] text-stone-400 ml-1 font-bold uppercase">Minimum Recharge: RM 30.00</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white p-4 rounded-2xl font-black hover:bg-stone-800 transition shadow-lg">
            {loading ? 'Processing...' : `Pay RM ${parseFloat(amount || '0').toFixed(2)} via Stripe`}
          </button>
        </form>
        <p className="text-center text-[10px] text-stone-400 mt-6 uppercase font-bold">D' Mannee Resources</p>
      </div>
    </div>
  );
}

export default function RechargePage() {
  return <Suspense fallback={<div>Loading...</div>}><RechargeContent /></Suspense>;
}
