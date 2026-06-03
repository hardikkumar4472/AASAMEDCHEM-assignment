"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("SELLER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected connection error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans text-slate-800">
      <div className="flex-1 bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900 text-white p-8 md:p-16 flex flex-col justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">AasaMedChem</h1>
            <p className="text-xs text-teal-300">Solutions. Trust. Innovation.</p>
          </div>
        </div>

        <div className="my-12 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Join AasaMedChem Today
          </h2>
          <p className="text-teal-100 text-base md:text-lg leading-relaxed mb-10">
            Create an account as a Seller or Buyer to manage and request pharmaceutical orders with absolute precision.
          </p>

          <div className="space-y-6">
            {[
              { title: "Seller Accounts", desc: "Browse catalog products, convert units, and submit quotations" },
              { title: "Buyer Accounts", desc: "Inspect chemical catalog items, request purchases, and track histories" },
              { title: "Calculations Engine", desc: "Support for weight, volume, and count units at 10-decimal precision" }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="w-6 h-6 rounded-full bg-teal-800/80 border border-teal-700 flex items-center justify-center text-xs font-bold text-emerald-400 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                  <p className="text-teal-200 text-xs">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-teal-300">
          © {new Date().getFullYear()} AasaMedChem. All rights reserved.
        </div>
      </div>

      <div className="flex-1 bg-slate-50 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl border border-gray-100/50">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-teal-950">Create Account</h3>
            <p className="text-sm text-gray-500 mt-1">Register your profile credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-lg text-xs">
                Registration successful! Redirecting to login...
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="enter your full name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="enter your email address"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="enter password (min 6 characters)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("SELLER")}
                  className={`py-2 px-3 border rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    role === "SELLER"
                      ? "bg-teal-50 border-teal-650 text-teal-950 font-extrabold border-teal-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Seller / Agent
                </button>
                <button
                  type="button"
                  onClick={() => setRole("BUYER")}
                  className={`py-2 px-3 border rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    role === "BUYER"
                      ? "bg-teal-50 border-teal-650 text-teal-950 font-extrabold border-teal-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Buyer Client
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center mt-3">
              <p className="text-xs text-gray-500">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-700 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-950 font-semibold">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
