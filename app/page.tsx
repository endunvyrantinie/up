'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('v') || '';
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    referralCode: referralCode,
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Бақайдгирӣ муваффақ шуд! Лутфан ворид шавед.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Бақайдгирӣ номуваффақ шуд');
      }
    } catch (error) {
      setError('Хато дар пайванд. Лутфан боз кӯшиш кунед.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-coffee-800 mb-2">☕ Coffee Rewards</h1>
            <p className="text-coffee-600">Earn through referrals and VIP investments</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {!showRegister ? (
              <>
                <h2 className="text-2xl font-bold text-coffee-800 mb-6 text-center">Welcome</h2>
                <div className="space-y-4">
                  <Link
                    href="/login"
                    className="block w-full bg-coffee-600 text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-coffee-700 transition"
                  >
                    Login
                  </Link>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="block w-full bg-coffee-200 text-coffee-800 py-3 px-6 rounded-lg font-semibold hover:bg-coffee-300 transition"
                  >
                    Register
                  </button>
                  <Link
                    href="/admin"
                    className="block w-full text-coffee-600 py-2 text-center text-sm hover:underline"
                  >
                    Admin Login
                  </Link>
                </div>
              </>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <h2 className="text-2xl font-bold text-coffee-800 mb-6 text-center">Register</h2>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    ⚠️ {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    ✅ {success}
                  </div>
                )}
                
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setError('');
                  }}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
                />
                <input
                  type="text"
                  placeholder="Referral Code (Optional)"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-coffee-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-coffee-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Дар ҳоли кор...
                    </>
                  ) : (
                    'Register'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setError('');
                    setSuccess('');
                  }}
                  disabled={loading}
                  className="w-full text-coffee-600 py-2 text-sm hover:underline disabled:opacity-50"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>

          <div className="text-center text-sm text-coffee-600">
            <p>Start earning today with our referral program!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center"><div className="text-coffee-800">Loading...</div></div>}>
      <HomeContent />
    </Suspense>
  );
}

