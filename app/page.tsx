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
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.repeatPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
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
            setSuccess('Registration successful! Please login.');
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
            setSuccess('Registration successful! Please login.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } catch (loginError) {
          console.error('Auto-login error:', loginError);
          setSuccess('Registration successful! Please login.');
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } else {
        setError(data.error || 'Registration failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please check your internet connection and try again.');
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
                        disabled={loading}
                        className="bg-coffee-50 border border-coffee-300 border-r-0 rounded-l-lg px-3 py-3 text-coffee-700 font-semibold focus:outline-none focus:ring-2 focus:ring-coffee-500 appearance-none cursor-pointer pr-8 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={loading}
                      className="flex-1 px-4 py-3 border border-coffee-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
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
                    disabled={loading}
                    className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
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
                    disabled={loading}
                    className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
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
                    disabled={loading}
                    className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-coffee-900 placeholder-coffee-400"
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
                  className="w-full bg-coffee-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-coffee-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Processing...
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

