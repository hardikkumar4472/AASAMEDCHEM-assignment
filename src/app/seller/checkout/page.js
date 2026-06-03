"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { calculateUnitPrice, calculateTotalPrice } from "@/lib/conversions";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/seller/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data || []);
      }
    } catch (err) {
      setError("Failed to load cart items");
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const unitPrice = calculateUnitPrice(
        item.product.basePrice,
        item.product.baseUnit,
        item.unit,
        item.product.density
      );
      return total + calculateTotalPrice(item.quantity, unitPrice);
    }, 0);
  };

  const subtotal = getSubtotal();
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/seller/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/seller");
        }, 3000);
      } else {
        setError(data.error || "Failed to submit quotation");
      }
    } catch (err) {
      setError("A connection error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 sm:w-10 h-8 sm:h-10" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-teal-950">Quotation Submitted!</h2>
          <p className="text-gray-500 text-sm">
            Your quotation has been sent to the administrators for review and approval.
          </p>
          <p className="text-xs text-teal-700">Redirecting to catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-teal-950 text-white py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center shadow-md">
        <Link href="/seller" className="text-teal-200 hover:text-white flex items-center space-x-1 text-xs sm:text-sm bg-teal-900 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Catalog</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <h1 className="text-sm sm:text-lg font-bold tracking-wide">Review & Checkout</h1>
        <div className="w-16 sm:w-24"></div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-teal-950 mb-3 sm:mb-4 pb-2 border-b border-gray-100 flex items-center space-x-2">
              <FileText className="w-4 sm:w-5 h-4 sm:h-5 text-teal-800" />
              <span>Quotation Items</span>
            </h3>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-6">Your cart is empty.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {cart.map((item) => {
                  const unitPrice = calculateUnitPrice(
                    item.product.basePrice,
                    item.product.baseUnit,
                    item.unit,
                    item.product.density
                  );
                  const itemTotal = calculateTotalPrice(item.quantity, unitPrice);

                  return (
                    <div key={item.id} className="py-3 sm:py-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-teal-950 text-sm">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {item.quantity} {item.unit} @ ₹{unitPrice.toFixed(2)}/{item.unit}
                        </p>
                      </div>
                      <span className="font-bold text-teal-900 text-sm whitespace-nowrap ml-3">
                        ₹{itemTotal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-teal-950 mb-3 sm:mb-4 pb-2 border-b border-gray-100">
              Quotation Note
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Administrative Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Provide context, shipping requirements, or special packaging requests..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-slate-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                className="w-full bg-teal-800 hover:bg-teal-900 text-white py-3 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Submitting..." : "Confirm & Submit Quotation"}
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm h-fit space-y-4 sm:space-y-6">
          <h3 className="text-base sm:text-lg font-bold text-teal-950 pb-2 border-b border-gray-100">
            Order Total
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span className="font-semibold">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-teal-950 text-base pt-3 border-t border-dashed border-gray-100">
              <span>Grand Total</span>
              <span className="text-teal-900">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
