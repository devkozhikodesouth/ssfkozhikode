"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { usePathname } from "next/navigation";

const Navbar: React.FC = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        navbarOpen
      ) {
        setNavbarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navbarOpen]);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Grand Conclave 26", href: "/grandconclave26" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-slate-200 py-3.5 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" width={32} height={32} alt="SSF Logo" className="drop-shadow-sm" />
          <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
            SSF Kozhikode South
          </h2>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-slate-700">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`transition text-sm sm:text-base font-medium ${
                pathname === item.href
                  ? "text-purple-600 font-medium border-b-2 border-purple-600 pb-1"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="text-slate-800 p-2 rounded-xl focus:outline-none bg-white border border-slate-200 shadow-sm"
            aria-label="Toggle Menu"
          >
            <Icon icon={navbarOpen ? "tabler:x" : "tabler:menu-2"} width={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer (Solid light, no blur) */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white text-slate-900 shadow-2xl transform transition-transform duration-300 ${
          navbarOpen ? "translate-x-0" : "translate-x-full"
        } z-50 border-l border-slate-200 flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" width={24} height={24} alt="SSF Logo" />
            <h2 className="text-base font-medium text-slate-900">SSF Kozhikode</h2>
          </div>
          <button
            onClick={() => setNavbarOpen(false)}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-200/60 transition"
            aria-label="Close Menu"
          >
            <Icon icon="tabler:x" width={22} />
          </button>
        </div>

        <nav className="flex flex-col items-start p-4 space-y-2 text-base">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setNavbarOpen(false)}
              className={`w-full px-3.5 py-2.5 rounded-xl transition font-medium text-sm sm:text-base ${
                pathname === item.href
                  ? "text-purple-600 bg-purple-50 font-medium border-l-4 border-purple-600 pl-3"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay (Clean background, no blur) */}
      {navbarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity"
          onClick={() => setNavbarOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
