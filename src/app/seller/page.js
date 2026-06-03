"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import NotificationBell from "@/app/components/NotificationBell";
import {
  Search,
  ShoppingCart,
  Trash,
  LogOut,
  X,
  PlusCircle,
  FileText,
  Settings,
  Scale,
  Package,
  Activity,
  History,
  Trash2,
  Check
} from "lucide-react";import { convertQuantity, calculateUnitPrice, calculateTotalPrice } from "@/lib/conversions";

const getCasNumber = (name) => {
  const n = name.toLowerCase();
  if (n.includes("paracetamol")) return "103-90-2";
  if (n.includes("amoxicillin")) return "26787-78-0";
  if (n.includes("ibuprofen")) return "15687-27-1";
  if (n.includes("ethanol")) return "64-17-5";
  if (n.includes("glycerin")) return "56-81-5";
  if (n.includes("aspirin")) return "50-78-2";
  return "103-90-2";
};

const getCategoryLabel = (name) => {
  const n = name.toLowerCase();
  if (n.includes("ethanol")) return "Solvents";
  if (n.includes("glycerin")) return "Excipients";
  if (n.includes("paracetamol") || n.includes("amoxicillin") || n.includes("ibuprofen") || n.includes("aspirin")) return "APIs";
  return "Intermediates";
};

