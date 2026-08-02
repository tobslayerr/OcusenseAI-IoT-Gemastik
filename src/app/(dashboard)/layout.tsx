/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { useMqttStore } from "@/store/useMqttStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // 🟢 Tarik Data Lengkap
  const { connect, onlineDevices, isConnected, battery, latency, isCharging } = useMqttStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [macAddress, setMacAddress] = useState("");
  
  const [isKicked, setIsKicked] = useState(false);
  const [isBatteryDead, setIsBatteryDead] = useState(false);

  useEffect(() => {
    const deviceId = localStorage.getItem("active_device_id");
    if (!deviceId) {
      router.replace("/");
    } else {
      fetch(`/api/devices/${deviceId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) setMacAddress(data.data.macAddress);
        });
      setIsCheckingAuth(false);
      connect();
    }
  }, [pathname, router, connect]);

  // 🟢 LOGIKA MODAL BATERAI HABIS & KICK OTOMATIS
  useEffect(() => {
    if (isConnected && macAddress && onlineDevices[macAddress] === false) {
      if (battery === 0 && !isCharging) {
        setIsBatteryDead(true);
        setTimeout(() => {
          localStorage.removeItem("active_device_id");
          router.replace("/");
        }, 5000); // Tunggu 5 detik agar pesan terbaca sebelum dilempar
      } else {
        setIsKicked(true);
        setTimeout(() => {
          localStorage.removeItem("active_device_id");
          router.replace("/");
        }, 4000);
      }
    }
  }, [isConnected, onlineDevices, macAddress, battery, isCharging, router]);

  // Tampilan Baterai Mati (0%)
  if (isBatteryDead) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white z-50 fixed inset-0 animate-fade-in">
        <i className="ph-fill ph-battery-empty text-7xl text-red-500 mb-4 animate-pulse"></i>
        <h2 className="text-3xl font-bold mb-2 text-center">Baterai Habis (0%)</h2>
        <p className="text-slate-400 mb-8 max-w-md text-center px-4">Perangkat fisik Ocusense Anda terputus secara otomatis karena kehabisan daya listrik.</p>
        <p className="text-slate-500 text-sm animate-pulse">Mengakhiri sesi dan kembali ke layar utama...</p>
      </div>
    );
  }

  // Tampilan Kicked Out Biasa (Python Dimatikan paksa)
  if (isKicked) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white z-50 fixed inset-0">
        <i className="ph-fill ph-warning-circle text-6xl text-red-500 mb-4 animate-bounce"></i>
        <h2 className="text-3xl font-bold mb-2">Koneksi Terputus!</h2>
        <p className="text-slate-400 mb-8 max-w-md text-center">Alat fisik Ocusense Anda (Python) baru saja dimatikan atau terputus dari jaringan.</p>
        <p className="text-slate-500 text-sm animate-pulse">Mengembalikan Anda ke layar utama...</p>
      </div>
    );
  }

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
      
      {/* 🟢 TAMPILAN MODAL RECONNECTING KARENA LAG TINGGI */}
      {latency > 300 && !isKicked && !isBatteryDead && (
        <div className="fixed inset-0 z-100 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center text-white animate-fade-in">
          <i className="ph-bold ph-wifi-x text-6xl text-yellow-500 mb-4 animate-bounce"></i>
          <h2 className="text-2xl font-bold mb-2">Jaringan Memburuk (Lag)</h2>
          <p className="text-slate-300">Ping terlalu tinggi ({latency}ms). Menunggu koneksi stabil...</p>
        </div>
      )}

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