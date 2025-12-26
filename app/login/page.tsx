'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    countryCode: '+60',
    phone: '',
    password: '',
  });

  // Popular country codes
  const countryCodes = [
    { code: '+60', country: '🇲🇾 Malaysia', flag: '🇲🇾' },
    { code: '+1', country: '🇺🇸 USA/Canada', flag: '🇺🇸' },
    { code: '+44', country: '🇬🇧 UK', flag: '🇬🇧' },
    { code: '+86', country: '🇨🇳 China', flag: '🇨🇳' },
    { code: '+91', country: '🇮🇳 India', flag: '🇮🇳' },
    { code: '+62', country: '🇮🇩 Indonesia', flag: '🇮🇩' },
    { code: '+65', country: '🇸🇬 Singapore', flag: '🇸🇬' },
    { code: '+66', country: '🇹🇭 Thailand', flag: '🇹🇭' },
    { code: '+84', country: '🇻🇳 Vietnam', flag: '🇻🇳' },
    { code: '+63', country: '🇵🇭 Philippines', flag: '🇵🇭' },
    { code: '+81', country: '🇯🇵 Japan', flag: '🇯🇵' },
    { code: '+82', country: '🇰🇷 South Korea', flag: '🇰🇷' },
    { code: '+61', country: '🇦🇺 Australia', flag: '🇦🇺' },
    { code: '+64', country: '🇳🇿 New Zealand', flag: '🇳🇿' },
    { code: '+971', country: '🇦🇪 UAE', flag: '🇦🇪' },
    { code: '+966', country: '🇸🇦 Saudi Arabia', flag: '🇸🇦' },
    { code: '+7', country: '🇷🇺 Russia/Kazakhstan', flag: '🇷🇺' },
    { code: '+49', country: '🇩🇪 Germany', flag: '🇩🇪' },
    { code: '+33', country: '🇫🇷 France', flag: '🇫🇷' },
    { code: '+39', country: '🇮🇹 Italy', flag: '🇮🇹' },
    { code: '+34', country: '🇪🇸 Spain', flag: '🇪🇸' },
    { code: '+31', country: '🇳🇱 Netherlands', flag: '🇳🇱' },
    { code: '+32', country: '🇧🇪 Belgium', flag: '🇧🇪' },
    { code: '+41', country: '🇨🇭 Switzerland', flag: '🇨🇭' },
    { code: '+46', country: '🇸🇪 Sweden', flag: '🇸🇪' },
    { code: '+47', country: '🇳🇴 Norway', flag: '🇳🇴' },
    { code: '+45', country: '🇩🇰 Denmark', flag: '🇩🇰' },
    { code: '+358', country: '🇫🇮 Finland', flag: '🇫🇮' },
    { code: '+48', country: '🇵🇱 Poland', flag: '🇵🇱' },
    { code: '+90', country: '🇹🇷 Turkey', flag: '🇹🇷' },
    { code: '+20', country: '🇪🇬 Egypt', flag: '🇪🇬' },
    { code: '+27', country: '🇿🇦 South Africa', flag: '🇿🇦' },
    { code: '+55', country: '🇧🇷 Brazil', flag: '🇧🇷' },
    { code: '+52', country: '🇲🇽 Mexico', flag: '🇲🇽' },
    { code: '+54', country: '🇦🇷 Argentina', flag: '🇦🇷' },
    { code: '+351', country: '🇵🇹 Portugal', flag: '🇵🇹' },
  ];

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Normalize phone number (remove spaces, dashes, etc.)
      const normalizedPhone = formData.phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
      
      // Combine country code and phone number
      const fullPhoneNumber = formData.countryCode + normalizedPhone;
      
      // Basic validation: phone should have at least 5 digits
      if (normalizedPhone.length < 5) {
        setError('Please enter a valid phone number (at least 5 digits)');
        setLoading(false);
        return;
      }
      
      // Clear any existing tokens before login attempt
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhoneNumber, // Send full phone number with country code
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
              <div className="relative">
                <select
                  value={formData.countryCode}
                  onChange={(e) => {
                    setFormData({ ...formData, countryCode: e.target.value });
                    setError('');
                  }}
                  disabled={loading}
                  className="bg-coffee-50 border-2 border-coffee-300 border-r-0 rounded-l-xl px-3 py-4 text-coffee-700 font-semibold focus:outline-none focus:ring-2 focus:ring-coffee-500 appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minWidth: '100px' }}
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.flag} {cc.code}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <span className="text-coffee-600">▼</span>
                </div>
              </div>
              <input
                type="tel"
                placeholder="Enter your phone number"
                required
                value={formData.phone}
                onChange={(e) => {
                  // Only allow numbers, spaces, dashes, and parentheses
                  const value = e.target.value.replace(/[^\d\s\-()]/g, '');
                  setFormData({ ...formData, phone: value });
                  setError('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-4 border-2 border-coffee-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400 text-lg transition-all"
              />
            </div>
            <p className="text-xs text-coffee-500 mt-1">Enter your phone number without country code</p>
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

