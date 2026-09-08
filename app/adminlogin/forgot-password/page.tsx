"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Copy } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(data.message || "Password reset token generated!");
        if (data.resetUrl) setResetUrl(data.resetUrl);
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("Server connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (!resetUrl) return;
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 [background:radial-gradient(ellipse_65%_50%_at_50%_0%,#F3E8FF_0%,#EEF2FF_40%,#F8FAFC_70%,#F1F5F9_100%)] flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto text-slate-800 selection:bg-purple-600 selection:text-white">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-purple-600/20 mb-4 ring-4 ring-purple-100">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center shadow-inner">
              <KeyRound className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate a secure JWT reset link for your admin account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-purple-950/5">
          {message ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Reset Link Ready</h3>
              <p className="text-slate-600 text-sm">{message}</p>

              {resetUrl && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                    Direct Reset Link
                  </p>
                  <p className="text-xs font-mono break-all text-amber-800 bg-amber-50/80 p-3 rounded-xl border border-amber-200">
                    {resetUrl}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={copyLink}
                      className="flex-1 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <Link
                      href={resetUrl}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-purple-600/20 transition"
                    >
                      Proceed to Reset
                    </Link>
                  </div>
                </div>
              )}

              <Link
                href="/adminlogin/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 hover:text-purple-900 pt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  Admin Email
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-600 hover:from-purple-800 hover:to-amber-500 shadow-lg shadow-purple-600/25 transition-all duration-300 cursor-pointer ${
                  loading ? "opacity-60 cursor-not-allowed" : "active:scale-95"
                }`}
              >
                {loading ? "Generating Link..." : "Request Reset Link"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/adminlogin/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 hover:text-purple-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Admin Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
