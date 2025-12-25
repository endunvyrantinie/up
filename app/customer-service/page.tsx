'use client';

import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function CustomerServicePage() {
  const telegramSupport = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || process.env.NEXT_PUBLIC_TELEGRAM_ADMIN || 'https://t.me/coffeesupport';
  const telegramChannel = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/coffeerewards';
  const telegramGroup = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || process.env.NEXT_PUBLIC_TELEGRAM_GROUP || 'https://t.me/coffeerewardsgroup';

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-100 to-coffee-200 pb-20">
      <div className="bg-coffee-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:underline">
            ← Back
          </Link>
          <h1 className="text-xl font-bold">Customer Service</h1>
          <div></div>
        </div>
      </div>

      {/* Header Image */}
      <div className="h-48 bg-gradient-to-br from-coffee-brown to-coffee-700 flex items-center justify-center">
        <div className="text-6xl text-white opacity-80">☕</div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Top Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <p className="text-coffee-700 text-center">
            Contact our team via Telegram for any questions about your account or deposits/withdrawals.
          </p>
        </div>

        {/* Contact List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="space-y-4">
            <a
              href={telegramSupport}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📩</span>
                <span className="font-semibold text-coffee-800">Telegram (Support)</span>
              </div>
              <span className="text-coffee-600 text-xl">→</span>
            </a>

            <a
              href={telegramChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📢</span>
                <span className="font-semibold text-coffee-800">Telegram Channel</span>
              </div>
              <span className="text-coffee-600 text-xl">→</span>
            </a>

            <a
              href={telegramGroup}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg hover:bg-coffee-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">👥</span>
                <span className="font-semibold text-coffee-800">Telegram Group</span>
              </div>
              <span className="text-coffee-600 text-xl">→</span>
            </a>
          </div>
        </div>

        {/* Service Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-coffee-800 mb-4">Online customer service time: 9:00–20:00</h3>
          <div className="space-y-2 text-sm text-coffee-700">
            <p>• If Telegram does not open, please try a different browser or device.</p>
            <p>• For any questions, contact our online customer service and they will assist you.</p>
            <p>• In busy periods, replies may be delayed; thank you for your patience.</p>
            <p>• To learn more or earn more, join our official Telegram channel.</p>
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

