/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, use } from "react"; // Tambahkan impor 'use' dari React
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";
import ExportButton from "@/components/ui/ExportButton";

// Ubah tipe params menjadi Promise
export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Buka bungkus Promise menggunakan use()
  const { id } = use(params);

  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("pdf-report-area");
    
    if (element) {
      const opt = {
        margin: 0.5,
        filename: `Rekam-Medis-${id}.pdf`, // Gunakan variabel 'id'
        image: { type: 'jpeg' as 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as 'in', format: 'a4' as 'a4', orientation: 'portrait' as 'portrait' }
      };
      
      const originalClasses = element.className;
      element.className = "bg-white p-8 text-slate-800 max-w-[790px] mx-auto";
      
      await html2pdf().set(opt).from(element).save();
      element.className = originalClasses;
    }
    setIsExporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 print-hide">
        <div>
          <button onClick={() => router.back()} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mb-2">
            <i className="ph-bold ph-arrow-left"></i> Kembali
          </button>
          <h2 className="font-outfit text-3xl font-bold text-slate-800">Laporan #{id}</h2>
        </div>
        <ExportButton onClick={handleExportPDF} isLoading={isExporting} />
      </div>

      <div id="pdf-report-area" className="bg-white border border-slate-200 md:rounded-2xl shadow-sm p-8 md:p-12 text-slate-800">
        <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-center">
          <div>
            <h2 className="font-outfit text-3xl tracking-tight"><span className="font-extrabold text-blue-600">OCU</span><span className="font-light text-slate-800">SENSE</span><span className="text-blue-600 text-xl">.ai</span></h2>
            <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mt-1">Cataract Screening Report</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">ID Laporan: <span className="font-mono font-bold text-slate-800">{id}</span></p>
            <p className="text-sm text-slate-500">Waktu Scan: <span className="font-bold text-slate-800">28 Juli 2026, 14:32 WIB</span></p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Citra Medis & Lokalisasi</h3>
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-200">
            <img src="/assets/mata.jpg" className="w-full h-full object-cover grayscale opacity-90" alt="Scanned Eye" />
            <div className="absolute w-3/4 h-3/4 yolo-box rounded-lg flex items-start">
              <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-br-lg rounded-tl-md">EYE : 0.94</span>
              <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border border-blue-400 bg-blue-500/10 rounded-full flex items-start">
                <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-md rounded-tl-full">PUPIL : 0.92</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-4">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Sistem Klasifikasi Tepi</h3>
            <p className="text-sm text-slate-500 mb-1">Hasil Diagnosa Alat:</p>
            <p className="text-2xl font-outfit font-bold text-red-600 mb-4">Katarak Matur</p>
            <p className="text-sm text-slate-500 mb-1">Confidence Score:</p>
            <p className="text-2xl font-outfit font-bold text-slate-800">94.2%</p>
          </div>
          <div className="flex flex-col justify-center items-start pl-8 border-l border-slate-200">
            <p className="text-sm text-slate-500 mb-3">Status Peninjauan Sistem:</p>
            <StatusBadge status="validated" />
          </div>
        </div>
      </div>
    </div>
  );
}