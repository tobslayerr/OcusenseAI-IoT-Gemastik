/* eslint-disable @next/next/no-img-element */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import dayjs from "dayjs";
import 'dayjs/locale/id';

dayjs.locale('id');

export default function LaporanPDFPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/records/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecord(data.data);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading || !record) {
    return <div className="p-20 text-center font-bold text-slate-500">Memuat Laporan...</div>;
  }

  // 🟢 DESAIN YOLO KERTAS PDF
  const renderYoloBox = (bbox: any, diagnosis: string, confidence: number) => {
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
      <div className="absolute rounded-lg flex items-start" 
           style={{ 
             left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
             border: `2px solid ${colorHex}`,
             backgroundColor: `${colorHex}1A`,
             boxShadow: `0 0 15px ${colorHex}4D`
           }}>
         <span className={`${colorTailwind} text-white text-[10px] font-bold px-3 py-1.5 rounded-br-lg rounded-tl-md shadow-sm whitespace-nowrap tracking-wider`}>
           EYE : {confidence}%
         </span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 md:p-14 shadow-sm border border-slate-200 rounded-xl min-h-screen print:p-0 print:border-none print:shadow-none">
      
      <div className="flex justify-between items-center mb-10 print:hidden">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2">
          <i className="ph-bold ph-arrow-left"></i> Kembali
        </button>
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 flex items-center gap-2">
          <i className="ph-bold ph-printer text-xl"></i> Cetak ke PDF
        </button>
      </div>

      <div className="border-b-4 border-slate-800 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-widest">Laporan Pemindaian AI</h1>
          <p className="text-slate-500 mt-1 font-medium">Sistem Deteksi Dini Katarak Ocusense</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Pindai</p>
          <p className="text-xl font-bold font-mono text-slate-800">#{record.scanId}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Data Pasien</h3>
          <p className="text-sm text-slate-500 mb-1">Nama Lengkap:</p>
          <p className="text-lg font-bold text-slate-800 mb-3">{record.patientName || "Pasien Anonim"}</p>
          <p className="text-sm text-slate-500 mb-1">Usia & Tanggal Periksa:</p>
          <p className="text-md font-bold text-slate-800">{record.patientAge ? `${record.patientAge} Tahun` : "-"} / {dayjs(record.timestamp).format('DD MMMM YYYY')}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Data Perangkat Asal</h3>
          <p className="text-sm text-slate-500 mb-1">Lokasi Pemindaian (Alat):</p>
          <p className="text-lg font-bold text-slate-800 mb-3">{record.device?.name || "-"}</p>
          <p className="text-sm text-slate-500 mb-1">Sistem Pemroses:</p>
          <p className="text-md font-bold text-slate-800">Edge Computing Node</p>
        </div>
      </div>

      {/* GAMBAR FULL VIEW DENGAN YOLO */}
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Citra Medis & Lokalisasi YOLO</h3>
      
      {/* KUNCI RASIO 4:3 UNTUK PDF */}
      <div 
        className="mb-10 w-full bg-black rounded-2xl overflow-hidden border-2 border-slate-200 relative flex items-center justify-center"
        style={{ aspectRatio: '640/480' }}
      >
        <img 
          src={`data:image/jpeg;base64,${record.image}`} 
          className="w-full h-full object-cover grayscale opacity-90" 
          alt="Scanned Eye" 
        />
        {renderYoloBox(record.boundingBox, record.diagnosis, record.confidenceScore)}
      </div>

      <div className="mb-10 flex gap-8 items-center border border-slate-200 p-8 rounded-2xl">
        <div className="w-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kesimpulan Analisis AI</h3>
          <h2 className={`text-4xl font-black mb-4 ${record.diagnosis === "Katarak Matur" ? "text-red-600" : record.diagnosis === "Katarak Imatur" ? "text-orange-500" : "text-emerald-600"}`}>
            {record.diagnosis}
          </h2>
          <div className="flex items-center gap-12">
            <div>
              <p className="text-sm text-slate-500 mb-1">Confidence Score (Akurasi):</p>
              <p className="text-3xl font-bold text-slate-800">{record.confidenceScore}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Status Penanganan:</p>
              <p className="text-xl font-bold text-slate-800">
                {record.diagnosis === "Katarak Matur" ? "⚠️ Perlu Rujukan Bedah" : "Batas Aman / Observasi"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 border-t border-slate-200 pt-8 mt-20">
        Dokumen elektronik ini dihasilkan secara otomatis oleh Ocusense AI.<br/>
        Analisis kecerdasan buatan bukan merupakan vonis mutlak pengganti diagnosis Dokter Spesialis Mata.
      </div>
    </div>
  );
}