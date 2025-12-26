'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
      <div className="bg-coffee-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => router.push('/dashboard')} className="text-sm hover:underline">
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold">☕ Coffee Rewards</h1>
          <div></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-br from-coffee-brown to-coffee-700 rounded-2xl shadow-2xl p-6 mb-6 text-white">
          <p className="text-coffee-latte text-sm mb-2">Account balance</p>
          <p className="text-5xl font-bold mb-4">RM {user.balance.toFixed(2)}</p>
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-coffee-800 mb-4">Withdrawal amount</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">
                RM Please enter withdrawal amount
              </label>
              <input
                type="number"
                placeholder="Enter amount"
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
                className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900"
              />
              {error && (
                <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                  ⚠️ {error}
                </div>
              )}
            </div>
            
            {amount && parseFloat(amount) > 0 && parseFloat(amount) >= 12 && !error && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-coffee-600">Amount received:</span>
                  <span className="text-lg font-bold text-green-600">
                    RM {(parseFloat(amount) * 0.84).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-end">
                  <span className="text-xs text-coffee-500">Tax: 16%</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-coffee-800 mb-2">
                Please select your withdrawal account
              </label>
              <button
                type="button"
                onClick={() => setShowAccountModal(true)}
                className="w-full bg-coffee-50 border border-coffee-300 rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-coffee-100 transition text-left"
              >
                <div>
                  <span className="font-semibold text-coffee-800 block">{selectedAccount}</span>
                  <span className="text-xs text-coffee-500">
                    {accounts.find(a => a.name === selectedAccount)?.bank || 'Select account'}
                  </span>
                </div>
                <span className="text-coffee-600 text-xl">→</span>
              </button>
            </div>
          </div>

          {/* Withdrawal Button */}
          <button
            onClick={handleGenerateQR}
            disabled={loading || !amount || (amount ? parseFloat(amount) < 12 : true) || !!error || !selectedAccount}
            className="w-full mt-6 bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-4 rounded-xl font-bold text-lg hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span>💸</span>
                <span>Instant Withdrawal</span>
              </>
            )}
          </button>

          {/* Withdrawal Instructions */}
          <div className="mt-6 bg-coffee-50 rounded-xl p-4 border border-coffee-200">
            <h4 className="font-bold text-coffee-800 mb-3">Withdrawal Instructions</h4>
            <ul className="space-y-2 text-sm text-coffee-700">
              <li className="flex items-start gap-2">
                <span className="text-coffee-brown font-bold">•</span>
                <span>Minimum withdrawal amount is RM 12</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coffee-brown font-bold">•</span>
                <span>Withdrawals are 24/7, multiple per day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coffee-brown font-bold">•</span>
                <span>Withdrawal fee is 16%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coffee-brown font-bold">•</span>
                <span>Arrival time about 2 hours; depends on bank</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coffee-brown font-bold">•</span>
                <span>Wrong info can cause failure</span>
              </li>
            </ul>
          </div>

          {/* QR Code Display */}
          {qrCode && (
            <div className="mt-6 text-center">
              <div className="bg-coffee-50 rounded-xl p-6 inline-block">
                <p className="text-sm text-coffee-600 mb-3">CoffeePay QR Code</p>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-lg font-bold text-coffee-800 mt-3">RM {amount}</p>
                <p className="text-xs text-coffee-500 mt-2">Scan to complete payment</p>
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

        {/* Withdrawal History */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-coffee-800 mb-4">Withdrawal History</h2>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-coffee-400">
              <p>No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-coffee-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-coffee-800">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-coffee-800">Amount</th>
                    <th className="text-center py-3 px-4 font-semibold text-coffee-800">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-coffee-800">Time Left</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((wd) => (
                    <tr key={wd.id} className="border-b border-coffee-100">
                      <td className="py-3 px-4 text-coffee-700">
                        {new Date(wd.requestDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-coffee-800">
                        RM {wd.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          wd.status === 'approved' ? 'bg-green-100 text-green-800' :
                          wd.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {wd.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-coffee-600">
                        {wd.status === 'pending' ? getTimeRemaining(wd.requestDate) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

