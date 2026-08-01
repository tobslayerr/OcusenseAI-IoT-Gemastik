"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulasi penundaan jabat tangan MQTT selama 2 detik
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-3xl border border-slate-100 premium-shadow text-center max-w-md w-full">
        <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="ph-fill ph-broadcast text-4xl text-blue-600 animate-pulse"></i>
        </div>
        <h1 className="font-outfit text-3xl font-bold text-slate-800 mb-2">Sinkronisasi Tepi</h1>
        <p className="text-slate-500 mb-8">Memverifikasi jabat tangan WebSockets dengan Pialang MQTT instrumen Ocusense.</p>
        
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex justify-center items-center gap-2 ${isConnecting ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          {isConnecting ? (
            <><i className="ph-bold ph-spinner animate-spin text-xl"></i> Menghubungkan...</>
          ) : (
            <><i className="ph-bold ph-plug text-xl"></i> Inisialisasi Koneksi</>
          )}
        </button>
      </div>
    </div>
  );
}