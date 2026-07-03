"use client";

import { useEffect } from "react";

export default function Pay() {
  useEffect(() => {
    window.location.href =
      "upi://pay?pa=shafeequemk80-2@okhdfcbank&pn=SSF%20Kozhikode&am=111&cu=INR&tn=hadya%20Fee";
  }, []);

  return <p>Opening payment app...</p>;
}