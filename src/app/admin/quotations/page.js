"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Check,
  X,
  LogOut,
  FolderOpen,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  Menu
} from "lucide-react";
import NotificationBell from "@/app/components/NotificationBell";
import MobileSidebar from "@/app/components/MobileSidebar";

export default function AdminQuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchQuotations = async () => {
    try {
      const res = await fetch("/api/admin/quotations");
      if (res.ok) {
        const data = await res.json();
        setQuotations(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const handleProcessQuote = async (status) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedQuote.id, status }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification(`Quotation ${status.toLowerCase()} successfully!`);
        setTimeout(() => setNotification(""), 3000);
        fetchQuotations();
        setSelectedQuote(null);
      } else {
        setError(data.error || "Failed to process quotation");
      }
    } catch (err) {
      setError("Network error processing quotation");
    } finally {
      setLoading(false);
    }
  };

  const sidebarContent = (
    <aside className="w-full h-full bg-teal-950 text-white p-6 flex flex-col">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
          A
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">AasaMedChem</h1>
          <p className="text-xs text-teal-300">Solutions. Trust. Innovation.</p>
        </div>
      </div>
      <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-3">
        Navigation
      </p>
      <nav className="space-y-1">
        <button
          onClick={() => { router.push("/admin"); setSidebarOpen(false); }}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-teal-200 hover:bg-teal-900 hover:text-white transition-colors cursor-pointer"
        >
          Products Inventory
        </button>
        <button
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm bg-teal-900 text-white font-bold cursor-pointer"
        >
          Review Quotations
        </button>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-teal-950 text-white py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-teal-900 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-lg">
              A
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold tracking-wide">AasaMedChem</h1>
              <p className="text-[10px] sm:text-xs text-teal-300">Solutions. Trust. Innovation.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <span className="text-xs sm:text-sm font-medium bg-teal-900 px-2 sm:px-3 py-1 rounded-full text-teal-100 hidden sm:inline">
            Admin Panel
          </span>
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="text-teal-200 hover:text-white flex items-center space-x-1 text-xs sm:text-sm bg-teal-900 hover:bg-teal-800 px-2 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {notification && (
        <div className="fixed bottom-5 right-4 sm:right-5 bg-teal-800 text-white px-4 sm:px-6 py-3 rounded-lg shadow-xl z-50 transition-all flex items-center space-x-2 animate-bounce max-w-[90vw]">
          <span className="text-xs sm:text-sm">{notification}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          {sidebarContent}
        </MobileSidebar>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-2xl font-bold text-teal-950 mb-4 sm:mb-6">Review Quotations</h2>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {quotations.length === 0 ? (
              <div className="text-center py-12 sm:py-16 text-gray-500">
                No quotations submitted yet.
              </div>
            ) : (
              <>
                {/* Desktop table view */}
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-teal-950 font-semibold">
                        <th className="p-3 sm:p-4">Quotation ID</th>
                        <th className="p-3 sm:p-4">Seller</th>
                        <th className="p-3 sm:p-4 hidden md:table-cell">Date</th>
                        <th className="p-3 sm:p-4">Total</th>
                        <th className="p-3 sm:p-4">Status</th>
                        <th className="p-3 sm:p-4 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {quotations.map((quote) => (
                        <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 sm:p-4 font-mono text-xs font-bold text-gray-500">
                            {quote.id.substring(0, 8).toUpperCase()}...
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className="font-bold text-teal-950 block">{quote.seller.name}</span>
                            <span className="text-xs text-gray-400 block">{quote.seller.email}</span>
                          </td>
                          <td className="p-3 sm:p-4 text-gray-500 hidden md:table-cell">
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3 sm:p-4 font-bold text-teal-900">
                            ₹{Number(quote.totalPrice).toFixed(2)}
                          </td>
                          <td className="p-3 sm:p-4">
                            <span className={`text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-bold uppercase ${
                              quote.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : quote.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {quote.status}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedQuote(quote);
                                setError("");
                              }}
                              className="text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card view */}
                <div className="sm:hidden divide-y divide-gray-100">
                  {quotations.map((quote) => (
                    <div key={quote.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-teal-950 text-sm block">{quote.seller.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono block">{quote.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          quote.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : quote.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500">
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </div>
                        <span className="font-bold text-teal-900 text-sm">₹{Number(quote.totalPrice).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedQuote(quote);
                          setError("");
                        }}
                        className="w-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors cursor-pointer text-center"
                      >
                        Inspect Quotation
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedQuote(null)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base sm:text-xl font-bold text-teal-950 mb-3 sm:mb-4 pb-2 border-b border-gray-100 flex items-center space-x-2 pr-8">
              <FolderOpen className="w-4 sm:w-5 h-4 sm:h-5 text-teal-800 shrink-0" />
              <span>Inspect Quotation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 text-sm bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-150">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-gray-400 block font-semibold">Seller Details</span>
                <span className="font-bold text-teal-950 flex items-center space-x-1 text-xs sm:text-sm">
                  <User className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                  <span>{selectedQuote.seller.name}</span>
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 block pl-4.5 break-all">{selectedQuote.seller.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs text-gray-400 block font-semibold">Submission Info</span>
                <span className="text-gray-700 flex items-center space-x-1 text-xs sm:text-sm">
                  <Calendar className="w-3.5 h-3.5 text-teal-800 shrink-0" />
                  <span>{new Date(selectedQuote.createdAt).toLocaleString()}</span>
                </span>
                <span className="font-bold text-teal-900 flex items-center space-x-1 pl-4.5 text-xs sm:text-sm">
                  <DollarSign className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>Total: ₹{Number(selectedQuote.totalPrice).toFixed(2)}</span>
                </span>
              </div>
            </div>

            {selectedQuote.adminNotes && (
              <div className="mb-3 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-semibold text-gray-550 block mb-1">Seller remarks:</span>
                <p className="text-xs sm:text-sm bg-amber-50/50 border border-amber-100/50 text-amber-950 p-2.5 sm:p-3 rounded-lg leading-relaxed">
                  {selectedQuote.adminNotes}
                </p>
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <span className="text-[10px] sm:text-xs font-semibold text-gray-550 block mb-2">Item Breakdown:</span>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-semibold text-teal-950">
                      <th className="p-2 sm:p-3">Product</th>
                      <th className="p-2 sm:p-3">Qty</th>
                      <th className="p-2 sm:p-3 hidden sm:table-cell">Unit</th>
                      <th className="p-2 sm:p-3 text-right hidden sm:table-cell">Price/Unit</th>
                      <th className="p-2 sm:p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {selectedQuote.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2 sm:p-3 font-bold text-xs">
                          {item.product.name}
                          <span className="sm:hidden block text-[10px] text-gray-400 font-normal">{item.unit}</span>
                        </td>
                        <td className="p-2 sm:p-3 font-mono text-xs">{Number(item.quantity)}</td>
                        <td className="p-2 sm:p-3 font-semibold uppercase text-gray-400 hidden sm:table-cell">{item.unit}</td>
                        <td className="p-2 sm:p-3 text-right hidden sm:table-cell">₹{Number(item.pricePerUnitConverted).toFixed(2)}</td>
                        <td className="p-2 sm:p-3 text-right font-bold text-teal-900">₹{Number(item.calculatedPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs mb-3 sm:mb-4 flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {selectedQuote.status === "PENDING" ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => handleProcessQuote("REJECTED")}
                  disabled={loading}
                  className="w-full sm:w-1/2 border border-red-200 hover:bg-red-50 text-red-700 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => handleProcessQuote("APPROVED")}
                  disabled={loading}
                  className="w-full sm:w-1/2 bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Subtract Stock</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSelectedQuote(null)}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              >
                Close Inspection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
