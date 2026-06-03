"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Layers,
  Percent,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Database,
  Lock,
  LineChart,
  UserCheck,
  Scale,
  FileText,
  Menu,
  X
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-100 py-3 px-4 sm:py-4 sm:px-6 md:px-12 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-xl">
            A
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-teal-950">AasaMedChem</h1>
            <p className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase hidden sm:block">Solutions. Trust. Innovation.</p>
          </div>
        </div>

        {/* Desktop buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 py-2 border border-slate-200 hover:border-emerald-200 rounded-lg transition-all cursor-pointer flex items-center space-x-1 bg-white"
          >
            <UserCheck className="w-4 h-4" />
            <span>Login</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm font-bold bg-teal-900 hover:bg-teal-950 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Shield className="w-4 h-4" />
            <span>Sign Up</span>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="sm:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
        </button>
      </header>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-100 px-4 py-4 space-y-3 animate-fade-in z-40 shadow-lg">
          <Link
            href="/auth/login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-sm font-bold text-slate-700 hover:text-emerald-600 px-4 py-3 border border-slate-200 hover:border-emerald-200 rounded-lg transition-all flex items-center space-x-2 bg-white"
          >
            <UserCheck className="w-4 h-4" />
            <span>Login</span>
          </Link>
          <Link
            href="/auth/login"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-sm font-bold bg-teal-900 hover:bg-teal-950 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2 justify-center"
          >
            <Shield className="w-4 h-4" />
            <span>Sign Up</span>
          </Link>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-50/30 via-white to-emerald-50/20 py-10 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 z-10">
            <div className="inline-flex items-center space-x-2 bg-emerald-50/80 border border-emerald-100 px-3 sm:px-3.5 py-1.5 rounded-full">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 tracking-wide">Trusted by Pharma. Driven by Innovation.</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-teal-950 tracking-tight leading-[1.1] max-w-2xl">
              Smart Inventory & Order Management for a <span className="text-emerald-600">Healthier Tomorrow</span>
            </h2>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl leading-relaxed">
              AasaMedChem is your all-in-one platform to manage pharmaceutical inventory, units, pricing, quotations, and orders — with accuracy, transparency, and efficiency.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
              <Link
                href="/auth/login"
                className="bg-teal-850 bg-teal-800 hover:bg-teal-900 text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer text-sm"
              >
                <UserCheck className="w-4 h-4" />
                <span>Login to Your Account</span>
              </Link>
              <Link
                href="/auth/login"
                className="border border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer text-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Create New Account</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-teal-950 text-sm">Secure & Reliable</h4>
                  <p className="text-xs text-slate-500">Role-based access & data protection</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-teal-950 text-sm">Accurate Pricing</h4>
                  <p className="text-xs text-slate-500">Precision scales with conversion</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-teal-950 text-sm">Built for Pharma</h4>
                  <p className="text-xs text-slate-500">Designed for pharmaceutical operations</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/20 to-teal-500/10 rounded-3xl blur-2xl transform rotate-6 scale-95 opacity-55"></div>
            <div className="relative w-full max-w-sm sm:max-w-md aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50">
              <img
                src="/hero.png"
                alt="Pharma Lab Hero Background"
                className="w-full h-full object-cover object-center"
              />

              <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/60 shadow-lg max-w-sm ml-auto">
                <div className="flex items-center space-x-2.5 mb-3 sm:mb-3.5">
                  <div className="p-2 bg-emerald-600 rounded-xl text-white">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-teal-950 text-xs tracking-tight">Unit Conversion</h5>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Made Simple</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span>1 kg</span>
                    <span>=</span>
                    <span>1000 g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 L</span>
                    <span>=</span>
                    <span>1000 mL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1 Item</span>
                    <span>=</span>
                    <span>1 Unit</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-emerald-600 tracking-wider text-center mt-3 pt-2.5 border-t border-dashed border-slate-100">
                  ACCURATE. CONSISTENT. ALWAYS.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-50/50 border-t border-slate-100 py-12 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              {[
                {
                  title: "Product Management",
                  desc: "Add, update, and manage your pharmaceutical products, categories, and pricing.",
                  icon: Database,
                  delay: "delay-0"
                },
                {
                  title: "Inventory Tracking",
                  desc: "Real-time stock visibility with multiple units and smart inventory insights.",
                  icon: Layers,
                  delay: "delay-75"
                },
                {
                  title: "Quotations & Orders",
                  desc: "Create quotations and orders with flexible units and accurate price calculations.",
                  icon: FileText,
                  delay: "delay-100"
                },
                {
                  title: "Reports & Analytics",
                  desc: "Get powerful insights into your business performance and inventory trends.",
                  icon: LineChart,
                  delay: "delay-150"
                },
                {
                  title: "Secure & Role-Based",
                  desc: "Admin and user roles with secure access and complete data control.",
                  icon: Lock,
                  delay: "delay-200"
                }
              ].map((feat, idx) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={idx}
                    className={`bg-white p-5 sm:p-6 rounded-3xl border border-slate-100/80 shadow-sm flex flex-col justify-between hover:shadow-xl hover:shadow-teal-950/5 hover:-translate-y-1.5 hover:border-emerald-500/20 transition-all duration-300 relative group overflow-hidden animate-slide-up ${feat.delay}`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-all duration-350"></div>
                    <div>
                      <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-700 rounded-2xl w-fit mb-4 sm:mb-5 border border-emerald-500/20 group-hover:from-emerald-500 group-hover:to-teal-800 group-hover:text-white transition-all duration-300 shadow-sm">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <h4 className="font-black text-cyan-955 text-cyan-950 text-sm mb-2 group-hover:text-teal-650 transition-colors duration-200">{feat.title}</h4>
                      <p className="text-xs text-slate-450 font-medium leading-relaxed group-hover:text-slate-500 transition-colors duration-200">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>


      <footer className="bg-teal-950 text-white pt-10 sm:pt-16 pb-6 sm:pb-8 border-t border-teal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
                A
              </div>
              <span className="text-lg font-bold tracking-wide">AasaMedChem</span>
            </div>
            <p className="text-xs text-teal-200/80 leading-relaxed max-w-xs">
              Empowering pharmaceutical enterprises and agents with mathematically-proven inventory algorithms, real-time conversion protocols, and secure operations.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 sm:mb-4">Quick Links</h4>
            <div className="flex flex-col space-y-2 sm:space-y-2.5 text-xs text-teal-300">
              <a href="#" className="hover:text-white transition-colors">Home Dashboard</a>
              <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
              <a href="#products" className="hover:text-white transition-colors">Products Catalog</a>
              <a href="#about" className="hover:text-white transition-colors">About Corporate</a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3 sm:mb-4">How it Works</h4>
            <div className="flex flex-col space-y-2 sm:space-y-2.5 text-xs text-teal-300">
              <a href="#" className="hover:text-white transition-colors">Register as Seller</a>
              <a href="#" className="hover:text-white transition-colors">Register as Buyer</a>
              <a href="#" className="hover:text-white transition-colors">Quotation Flow</a>
              <a href="#" className="hover:text-white transition-colors">Admin Approval</a>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-white text-sm mb-3 sm:mb-4">Contact Information</h4>
            <div className="flex flex-col space-y-2 sm:space-y-2.5 text-xs text-teal-300">
              <span>AasaMedChem Corporate Office</span>
              <span>Email: info@aasamedchem.com</span>
              <span>Phone: +91 (120) 456-7890</span>
              <span>Support Desk: Mon-Sat, 9AM-6PM</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 border-t border-teal-900/60 pt-4 sm:pt-6 text-center flex flex-col sm:flex-row justify-between items-center text-xs text-teal-400 gap-3">
          <p>© {new Date().getFullYear()} AasaMedChem. All rights reserved.</p>
          <div className="flex space-x-4 sm:space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security Audit</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
