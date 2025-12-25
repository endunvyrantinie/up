'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Server error' }));
        setError(errorData.error || 'Login failed');
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        if (data.user?.isAdmin) {
          localStorage.setItem('adminToken', data.token);
          router.push('/admin');
        } else {
          router.push('/home?showInfo=true');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-coffee-200/30 rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-coffee-300/30 rounded-full translate-x-48 translate-y-48"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border-2 border-coffee-100 relative z-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-pulse">☕</div>
          <h1 className="text-4xl font-bold text-coffee-800 mb-2">Coffee Rewards</h1>
          <p className="text-coffee-600 text-lg">Login to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slideUp">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-coffee-800 mb-2">📧 Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError('');
              }}
              disabled={loading}
              className="w-full px-4 py-4 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400 text-lg transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-coffee-800 mb-2">🔒 Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setError('');
              }}
              disabled={loading}
              className="w-full px-4 py-4 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400 text-lg transition-all"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-2xl">⏳</span>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Login</span>
              </>
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/" className="text-coffee-600 text-sm hover:text-coffee-800 hover:underline font-semibold transition">
            Don't have an account? <span className="text-coffee-brown">Register</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

