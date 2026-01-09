"use client";
import { useState } from 'react';

export default function RechargePage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (amount: number) => {
    setLoading(true);
    try {
      // Replace 'USER_ID_123' with your actual logged-in user ID variable
      const userId = "USER_ID_123"; 

      const response = await fetch('/api/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // 👈 THIS PREVENTS THE 400 ERROR
        },
        body: JSON.stringify({
          amount: amount,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Secure Checkout
        window.location.href = data.url;
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Payment Click Error:", error);
      alert("Failed to connect to payment server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Recharge Credits</h1>
      
      <button
        disabled={loading}
        onClick={() => handlePayment(50)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
      >
        {loading ? "Processing..." : "Pay RM 50 (FPX / Card)"}
      </button>

      <p className="mt-4 text-sm text-gray-500">
        Secure payment via Stripe Malaysia
      </p>
    </div>
  );
}