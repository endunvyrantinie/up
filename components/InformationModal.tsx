'use client';

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InformationModal({ isOpen, onClose }: InformationModalProps) {
  if (!isOpen) return null;

  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/coffeerewards';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideUp border-2 border-coffee-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-coffee-brown to-coffee-600 text-white p-6 rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="text-center">
              <div className="text-5xl mb-2">☕</div>
              <h2 className="text-2xl font-bold">Welcome Information</h2>
              <p className="text-white/90 text-sm mt-1">Important details about our platform</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          <ul className="space-y-4 text-coffee-800">
            <li className="flex items-start gap-3 p-3 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition">
              <span className="text-2xl text-coffee-brown mt-0.5">👋</span>
              <span className="flex-1 pt-1">Welcome to the platform.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition">
              <span className="text-2xl text-green-600 mt-0.5">🎁</span>
              <span className="flex-1 pt-1"><strong className="text-green-700">Registration bonus: RM 12.</strong></span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
              <span className="text-2xl text-blue-600 mt-0.5">👥</span>
              <span className="flex-1 pt-1"><strong className="text-blue-700">Referral bonus:</strong> Level 1: 28%, Level 2: 1%, Level 3: 1%.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
              <span className="text-2xl text-purple-600 mt-0.5">💳</span>
              <span className="flex-1 pt-1">24/7 deposit and withdrawal.</span>
            </li>
            <li className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition">
              <span className="text-2xl text-amber-600 mt-0.5">☕</span>
              <span className="flex-1 pt-1">Invest in coffee production lines and earn stable daily returns.</span>
            </li>
          </ul>

          <div className="space-y-3 pt-2">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>📱</span>
              <span>Join Official Telegram Group</span>
            </a>
            <button
              onClick={onClose}
              className="block w-full bg-gradient-to-r from-coffee-brown to-coffee-600 text-white py-4 rounded-xl font-bold hover:from-coffee-600 hover:to-coffee-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

