/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/id';

dayjs.locale('id');

export default function HistoryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceName, setDeviceName] = useState("Memuat...");

  useEffect(() => {
    const fetchFreshData = async () => {
      if (typeof window === "undefined") return;
      const activeDeviceId = localStorage.getItem("active_device_id");
      
      if (!activeDeviceId) {
        setDeviceName("Tidak ada alat");
        setIsLoading(false);
        return;
      }

      try {
        // PENGHANCUR CACHE: Tambahkan Date.now() agar selalu Live!
        const resDevice = await fetch(`/api/devices/${activeDeviceId}?t=${Date.now()}`, { cache: 'no-store' });
        const dataDevice = await resDevice.json();
        if (dataDevice.success) setDeviceName(dataDevice.data.name);

        const resRecords = await fetch(`/api/records?t=${Date.now()}&deviceId=${activeDeviceId}`, { cache: 'no-store' });
        const dataRecords = await resRecords.json();
        
        if (dataRecords.success) {
          const deviceRecords = dataRecords.data.filter((item: any) => item.deviceId === activeDeviceId);
          setRecords(deviceRecords.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }
      } catch (error) {
        console.error("Gagal menarik data baru");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFreshData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 w-full pb-10">
      
      {/* HEADER HALAMAN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-outfit text-2xl md:text-3xl font-bold text-slate-800">Catatan Pemeriksaan</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Riwayat laporan hasil pindai mata (Live).</p>
        </div>
        
        <div className="bg-white border border-slate-200 px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl shadow-sm w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Alat Terhubung</p>
            <p className="font-outfit font-bold text-blue-700 truncate max-w-50 md:max-w-62.5">{deviceName}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center shrink-0">
            <i className="ph-fill ph-cpu text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden relative">
        
        {isLoading ? (
          // SKELETON LOADING
          <div className="p-6 md:p-8 space-y-4">
            <div className="h-10 bg-slate-100 rounded-lg w-full mb-6"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-12 md:h-16 bg-slate-100 rounded-xl w-1/3"></div>
                <div className="h-12 md:h-16 bg-slate-100 rounded-xl w-1/4"></div>
                <div className="h-12 md:h-16 bg-slate-100 rounded-xl w-1/4"></div>
                <div className="h-12 md:h-16 bg-slate-100 rounded-xl w-1/6"></div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          
          // TIDAK ADA DATA
          <div className="p-12 md:p-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
              <i className="ph-fill ph-folder-open text-4xl text-slate-300"></i>
            </div>
            <h3 className="font-outfit text-xl font-bold text-slate-800">Belum Ada Riwayat</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">Perangkat ini belum pernah melakukan pemindaian mata.</p>
          </div>
          
        ) : (
          
          // TABEL DATA RESPONSIF
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left min-w-175 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] md:text-xs uppercase tracking-widest text-slate-500 font-bold">
                  <th className="px-6 py-5 rounded-tl-3xl">Profil Pasien</th>
                  <th className="px-6 py-5">Waktu Terekam</th>
                  <th className="px-6 py-5">Hasil Diagnosis AI</th>
                  <th className="px-6 py-5 text-center rounded-tr-3xl">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4 md:py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <i className="ph-fill ph-user text-lg"></i>
                        </div>
                        <div>
                          <p className="font-outfit font-bold text-slate-800 text-sm md:text-base">{record.patientName || "Pasien Anonim"}</p>
                          <p className="text-[10px] md:text-xs text-slate-500 font-semibold uppercase mt-0.5">{record.patientAge ? `Usia: ${record.patientAge} Tahun` : "Usia Tidak Diketahui"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 md:py-5">
                      <p className="font-semibold text-slate-700">{dayjs(record.timestamp).format('DD MMM YYYY')}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{dayjs(record.timestamp).format('HH:mm:ss')} WIB</p>
                    </td>
                    <td className="px-6 py-4 md:py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex items-center gap-2 font-bold w-max px-3 py-1.5 rounded-lg text-xs md:text-sm ${record.diagnosis === "Katarak Matur" ? "bg-red-50 text-red-700" : record.diagnosis === "Katarak Imatur" ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700"}`}>
                          <span className={`w-2 h-2 rounded-full ${record.diagnosis === "Katarak Matur" ? "bg-red-500" : record.diagnosis === "Katarak Imatur" ? "bg-orange-500" : "bg-emerald-500"}`}></span>
                          {record.diagnosis}
                        </span>
                        <p className="text-[10px] md:text-xs text-slate-400 font-semibold uppercase tracking-wider pl-1">Akurasi AI: <span className="text-slate-600">{record.confidenceScore}%</span></p>
                      </div>
                    </td>
                    <td className="px-6 py-4 md:py-5 text-center">
                      <Link href={`/history/${record.scanId}`} className="inline-flex justify-center items-center gap-2 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-700 font-bold px-4 py-2 md:py-2.5 rounded-xl transition-all shadow-sm w-full md:w-auto text-xs md:text-sm">
                        <i className="ph-bold ph-printer text-base md:text-lg"></i> Laporan
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}