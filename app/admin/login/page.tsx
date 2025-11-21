"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    console.log("🟢 Sending login request...");
  
    try {
      const res = await fetch("/api/login/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        redirect: "manual", // 👈 prevent fetch from auto-following redirects
        body: JSON.stringify({ email, password }),
      });
  
      console.log("📥 Response status:", res.status);
  
      // 🟡 When backend sends a redirect, fetch does not follow it automatically
      if (res.type === "opaqueredirect" || res.status === 0) {
        console.log("🔁 Redirect detected (opaqueredirect) — manually navigating...");
        window.location.href = "/admin/dashboard";
        return;
      }
  
      if (res.redirected) {
        console.log("🔁 Redirect detected:", res.url);
        window.location.href = res.url;
        return;
      }
  
      if (res.ok) {
        console.log("✅ Login success, redirecting manually...");
        window.location.href = "/admin/dashboard";
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("❌ Login failed:", data);
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("🔥 Login request error:", err);
      setError("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };
  const addTickets = async () => {
  try {
    const res = await fetch("/api/migrate", { method: "PATCH" });
    const data = await res.json();
    alert(data.message || "Done");
  } catch (error) {
    console.error(error);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-700">
          Admin Login
        </h2>
        
<button
  onClick={addTickets}
  className="bg-green-600 text-white px-4 py-2 rounded"
>
  Add Ticket Numbers
</button>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 p-2 mb-6 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 rounded-lg transition-colors duration-200`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
