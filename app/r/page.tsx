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
    countryCode: '+60',
    phone: '',
    password: '',
    repeatPassword: '',
    referralCode: referralCode,
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
    { code: '+351', country: '🇬🇷 Greece', flag: '🇬🇷' },
  ];

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
      // Normalize phone number (remove all non-digit characters)
      const normalizedPhone = formData.phone.replace(/[^\d]/g, '');
      
      // Combine country code and phone number
      const fullPhoneNumber = formData.countryCode + normalizedPhone;
      
      // Basic validation: phone should have at least 5 digits
      if (normalizedPhone.length < 5) {
        setError('Please enter a valid phone number (at least 5 digits)');
        setLoading(false);
        return;
      }
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhoneNumber, // Send full phone number with country code
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
              phone: fullPhoneNumber, // Use full phone number with country code
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
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center p-4 swipeable">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden mobile-card">
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
                <div className="relative">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => {
                      setFormData({ ...formData, countryCode: e.target.value });
                      setError('');
                    }}
                    className="bg-coffee-50 border border-coffee-300 border-r-0 rounded-l-lg px-3 py-3 text-coffee-700 font-semibold focus:outline-none focus:ring-2 focus:ring-coffee-500 appearance-none cursor-pointer pr-8"
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
                  placeholder="Enter phone number"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    // Only allow numbers, spaces, dashes, and parentheses
                    const value = e.target.value.replace(/[^\d\s\-()]/g, '');
                    setFormData({ ...formData, phone: value });
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-coffee-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
                />
              </div>
              <p className="text-xs text-coffee-500 mt-1">Enter your phone number without country code</p>
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
                Referral Code <span className="text-coffee-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter referral code if you have one"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
              />
              <div className="mt-2 p-3 bg-coffee-50 rounded-lg border border-coffee-200">
                <p className="text-xs text-coffee-700 leading-relaxed">
                  <span className="font-semibold">💡 What is a Referral Code?</span><br />
                  If someone invited you to join, enter their referral code here. When you purchase VIP packages, they will earn commissions from your purchases. You can also invite others using your own referral code after registration!
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coffee-brown text-white py-4 rounded-lg font-bold text-lg hover:bg-coffee-700 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-target no-select shadow-lg active:shadow-xl"
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

