"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRedirecting(true);
        const target = data.redirect || "/adminlogin/gc26/totaldelegates";
        router.replace(target);
        router.refresh();
        setTimeout(() => {
          window.location.replace(target);
        }, 800);
        return;
      } else {
        setError(data.message || "Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Unable to connect to authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 [background:radial-gradient(ellipse_65%_50%_at_50%_0%,#F3E8FF_0%,#EEF2FF_40%,#F8FAFC_70%,#F1F5F9_100%)] flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto text-slate-800 selection:bg-purple-600 selection:text-white">
      {/* Subtle ambient light glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-800 p-0.5 shadow-xl shadow-purple-600/20 mb-4 ring-4 ring-purple-100">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-8 h-8 text-purple-700" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Portal
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            <span className="font-cooper text-purple-700 font-bold">SSF</span> Kozhikode South Management Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-purple-950/5">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-600" />
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@gmail.com"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-2xl px-4 py-3.5 bg-slate-50/90 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition text-base sm:text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Password
                </label>
                <Link
                  href="/adminlogin/forgot-password"
                  className="text-xs text-purple-600 hover:text-purple-800 transition font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full rounded-2xl pl-4 pr-12 py-3.5 bg-slate-50/90 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition text-base sm:text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || redirecting}
              className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 shadow-lg shadow-purple-600/25 transition-all duration-300 flex items-center justify-center gap-2 touch-manipulation cursor-pointer ${
                loading || redirecting ? "opacity-75 cursor-not-allowed" : "active:scale-95"
              }`}
            >
              {(loading || redirecting) && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>
                {redirecting
                  ? "Opening Dashboard..."
                  : loading
                  ? "Authenticating..."
                  : "Sign In to Admin"}
              </span>
              {!loading && !redirecting && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {/* Footer info */}
     
      </div>
    </div>
  );
}
