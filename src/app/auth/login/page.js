"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(errorParam === "AccessDenied" ? "Access Denied." : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else if (session?.user?.role === "SELLER") {
          router.push("/seller");
        } else if (session?.user?.role === "BUYER") {
          router.push("/buyer");
        } else {
          setError("No role associated with account");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
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
            Inventory & Order Management System
          </h2>
          <p className="text-teal-100 text-base md:text-lg leading-relaxed mb-10">
            A smart platform for pharmaceutical product management, unit conversion, quotations, and orders.
          </p>

          <div className="space-y-6">
            {[
              { title: "Role-Based Access", desc: "Dedicated Admin & Seller panels" },
              { title: "Multi-Unit Support", desc: "Support for weight, volume, and count units" },
              { title: "High Precision", desc: "Accurate pricing & conversions" },
              { title: "Real-time Insights", desc: "Inventory tracking, orders & analytics" }
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
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-teal-950">Welcome Back</h3>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="enter your email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs text-teal-700 hover:underline">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                placeholder="enter your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs text-gray-600 select-none">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Don't have an account?{" "}
                <a href="#" className="text-teal-700 font-semibold hover:underline">
                  Contact Admin
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
