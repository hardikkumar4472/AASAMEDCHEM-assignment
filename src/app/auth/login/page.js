"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, Users, CheckCircle2 } from "lucide-react";

function LoginForm() {
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
        setError("Invalid credentials or role mismatch");
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
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans overflow-hidden">
      <div className="flex-1 bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-950 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_45%)]"></div>
        <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center space-x-3 z-10 animate-fade-in">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-emerald-500/20">
            A
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">AasaMedChem</h1>
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Solutions. Trust. Innovation.</p>
          </div>
        </div>

        <div className="my-auto py-12 max-w-xl z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] animate-slide-up">
            Inventory & <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Order Management</span> <br />
            System
          </h2>
          <p className="text-teal-100/80 text-base md:text-lg leading-relaxed max-w-md animate-slide-up delay-100">
            A smart platform for pharmaceutical product management, unit conversion, quotations, and orders.
          </p>

          <div className="space-y-4 pt-4 animate-slide-up delay-200">
            {[
              { title: "Role-Based Access", desc: "Admin & Seller panels" },
              { title: "Multi-Unit Support", desc: "g, kg, L, mL, Items" },
              { title: "High Precision", desc: "Accurate pricing & conversions" },
              { title: "Real-time Insights", desc: "Inventory, orders & analytics" }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all hover:bg-white/10 hover:-translate-y-0.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                  <p className="text-teal-200/60 text-xs">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-teal-300/60 z-10 pt-6 border-t border-white/5 flex justify-between items-center">
          <span>© {new Date().getFullYear()} AasaMedChem.</span>
          <span>Version 1.0.0</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-50 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100/80 animate-scale-in relative z-10">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-3xl font-black text-cyan-950 tracking-tight">Welcome Back</h3>
            <p className="text-sm text-slate-400 mt-2 font-medium">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block tracking-wide uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent focus:bg-white transition-all font-medium"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 block tracking-wide uppercase">
                  Password
                </label>
                <a href="#" className="text-xs text-teal-600 hover:text-teal-700 font-bold hover:underline transition-all">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent focus:bg-white transition-all font-medium"
                  placeholder="Enter your password"
                />
              </div>
            </div>


            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4.5 w-4.5 text-teal-600 focus:ring-teal-500 border-slate-350 rounded-lg cursor-pointer transition-all"
              />
              <label htmlFor="remember_me" className="ml-2.5 block text-xs text-slate-500 font-semibold select-none cursor-pointer">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-800 to-cyan-900 hover:from-teal-900 hover:to-cyan-950 text-white rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-teal-900/20 hover:shadow-teal-900/30 transition-all disabled:opacity-50 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="text-center mt-6 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 font-semibold">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-all">
                  Register Now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-teal-950 font-bold animate-pulse">Loading auth credentials...</div>}>
      <LoginForm />
    </Suspense>
  );
}
