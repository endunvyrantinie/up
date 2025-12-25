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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-coffee-200 z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive(tab.path)
                ? 'text-coffee-brown'
                : 'text-coffee-400'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-xs font-semibold">{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

