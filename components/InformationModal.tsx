'use client';

interface InformationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InformationModal({ isOpen, onClose }: InformationModalProps) {
  if (!isOpen) return null;

  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/coffeerewards';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-coffee-brown text-white p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-center">Information</h2>
        </div>
        
        <div className="p-6 space-y-4">
          <ul className="space-y-3 text-coffee-800">
            <li className="flex items-start gap-2">
              <span className="text-coffee-brown font-bold">•</span>
              <span>Welcome to the platform.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-coffee-brown font-bold">•</span>
              <span>Registration bonus: RM 12.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-coffee-brown font-bold">•</span>
              <span>Referral bonus: Level 1: 28%, Level 2: 1%, Level 3: 1%.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-coffee-brown font-bold">•</span>
              <span>24/7 deposit and withdrawal.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-coffee-brown font-bold">•</span>
              <span>Invest in coffee production lines and earn stable daily returns.</span>
            </li>
          </ul>

          <div className="space-y-3 pt-4">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-500 text-white py-3 rounded-lg font-semibold text-center hover:bg-blue-600 transition"
            >
              Click to join the official Telegram group
            </a>
            <button
              onClick={onClose}
              className="block w-full bg-coffee-brown text-white py-3 rounded-lg font-semibold hover:bg-coffee-700 transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

