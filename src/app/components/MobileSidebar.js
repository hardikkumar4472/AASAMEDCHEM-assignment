"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

export default function MobileSidebar({ open, onClose, children }) {
  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Desktop: always visible inline */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:shrink-0">
        {children}
      </div>

      {/* Mobile: overlay + drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-72 bg-cyan-950 z-50 flex flex-col overflow-y-auto shadow-2xl">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
