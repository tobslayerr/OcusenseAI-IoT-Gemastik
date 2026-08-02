/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useMqttStore } from "@/store/useMqttStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Deteksi perpindahan rute
  const connect = useMqttStore(state => state.connect);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Kunci Utama: Jalankan ulang setiap kali pengguna pindah halaman!
  useEffect(() => {
    const deviceId = localStorage.getItem("active_device_id");
    
    if (!deviceId) {
      router.replace("/");
    } else {
      setIsCheckingAuth(false);
      connect(); // Jaga agar selalu online di setiap rute
    }
  }, [pathname, router, connect]); // <== Memantau pathname

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <i className="ph-bold ph-spinner animate-spin text-5xl text-blue-500 mb-4"></i>
        <p className="font-medium animate-pulse">Memverifikasi sesi aman...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-800 relative overflow-hidden">
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 w-full h-screen overflow-y-auto">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}