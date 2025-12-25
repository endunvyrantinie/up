'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Notification from '@/components/Notification';
import { Transaction, ReferralTreeItem } from '@/lib/db';

interface User {
  id: string;
  username: string;
  email: string;
  referralCode: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  referralCount: number;
  totalCommissions: number;
}

interface ReferralTree {
  level1: ReferralTreeItem[];
  level2: ReferralTreeItem[];
  level3: ReferralTreeItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'referrals' | 'withdraw' | 'transactions'>('referrals');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUser();

    // Auto-refresh every 30 seconds
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchUser();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 flex items-center justify-center">
        <div className="text-coffee-800 text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/?v=${user.referralCode}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 pb-20">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="bg-coffee-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">☕ Coffee Rewards</h1>
          <button onClick={handleLogout} className="text-sm hover:underline">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Simple Balance Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-coffee-600 text-sm mb-2">Bonus Balance</p>
            <p className="text-4xl font-bold text-coffee-800">${user.balance.toFixed(2)}</p>
          </div>
          
          <div className="bg-coffee-50 rounded-lg p-3">
            <p className="text-xs text-coffee-600 mb-2">🔗 Your Referral Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-white text-coffee-900 text-sm px-3 py-2 rounded border border-coffee-300 focus:outline-none"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(referralLink);
                  setNotification({ message: 'Link copied!', type: 'success' });
                }}
                className="bg-coffee-600 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-coffee-700 transition"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-sm text-coffee-600 mb-2">Referral Count</p>
            <p className="text-3xl font-bold text-coffee-800">{user.referralCount || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-sm text-coffee-600 mb-2">Total Commissions</p>
            <p className="text-3xl font-bold text-green-600">${(user.totalCommissions || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs - Simplified */}
        <div className="bg-white rounded-2xl shadow-xl mb-6">
          <div className="flex border-b border-coffee-200 overflow-x-auto">
            {(['referrals', 'withdraw', 'transactions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-semibold capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-coffee-600 border-b-2 border-coffee-600'
                    : 'text-coffee-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'withdraw' && <WithdrawTab user={user} onUpdate={fetchUser} />}
            {activeTab === 'referrals' && <ReferralsTab user={user} referralLink={referralLink} />}
            {activeTab === 'transactions' && <TransactionsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}


function WithdrawTab({ user, onUpdate }: { user: User; onUpdate: () => void }) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 50) {
      alert('Minimum withdrawal is $50');
      return;
    }
    if (parseFloat(amount) > user.balance) {
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
        body: JSON.stringify({ amount: parseFloat(amount), paymentMethod, accountInfo }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Withdrawal request submitted');
        setAmount('');
        setPaymentMethod('');
        setAccountInfo('');
        onUpdate();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      alert('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-coffee-800 mb-4">Withdraw Funds</h3>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Withdrawal requests take 24 hours to process. Minimum withdrawal: $50
        </p>
      </div>
      <input
        type="number"
        placeholder="Amount (Min: $50)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
      />
      <input
        type="text"
        placeholder="Payment Method (e.g., Bank Transfer, PayPal)"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
      />
      <input
        type="text"
        placeholder="Account Information"
        value={accountInfo}
        onChange={(e) => setAccountInfo(e.target.value)}
        className="w-full px-4 py-3 border border-coffee-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 bg-white text-coffee-900 placeholder-coffee-400"
      />
      <button
        onClick={handleWithdraw}
        disabled={loading}
        className="w-full bg-coffee-600 text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Submit Withdrawal Request'}
      </button>
    </div>
  );
}

function ReferralsTab({ user, referralLink }: { user: User; referralLink: string }) {
  const [copied, setCopied] = useState(false);
  const [referralTree, setReferralTree] = useState<ReferralTree | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTree, setShowTree] = useState(false);

  useEffect(() => {
    if (showTree) {
      fetchReferralTree();
    }
  }, [showTree]);

  const fetchReferralTree = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/referrals/tree', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data) {
        setReferralTree(data);
      }
    } catch (error) {
      console.error('Failed to fetch referral tree');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-coffee-800 mb-4">Your Referral Link</h3>
      <div className="bg-coffee-50 rounded-lg p-4">
        <p className="text-sm text-coffee-600 mb-2">Share this link to earn commissions:</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-4 py-2 border border-coffee-300 rounded-lg bg-white text-sm"
          />
          <button
            onClick={copyLink}
            className="bg-coffee-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-coffee-700 transition"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-coffee-50 rounded-lg p-4">
          <p className="text-sm text-coffee-600 mb-2">Your Referral Code:</p>
          <p className="text-2xl font-bold text-coffee-800">{user.referralCode}</p>
        </div>
        <div className="bg-coffee-50 rounded-lg p-4">
          <p className="text-sm text-coffee-600 mb-2">Total Referrals:</p>
          <p className="text-2xl font-bold text-coffee-800">{user.referralCount}</p>
        </div>
      </div>

      <div className="bg-coffee-50 rounded-lg p-4">
        <p className="text-sm text-coffee-600 mb-2">Total Commissions Earned:</p>
        <p className="text-2xl font-bold text-coffee-800">${user.totalCommissions.toFixed(2)}</p>
      </div>

      <button
        onClick={() => setShowTree(!showTree)}
        className="w-full bg-coffee-200 text-coffee-800 py-3 rounded-lg font-semibold hover:bg-coffee-300 transition"
      >
        {showTree ? 'Hide' : 'Show'} Referral Tree
      </button>

      {showTree && (
        <div className="bg-white border border-coffee-200 rounded-lg p-4">
          {loading ? (
            <p className="text-center text-coffee-600">Loading...</p>
          ) : referralTree ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-coffee-800 mb-2">Level 1 Referrals ({referralTree.level1.length})</h4>
                {referralTree.level1.length > 0 ? (
                  <div className="space-y-2">
                    {referralTree.level1.map((ref) => (
                      <div key={ref.id} className="bg-coffee-50 p-2 rounded text-sm">
                        <p className="font-medium">{ref.username}</p>
                        <p className="text-coffee-600">Commission: ${ref.commission.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-coffee-400 text-sm">No level 1 referrals yet</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-coffee-800 mb-2">Level 2 Referrals ({referralTree.level2.length})</h4>
                {referralTree.level2.length > 0 ? (
                  <div className="space-y-2">
                    {referralTree.level2.map((ref) => (
                      <div key={ref.id} className="bg-coffee-50 p-2 rounded text-sm">
                        <p className="font-medium">{ref.username}</p>
                        <p className="text-coffee-600">Commission: ${ref.commission.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-coffee-400 text-sm">No level 2 referrals yet</p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-coffee-800 mb-2">Level 3 Referrals ({referralTree.level3.length})</h4>
                {referralTree.level3.length > 0 ? (
                  <div className="space-y-2">
                    {referralTree.level3.map((ref) => (
                      <div key={ref.id} className="bg-coffee-50 p-2 rounded text-sm">
                        <p className="font-medium">{ref.username}</p>
                        <p className="text-coffee-600">Commission: ${ref.commission.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-coffee-400 text-sm">No level 3 referrals yet</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-coffee-600">No referral data available</p>
          )}
        </div>
      )}
    </div>
  );
}

function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'commission':
      case 'daily_reward':
      case 'vip_return':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      default:
        return 'text-coffee-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'commission':
        return '💵';
      case 'daily_reward':
        return '🎁';
      case 'vip_return':
        return '⭐';
      default:
        return '📝';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-coffee-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-coffee-800 flex items-center gap-2">
          📜 Wallet History
        </h3>
        <button
          onClick={() => router.push('/withdraw')}
          className="bg-coffee-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-coffee-700 transition"
        >
          Withdraw →
        </button>
      </div>
      {transactions.length === 0 ? (
        <div className="text-center py-8 bg-coffee-50 rounded-lg">
          <p className="text-coffee-600">No transactions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-coffee-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-coffee-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-coffee-800">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-coffee-800">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-coffee-800">Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-coffee-800">Balance / Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => {
                  // Calculate running balance (simplified)
                  const previousBalance = index > 0 
                    ? transactions.slice(0, index).reduce((sum, t) => {
                        return sum + (t.type === 'withdrawal' ? -t.amount : t.amount);
                      }, 0)
                    : 0;
                  const currentBalance = previousBalance + (tx.type === 'withdrawal' ? -tx.amount : tx.amount);
                  
                  return (
                    <tr key={tx.id} className="border-b border-coffee-100 hover:bg-coffee-50 transition">
                      <td className="py-3 px-4 text-coffee-700">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(tx.type)}</span>
                          <span className="font-medium text-coffee-800 capitalize">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </div>
                        {tx.description && (
                          <p className="text-xs text-coffee-500 mt-1">{tx.description}</p>
                        )}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${getTypeColor(tx.type)}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}RM {tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-coffee-800">RM {currentBalance.toFixed(2)}</span>
                          {tx.type === 'withdrawal' && tx.status && (
                            <span className={`text-xs px-2 py-1 rounded mt-1 ${
                              tx.status === 'approved' ? 'bg-green-100 text-green-800' :
                              tx.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tx.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

