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
    <div className="fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-xl border-t-2 border-coffee-200/50 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-bottom">
      {/* iOS notch support */}
      <div className="absolute bottom-0 left-0 right-0 h-[env(safe-area-inset-bottom)] bg-white/98"></div>
      
      <div className="flex justify-around items-center min-h-[72px] py-2 px-2 pb-safe relative">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            href={tab.path}
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[64px] transition-all duration-300 touch-manipulation relative group ${
              isActive(tab.path)
                ? 'text-coffee-brown'
                : 'text-coffee-400 active:text-coffee-600'
            }`}
          >
            {/* Active indicator background */}
            {isActive(tab.path) && (
              <div className="absolute inset-0 bg-coffee-50/50 rounded-2xl -mx-2 -my-1 animate-fadeIn"></div>
            )}
            
            {/* Icon with better touch target */}
            <div className={`relative z-10 text-3xl sm:text-4xl mb-1 transition-all duration-300 transform ${
              isActive(tab.path) 
                ? 'scale-110 animate-bounce' 
                : 'group-active:scale-95'
            }`}>
              {tab.icon}
            </div>
            
            {/* Label */}
            <span className={`relative z-10 text-[11px] sm:text-xs font-bold transition-all duration-300 ${
              isActive(tab.path) ? 'text-coffee-brown' : 'text-coffee-500'
            }`}>
              {tab.label}
            </span>
            
            {/* Active indicator dot */}
            {isActive(tab.path) && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-coffee-brown rounded-full animate-pulse"></div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

