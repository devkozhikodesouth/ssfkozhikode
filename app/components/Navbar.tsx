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
    { name: "Grand Gathering", href: "/grandgathering" },
  ];

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-transparent py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" width={32} height={32} alt="SSF Logo" className="drop-shadow" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            SSF Kozhikode South
          </h2>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-white">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`transition text-sm font-semibold ${
                pathname === item.href
                  ? "text-purple-400 font-bold border-b-2 border-purple-400 pb-1"
                  : "text-slate-300 hover:text-white"
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
            className="text-white p-2 rounded-lg focus:outline-none bg-slate-950/60 backdrop-blur-md border border-purple-500/20"
            aria-label="Toggle Menu"
          >
            <Icon icon={navbarOpen ? "tabler:x" : "tabler:menu-2"} width={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        ref={mobileMenuRef}
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-slate-950 text-white shadow-2xl transform transition-transform duration-300 ${
          navbarOpen ? "translate-x-0" : "translate-x-full"
        } z-50 border-l border-purple-500/20`}
      >
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <h2 className="text-base font-bold text-white">SSF Kozhikode South</h2>
          <button
            onClick={() => setNavbarOpen(false)}
            className="text-slate-400 hover:text-white"
            aria-label="Close Menu"
          >
            <Icon icon="tabler:x" width={24} />
          </button>
        </div>

        <nav className="flex flex-col items-start p-4 space-y-4 text-base">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setNavbarOpen(false)}
              className={`w-full py-2 transition font-medium ${
                pathname === item.href
                  ? "text-purple-400 font-bold border-l-4 border-purple-500 pl-3"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {navbarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setNavbarOpen(false)}
        />
      )}
    </header>
  );
};

export default Navbar;
