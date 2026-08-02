/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMqttStore } from "@/store/useMqttStore";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { isConnected, latency, battery } = useMqttStore();
  const [device, setDevice] = useState<any>(null);

  useEffect(() => {
    const activeDeviceId = typeof window !== 'undefined' ? localStorage.getItem("active_device_id") : null;
    if (activeDeviceId) {
      fetch(`/api/devices/${activeDeviceId}`).then(res => res.json()).then(data => {
        if (data.success && data.data) setDevice(data.data);
      });
    }
  }, []);

  const menuItems = [
    { name: "Pantauan Alat", path: "/dashboard", icon: "ph-monitor" },
    { name: "Catatan Pemeriksaan", path: "/history", icon: "ph-folder-open" },
    { name: "Pengaturan Perangkat", path: "/settings", icon: "ph-gear" },
  ];

  return (
    <>
      {/* Overlay Gelap untuk HP */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 backdrop-blur-sm md:hidden" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Sidebar Utama */}
      <aside className={`fixed md:sticky top-0 z-50 h-screen w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} print:hidden shadow-2xl`}>
        
        {/* Header & Tombol Tutup HP */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <i className="ph-bold ph-camera text-xl"></i>
            </div>
            <h1 className="font-outfit font-bold text-xl tracking-wide">Ocusense</h1>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <i className="ph-bold ph-x text-2xl"></i>
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Menu Utama</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link key={item.name} href={item.path} onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-slate-800 hover:text-white"}`}
              >
                <i className={`ph-fill ${item.icon} text-xl`}></i>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Panel Telemetri Asli */}
        <div className="mx-4 mb-6 bg-slate-800 border border-slate-700 rounded-2xl p-4 shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Identitas Tepi</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
              <i className="ph-fill ph-cpu text-xl"></i>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{device ? device.name : "Memuat..."}</p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{device ? device.macAddress : "..."}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900 rounded-xl p-2.5 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Status Ping</p>
              <div className="flex items-center justify-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <p className={`text-xs font-bold font-mono ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>{isConnected ? `${latency} ms` : 'OFFLINE'}</p>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl p-2.5 text-center border border-slate-700/50">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Daya (Bat)</p>
              <p className={`text-xs font-bold font-mono ${battery > 20 ? 'text-blue-400' : 'text-red-400'}`}>{isConnected ? `${battery}%` : '--'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}