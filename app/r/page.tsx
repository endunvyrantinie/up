'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('v') || '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    repeatPassword: '',
    referralCode: referralCode,
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.repeatPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.phone,
          email: `${formData.phone}@coffee.com`,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Server error' }));
        setError(errorData.error || `Error: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        // Auto login
        try {
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: `${formData.phone}@coffee.com`,
              password: formData.password,
            }),
          });

          if (!loginRes.ok) {
            setError('Registration successful, but auto-login failed. Please login manually.');
            setLoading(false);
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            return;
          }

          const loginData = await loginRes.json();

          if (loginData.success && loginData.token) {
            // Clear ALL existing tokens and data first
            localStorage.clear();
            sessionStorage.clear();
            
            // Small delay to ensure storage is cleared
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Set new token
            localStorage.setItem('token', loginData.token);
            // Use window.location for clean redirect
            window.location.href = '/home?showInfo=true';
            return;
          } else {
            setError('Registration successful, but auto-login failed. Please login manually.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          setError('Registration successful, but auto-login failed. Please login manually.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Coffee Logo - Mobile Optimized */}
        <div className="bg-coffee-brown text-white p-4 sm:p-6 text-center">
          <div className="text-4xl sm:text-5xl mb-2">☕</div>
          <h1 className="text-xl sm:text-2xl font-bold">Coffee Rewards</h1>
        </div>

        {/* Coffee Image Placeholder - Mobile Optimized */}
        <div className="h-40 sm:h-48 bg-gradient-to-br from-coffee-200 to-coffee-300 flex items-center justify-center">
          <div className="text-5xl sm:text-6xl">☕</div>
        </div>

        {/* Form - Mobile Optimized */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">
                Mobile Phone
              </label>
              <div className="flex">
                <div className="bg-coffee-50 border border-coffee-300 border-r-0 rounded-l-lg px-4 py-3 flex items-center">
                  <span className="text-coffee-700 font-semibold">+60</span>
                </div>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-coffee-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError('');
                }}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">
                Repeat Password
              </label>
              <input
                type="password"
                placeholder="Repeat password"
                required
                value={formData.repeatPassword}
                onChange={(e) => {
                  setFormData({ ...formData, repeatPassword: e.target.value });
                  setError('');
                }}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">
                Referral Code
              </label>
              <input
                type="text"
                placeholder="Referral code (optional)"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee-brown text-white py-4 rounded-lg font-bold text-lg hover:bg-coffee-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create an account now'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-coffee-brown text-sm hover:underline">
              You have already created an account, log in now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800">Loading...</div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

