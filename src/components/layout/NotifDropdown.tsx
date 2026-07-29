"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function NotifDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 md:w-11 md:h-11 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all premium-shadow relative"
      >
        <i className="ph ph-bell text-xl"></i>
        {/* Indikator Merah Peringatan Aktif */}
        <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      <div
        className={`absolute right-0 top-12 mt-2 w-80 bg-white border border-slate-100 rounded-2xl premium-shadow z-50 overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? "opacity-100 visible translate-y-0 scale-100" : "opacity-0 invisible -translate-y-2 scale-95"
        }`}
      >
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-outfit font-semibold text-slate-800">Peringatan Sistem Darurat</h3>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {/* Item Notifikasi */}
          <Link href="/validation" className="block p-4 hover:bg-red-50 border-b border-slate-50 transition-colors bg-red-50/30">
            <div className="flex gap-3">
              <div className="mt-0.5 w-2 h-2 rounded-full bg-red-600 shrink-0 animate-pulse"></div>
              <div>
                <p className="text-sm font-bold text-red-700">Peringatan: Katarak Matur</p>
                <p className="text-xs text-red-600 mt-1">Sistem mendeteksi indikasi katarak berat. Segera periksa dan terbitkan rujukan!</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}