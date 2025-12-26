'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function RechargePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const amountChips = [50, 100, 200, 400, 800, 1600, 3000, 6000, 12000];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const handleRecharge = async () => {
    const rechargeAmount = selectedAmount || (amount ? parseFloat(amount) : 0);
    
    if (!rechargeAmount || rechargeAmount < 50 || isNaN(rechargeAmount)) {
      alert('Minimum deposit is RM 50');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/recharge', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: rechargeAmount }),
      });
      const data = await res.json();
      if (data.success && data.qrCode) {
        setQrCode(data.qrCode);
        setShowQRModal(true);
        setAmount('');
        setSelectedAmount(null);
      } else {
        alert(data.error || 'Recharge failed');
      }
    } catch (error) {
      alert('Recharge failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-24">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-coffee-brown to-coffee-700 text-white p-6 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:text-coffee-200 transition flex items-center gap-2">
            <span>←</span>
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>💰</span>
            <span>Recharge</span>
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 -mt-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-2xl p-6 mb-6 text-white">
          <p className="text-white/90 text-sm mb-2">Current Balance</p>
          <p className="text-4xl font-bold">RM {user.balance.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 mb-6 border-2 border-coffee-100">
          <h2 className="text-xl sm:text-2xl font-bold text-coffee-800 mb-2 flex items-center gap-2">
            <span>💳</span>
            <span>Recharge Amount</span>
          </h2>
          <p className="text-xs sm:text-sm text-coffee-600 mb-4 sm:mb-6">Minimum deposit: RM 50</p>
          
          {/* Amount Chips - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
            {amountChips.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setSelectedAmount(chip);
                  setAmount(chip.toString());
                }}
                className={`py-3 sm:py-4 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold transition-all duration-300 transform active:scale-105 touch-manipulation min-h-[48px] text-xs sm:text-sm ${
                  selectedAmount === chip
                    ? 'bg-gradient-to-r from-coffee-brown to-coffee-600 text-white shadow-lg scale-105'
                    : 'bg-coffee-50 text-coffee-800 active:bg-coffee-100 border-2 border-coffee-200'
                }`}
              >
                RM {chip.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Amount Input - Enhanced */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-coffee-800 mb-3">
              💵 Enter Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-600 font-bold">RM</span>
              <input
                type="number"
                placeholder="Enter amount (min RM 50)"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full pl-12 pr-4 py-4 border-2 border-coffee-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 bg-white text-coffee-900 text-lg font-semibold"
              />
            </div>
            {amount && parseFloat(amount) > 0 && parseFloat(amount) < 50 && (
              <p className="mt-2 text-sm text-red-600">⚠️ Minimum deposit is RM 50</p>
            )}
          </div>

          {/* Recharge Channel - Enhanced */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-coffee-800 mb-3">
              🔄 Payment Channel
            </label>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-coffee-800 block">Payment Channel 1</span>
                  <span className="text-xs text-coffee-600">Secure & Fast</span>
                </div>
                <span className="text-2xl text-green-600">✓</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRecharge}
            disabled={loading || (!amount && !selectedAmount) || (amount ? parseFloat(amount) < 50 : false)}
            className="w-full bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-5 rounded-xl font-bold text-lg hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin text-2xl">⏳</span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>💳</span>
                <span>Recharge Now</span>
              </>
            )}
          </button>
        </div>

        {/* Recharge Rules - Enhanced */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border-2 border-coffee-100">
          <h3 className="text-xl font-bold text-coffee-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            <span>Recharge Rules</span>
          </h3>
          <ul className="space-y-3">
            {[
              'Minimum deposit is RM 50',
              'Verify account information before transferring',
              'If funds are delayed, contact online service',
              'Never transfer to strangers',
              'Officials never ask for password'
            ].map((rule, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition">
                <span className="text-coffee-brown font-bold text-lg">{index + 1}.</span>
                <span className="text-sm text-coffee-700 flex-1 pt-0.5">{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-slideUp border-2 border-coffee-200">
            <div className="bg-gradient-to-r from-coffee-brown to-coffee-600 text-white p-6 rounded-t-3xl">
              <h3 className="text-xl font-bold">Scan QR Code to Pay</h3>
              <p className="text-white/90 text-sm mt-1">Complete your recharge payment</p>
            </div>
            
            <div className="p-6 text-center">
              <div className="bg-coffee-50 rounded-xl p-6 inline-block mb-4">
                <p className="text-sm text-coffee-600 mb-3">CoffeePay QR Code</p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-lg font-bold text-coffee-800 mt-3">RM {selectedAmount || (amount ? parseFloat(amount) : 0).toFixed(2)}</p>
                <p className="text-xs text-coffee-500 mt-2">Scan to complete payment</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> After scanning and completing payment, your balance will be updated once the transaction is approved by admin.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setQrCode(null);
                  fetchUser();
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-coffee-brown to-coffee-600 text-white rounded-xl font-semibold hover:from-coffee-600 hover:to-coffee-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomTabBar />
    </div>
  );
}

