"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CheckCheck, Package, ShieldCheck, ShieldX, UserPlus, Info } from "lucide-react";

const TYPE_CONFIG = {
  ORDER_SUBMITTED: {
    icon: Package,
    color: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  NEW_ORDER: {
    icon: Package,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  ORDER_APPROVED: {
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
  ORDER_REJECTED: {
    icon: ShieldX,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  NEW_USER: {
    icon: UserPlus,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
  },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (_) {}
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-slate-600"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-teal-700" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-teal-600 hover:text-teal-800 font-bold flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>All read</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] || {
                  icon: Info,
                  color: "text-slate-600",
                  bg: "bg-slate-50",
                  border: "border-slate-100",
                };
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read && markOneRead(n.id)}
                    className={`w-full text-left px-4 py-3 flex items-start space-x-3 border-b border-slate-50 transition-colors cursor-pointer ${
                      n.read ? "bg-white" : "bg-amber-50/30"
                    } hover:bg-slate-50`}
                  >
                    <div
                      className={`mt-0.5 w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${cfg.bg} ${cfg.border}`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-bold ${n.read ? "text-slate-600" : "text-slate-900"}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold mt-1 block">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
