"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const menuItems = [
    { path: "/dashboard", icon: "ph-desktop", label: "Pantauan Alat" },
    { path: "/history", icon: "ph-folder-open", label: "Catatan Pemeriksaan" },
    { path: "/validation", icon: "ph-stethoscope", label: "Tinjauan Dokter" },
    { path: "/settings", icon: "ph-cpu", label: "Pengaturan Perangkat" },
  ];

  return (
    <aside
      className={`w-64 bg-[#0B1120] text-slate-300 flex flex-col justify-between fixed inset-y-0 left-0 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 z-50 transition-transform duration-300 ease-in-out shadow-2xl print-hide`}
    >
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <span className="font-outfit text-2xl tracking-tight">
            <span className="font-extrabold text-blue-500">OCU</span>
            <span className="font-light text-white">SENSE</span>
            <span className="text-blue-500 text-lg">.ai</span>
          </span>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <i className="ph ph-x text-2xl"></i>
          </button>
        </div>
        <nav className="p-4 space-y-2 mt-4">
          <p className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">Menu Utama</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <i className={`${isActive ? "ph-fill" : "ph"} ${item.icon} text-xl`}></i> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-6">
        <div className="bg-[#111827] border border-white/5 p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">MQTT Broker Aktif</span>
          </div>
          <p className="text-xs text-slate-400">
            Latensi: <span className="font-mono text-white">0.0 ms</span>
          </p>
        </div>
      </div>
    </aside>
  );
}