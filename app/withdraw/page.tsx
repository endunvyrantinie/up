'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BottomTabBar from '@/components/BottomTabBar';
import { Transaction } from '@/lib/db';

interface Withdrawal {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  qrCode?: string;
  requestDate: string;
  approveDate?: string;
}

export default function WithdrawPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [qrCode, setQrCode] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('Bank Account 1');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([
    { id: '1', name: 'Bank Account 1', bank: 'Maybank', account: '1234567890' },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();
    fetchWithdrawals();
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts');
      const data = await res.json();
      if (data.accounts && data.accounts.length > 0) {
        setAccounts(data.accounts);
        if (!selectedAccount && data.accounts[0]) {
          setSelectedAccount(data.accounts[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts');
    }
  };

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

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) {
        const wd = data.transactions
          .filter((t: Transaction) => t.type === 'withdrawal')
          .map((t: Transaction) => ({
            id: t.id,
            amount: t.amount,
            status: t.status,
            qrCode: t.qrCode,
            requestDate: t.createdAt,
            approveDate: t.approveDate,
          }));
        setWithdrawals(wd);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawals');
    }
  };

  const handleGenerateQR = async () => {
    const withdrawalAmount = amount ? parseFloat(amount) : 0;
    if (!amount || isNaN(withdrawalAmount) || withdrawalAmount < 12) {
      alert('Minimum withdrawal is RM 12');
      return;
    }
    if (user && withdrawalAmount > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: withdrawalAmount }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }
        fetchUser();
        fetchWithdrawals();
        alert('Withdrawal request submitted! Processing in 24 hours.');
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      alert('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (requestDate: string) => {
    const hoursSinceRequest = (Date.now() - new Date(requestDate).getTime()) / (1000 * 60 * 60);
    const hoursLeft = 24 - hoursSinceRequest;
    if (hoursLeft <= 0) return 'Ready';
    return `${Math.floor(hoursLeft)}h ${Math.floor((hoursLeft % 1) * 60)}m`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-28 swipeable">
      {/* Enhanced Header - Mobile App Style */}
      <div className="bg-gradient-to-r from-coffee-brown to-coffee-700 text-white p-6 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:text-coffee-200 transition flex items-center gap-2 active:scale-95">
            <span className="text-xl">←</span>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span>💸</span>
            <span>Withdrawal</span>
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 -mt-4">
        {/* Current Balance - Enhanced Mobile Card */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden mobile-card">
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/10 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24"></div>
          <div className="relative z-10">
            <p className="text-white/90 text-sm sm:text-base mb-2 font-semibold">💰 Account Balance</p>
            <p className="text-4xl sm:text-6xl font-bold mb-2 drop-shadow-lg">RM {user.balance.toFixed(2)}</p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              <span className="text-white/80 text-xs sm:text-sm">Available for withdrawal</span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form - Enhanced Mobile App Style */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 mb-6 border-2 border-coffee-100 mobile-card">
          <h2 className="text-xl sm:text-2xl font-bold text-coffee-800 mb-4 sm:mb-6 flex items-center gap-2">
            <span>💵</span>
            <span>Withdrawal Amount</span>
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-bold text-coffee-800 mb-3">
                Enter Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-coffee-600 font-bold text-lg">RM</span>
                <input
                  type="number"
                  placeholder="Enter amount (min RM 12)"
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAmount(value);
                    setError('');
                    
                    if (value && parseFloat(value) < 12) {
                      setError('Minimum withdrawal is RM 12');
                    } else if (value && user && parseFloat(value) > user.balance) {
                      setError(`Insufficient balance. Available: RM ${user.balance.toFixed(2)}`);
                    } else {
                      setError('');
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 sm:py-5 border-2 border-coffee-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 bg-white text-coffee-900 text-lg sm:text-xl font-semibold"
                />
              </div>
              {error && (
                <div className="mt-3 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-slideUp">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            {amount && parseFloat(amount) > 0 && parseFloat(amount) >= 12 && !error && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 animate-slideUp">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base text-coffee-700 font-semibold">💰 Amount Received:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">
                    RM {(parseFloat(amount) * 0.84).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="text-xs sm:text-sm text-coffee-600">Withdrawal Amount:</span>
                  <span className="text-sm sm:text-base font-semibold text-coffee-800">RM {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs sm:text-sm text-coffee-500 font-medium">Tax: 16% (RM {(parseFloat(amount) * 0.16).toFixed(2)})</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-base font-bold text-coffee-800 mb-3">
                🏦 Select Withdrawal Account
              </label>
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="w-full bg-gradient-to-r from-coffee-50 to-coffee-100 border-2 border-coffee-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex justify-between items-center cursor-pointer hover:bg-coffee-100 active:scale-95 transition-all duration-300 text-left touch-manipulation group"
              >
                <div className="flex-1">
                  <span className="font-bold text-coffee-800 block text-base sm:text-lg mb-1">{selectedAccount}</span>
                  <span className="text-xs sm:text-sm text-coffee-600">
                    {accounts.find(a => a.name === selectedAccount)?.bank || 'Tap to select account'}
                  </span>
                </div>
                <span className="text-coffee-600 text-2xl sm:text-3xl group-active:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>

          {/* Withdrawal Button - Enhanced Mobile App Style */}
          <button
            onClick={handleGenerateQR}
            disabled={loading || !amount || (amount ? parseFloat(amount) < 12 : true) || !!error || !selectedAccount}
            className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-5 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 touch-target no-select"
          >
            {loading ? (
              <>
                <span className="animate-spin text-2xl">⏳</span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">💸</span>
                <span>Submit Withdrawal Request</span>
              </>
            )}
          </button>

          {/* Withdrawal Instructions - Enhanced Mobile Card */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border-2 border-blue-200 mobile-card">
            <h4 className="font-bold text-coffee-800 mb-4 sm:mb-5 text-lg sm:text-xl flex items-center gap-2">
              <span>📋</span>
              <span>Withdrawal Instructions</span>
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { icon: '💰', text: 'Minimum withdrawal amount is RM 12' },
                { icon: '⏰', text: 'Withdrawals are available 24/7, multiple times per day' },
                { icon: '💳', text: 'Withdrawal fee is 16% (automatically deducted)' },
                { icon: '🚀', text: 'Processing time: approximately 2 hours (depends on bank)' },
                { icon: '⚠️', text: 'Please verify account information to avoid transaction failure' },
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-xl hover:bg-white/80 transition">
                  <span className="text-xl sm:text-2xl">{item.icon}</span>
                  <span className="text-sm sm:text-base text-coffee-700 flex-1 pt-0.5 font-medium">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* QR Code Display - Enhanced Mobile App Style */}
          {qrCode && (
            <div className="mt-6 sm:mt-8 text-center animate-slideUp">
              <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 inline-block border-2 border-coffee-200 shadow-xl">
                <p className="text-sm sm:text-base text-coffee-700 mb-4 font-semibold">☕ CoffeePay QR Code</p>
                <div className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl inline-block shadow-lg mb-4">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64 sm:w-72 sm:h-72" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-coffee-800 mt-3 mb-2">RM {parseFloat(amount).toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-coffee-600 mt-2 font-medium">Scan QR code to complete withdrawal</p>
              </div>
            </div>
          )}
        </div>

        {/* Account Selection Modal */}
        {showAccountModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-slideUp border-2 border-coffee-200">
              <div className="bg-gradient-to-r from-coffee-brown to-coffee-600 text-white p-6 rounded-t-3xl">
                <h3 className="text-xl font-bold">Select Withdrawal Account</h3>
                <p className="text-white/90 text-sm mt-1">Choose your bank account</p>
              </div>
              
              <div className="p-6 space-y-3">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      setSelectedAccount(account.name);
                      setShowAccountModal(false);
                    }}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedAccount === account.name
                        ? 'border-coffee-brown bg-coffee-50'
                        : 'border-coffee-200 bg-white hover:bg-coffee-50 hover:border-coffee-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-coffee-800">{account.name}</p>
                        <p className="text-sm text-coffee-600">{account.bank}</p>
                        <p className="text-xs text-coffee-500 mt-1">****{account.account.slice(-4)}</p>
                      </div>
                      {selectedAccount === account.name && (
                        <span className="text-2xl text-coffee-brown">✓</span>
                      )}
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="w-full mt-4 px-6 py-3 bg-coffee-200 text-coffee-800 rounded-xl font-semibold hover:bg-coffee-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal History - Enhanced Mobile App Style */}
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border-2 border-coffee-100 mobile-card">
          <h2 className="text-xl sm:text-2xl font-bold text-coffee-800 mb-4 sm:mb-6 flex items-center gap-2">
            <span>📜</span>
            <span>Withdrawal History</span>
          </h2>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-coffee-400">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-base sm:text-lg font-semibold">No withdrawal requests yet</p>
              <p className="text-sm text-coffee-500 mt-2">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {withdrawals.map((wd) => (
                <div key={wd.id} className="bg-gradient-to-r from-coffee-50 to-coffee-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-coffee-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs sm:text-sm text-coffee-600 font-medium mb-1">
                        {new Date(wd.requestDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-coffee-800">RM {wd.amount.toFixed(2)}</p>
                    </div>
                    <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${
                      wd.status === 'approved' ? 'bg-green-100 text-green-800' :
                      wd.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {wd.status === 'approved' ? '✓ Approved' : 
                       wd.status === 'rejected' ? '✗ Rejected' : 
                       '⏳ Pending'}
                    </span>
                  </div>
                  {wd.status === 'pending' && (
                    <div className="flex items-center justify-between pt-3 border-t border-coffee-200">
                      <span className="text-xs sm:text-sm text-coffee-600 font-medium">⏰ Processing Time:</span>
                      <span className="text-sm sm:text-base font-bold text-coffee-800">{getTimeRemaining(wd.requestDate)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

