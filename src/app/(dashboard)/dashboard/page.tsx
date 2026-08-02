/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/id';
import { useMqttStore } from "@/store/useMqttStore";

dayjs.locale('id');

export default function DashboardPage() {
  // 🟢 PERBAIKAN: Menambahkan 'isCharging' di sini agar dikenali oleh TypeScript
  const { isConnected, battery, latency, isCharging, latestScanPayload, clearLatestScan } = useMqttStore();
  
  const [device, setDevice] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [clearedScanIds, setClearedScanIds] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, matur: 0, imatur: 0, normal: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClearedIds = localStorage.getItem("cleared_scans");
      if (savedClearedIds) {
        setClearedScanIds(JSON.parse(savedClearedIds));
      }
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (typeof window === "undefined") return;
      const deviceId = localStorage.getItem("active_device_id");
      if (!deviceId) return setIsLoading(false);

      try {
        const resDevice = await fetch(`/api/devices/${deviceId}?t=${Date.now()}`, { cache: 'no-store' });
        const dataDevice = await resDevice.json();
        if (dataDevice.success) setDevice(dataDevice.data);

        const resRecords = await fetch(`/api/records?t=${Date.now()}&deviceId=${deviceId}`, { cache: 'no-store' });
        const dataRecords = await resRecords.json();
        
        if (dataRecords.success) {
          const sorted = dataRecords.data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setRecords(sorted);

          let countMatur = 0, countImatur = 0, countNormal = 0;
          sorted.forEach((r: any) => {
            if (r.diagnosis === "Katarak Matur") countMatur++;
            else if (r.diagnosis === "Katarak Imatur") countImatur++;
            else countNormal++;
          });
          setStats({ total: sorted.length, matur: countMatur, imatur: countImatur, normal: countNormal });
        }
      } catch (error) {
        console.error("Gagal menarik data dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [latestScanPayload]);

  const getDisplayScan = () => {
    if (latestScanPayload && latestScanPayload.mac_address === device?.macAddress) {
      if (!clearedScanIds.includes(latestScanPayload.scan_id)) {
        return {
          scanId: latestScanPayload.scan_id,
          timestamp: latestScanPayload.timestamp,
          diagnosis: latestScanPayload.ai_analysis.diagnosis,
          confidenceScore: latestScanPayload.ai_analysis.confidence_score,
          boundingBox: latestScanPayload.ai_analysis.bounding_box,
          image: latestScanPayload.image,
          isLive: true
        };
      }
    }
    const latestDbRecord = records.length > 0 ? records[0] : null;
    if (latestDbRecord && !clearedScanIds.includes(latestDbRecord.scanId)) {
      return {
        scanId: latestDbRecord.scanId,
        timestamp: latestDbRecord.timestamp,
        diagnosis: latestDbRecord.diagnosis,
        confidenceScore: latestDbRecord.confidenceScore,
        boundingBox: latestDbRecord.boundingBox,
        image: latestDbRecord.image,
        isLive: false
      };
    }
    return null;
  };

  const displayScan = getDisplayScan();

  const handleSelesai = () => {
    if (displayScan?.scanId) {
      const updatedClearedIds = [...clearedScanIds, displayScan.scanId];
      setClearedScanIds(updatedClearedIds);
      localStorage.setItem("cleared_scans", JSON.stringify(updatedClearedIds));
    }
    clearLatestScan();
  };

  const renderYoloBox = (bbox: number[], diagnosis: string, confidence: number) => {
    if (!bbox || bbox.length !== 4) return null;
    const CAM_W = 640;
    const CAM_H = 480;
    
    const left = (bbox[0] / CAM_W) * 100;
    const top = (bbox[1] / CAM_H) * 100;
    const width = ((bbox[2] - bbox[0]) / CAM_W) * 100;
    const height = ((bbox[3] - bbox[1]) / CAM_H) * 100;

    let colorHex = diagnosis === "Katarak Matur" ? "#ef4444" : diagnosis === "Katarak Imatur" ? "#f97316" : "#10B981";
    let colorTailwind = diagnosis === "Katarak Matur" ? "bg-red-500" : diagnosis === "Katarak Imatur" ? "bg-orange-500" : "bg-emerald-500";

    return (
      <div className="absolute rounded-lg flex items-start transition-all duration-500" 
           style={{ 
             left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
             border: `2px solid ${colorHex}`,
             backgroundColor: `${colorHex}1A`,
             boxShadow: `0 0 15px ${colorHex}4D`
           }}>
         <span className={`${colorTailwind} text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-br-lg rounded-tl-md shadow-sm whitespace-nowrap tracking-wider`}>
           EYE : {confidence}%
         </span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 w-full pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">Pantauan Alat</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Ringkasan aktivitas pemindaian dan status perangkat cerdas.</p>
        </div>
        
        <div className="bg-white border border-slate-200 px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl shadow-sm w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status Alat</p>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <p className={`font-outfit font-bold text-sm md:text-base ${isConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                {isConnected ? 'ONLINE TERHUBUNG' : 'TERPUTUS'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-6 md:space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-2xl md:rounded-3xl"></div>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="h-64 bg-slate-200 rounded-3xl md:col-span-2"></div>
            <div className="h-64 bg-slate-200 rounded-3xl md:col-span-1"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="ph-fill ph-files text-7xl"></i></div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Pemindaian</p>
              <h3 className="text-3xl md:text-4xl font-outfit font-black text-slate-800">{stats.total}</h3>
            </div>
            <div className="bg-linear-to-br from-red-500 to-red-600 border border-red-600 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-md shadow-red-500/20 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity"><i className="ph-fill ph-warning-circle text-7xl"></i></div>
              <p className="text-[10px] md:text-xs font-bold text-red-100 uppercase tracking-widest mb-2">Katarak Matur</p>
              <h3 className="text-3xl md:text-4xl font-outfit font-black">{stats.matur}</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="ph-fill ph-eye text-7xl text-orange-500"></i></div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Katarak Imatur</p>
              <h3 className="text-3xl md:text-4xl font-outfit font-black text-orange-500">{stats.imatur}</h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><i className="ph-fill ph-check-circle text-7xl text-emerald-500"></i></div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mata Normal</p>
              <h3 className="text-3xl md:text-4xl font-outfit font-black text-emerald-600">{stats.normal}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-outfit text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                  <i className="ph-fill ph-clock text-blue-600"></i> Pindaian Terakhir
                </h3>
                {displayScan?.isLive && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full animate-pulse border border-emerald-200">
                    <i className="ph-fill ph-broadcast"></i> Live Feed Masuk
                  </span>
                )}
              </div>

              {!displayScan ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <i className="ph-fill ph-camera text-4xl text-slate-300"></i>
                  </div>
                  <h4 className="font-bold text-slate-700 mb-1">Siap Menerima Pindaian</h4>
                  <p className="text-slate-500 text-sm font-medium">Tekan tombol ambil gambar pada alat fisik Anda.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 md:gap-8 items-center md:items-start bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-100">
                  
                  <div 
                    className="relative w-full max-w-lg mx-auto bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-200 flex items-center justify-center" 
                    style={{ aspectRatio: '640/480' }}
                  >
                    <img 
                      src={`data:image/jpeg;base64,${displayScan.image}`} 
                      className="w-full h-full object-cover grayscale opacity-90" 
                      alt="Scan Mata Full View" 
                    />
                    {renderYoloBox(displayScan.boundingBox, displayScan.diagnosis, displayScan.confidenceScore)}
                  </div>
                  
                  <div className="w-full">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Pindai</p>
                        <p className="font-outfit font-bold text-slate-800 text-lg md:text-xl">#{displayScan.scanId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Waktu</p>
                        <p className="text-xs md:text-sm font-semibold text-slate-600">{dayjs(displayScan.timestamp).format('HH:mm:ss')} WIB</p>
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hasil Analisis AI</p>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 font-bold px-4 py-2 rounded-xl text-sm md:text-base ${displayScan.diagnosis === "Katarak Matur" ? "bg-red-100 text-red-700" : displayScan.diagnosis === "Katarak Imatur" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"}`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${displayScan.diagnosis === "Katarak Matur" ? "bg-red-500 animate-ping" : displayScan.diagnosis === "Katarak Imatur" ? "bg-orange-500" : "bg-emerald-500"}`}></span>
                          {displayScan.diagnosis}
                        </span>
                        <span className="text-sm font-bold text-slate-500">Akurasi: {displayScan.confidenceScore}%</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleSelesai}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-3 md:py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <i className="ph-bold ph-check-circle text-lg"></i> Selesai
                      </button>
                      <Link 
                        href={`/history/${displayScan.scanId}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 md:py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                      >
                        <i className="ph-bold ph-printer text-lg"></i> Buka Laporan
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full blur-2xl"></div>
              
              <h3 className="font-outfit text-lg md:text-xl font-bold text-white mb-6 border-b border-slate-800 pb-4 flex items-center gap-2">
                <i className="ph-fill ph-cpu text-blue-400"></i> Edge Hardware
              </h3>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nama Perangkat</p>
                  <p className="font-outfit font-bold text-lg">{device?.name || "Memuat..."}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{device?.macAddress}</p>
                </div>

                <div className={`bg-slate-800/50 rounded-2xl p-4 border transition-all ${battery <= 20 && !isCharging ? 'border-red-500/50 bg-red-500/10' : 'border-slate-700/50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Daya Baterai</p>
                    {isCharging ? (
                      <i className="ph-fill ph-lightning text-xl text-yellow-400 animate-pulse"></i>
                    ) : battery <= 10 ? (
                      <i className="ph-fill ph-battery-warning text-xl text-red-500 animate-ping"></i>
                    ) : battery <= 20 ? (
                      <i className="ph-fill ph-battery-low text-xl text-orange-400"></i>
                    ) : (
                      <i className="ph-fill ph-battery-high text-xl text-emerald-400"></i>
                    )}
                  </div>
                  <div className="flex items-end gap-2">
                    <h3 className={`text-3xl font-outfit font-black ${battery <= 20 && !isCharging ? 'text-red-400' : ''}`}>{isConnected ? battery : '--'}</h3>
                    <span className="text-slate-400 font-bold mb-1">% 
                      {isCharging ? <span className="text-yellow-400 text-[10px] uppercase ml-1 animate-pulse">(Mengisi Daya)</span> : 
                       battery <= 10 ? <span className="text-red-400 text-[10px] uppercase ml-1">(Kritis!)</span> : 
                       battery <= 20 ? <span className="text-orange-400 text-[10px] uppercase ml-1">(Lemah)</span> : ''}
                    </span>
                  </div>
                </div>

                <div className={`bg-slate-800/50 rounded-2xl p-4 border transition-all ${latency > 200 ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-slate-700/50'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Jaringan (Ping)</p>
                    <i className={`ph-fill ph-wifi-high text-xl ${latency > 200 ? 'text-yellow-400' : 'text-blue-400'}`}></i>
                  </div>
                  <div className="flex items-end gap-2">
                    <h3 className={`text-3xl font-outfit font-black ${latency > 200 ? 'text-yellow-400' : ''}`}>{isConnected ? latency : '--'}</h3>
                    <span className="text-slate-400 font-bold mb-1">ms</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}