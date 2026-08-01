"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Menentukan judul halaman secara dinamis berdasarkan rute
  const getPageTitle = () => {
    if (pathname.includes("/history")) return "Catatan Pemeriksaan";
    if (pathname.includes("/validation")) return "Ruang Kerja Dokter";
    if (pathname.includes("/settings")) return "Spesifikasi Alat & Sistem";
    return "Pantauan Alat Langsung";
  };

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <Navbar title={getPageTitle()} onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}