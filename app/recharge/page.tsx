'use client';

import { useState } from 'react';

export default function RechargePage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email: 'user@dmannee.com', // Replace with real user email later
          name: 'D Mannee User'
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to ToyyibPay
      } else {
        setMessage({ type: 'error', text: data.error || 'Payment failed to start' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'System error. Check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-stone-800">☕ Wallet Recharge</h2>
        
        {message.text && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.type === 'error' ? '⚠️' : '✅'} {message.text}
          </div>
        )}

        <form onSubmit={handlePay} className="space-y-4">
          <input
            type="number"
            placeholder="Enter Amount (RM)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-stone-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 disabled:opacity-50 transition"
          >
            {loading ? 'Processing...' : 'Pay with Online Banking'}
          </button>
        </form>
        <p className="text-center text-xs text-stone-400 mt-4">Powered by ToyyibPay for D' Mannee Resources</p>
      </div>
    </div>
  );
}