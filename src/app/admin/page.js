"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import NotificationBell from "@/app/components/NotificationBell";
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  X,
  Package,
  AlertTriangle,
  FolderOpen,
  BarChart2,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Shield,
  Search,
  Settings,
  Activity,
  History,
  TrendingDown,
  Layers,
  Sparkles
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [baseUnit, setBaseUnit] = useState("g");
  const [currentStockBaseUnit, setCurrentStockBaseUnit] = useState("");
  const [density, setDensity] = useState("1.0");

  const [editId, setEditId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  const [adminPage, setAdminPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/admin/products?page=${adminPage}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setAdminTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [adminPage]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          name,
          description,
          basePrice: parseFloat(basePrice),
          baseUnit,
          currentStockBaseUnit: parseFloat(currentStockBaseUnit),
          density: parseFloat(density),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification("Product created successfully!");
        setTimeout(() => setNotification(""), 3000);
        fetchProducts();
        fetchAnalytics();
        setShowAddModal(false);
        resetForm();
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch (err) {
      setError("Network error creating product");
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editId,
          sku,
          name,
          description,
          basePrice: parseFloat(basePrice),
          baseUnit,
          currentStockBaseUnit: parseFloat(currentStockBaseUnit),
          density: parseFloat(density),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification("Product updated successfully!");
        setTimeout(() => setNotification(""), 3000);
        fetchProducts();
        fetchAnalytics();
        setShowEditModal(false);
        resetForm();
      } else {
        setError(data.error || "Failed to update product");
      }
    } catch (err) {
      setError("Network error updating product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotification("Product deleted successfully!");
        setTimeout(() => setNotification(""), 3000);
        fetchProducts();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (product) => {
    setEditId(product.id);
    setSku(product.sku);
    setName(product.name);
    setDescription(product.description || "");
    setBasePrice(Number(product.basePrice).toString());
    setBaseUnit(product.baseUnit);
    setCurrentStockBaseUnit(Number(product.currentStockBaseUnit).toString());
    setDensity(Number(product.density).toString());
    setShowEditModal(true);
    setError("");
  };

  const resetForm = () => {
    setEditId(null);
    setSku("");
    setName("");
    setDescription("");
    setBasePrice("");
    setBaseUnit("g");
    setCurrentStockBaseUnit("");
    setDensity("1.0");
    setError("");
  };

  const lowStockProducts = products.filter(p => Number(p.currentStockBaseUnit) < 1000);

  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-teal-850 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-teal-950 font-bold text-sm tracking-wide">Loading Dashboard Metrics...</p>
        </div>
      );
    }

    const { metrics, orders, charts } = analytics;
    const trend = charts.recentSalesTrend || [];
    const maxVal = Math.max(...trend.map(t => t.total), 1000);

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Products</span>
              <span className="text-3xl font-black text-cyan-950 block">{metrics.totalProducts}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                <span>+12 this week</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-inner">
              <Package className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
              <span className="text-3xl font-black text-cyan-950 block">{metrics.approvedQuotations}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                <span>+18 this week</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Quotations</span>
              <span className="text-3xl font-black text-cyan-950 block">{metrics.totalQuotations}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                <span>+3 this week</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Revenue (INR)</span>
              <span className="text-2xl font-black text-cyan-950 block">₹{metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                <span>+22.5% this week</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-black text-cyan-950 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-teal-700" />
                <span>Recent Orders</span>
              </h3>
              <button onClick={() => setActiveTab("products")} className="text-xs font-bold text-teal-600 hover:text-teal-700">
                View All
              </button>
            </div>

            {trend.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-sm font-semibold">No sales records available.</p>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Total (INR)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-mono text-cyan-950 font-bold">{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-3 font-bold text-cyan-950">{order.userName}</td>
                        <td className="p-3 font-bold text-teal-900">₹{order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : order.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border border-red-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {order.status === "APPROVED" ? "Confirmed" : order.status === "PENDING" ? "Pending" : "Cancelled"}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-black text-cyan-950 mb-6">Inventory Overview</h3>
              <div className="flex justify-center mb-6 relative">
                <div className="w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f8fafc" strokeWidth="4.5" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray="70 30" strokeDashoffset="0" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray="18 82" strokeDashoffset="-70" />
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4.5" strokeDasharray="12 88" strokeDashoffset="-88" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-cyan-950">{metrics.totalProducts}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-500">In Stock</span>
                  </div>
                  <span className="text-cyan-950">178 (70%)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                    <span className="text-slate-500">Low Stock</span>
                  </div>
                  <span className="text-cyan-950">45 (18%)</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-slate-500">Out of Stock</span>
                  </div>
                  <span className="text-cyan-950">33 (12%)</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-4 mt-4">
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-cyan-950">Low Stock Alerts</span>
                <button onClick={() => setActiveTab("products")} className="text-teal-600 hover:text-teal-700">View All</button>
              </div>
              <div className="space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
                {lowStockProducts.slice(0, 3).map(p => (
                  <div key={p.id} className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-bold text-cyan-950">{p.name}</span>
                    <span className="text-red-600 font-bold">{Number(p.currentStockBaseUnit).toLocaleString()} {p.baseUnit} left</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    if (!analytics || !analytics.users) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-teal-800 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-base font-black text-cyan-950">System Registered Users</h3>
          <span className="bg-teal-50 text-teal-850 text-xs px-3 py-1 rounded-full font-bold">
            {analytics.users.length} Users
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role Permission</th>
                <th className="p-4">Account Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
              {analytics.users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/55 transition-colors">
                  <td className="p-4 font-bold text-cyan-950">{user.name}</td>
                  <td className="p-4 font-mono text-slate-500">{user.email}</td>
                  <td className="p-4 font-bold">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      user.role === "ADMIN"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : user.role === "BUYER"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-teal-50 text-teal-700 border border-teal-200"
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {notification && (
        <div className="fixed bottom-6 right-6 bg-cyan-950 text-white px-5 py-3 rounded-xl shadow-2xl z-50 transition-all border border-emerald-500/50 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide">{notification}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="w-full lg:w-64 bg-cyan-950 text-white p-6 flex flex-col justify-between border-t border-cyan-900/50 lg:border-t-0 shrink-0">
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
                AD
              </div>
              <div>
                <span className="text-xs font-bold block text-white">Aasa Admin</span>
                <span className="text-[10px] text-emerald-400/80 block font-semibold">Super Administrator</span>
              </div>
            </div>

            <div>
              <p className="text-[9px] font-bold text-teal-400/60 uppercase tracking-widest mb-3">
                Navigation
              </p>
              <nav className="space-y-1">
                {[
                  { id: "analytics", label: "Dashboard", icon: BarChart2 },
                  { id: "products", label: "Products", icon: Package },
                  { id: "users", label: "Users", icon: Users },
                  { id: "inventory", label: "Inventory", icon: Layers },
                  { id: "quotations", label: "Orders / Quotations", icon: FileText },
                  { id: "reports", label: "Reports", icon: TrendingUp },
                  { id: "settings", label: "Settings", icon: Settings },
                  { id: "audit", label: "Audit Logs", icon: History }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === "quotations") {
                          router.push("/admin/quotations");
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2.5 ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-700/20 scale-[1.02]"
                          : "text-teal-200 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
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
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-cyan-950 tracking-tight">
                {activeTab === "analytics" ? "Dashboard" : activeTab === "products" ? "Products Management" : "Administration Workspace"}
              </h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Welcome back, Admin 👋</span>
            </div>
            
            <div className="flex items-center space-x-4 text-slate-500">
              <div className="relative w-64 hidden md:block">
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 pl-8 text-xs text-slate-900 focus:outline-none focus:border-teal-600 placeholder-slate-400 font-medium"
                />
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
              <NotificationBell />
              <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-650">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-65px)] custom-scrollbar">
            {activeTab === "analytics" && renderAnalytics()}
            
            {activeTab === "users" && renderUsers()}

            {activeTab === "products" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-cyan-950">Chemical Catalog Registry</h3>
                  <button
                    onClick={() => {
                      resetForm();
                      setShowAddModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-md hover:shadow-lg shadow-emerald-500/10 hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-4">SKU</th>
                          <th className="p-4">Product Name</th>
                          <th className="p-4">Base Unit</th>
                          <th className="p-4">Base Price</th>
                          <th className="p-4">Density (g/ml)</th>
                          <th className="p-4">Current Stock</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-650 font-medium">
                        {products.map((product) => {
                          const isLowStock = Number(product.currentStockBaseUnit) < 1000;
                          return (
                            <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 font-mono text-[10px] text-slate-400 font-bold">{product.sku}</td>
                              <td className="p-4 font-bold text-cyan-950">{product.name}</td>
                              <td className="p-4 text-[10px] font-bold uppercase text-slate-400">{product.baseUnit}</td>
                              <td className="p-4 font-bold text-teal-900">₹{Number(product.basePrice).toFixed(2)}</td>
                              <td className="p-4 font-mono text-[10px]">{Number(product.density).toFixed(3)}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isLowStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                                }`}>
                                  {Number(product.currentStockBaseUnit).toLocaleString()} {product.baseUnit}
                                </span>
                              </td>
                              <td className="p-4 flex justify-center items-center space-x-2">
                                <button
                                  onClick={() => openEditModal(product)}
                                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 text-teal-800 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-300 text-red-700 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-150 px-4 pb-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <button
                    disabled={adminPage <= 1}
                    onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-slate-500">
                    Page {adminPage} of {adminTotalPages}
                  </span>
                  <button
                    disabled={adminPage >= adminTotalPages}
                    onClick={() => setAdminPage(p => Math.min(adminTotalPages, p + 1))}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-cyan-955 bg-cyan-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 animate-scale-in">
            <button
              onClick={() => {
                setShowAddModal(false);
                setShowEditModal(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-cyan-950 mb-4 flex items-center space-x-2">
              <FolderOpen className="w-5 h-5 text-teal-850" />
              <span>{showAddModal ? "Create New Product" : "Update Product Specifications"}</span>
            </h3>

            <form onSubmit={showAddModal ? handleAddProduct : handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                    placeholder="e.g. AMC-API-001"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                    placeholder="e.g. Paracetamol API"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                  rows={2}
                  placeholder="Analytical grade lab solvent..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Base Unit</label>
                  <select
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="g">g (Gram)</option>
                    <option value="ml">ml (Milliliter)</option>
                    <option value="pc">pc (Piece)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Base Price (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                    placeholder="0.05"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Density (g/ml)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={density}
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                    placeholder="0.789"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wide">Initial Stock (Base Unit)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={currentStockBaseUnit}
                  onChange={(e) => setCurrentStockBaseUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
                  placeholder="100000"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold">
                  {error}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-700 py-3 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-emerald-500/10 hover:scale-[1.01]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
