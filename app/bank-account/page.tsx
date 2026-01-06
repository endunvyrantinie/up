'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function BankAccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setBankName(data.user.bankName || '');
        setAccountName(data.user.accountName || '');
        setAccountNumber(data.user.accountNumber || '');
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/user/update-bank', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankName, accountName, accountNumber }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Bank details saved successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save details' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen-safe bg-stone-50 pb-28">
      <div className="bg-stone-900 text-white p-6 shadow-xl">
        <div className="container mx-auto flex items-center gap-4">
          <Link href="/mine" className="text-xl">←</Link>
          <h1 className="text-xl font-bold">Bank Account Management</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-stone-200">
          {message.text && (
            <div className={`p-4 mb-6 rounded-xl text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message.type === 'error' ? '⚠️' : '✅'} {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Bank Name</label>
              <input type="text" placeholder="e.g. Maybank, CIMB" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-4 border-2 border-stone-100 rounded-xl focus:border-stone-900 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Account Holder Name</label>
              <input type="text" placeholder="Full name as per bank record" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full p-4 border-2 border-stone-100 rounded-xl focus:border-stone-900 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Account Number</label>
              <input type="text" placeholder="Enter bank account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-4 border-2 border-stone-100 rounded-xl focus:border-stone-900 outline-none" required />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Bank Details'}
            </button>
          </form>
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