export default function SellerPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [calcQty, setCalcQty] = useState(1);
  const [calcUnit, setCalcUnit] = useState("g");
  const [modalError, setModalError] = useState("");

  const [notification, setNotification] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [category, unitFilter, minPrice, maxPrice, sortBy]);

  const fetchProducts = async () => {
    try {
      const q = new URLSearchParams({
        search: debouncedSearch,
        category,
        unit: unitFilter,
        minPrice,
        maxPrice,
        sortBy,
        page: page.toString(),
        limit: "6",
      });
      const res = await fetch(`/api/seller/products?${q.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/seller/cart");
      const data = await res.json();
      setCart(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, category, unitFilter, minPrice, maxPrice, sortBy, page]);

  useEffect(() => {
    fetchCart();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setCalcQty(1);
    setCalcUnit(product.baseUnit);
    setModalError("");
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = async () => {
    setModalError("");
    try {
      const res = await fetch("/api/seller/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantity: parseFloat(calcQty),
          unit: calcUnit,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification("Product added to quotation!");
        setTimeout(() => setNotification(""), 3000);
        fetchCart();
        closeProductModal();
      } else {
        setModalError(data.error || "Failed to add to cart");
      }
    } catch (err) {
      setModalError("Network error adding to cart");
    }
  };

  const handleDeleteCartItem = async (id) => {
    try {
      const res = await fetch(`/api/seller/cart?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCart();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await fetch("/api/seller/cart", { method: "DELETE" });
      if (res.ok) {
        setCart([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {notification && (
        <div className="fixed bottom-6 right-6 bg-cyan-950 text-white px-5 py-3 rounded-xl shadow-2xl z-50 transition-all border border-emerald-500/50 flex items-center space-x-2 animate-bounce">
          <Check className="w-4 h-4 text-emerald-450" />
          <span className="text-xs font-bold tracking-wide">{notification}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="w-full lg:w-64 bg-cyan-955 bg-cyan-950 text-white p-6 flex flex-col justify-between border-t border-cyan-900/50 lg:border-t-0 shrink-0">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-emerald-500/15">
                A
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white to-emerald-350 bg-clip-text text-transparent">AasaMedChem</h1>
                <p className="text-[9px] text-emerald-400 font-bold tracking-widest uppercase">Solutions. Trust. Innovation.</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/25 shadow-inner">
                SL
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Aasa Seller</span>
                <span className="text-[10px] text-emerald-400/80 block font-semibold font-semibold">Sales Agent Panel</span>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold text-teal-400/60 uppercase tracking-widest mb-3">
                Main Menu
              </p>
              <nav className="space-y-1">
                <button
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-md shadow-emerald-700/20 flex items-center space-x-2.5 scale-[1.02]"
                >
                  <Package className="w-4 h-4" />
                  <span>Browse Products</span>
                </button>
                <button
                  onClick={() => router.push("/seller/checkout")}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-200 hover:bg-white/5 hover:text-white transition-all cursor-pointer flex items-center space-x-2.5"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Review Checkout</span>
                </button>
                <button
                  onClick={() => router.push("/seller/orders")}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-200 hover:bg-white/5 hover:text-white transition-all cursor-pointer flex items-center space-x-2.5"
                >
                  <History className="w-4 h-4" />
                  <span>Quotation History</span>
                </button>
              </nav>
            </div>

            <div>
              <p className="text-[9px] font-bold text-teal-400/60 uppercase tracking-widest mb-3">
                Filters Catalog
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-teal-300/80 font-bold block mb-1 uppercase tracking-wide">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cyan-900/60 border border-cyan-800 rounded-xl text-xs text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-cyan-950 text-white">All Categories</option>
                    <option value="api" className="bg-cyan-950 text-white">APIs</option>
                    <option value="excipient" className="bg-cyan-950 text-white">Excipients</option>
                    <option value="solvent" className="bg-cyan-950 text-white">Solvents</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-teal-300/80 font-bold block mb-1 uppercase tracking-wide">Unit Type</label>
                  <select
                    value={unitFilter}
                    onChange={(e) => setUnitFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-cyan-900/60 border border-cyan-800 rounded-xl text-xs text-white focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-cyan-950 text-white">All Units</option>
                    <option value="g" className="bg-cyan-950 text-white">g (Gram)</option>
                    <option value="ml" className="bg-cyan-950 text-white">ml (Milliliter)</option>
                    <option value="pc" className="bg-cyan-950 text-white">pc (Piece)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer flex items-center space-x-2.5 mt-8 border-t border-white/5 pt-4"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 flex justify-between items-center shadow-sm sticky top-0 z-20">
            <div className="relative w-80 hidden md:block">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by SKU, name..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 focus:outline-none focus:border-teal-650 placeholder-slate-400 font-medium"
              />
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            </div>

            <div className="flex items-center space-x-4 text-slate-500">
              <span className="text-[10px] font-bold text-teal-850 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Active Catalog
              </span>
              <button className="p-2 hover:bg-slate-100 rounded-xl relative cursor-pointer text-slate-655">
                <NotificationBell />
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer text-slate-655">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)] custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col">
                <h3 className="text-base font-black text-cyan-950">Products Catalog</h3>
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mt-0.5">Showing products list</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none font-bold cursor-pointer"
              >
                <option value="name">Alphabetical</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm animate-pulse">
                <p className="text-slate-500 font-bold">No active products found matching filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
                {products.map((product) => {
                  const isLowStock = Number(product.currentStockBaseUnit) < 1000;
                  const casNum = getCasNumber(product.name);
                  const catLabel = getCategoryLabel(product.name);
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 relative group"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">SKU: {product.sku}</span>
                            <span className="text-[9px] font-bold text-emerald-600 tracking-wider">CAS: {casNum}</span>
                          </div>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isLowStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </div>
                        
                        <div className="w-full aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl flex items-center justify-center border border-slate-100 mb-4 group-hover:scale-[1.01] transition-all">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-teal-850 shadow-sm">
                              <Scale className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{catLabel}</span>
                          </div>
                        </div>

                        <h4 className="text-sm font-black text-cyan-950 mb-1 group-hover:text-teal-650 transition-colors">{product.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 font-medium">{product.description}</p>
                      </div>

                      <div className="border-t border-slate-50 pt-4 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">Base Price</span>
                          <span className="text-base font-black text-cyan-950">₹{Number(product.basePrice).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 font-bold"> / {product.baseUnit}</span>
                        </div>
                        <button
                          onClick={() => openProductModal(product)}
                          className="bg-cyan-950 hover:bg-teal-900 text-white p-2.5 rounded-xl transition-all shadow-md shadow-cyan-950/15 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-150 bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </main>

        <section className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-slate-150 p-6 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-black text-cyan-955 text-cyan-950 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span>My Quotation</span>
              </h3>
              <span className="bg-emerald-50 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {cart.length} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30 animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empty quotation cart</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                {cart.map((item) => {
                  const unitPrice = calculateUnitPrice(
                    item.product.basePrice,
                    item.product.baseUnit,
                    item.unit,
                    item.product.density
                  );
                  const itemTotal = calculateTotalPrice(item.quantity, unitPrice);

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-55 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex justify-between items-start hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1 pr-3">
                        <h5 className="font-bold text-cyan-955 text-cyan-950 text-xs">{item.product.name}</h5>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">
                          {item.quantity} {item.unit} @ ₹{unitPrice.toFixed(2)}/{item.unit}
                        </p>
                        <span className="text-xs font-black text-teal-900 block mt-1">
                          ₹{itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCartItem(item.id)}
                        className="text-slate-400 hover:text-red-655 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mt-6">
              <div className="space-y-2 mb-4 text-xs font-bold">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-cyan-950">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%)</span>
                  <span className="text-cyan-950">₹{gst.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-black text-cyan-955 text-cyan-950 text-sm pt-2 border-t border-dashed border-slate-200">
                  <span>Total (INR)</span>
                  <span className="text-emerald-700">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearCart}
                  className="w-1/3 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => router.push("/seller/checkout")}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Submit Quotation</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-cyan-955 bg-cyan-955 bg-cyan-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 animate-scale-in">
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-between items-start mb-2 pr-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  SKU: {selectedProduct.sku}
                </span>
                <span className="text-[10px] font-bold text-emerald-650 text-emerald-600 tracking-wider">
                  CAS: {getCasNumber(selectedProduct.name)}
                </span>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                Number(selectedProduct.currentStockBaseUnit) < 1000 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
              }`}>
                In Stock
              </span>
            </div>

            <h3 className="text-base font-black text-cyan-950 mb-2">
              {selectedProduct.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-medium">{selectedProduct.description}</p>

            <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={calcQty}
                    onChange={(e) => setCalcQty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:border-teal-600 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Unit
                  </label>
                  <select
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:border-teal-600 font-bold appearance-none cursor-pointer"
                  >
                    {selectedProduct.baseUnit === "pc" ? (
                      <>
                        <option value="pc">Piece (pc)</option>
                        <option value="pack">Pack (10 pcs)</option>
                        <option value="box">Box (100 pcs)</option>
                      </>
                    ) : selectedProduct.baseUnit === "ml" ? (
                      <>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="L">Liter (L)</option>
                        <option value="ul">Microliter (ul)</option>
                        <option value="g">Gram (g) [Converted]</option>
                        <option value="kg">Kilogram (kg) [Converted]</option>
                      </>
                    ) : (
                      <>
                        <option value="g">Gram (g)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="mg">Milligram (mg)</option>
                        <option value="ml">Milliliter (ml) [Converted]</option>
                        <option value="L">Liter (L) [Converted]</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {calcQty > 0 && (
                <div className="border-t border-slate-200 mt-4 pt-3 text-xs text-slate-600 space-y-1 font-semibold">
                  <div className="flex justify-between">
                    <span>Base price:</span>
                    <span className="text-cyan-950">₹{Number(selectedProduct.basePrice).toFixed(2)}/{selectedProduct.baseUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price per Unit ({calcUnit}):</span>
                    <span className="text-cyan-950">
                      ₹
                      {calculateUnitPrice(
                        selectedProduct.basePrice,
                        selectedProduct.baseUnit,
                        calcUnit,
                        selectedProduct.density
                      ).toFixed(2)}
                      /{calcUnit}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-cyan-955 text-cyan-950 pt-1.5 border-t border-dashed border-slate-250">
                    <span>Price Calculation:</span>
                    <span className="text-emerald-705 text-emerald-600">
                      ₹
                      {calculateTotalPrice(
                        calcQty,
                        calculateUnitPrice(
                          selectedProduct.basePrice,
                          selectedProduct.baseUnit,
                          calcUnit,
                          selectedProduct.density
                        )
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold mb-4">
                {modalError}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={closeProductModal}
                className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-500/10 hover:scale-[1.01]"
              >
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
