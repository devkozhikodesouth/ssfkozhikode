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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-white">
      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-amber-500 p-0.5 shadow-xl shadow-purple-600/30 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-purple-100 to-amber-200 bg-clip-text text-transparent">
            Forgot Password
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate a secure JWT reset link for your admin account
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-purple-500/20 shadow-2xl">
          {message ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Reset Link Ready</h3>
              <p className="text-slate-300 text-sm">{message}</p>

              {resetUrl && (
                <div className="p-4 rounded-2xl bg-slate-800/90 border border-purple-500/30 space-y-3">
                  <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">
                    Direct Reset Link
                  </p>
                  <p className="text-xs font-mono break-all text-amber-300 bg-slate-950 p-3 rounded-xl border border-purple-500/20">
                    {resetUrl}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={copyLink}
                      className="flex-1 py-2.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-200 text-xs font-semibold border border-purple-500/30 flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                    <Link
                      href={resetUrl}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center"
                    >
                      Proceed to Reset
                    </Link>
                  </div>
                </div>
              )}

              <Link
                href="/adminlogin/login"
                className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white pt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-200/80 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@gmail.com"
                  className="w-full rounded-2xl px-4 py-3.5 bg-slate-800/90 border border-purple-500/30 text-white outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 shadow-lg shadow-purple-600/30 transition-all duration-300 ${
                  loading ? "opacity-60 cursor-not-allowed" : "active:scale-95"
                }`}
              >
                {loading ? "Generating Link..." : "Request Reset Link"}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/adminlogin/login"
                  className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
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
