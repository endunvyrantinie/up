'use client';

import Link from 'next/link';

export default function FailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-red-100 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">❌</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Payment Failed</h2>
        <p className="text-stone-500 mb-8">Something went wrong with your transaction. Please try again or contact support.</p>
        
        <div className="space-y-3">
          <Link 
            href="/recharge" 
            className="block w-full bg-stone-900 text-white p-4 rounded-xl font-bold hover:bg-stone-800 transition"
          >
            Try Again
          </Link>
          <Link 
            href="/home" 
            className="block w-full bg-stone-100 text-stone-600 p-4 rounded-xl font-bold hover:bg-stone-200 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
