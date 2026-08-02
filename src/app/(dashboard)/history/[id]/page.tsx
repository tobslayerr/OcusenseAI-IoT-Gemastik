/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @next/next/no-img-element */
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
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!document.getElementById('html-to-image-script')) {
      const script1 = document.createElement('script');
      script1.id = 'html-to-image-script';
      script1.src = "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
      document.head.appendChild(script1);
    }
    if (!document.getElementById('jspdf-script')) {
      const script2 = document.createElement('script');
      script2.id = 'jspdf-script';
      script2.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      document.head.appendChild(script2);
    }

    if (!id) return;
    const activeDeviceId = localStorage.getItem("active_device_id");
    fetch(`/api/records/${id}?deviceId=${activeDeviceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRecord(data.data);
        setIsLoading(false);
      });
  }, [id]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    // 🟢 TRIK PAMUNGKAS: Membungkam Console (Console Interceptor)
    // Menyembunyikan keluhan "SecurityError cssRules" dari html-to-image yang tidak fatal
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      if (errorMessage.includes('cssRules') || errorMessage.includes('SecurityError') || errorMessage.includes('Error inlining remote css file')) {
        return; // Abaikan pesan peringatan ini
      }
      originalConsoleError(...args); // Biarkan error asli lainnya tetap muncul
    };

    try {
      // @ts-ignore
      const htmlToImage = window.htmlToImage;
      // @ts-ignore
      const jsPDF = window.jspdf?.jsPDF;

      if (!htmlToImage || !jsPDF) {
        alert("Sistem konversi PDF sedang disiapkan. Mohon tunggu 2 detik dan klik lagi.");
        setIsDownloading(false);
        console.error = originalConsoleError; // Kembalikan console jika dibatalkan
        return;
      }

      const hiddenContainer = document.createElement('div');
      hiddenContainer.style.position = 'absolute';
      hiddenContainer.style.top = '-9999px';
      hiddenContainer.style.left = '-9999px';
      hiddenContainer.style.width = '800px'; 
      hiddenContainer.style.backgroundColor = '#ffffff';
      document.body.appendChild(hiddenContainer);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [800, 1131] });
      const pagesToPrint = ['pdf-page-1', 'pdf-page-2'];

      for (let i = 0; i < pagesToPrint.length; i++) {
        const originalPage = document.getElementById(pagesToPrint[i]);
        if (!originalPage) continue;

        const clone = originalPage.cloneNode(true) as HTMLElement;
        clone.style.width = '800px';
        clone.style.height = '1131px';
        clone.style.padding = '60px'; 
        clone.style.boxSizing = 'border-box';
        clone.style.backgroundColor = '#ffffff';
        clone.style.borderRadius = '0';
        clone.style.boxShadow = 'none';

        hiddenContainer.appendChild(clone);

        const dataUrl = await htmlToImage.toJpeg(clone, {
          quality: 1.0,
          pixelRatio: 2, 
          backgroundColor: '#ffffff'
        });

        if (i > 0) pdf.addPage([800, 1131], 'portrait');
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 800, 1131);

        hiddenContainer.removeChild(clone);
      }

      pdf.save(`Laporan_Medis_${record.scanId}.pdf`);
      document.body.removeChild(hiddenContainer);

    } catch (error) {
      // Jika terjadi error sistem nyata (bukan sekadar peringatan CSS), tampilkan dengan console asli
      originalConsoleError("Gagal mencetak PDF:", error);
      alert("Terjadi kesalahan sistem saat membuat dokumen PDF.");
    } finally {
      // 🟢 KEMBALIKAN CONSOLE: Buka kembali izin log error pada peramban
      console.error = originalConsoleError;
      setIsDownloading(false);
    }
  };

  if (isLoading || !record) {
    return <div className="p-20 text-center font-bold text-slate-500">Memuat Laporan...</div>;
  }

  const renderYoloBox = (bbox: any, diagnosis: string, confidence: number) => {
    if (!bbox || bbox.length !== 4) return null;
    const CAM_W = 640;
    const CAM_H = 480;
    
    const left = (bbox[0] / CAM_W) * 100;
    const top = (bbox[1] / CAM_H) * 100;
    const width = ((bbox[2] - bbox[0]) / CAM_W) * 100;
    const height = ((bbox[3] - bbox[1]) / CAM_H) * 100;

    let colorHex = diagnosis === "Katarak Matur" ? "#dc2626" : diagnosis === "Katarak Imatur" ? "#ea580c" : "#059669";

    return (
      <div className="absolute rounded-lg flex items-start" 
           style={{ 
             left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`,
             border: `2px solid ${colorHex}`,
             backgroundColor: `${colorHex}1A`
           }}>
         <span style={{ backgroundColor: colorHex, color: '#ffffff' }} className="text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-md whitespace-nowrap tracking-wider">
           EYE : {confidence}%
         </span>
      </div>
    );
  };

  const diagColor = record.diagnosis === "Katarak Matur" ? "#dc2626" : record.diagnosis === "Katarak Imatur" ? "#ea580c" : "#059669";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 px-4 md:px-0">
      
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-colors">
          <i className="ph-bold ph-arrow-left"></i> Kembali ke Riwayat
        </button>
        <button 
          onClick={handleDownloadPDF} 
          disabled={isDownloading}
          className="bg-blue-600 text-white px-5 md:px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
        >
          {isDownloading ? <i className="ph-bold ph-spinner animate-spin text-lg md:text-xl"></i> : <i className="ph-bold ph-download-simple text-lg md:text-xl"></i>}
          {isDownloading ? 'Menyiapkan Dokumen...' : 'Download ke PDF'}
        </button>
      </div>
          
      <div id="pdf-page-1" className="bg-white p-6 md:p-12 border border-slate-200 rounded-2xl shadow-sm flex flex-col font-sans mb-8">
        
        <div className="border-b-4 border-slate-800 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-widest m-0">Laporan Pemindaian AI</h1>
            <p className="text-slate-500 mt-1 font-medium m-0">Sistem Deteksi Dini Katarak Ocusense</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 m-0">ID Pindai</p>
            <p className="text-lg md:text-xl font-bold font-mono text-slate-800 m-0">#{record.scanId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 m-0">Data Pasien</h3>
            <p className="text-[11px] md:text-sm text-slate-500 mb-1 m-0">Nama Lengkap:</p>
            <p className="text-base md:text-lg font-bold text-slate-800 mb-3 m-0">{record.patientName || "Pasien Anonim"}</p>
            <p className="text-[11px] md:text-sm text-slate-500 mb-1 m-0">Usia & Tanggal Periksa:</p>
            <p className="text-sm md:text-md font-bold text-slate-800 m-0">{record.patientAge ? `${record.patientAge} Tahun` : "-"} / {dayjs(record.timestamp).format('DD MMMM YYYY')}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 m-0">Data Perangkat Asal</h3>
            <p className="text-[11px] md:text-sm text-slate-500 mb-1 m-0">Lokasi Pemindaian (Alat):</p>
            <p className="text-base md:text-lg font-bold text-slate-800 mb-3 m-0">{record.device?.name || "-"}</p>
            <p className="text-[11px] md:text-sm text-slate-500 mb-1 m-0">Alamat Jaringan Keras:</p>
            <p className="text-sm md:text-md font-bold text-slate-800 font-mono m-0">{record.device?.macAddress || "-"}</p>
          </div>
        </div>

        <div className="mb-6 flex gap-8 items-center border border-slate-200 p-6 md:p-8 rounded-2xl bg-white">
          <div className="w-full">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 m-0">Kesimpulan Analisis Klinis</h3>
            <h2 className="text-2xl md:text-4xl font-black mb-6 m-0 uppercase" style={{ color: diagColor }}>
              {record.diagnosis}
            </h2>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
              <div>
                <p className="text-[11px] md:text-sm text-slate-500 mb-1 m-0">Confidence Score (Akurasi):</p>
                <p className="text-xl md:text-3xl font-bold text-slate-800 m-0">{record.confidenceScore}%</p>
              </div>
              <div>
                <p className="text-[11px] md:text-sm text-slate-500 mb-1 m-0">Status Penanganan:</p>
                <p className="text-lg md:text-xl font-bold text-slate-800 m-0">
                  {record.diagnosis === "Katarak Matur" ? "Perlu Rujukan Bedah Phaco" : "Batas Aman / Observasi Lanjutan"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grow min-h-10"></div>

        <div className="text-center text-[10px] md:text-xs text-slate-400 border-t border-slate-200 pt-6 mt-6 m-0">
          Lanjut ke halaman berikutnya untuk melihat rekaman Citra Medis Dasar dan Lokalisasi (YOLO).
        </div>
      </div>

      <div id="pdf-page-2" className="bg-white p-6 md:p-12 border border-slate-200 rounded-2xl shadow-sm flex flex-col font-sans">
        
        <div className="border-b-4 border-slate-800 pb-6 mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-widest m-0">Lampiran Citra Medis</h2>
          <p className="text-slate-500 mt-1 font-medium text-xs md:text-sm m-0">Laporan #{record.scanId}</p>
        </div>

        <h3 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 m-0">Lokalisasi Kornea Mata (YOLO Vision)</h3>
        
        <div 
          className="mb-8 w-full max-w-160 mx-auto bg-black rounded-2xl overflow-hidden border-2 border-slate-200 relative flex items-center justify-center"
          style={{ aspectRatio: '640/480' }}
        >
          <img 
            src={`data:image/jpeg;base64,${record.image}`} 
            className="w-full h-full object-contain grayscale opacity-90" 
            style={{ display: 'block' }}
            alt="Scanned Eye" 
          />
          {renderYoloBox(record.boundingBox, record.diagnosis, record.confidenceScore)}
        </div>

        <div className="grow min-h-10"></div>

        <div className="text-center text-[10px] md:text-xs text-slate-400 border-t border-slate-200 pt-6 mt-6 m-0">
          Dokumen elektronik ini dihasilkan secara otomatis oleh sistem komputasi Edge AI Ocusense.<br/>
          Laporan ini bersifat sebagai penunjang skrining awal dan bukan merupakan vonis diagnosis klinis mutlak.<br/>
          Harap selalu konsultasikan hasil ini kepada Dokter Spesialis Mata (Sp.M).
        </div>
      </div>

    </div>
  );
}