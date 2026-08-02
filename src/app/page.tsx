/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMqttStore } from "@/store/useMqttStore";

export default function LandingPage() {
  const router = useRouter();
  
  // 🟢 Tarik status dari store
  const { connect, onlineDevices } = useMqttStore();

  const [currentStep, setCurrentStep] = useState<string>("LIST");
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  const [inputPin, setInputPin] = useState("");
  const [loginError, setLoginError] = useState(""); // 🟢 Pesan Error Kustom
  const [opName, setOpName] = useState("");
  const [opDob, setOpDob] = useState("");

  const fetchDevices = () => {
    fetch("/api/devices", { cache: 'no-store' })
      .then(res => res.json())
      .then(data => setDevices(data.data || []));
  };

  useEffect(() => {
    connect(); // Hubungkan MQTT sejak di Landing Page agar tau status alat
    fetchDevices();
  }, [connect]);

  const handleSelectDevice = (device: any) => {
    setSelectedDevice(device);
    setCurrentStep("PAIRING");
    setInputPin("");
    setLoginError("");
  };

  const handleDeleteDevice = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if(confirm(`Hapus alat "${name}"? \nRiwayat pemeriksaan tetap aman.`)) {
      await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      fetchDevices();
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // 🟢 CEK APAKAH PYTHON ALAT INI SEDANG MENYALA?
    if (onlineDevices[selectedDevice.macAddress] !== true) {
      setLoginError("Alat fisik ini sedang offline (mati). Silakan nyalakan sistem alat terlebih dahulu.");
      return;
    }

    if (selectedDevice.pairingCode === inputPin) {
      if (selectedDevice.operatorName) {
        await fetch(`/api/devices/${selectedDevice.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operatorName: selectedDevice.operatorName })
        });
        startHandshake(selectedDevice.id);
      } else {
        setCurrentStep("REGISTER");
      }
    } else {
      setLoginError("PIN yang Anda masukkan salah.");
    }
  };

  const handleRegisterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/devices/${selectedDevice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorName: opName, operatorDob: new Date(opDob) })
    });
    startHandshake(selectedDevice.id);
  };

  const startHandshake = (deviceId: string) => {
    setCurrentStep("CONNECTING");
    setTimeout(() => {
      localStorage.setItem("active_device_id", deviceId);
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <div className="absolute w-200 h-200 border border-blue-500/20 rounded-full animate-ping opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 text-center relative z-10 transition-all">
        
        {currentStep === "LIST" && (
          <div className="animate-fade-in">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ph-fill ph-radar text-5xl text-blue-400 animate-spin-slow"></i>
            </div>
            <h1 className="font-outfit text-3xl font-extrabold text-white mb-2">Ocusense Edge</h1>
            <p className="text-slate-400 text-sm mb-6">Pilih perangkat pemindai yang aktif di jaringan Anda.</p>
            
            {devices.length === 0 ? (
              <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-2xl text-blue-300">
                <i className="ph-fill ph-info text-3xl mb-2"></i>
                <p className="text-sm">Menunggu alat fisik... Nyalakan skrip Python untuk memunculkan perangkat.</p>
                <button onClick={fetchDevices} className="mt-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all">Segarkan</button>
              </div>
            ) : (
              <div className="space-y-3 text-left max-h-87.5 overflow-y-auto pr-2 custom-scrollbar">
                {devices.map((device) => (
                  <div key={device.id} className="relative group flex items-center">
                    <button onClick={() => handleSelectDevice(device)} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl flex items-center gap-4 transition-all">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <i className="ph-fill ph-cpu text-2xl"></i>
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-bold text-white text-lg">{device.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {device.operatorName ? `👤 Pasien: ${device.operatorName}` : "⚠️ Data Kosong"}
                        </p>
                      </div>
                      {/* Indikator Online/Offline Live dari MQTT */}
                      <div className="absolute right-12 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: onlineDevices[device.macAddress] === true ? '#10B981' : '#EF4444' }}></div>
                    </button>
                    <button onClick={(e) => handleDeleteDevice(e, device.id, device.name)} className="absolute right-4 w-8 h-8 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"><i className="ph-bold ph-trash"></i></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === "PAIRING" && (
          <form onSubmit={handleVerifyPin} className="animate-fade-in text-left">
            <button type="button" onClick={() => setCurrentStep("LIST")} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm font-bold transition-colors">
              <i className="ph-bold ph-arrow-left"></i> Kembali
            </button>
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
              <i className="ph-fill ph-lock-key text-3xl text-emerald-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Otorisasi Alat</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Masukkan <strong>4-Digit PIN</strong> dari layar terminal <strong>{selectedDevice?.name}</strong>.</p>
            
            <div className="mb-6">
              <input type="text" maxLength={4} required value={inputPin} onChange={e => setInputPin(e.target.value)} className={`w-full bg-slate-800 border ${loginError ? 'border-red-500' : 'border-slate-700 focus:border-emerald-500'} text-white font-mono text-center text-3xl tracking-[0.5em] rounded-xl px-4 py-5 outline-none transition-all`} placeholder="••••" />
              {loginError && <p className="text-red-400 text-xs font-bold mt-3"><i className="ph-fill ph-warning-circle"></i> {loginError}</p>}
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg">Buka Kunci</button>
          </form>
        )}

        {currentStep === "REGISTER" && (
          <form onSubmit={handleRegisterProfile} className="animate-fade-in text-left">
            <h2 className="text-2xl font-bold text-white mb-2">Data Pasien Baru</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Profil alat ini masih kosong. Silakan lengkapi identitas Pasien.</p>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap Pasien</label>
                <input type="text" required value={opName} onChange={e => setOpName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500" placeholder="Cth: Budi Santoso" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tanggal Lahir</label>
                <input type="date" required value={opDob} onChange={e => setOpDob(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all">Simpan & Mulai</button>
          </form>
        )}

        {currentStep === "CONNECTING" && (
          <div className="py-10 animate-fade-in">
            <i className="ph-fill ph-wifi-high text-6xl text-emerald-400 animate-pulse mb-6 inline-block"></i>
            <h2 className="text-2xl font-bold text-white mb-2">Masuk ke Dasbor...</h2>
          </div>
        )}

      </div>
    </div>
  );
}