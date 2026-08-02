/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import 'dayjs/locale/id';
import { useMqttStore } from "@/store/useMqttStore";

dayjs.locale('id');

export default function SettingsPage() {
  const router = useRouter();
  const { isConnected, battery, latency } = useMqttStore();

  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [device, setDevice] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Custom Modal State
  const [modal, setModal] = useState({ isOpen: false, type: "success", message: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      const deviceId = typeof window !== 'undefined' ? localStorage.getItem("active_device_id") : null;
      if (deviceId) {
        setActiveDeviceId(deviceId);
        try {
          // PENGHANCUR CACHE AGAR DATA TERBARU MUNCUL LANGSUNG
          const res = await fetch(`/api/devices/${deviceId}?t=${Date.now()}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.success && data.data) {
            setDevice(data.data);
            setPhone(data.data.alertPhone || "");
            setEmail(data.data.alertEmail || "");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchSettings();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeviceId) return;
    setIsSaving(true);
    try {
      await fetch(`/api/devices/${activeDeviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertPhone: phone, alertEmail: email })
      });
      setModal({ isOpen: true, type: "success", message: "Konfigurasi notifikasi berhasil disimpan!" });
    } catch (error) {
      setModal({ isOpen: true, type: "error", message: "Gagal menyimpan konfigurasi server. Coba lagi." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutDevice = () => {
    localStorage.removeItem("active_device_id");
    router.push("/");
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return "-";
    return new Date().getFullYear() - new Date(dobString).getFullYear();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 w-full pb-10">
      
      {/* MODAL KUSTOM (Pengganti Alert) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${modal.type === "success" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                <i className={`ph-fill ${modal.type === "success" ? "ph-check-circle" : "ph-warning-circle"} text-6xl`}></i>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{modal.type === "success" ? "Berhasil!" : "Terjadi Kesalahan"}</h3>
            <p className="text-slate-500 text-sm md:text-base mb-8">{modal.message}</p>
            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 md:py-4 rounded-xl transition-colors shadow-lg">Tutup</button>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">Pengaturan Perangkat</h2>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Konfigurasi perangkat keras, profil pasien, dan notifikasi.</p>
      </div>

      {isLoading ? (
        // SKELETON LOADING
        <div className="animate-pulse space-y-6 md:space-y-8">
          <div className="h-40 md:h-48 bg-slate-200 rounded-3xl w-full"></div>
          <div className="h-48 md:h-56 bg-slate-200 rounded-3xl w-full"></div>
          <div className="h-64 md:h-72 bg-slate-200 rounded-3xl w-full"></div>
        </div>
      ) : (
        <>
          <div className="bg-linear-to-br from-blue-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-5 -top-5 opacity-10"><i className="ph-fill ph-user text-9xl md:text-[12rem]"></i></div>
            <div className="relative z-10">
              <span className="bg-blue-900/50 text-blue-100 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 md:px-4 py-1.5 rounded-full border border-blue-400/30 mb-4 inline-block">Profil Pasien Aktif</span>
              <h2 className="text-2xl md:text-4xl font-outfit font-bold mb-2">{device?.operatorName || "Belum Diatur"}</h2>
              <p className="text-xs md:text-sm text-blue-100 flex items-center gap-2">
                <i className="ph-bold ph-identification-card text-lg md:text-xl"></i> 
                {device?.operatorDob ? `Usia Pasien: ${calculateAge(device.operatorDob)} Tahun` : "Data usia tidak ditemukan"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="font-outfit text-lg md:text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center gap-2">
              <i className="ph-fill ph-hard-drives text-blue-600"></i> Status Perangkat Tepi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div className="truncate pr-4">
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Koneksi ({device?.macAddress})</p>
                  <p className="font-outfit font-bold text-slate-800 truncate text-sm md:text-base">{device?.name}</p>
                </div>
                <span className={`text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shrink-0 ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {isConnected ? `Online` : 'Offline'}
                </span>
              </div>
              <div className="p-4 md:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daya Baterai</p>
                  <p className="font-outfit font-bold text-slate-800 text-sm md:text-base">Li-ion 18650</p>
                </div>
                <span className={`text-sm md:text-base font-bold flex items-center gap-1 ${battery > 20 ? 'text-emerald-600' : 'text-red-600'}`}>
                  <i className={battery > 20 ? "ph-fill ph-battery-high text-xl md:text-2xl" : "ph-fill ph-battery-warning text-xl md:text-2xl"}></i>
                  {isConnected ? `${battery}%` : '--'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
            <h3 className="font-outfit text-lg md:text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
              <i className="ph-fill ph-broadcast text-blue-600"></i> Penjaluran Laporan Darurat
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6 max-w-2xl">
              Tentukan email yang akan menerima notifikasi otomatis jika alat mendeteksi Katarak Matur.
            </p>
            <form onSubmit={handleSaveConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">WhatsApp Dokter/Wali</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+6281234567890" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">Email Darurat 🚨</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="dokter@rumah-sakit.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 md:py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm" />
                </div>
              </div>
              <div className="text-right pt-4 border-t border-slate-100">
                <button type="submit" disabled={isSaving} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 md:py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg">
                  {isSaving ? <i className="ph-bold ph-spinner animate-spin text-lg"></i> : <i className="ph-bold ph-floppy-disk text-lg"></i>}
                  {isSaving ? "Menyimpan Konfigurasi..." : "Simpan Konfigurasi"}
                </button>
              </div>
            </form>
          </div>

          <div className="pt-4 flex justify-end">
            <button onClick={handleLogoutDevice} className="w-full md:w-auto bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 md:py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-200">
              <i className="ph-bold ph-sign-out text-lg md:text-xl"></i> Keluar (Ganti Alat/Pasien)
            </button>
          </div>
        </>
      )}
    </div>
  );
}