'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to home after 5 seconds
    const timer = setTimeout(() => {
      router.push('/home');
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-green-100 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Payment Successful!</h2>
        <p className="text-stone-500 mb-8">Your wallet balance will be updated automatically within a few minutes.</p>
        
        <div className="space-y-3">
          <Link 
            href="/home" 
            className="block w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition"
          >
            Back to Home
          </Link>
          <p className="text-xs text-stone-400">Redirecting to home in 5 seconds...</p>
        </div>
      </div>
    </div>
  );
}
