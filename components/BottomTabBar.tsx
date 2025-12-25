'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/product', label: 'Product', icon: '☕' },
    { path: '/team', label: 'Team', icon: '👥' },
    { path: '/mine', label: 'Mine', icon: '👤' },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t-2 border-coffee-200 z-50 shadow-2xl">
      <div className="flex justify-around items-center h-18 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${
              isActive(tab.path)
                ? 'text-coffee-brown transform scale-110'
                : 'text-coffee-400 hover:text-coffee-600'
            }`}
          >
            <div className={`text-3xl mb-1 transition-all duration-300 ${
              isActive(tab.path) ? 'animate-bounce' : ''
            }`}>
              {tab.icon}
            </div>
            <span className={`text-xs font-bold transition-all duration-300 ${
              isActive(tab.path) ? 'text-coffee-brown' : ''
            }`}>
              {tab.label}
            </span>
            {isActive(tab.path) && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-coffee-brown rounded-t-full"></div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

