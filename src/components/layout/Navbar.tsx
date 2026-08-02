"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMqttStore } from "@/store/useMqttStore";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const { isConnected } = useMqttStore();
  const [deviceName, setDeviceName] = useState("Memuat...");

  useEffect(() => {
    const activeDeviceId = typeof window !== 'undefined' ? localStorage.getItem("active_device_id") : null;
    if (activeDeviceId) {
      fetch(`/api/devices/${activeDeviceId}`).then(res => res.json()).then(data => {
        if (data.success && data.data) setDeviceName(data.data.name);
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("active_device_id");
    router.push("/");
  };

  return (
    <header className="h-16 md:h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 print:hidden shrink-0">
      <div className="flex items-center gap-4">
        {/* Tombol Burger Mobile */}
        <button onClick={onMenuClick} className="md:hidden text-slate-600 hover:text-blue-600 p-2">
          <i className="ph-bold ph-list text-2xl"></i>
        </button>
        
        <div className="hidden md:block">
          <h2 className="font-outfit font-bold text-xl text-slate-800">Sistem Edge AI</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{isConnected ? 'Sistem Aktif' : 'Menunggu Alat'}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 max-w-30 md:max-w-xs">
          <i className="ph-fill ph-cpu text-blue-500 shrink-0"></i>
          <span className="text-xs md:text-sm font-bold text-slate-700 truncate">{deviceName}</span>
        </div>
        
        <button onClick={handleLogout} className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0" title="Keluar">
          <i className="ph-bold ph-sign-out text-base md:text-lg"></i>
        </button>
      </div>
    </header>
  );
}