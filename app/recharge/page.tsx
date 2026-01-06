'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RechargePage() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // This calls the ToyyibPay API we set up at /api/recharge
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          // In a real app, replace these with real user data from your Auth state
          email: 'customer@dmannee.com', 
          name: 'D Mannee User',
          phone: '0123456789'
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect the user to the ToyyibPay Payment Portal
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to generate payment link');
      }
    } catch (err) {
      setError('Connection error. Please check your internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 border border-stone-200">
        <h1 className="text-2xl font-bold text-stone-800 mb-6 text-center">☕ Wallet Recharge</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRecharge} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">
              Enter Amount (RM)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Min RM 1.00"
              required
              min="1"
              step="0.01"
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-coffee-500 outline-none text-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[10, 50, 100].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setAmount(val.toString())}
                className="py-2 border border-stone-300 rounded-lg hover:bg-stone-50 transition text-stone-600"
              >
                RM{val}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-900 transition disabled:opacity-50"
          >
            {loading ? 'Redirecting to Bank...' : 'Pay with Online Banking'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-stone-500">
          Powered by ToyyibPay for D' Mannee Resources
        </p>
      </div>
    </div>
  );
}