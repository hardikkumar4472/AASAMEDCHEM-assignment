"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/seller/quotations");
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        } else {
          setError("Failed to fetch quotation history");
        }
      } catch {
        setError("Network error loading history");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-teal-950 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <Link
          href="/seller"
          className="text-teal-200 hover:text-white flex items-center space-x-1 text-sm bg-teal-900 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
        <h1 className="text-lg font-bold tracking-wide">My Quotation History</h1>
        <div className="w-32" />
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8">
        {loading ? (
          <div className="text-center py-20 text-teal-950">
            <p className="font-semibold animate-pulse">Loading quotations...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center text-sm">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <AlertCircle className="w-12 h-12 text-teal-800 mx-auto mb-3 opacity-30" />
            <p className="text-gray-500 font-medium">No quotations submitted yet.</p>
            <Link
              href="/seller"
              className="text-teal-700 hover:underline mt-2 inline-block font-semibold text-sm"
            >
              Browse products and submit your first quotation.
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-gray-50/70 px-6 py-4 border-b border-gray-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs text-gray-400 font-mono block">
                      QUOTATION ID: {order.id}
                    </span>
                    <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                      Submitted: {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="px-6 py-4 divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <h4 className="font-bold text-teal-950">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">
                          {Number(item.quantity)} {item.unit} @ ₹
                          {Number(item.pricePerUnitConverted).toFixed(2)}/{item.unit}
                        </p>
                      </div>
                      <span className="font-semibold text-teal-900">
                        ₹{Number(item.calculatedPrice).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="max-w-md">
                    {order.adminNotes && (
                      <div className="text-xs">
                        <span className="font-bold text-gray-700 block">Remarks:</span>
                        <p className="text-gray-500 mt-0.5">{order.adminNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block font-medium">
                      Grand Total (incl. GST)
                    </span>
                    <span className="text-lg font-extrabold text-teal-900">
                      ₹{Number(order.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
