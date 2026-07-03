"use client";

import { useEffect } from "react";

export default function Pay() {
  const upiUrl =
    "upi://pay?pa=work.me702566@okaxis&pn=SSF%20Kozhikode&am=111&cu=INR&tn=hadya%20Fee";

  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = upiUrl;
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <p>If the payment app doesn't open automatically, tap below.</p>
      <a href={upiUrl}>Open Payment App</a>
    </div>
  );
}