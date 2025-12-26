'use client';

import Link from 'next/link';
import BottomTabBar from '@/components/BottomTabBar';

export default function CustomerServicePage() {
  const telegramSupport = process.env.NEXT_PUBLIC_TELEGRAM_SUPPORT_URL || process.env.NEXT_PUBLIC_TELEGRAM_ADMIN || 'https://t.me/coffeesupport';
  const telegramChannel = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL_URL || process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || 'https://t.me/coffeerewards';
  const telegramGroup = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_URL || process.env.NEXT_PUBLIC_TELEGRAM_GROUP || 'https://t.me/coffeerewardsgroup';

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-coffee-50 via-coffee-100 to-coffee-200 pb-28 swipeable">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-coffee-brown to-coffee-700 text-white p-6 shadow-xl">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/home" className="text-sm hover:text-coffee-200 transition flex items-center gap-2">
            <span>←</span>
            <span>Back</span>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>💬</span>
            <span>Customer Service</span>
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Enhanced Header Image */}
      <div className="h-56 bg-gradient-to-br from-coffee-brown via-coffee-600 to-coffee-700 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24"></div>
        <div className="text-8xl text-white opacity-90 relative z-10 animate-pulse">☕</div>
      </div>

      <div className="container mx-auto px-4 py-6 -mt-8">
        {/* Enhanced Top Info Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-2 border-coffee-100">
          <div className="text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-coffee-800 font-semibold text-lg">
              Contact our team via Telegram for any questions about your account or deposits/withdrawals.
            </p>
          </div>
        </div>

        {/* Enhanced Contact List */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-2 border-coffee-100">
          <h3 className="text-xl font-bold text-coffee-800 mb-4 px-2">📱 Contact Channels</h3>
          <div className="space-y-3">
            {[
              { href: telegramSupport, label: 'Telegram (Support)', icon: '📩', color: 'from-blue-400 to-blue-600' },
              { href: telegramChannel, label: 'Telegram Channel', icon: '📢', color: 'from-purple-400 to-purple-600' },
              { href: telegramGroup, label: 'Telegram Group', icon: '👥', color: 'from-green-400 to-green-600' },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-gradient-to-r bg-coffee-50 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group border-2 border-coffee-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center text-2xl shadow-md`}>
                    {item.icon}
                  </div>
                  <span className="font-bold text-coffee-800 group-hover:text-coffee-brown transition text-lg">{item.label}</span>
                </div>
                <span className="text-coffee-600 text-2xl group-hover:text-coffee-brown group-hover:translate-x-2 transition">→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Enhanced Service Info */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 border-2 border-coffee-100">
          <h3 className="text-xl font-bold text-coffee-800 mb-4 flex items-center gap-2">
            <span>⏰</span>
            <span>Online customer service time: 9:00–20:00</span>
          </h3>
          <div className="space-y-3">
            {[
              'If Telegram does not open, please try a different browser or device',
              'For any questions, contact our online customer service and they will assist you',
              'In busy periods, replies may be delayed; thank you for your patience',
              'To learn more or earn more, join our official Telegram channel'
            ].map((rule, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition">
                <span className="text-coffee-brown font-bold text-lg">{index + 1}.</span>
                <span className="text-sm text-coffee-700 flex-1 pt-0.5">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}

