'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = formData.phone.replace(/\s+/g, '').replace(/-/g, '');
      
      // Clear any existing tokens before login attempt
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          password: formData.password,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Server error' }));
        const errorMessage = errorData.error || 'Login failed';
        console.error('Login API error:', errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (data.success && data.token) {
        // Clear ALL existing data first
        localStorage.clear();
        sessionStorage.clear();
        
        // Small delay to ensure storage is cleared
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Set new token
        localStorage.setItem('token', data.token);
        if (data.user?.isAdmin) {
          localStorage.setItem('adminToken', data.token);
          // Use window.location for admin to ensure clean redirect
          window.location.href = '/admin';
        } else {
          // Use window.location for user to ensure clean redirect with cache busting
          window.location.href = '/home?showInfo=true&t=' + Date.now();
        }
        // Don't set loading to false here as we're redirecting
        return;
      } else {
        const errorMessage = data.error || 'Login failed';
        console.error('Login failed:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please check your internet and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 flex items-center justify-center p-4 relative overflow-hidden swipeable">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-coffee-200/30 rounded-full -translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-coffee-300/30 rounded-full translate-x-48 translate-y-48"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-coffee-100 relative z-10 mobile-card">
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-pulse">☕</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-coffee-800 mb-2">Coffee Rewards</h1>
          <p className="text-coffee-600 text-base sm:text-lg">Login to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slideUp">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-coffee-800 mb-2">📱 Phone Number</label>
            <div className="flex">
              <div className="bg-coffee-50 border-2 border-coffee-300 border-r-0 rounded-l-xl px-4 py-4 flex items-center">
                <span className="text-coffee-700 font-semibold">+60</span>
              </div>
              <input
                type="tel"
                placeholder="Enter your phone number"
                required
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setError('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-4 border-2 border-coffee-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400 text-lg transition-all"
              />
            </div>
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
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 touch-target no-select"
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

