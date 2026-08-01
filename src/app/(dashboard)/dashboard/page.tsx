"use client";

import { useEffect } from "react";
import TelemetryCard from "@/components/ui/TelemetryCard";
import { useMqttStore } from "@/store/useMqttStore";

export default function DashboardPage() {
  const { connect, disconnect, isConnected, battery, latency, latestScan } = useMqttStore();

  useEffect(() => {
    connect();
    return () => disconnect(); // Memutus koneksi saat pindah halaman
  }, [connect, disconnect]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Indikator Status Koneksi */}
      <div className="flex justify-end">
        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          {isConnected ? 'MQTT Terhubung (WebSockets)' : 'Terputus dari Alat'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TelemetryCard 
          title="Status Perangkat Tepi" 
          value={isConnected ? "Online (Siap)" : "Offline"} 
          subtitle={`Latensi Jaringan: ${latency} ms`} 
          icon="ph-broadcast" 
          iconBgColor={isConnected ? "bg-emerald-50" : "bg-slate-50"} 
          iconTextColor={isConnected ? "text-emerald-600" : "text-slate-600"} 
        />
        <TelemetryCard 
          title="Daya Alat Tersisa" 
          value={
            <span className="flex items-center gap-2">
              <i className={`ph-fill ${battery > 20 ? 'ph-battery-high text-green-500' : 'ph-battery-warning text-red-500'}`}></i> 
              {battery > 0 ? `${battery.toFixed(1)}%` : 'Memuat...'}
            </span>
          } 
          subtitle="INA219 Sensor Live" 
          icon="ph-lightning" 
          iconBgColor="bg-blue-50" 
          iconTextColor="text-blue-600" 
        />
      </div>

      {/* Area Pemindaian Live */}
      <div className="bg-white border border-slate-100 rounded-2xl premium-shadow p-2">
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 lg:p-10 min-h-100 flex flex-col justify-center">
          
          {!latestScan ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 premium-shadow animate-bounce">
                <i className="ph-fill ph-camera text-3xl text-blue-500"></i>
              </div>
              <h3 className="font-outfit text-xl font-bold text-slate-800">Menunggu Pemindaian...</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Sistem bersiap menganalisis citra mata secara otomatis dari Raspberry Pi.</p>
            </div>
          ) : (
            <div className="text-center">
               <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4 animate-pulse">
                Data Baru Diterima!
               </div>
               <h3 className="font-outfit text-2xl font-bold text-slate-800 mb-2">ID: {latestScan.scan_id}</h3>
               <p className="text-xl font-bold text-red-600 mb-1">{latestScan.ai_analysis.diagnosis}</p>
               <p className="text-slate-500">Confidence Score: <span className="font-bold text-slate-800">{latestScan.ai_analysis.confidence_score}%</span></p>
               <button className="mt-6 bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all">
                 Lihat Detail / Validasi Dokter
               </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}