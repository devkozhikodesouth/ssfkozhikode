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
    <div className="bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-purple-500/20 shadow-2xl">
      {success ? (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">Password Updated!</h3>
          <p className="text-slate-300 text-sm">
            Your admin account password has been updated securely.
          </p>

          <Link
            href="/adminlogin/login"
            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all"
          >
            <span>Login with New Password</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {!token && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-medium">
              ⚠️ No reset token found in URL. Please check your reset link.
            </div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-200/80 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                className="w-full rounded-2xl pl-4 pr-12 py-3.5 bg-slate-800/90 border border-purple-500/30 text-white outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-purple-200/80 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              className="w-full rounded-2xl px-4 py-3.5 bg-slate-800/90 border border-purple-500/30 text-white outline-none focus:ring-2 focus:ring-purple-500 transition text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className={`w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 shadow-lg shadow-purple-600/30 transition-all duration-300 ${
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-white">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-0.5 shadow-xl shadow-purple-600/30 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Lock className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white via-purple-100 to-emerald-200 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Set a new secure password for your admin account
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-purple-300">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
