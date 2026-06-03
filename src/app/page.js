import Link from "next/link";
import {
  Shield,
  Layers,
  Percent,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <header className="bg-teal-950 text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">AasaMedChem</h1>
            <p className="text-xs text-teal-300">Solutions. Trust. Innovation.</p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <section className="w-full max-w-7xl px-6 md:px-12 py-16 md:py-24 text-center flex flex-col items-center">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full mb-6 border border-emerald-100">
            Smart Pharma Inventory Management
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-teal-950 tracking-tight leading-tight max-w-4xl mb-6">
            Robust, High-Precision Inventory & Order Control
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl leading-relaxed mb-10">
            A comprehensive, modular platform designed specifically for pharmaceutical warehouses and agents. Seamlessly conversion weight, volume, and count parameters in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/auth/login"
              className="bg-teal-905 bg-teal-900 hover:bg-teal-950 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-md cursor-pointer"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            >
              Explore Features
            </a>
          </div>
        </section>

        <section id="features" className="w-full bg-white border-y border-gray-200 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-teal-950">Core Platform Features</h3>
              <p className="text-gray-500 mt-2">Built with security and mathematical precision at the center.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-150 shadow-sm flex flex-col items-start">
                <div className="p-3 bg-teal-50 text-teal-800 rounded-lg mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-teal-950 text-lg mb-2">Role-Based Access</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Distinct, isolated panels for Admin operations and Seller/Agent quotation requests.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-150 shadow-sm flex flex-col items-start">
                <div className="p-3 bg-teal-50 text-teal-800 rounded-lg mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-teal-950 text-lg mb-2">Multi-Unit Support</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Support weights (g, kg, mg), volumes (ml, L, ul), and counts (pc, pack, box) seamlessly.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-150 shadow-sm flex flex-col items-start">
                <div className="p-3 bg-teal-50 text-teal-800 rounded-lg mb-4">
                  <Percent className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-teal-950 text-lg mb-2">High Precision</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Calculates conversions and prices at 10-decimal precision, preventing float errors.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl border border-gray-150 shadow-sm flex flex-col items-start">
                <div className="p-3 bg-teal-50 text-teal-800 rounded-lg mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-teal-950 text-lg mb-2">Real-time Insights</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Monitor stock thresholds, manage quotation approvals, and inspect orders immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-teal-950 text-white py-12 px-6 md:px-12 text-center text-xs border-t border-teal-900/50">
        <p className="text-teal-300">AasaMedChem Solutions. Trust. Innovation.</p>
        <p className="text-teal-500 mt-2">© {new Date().getFullYear()} AasaMedChem. All rights reserved.</p>
      </footer>
    </div>
  );
}
