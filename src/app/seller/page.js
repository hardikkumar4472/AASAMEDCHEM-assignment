"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  Plus,
  Trash,
  LogOut,
  X,
  PlusCircle,
  FileText
} from "lucide-react";
import { convertQuantity, calculateUnitPrice, calculateTotalPrice } from "@/lib/conversions";

export default function SellerPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [calcQty, setCalcQty] = useState(1);
  const [calcUnit, setCalcUnit] = useState("g");
  const [modalError, setModalError] = useState("");

  const [notification, setNotification] = useState("");

  const fetchProducts = async () => {
    try {
      const q = new URLSearchParams({
        search,
        category,
        unit: unitFilter,
        minPrice,
        maxPrice,
        sortBy,
      });
      const res = await fetch(`/api/seller/products?${q.toString()}`);
      const data = await res.json();
      setProducts(data || []);
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
  }, [search, category, unitFilter, minPrice, maxPrice, sortBy]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-teal-950 text-white py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-white text-lg">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">AasaMedChem</h1>
            <p className="text-xs text-teal-300">Solutions. Trust. Innovation.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium bg-teal-900 px-3 py-1 rounded-full text-teal-100">
            Seller Panel
          </span>
          <button
            onClick={handleLogout}
            className="text-teal-200 hover:text-white flex items-center space-x-1 text-sm bg-teal-900 hover:bg-teal-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {notification && (
        <div className="fixed bottom-5 right-5 bg-teal-800 text-white px-6 py-3 rounded-lg shadow-xl z-50 transition-all flex items-center space-x-2 animate-bounce">
          <span>{notification}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="w-full lg:w-64 bg-white border-r border-gray-200 p-6 flex flex-col space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Search Products
            </h3>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SKU, name..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {[
                { label: "All Categories", value: "" },
                { label: "APIs", value: "api" },
                { label: "Excipients", value: "excipient" },
                { label: "Solvents", value: "solvent" },
                { label: "Glassware", value: "beaker" }
              ].map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setCategory(cat.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                    category === cat.value
                      ? "bg-teal-50 text-teal-950 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Unit Types
            </h3>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none"
            >
              <option value="">All Units</option>
              <option value="g">Grams (g)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="pc">Pieces (pc)</option>
            </select>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Price Range
            </h3>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-teal-950">Catalog Products</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none"
              >
                <option value="name">Alphabetical</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-500">No products found matching filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => {
                const isLowStock = Number(product.currentStockBaseUnit) < 1000;
                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-400">
                          {product.sku}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isLowStock
                              ? "bg-amber-50 text-amber-700"
                              : "bg-teal-50 text-teal-700"
                          }`}
                        >
                          {isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-teal-950 mb-1">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-gray-400 block">Base Price</span>
                        <span className="text-lg font-extrabold text-teal-900">
                          ₹{Number(product.basePrice).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">/{product.baseUnit}</span>
                      </div>
                      <button
                        onClick={() => openProductModal(product)}
                        className="bg-teal-800 hover:bg-teal-900 text-white p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <section className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-teal-950 flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-teal-800" />
                <span>My Quotation</span>
              </h3>
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {cart.length} items
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Your quotation is currently empty.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
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
                      className="bg-gray-50 rounded-lg p-3.5 border border-gray-150 flex justify-between items-start"
                    >
                      <div className="flex-1 pr-3">
                        <h5 className="font-bold text-teal-950 text-sm">
                          {item.product.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.quantity} {item.unit} @ ₹{unitPrice.toFixed(2)}/{item.unit}
                        </p>
                        <span className="text-xs font-bold text-teal-900 block mt-1.5">
                          ₹{itemTotal.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteCartItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-gray-100 pt-4 mt-6">
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-teal-950 text-base pt-2 border-t border-dashed border-gray-100">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearCart}
                  className="w-1/3 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => router.push("/seller/checkout")}
                  className="w-2/3 bg-teal-800 hover:bg-teal-900 text-white py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in duration-200">
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              {selectedProduct.sku}
            </span>
            <h3 className="text-xl font-bold text-teal-950 mb-2">
              {selectedProduct.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{selectedProduct.description}</p>

            <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100/50 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-teal-950 block mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={calcQty}
                    onChange={(e) => setCalcQty(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-teal-950 block mb-1.5">
                    Unit
                  </label>
                  <select
                    value={calcUnit}
                    onChange={(e) => setCalcUnit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
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
                <div className="border-t border-teal-100/70 mt-4 pt-3 text-xs text-teal-900 space-y-1">
                  <div className="flex justify-between">
                    <span>Base price:</span>
                    <span>₹{Number(selectedProduct.basePrice).toFixed(2)}/{selectedProduct.baseUnit}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Converted unit price:</span>
                    <span>
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
                  <div className="flex justify-between text-sm font-extrabold text-teal-950 pt-1.5 border-t border-dashed border-teal-200/50">
                    <span>Calculated Total:</span>
                    <span>
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs mb-4">
                {modalError}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={closeProductModal}
                className="w-1/2 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                className="w-1/2 bg-teal-800 hover:bg-teal-900 text-white py-2 rounded-lg text-sm font-medium cursor-pointer"
              >
                Add to Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
