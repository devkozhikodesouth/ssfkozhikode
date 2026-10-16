"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TouchGlowEffect from "./TouchGlowEffect";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Admin and the standalone Fund Challenge app render without site chrome
  const isAdminRoute =
    pathname.startsWith("/adminlogin") || pathname.startsWith("/fundchallenge");

  return (
    <>
      {!isAdminRoute && <TouchGlowEffect />}
      {!isAdminRoute && <Navbar />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  );
}


