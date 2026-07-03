"use client";

import { useEffect } from "react";

export default function Pay() {
  const amount = "111";
  const upiUrl =
    "upi://pay?pa=work.me702566@okaxis&pn=SSF%20Kozhikode&am=111&cu=INR&tn=hadya%20Fee";

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = upiUrl;
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl p-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            💳
          </div>

          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            SSF Kozhikode
          </h1>

          <p className="mt-2 text-gray-500">Hadya For Sahithyotsav</p>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            <p className="text-sm text-gray-500">Amount</p>
            <p className="mt-1 text-4xl font-bold">₹{amount}</p>
          </div>

          <a
            href={upiUrl}
            className="mt-8 block w-full rounded-2xl bg-green-600 px-5 py-4 text-center text-lg font-semibold text-white hover:bg-green-700"
          >
            Pay with UPI
          </a>

          <p className="mt-4 text-sm text-gray-500">
            Opening your payment app automatically...
          </p>

          <p className="mt-2 text-xs text-gray-400">
            If Google Pay, PhonePe or Paytm doesn't open automatically,
            tap the button above.
          </p>
        </div>
      </div>
    </div>
  );
}