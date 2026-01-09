"use client";

export default function RechargePage() {
  const handleStripePayment = async (amount: number) => {
    try {
      const response = await fetch('/api/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: amount, 
          userId: "current_user_id" // Replace with your actual auth user ID
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("Failed to create payment session: " + data.error);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with the connection.");
    }
  };

  return (
    <div className="p-10">
      <h1>Recharge Coffee Credits</h1>
      <button 
        onClick={() => handleStripePayment(50)} 
        className="bg-blue-600 text-white p-3 rounded"
      >
        Pay RM50 via Stripe (FPX/Card)
      </button>
    </div>
  );
}