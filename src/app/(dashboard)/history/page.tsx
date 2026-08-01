/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/id';

dayjs.locale('id');

export default function HistoryListPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Menyedot semua data dari PostgreSQL
  useEffect(() => {
    fetch("/api/records")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecords(data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-slate-800">Riwayat Rekam Medis</h1>
          <p className="text-slate-500 mt-1">Daftar seluruh hasil pemindaian Ocusense IoT</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2 px-4 rounded-xl flex items-center gap-2 transition-all">
          <i className="ph-bold ph-arrows-clockwise"></i> Segarkan Data
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 premium-shadow overflow-hidden">
        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center">
             <i className="ph-bold ph-spinner animate-spin text-4xl text-blue-600 mb-4"></i>
             <p className="font-bold text-slate-500 animate-pulse">Memuat data dari PostgreSQL...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <i className="ph-fill ph-folder-open text-3xl text-slate-400"></i>
            </div>
            <h3 className="font-outfit text-xl font-bold text-slate-800">Belum Ada Data</h3>
            <p className="text-slate-500 mt-2">Nyalakan alat IoT untuk mulai memindai pasien.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest pl-8">Scan ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Waktu Pindai</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Diagnosis</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status Validasi</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center pr-8">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-8">
                      <span className="font-mono font-bold text-slate-800">{record.scanId}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {dayjs(record.timestamp).format('DD MMM YYYY, HH:mm')}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{record.diagnosis}</span>
                      <div className="text-xs text-slate-500 mt-0.5">Akurasi: {record.confidenceScore}%</div>
                    </td>
                    <td className="p-4">
                      {record.validationStatus === "validated" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <i className="ph-bold ph-check"></i> Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                          <i className="ph-bold ph-clock"></i> Tertunda
                        </span>
                      )}
                    </td>
                    <td className="p-4 pr-8 text-center">
                      <Link 
                        href={`/history/${record.scanId}`}
                        className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      >
                        <i className="ph-bold ph-file-pdf"></i> Lihat PDF
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