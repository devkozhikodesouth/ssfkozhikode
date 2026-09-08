"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from URL.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Server connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl shadow-purple-950/5">
      {success ? (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Password Updated!</h3>
          <p className="text-slate-600 text-sm">
            Your admin account password has been updated securely.
          </p>

          <Link
            href="/adminlogin/login"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-800 hover:to-indigo-700 shadow-lg shadow-purple-600/25 transition-all"
          >
            <span>Login with New Password</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {!token && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-medium">
              ⚠️ No reset token found in URL. Please check your reset link.
            </div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-2xl pl-4 pr-12 py-3.5 bg-slate-50/90 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition text-base sm:text-sm font-medium"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-2xl px-4 py-3.5 bg-slate-50/90 border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition text-base sm:text-sm font-medium"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-700 via-indigo-600 to-emerald-600 hover:from-purple-800 hover:to-emerald-500 shadow-lg shadow-purple-600/25 transition-all duration-300 touch-manipulation cursor-pointer ${
              loading || !token ? "opacity-60 cursor-not-allowed" : "active:scale-95"
            }`}
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[100dvh] bg-slate-50 [background:radial-gradient(ellipse_65%_50%_at_50%_0%,#F3E8FF_0%,#EEF2FF_40%,#F8FAFC_70%,#F1F5F9_100%)] flex items-center justify-center p-4 sm:p-6 relative overflow-y-auto text-slate-800 selection:bg-purple-600 selection:text-white">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-200/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-emerald-500 p-0.5 shadow-xl shadow-purple-600/20 mb-4 ring-4 ring-purple-100">
            <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Set a new secure password for your admin account
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-purple-700 font-medium">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
