/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import 'dayjs/locale/id';

dayjs.locale('id');

export default function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [record, setRecord] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch(`/api/records/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecord(data.data);
        } else {
          setIsError(true);
        }
      })
      .catch(() => setIsError(true));
  }, [id]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("pdf-report-area");
    
    if (element) {
      const opt = {
        margin: 0.5,
        filename: `Rekam-Medis-Ocusense-${id}.pdf`,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      // =========================================================================
      // SOLUSI MUTLAK: MEMATIKAN SAKLAR CSS TANPA MERUSAK REACT DOM
      // =========================================================================
      const stylesheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')) as (HTMLStyleElement | HTMLLinkElement)[];
      
      // 1. Matikan sementara CSS global agar mesin PDF terhindar dari error lab()
      stylesheets.forEach(sheet => {
        sheet.disabled = true; 
      });

      try {
        // 2. Ekstrak PDF dari elemen yang sudah kita desain dengan Inline-Style penuh
        await html2pdf().set(opt).from(element).save();
      } catch (error) {
        console.error("Gagal mencetak PDF:", error);
      } finally {
        // 3. Nyalakan kembali saklar CSS. React tidak akan error karena elemen tidak dipindah!
        stylesheets.forEach(sheet => {
          sheet.disabled = false;
        });
      }
    }
    setIsExporting(false);
  };

  if (isError) {
    return (
      <div className="p-20 text-center max-w-lg mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 mt-10">
        <div className="text-red-500 mb-4"><i className="ph-fill ph-warning-circle text-7xl animate-pulse"></i></div>
        <h2 className="text-2xl font-outfit font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h2>
        <p className="text-slate-500 mb-8">Rekam medis dengan ID <strong className="text-slate-800">{id}</strong> tidak terdaftar.</p>
        <button onClick={() => router.push('/history')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center">
        <i className="ph-bold ph-spinner animate-spin text-5xl text-blue-600 mb-4"></i>
        <div className="font-bold text-slate-500 animate-pulse text-lg">Menyiapkan Laporan Medis...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* AREA NAVIGASI WEB */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <button onClick={() => router.push('/history')} className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mb-2">
            <i className="ph-bold ph-arrow-left"></i> Kembali ke Riwayat
          </button>
          <h2 className="font-outfit text-3xl font-bold text-slate-800">Laporan #{id}</h2>
        </div>
        <button 
          onClick={handleExportPDF} 
          disabled={isExporting}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg"
        >
          <i className={isExporting ? "ph-bold ph-spinner animate-spin" : "ph-bold ph-printer"}></i>
          {isExporting ? "Mengekstrak Dokumen..." : "Cetak Dokumen Legal (PDF)"}
        </button>
      </div>

      {/* AREA CETAK PDF - MENGGUNAKAN INLINE STYLES PENUH AGAR AMAN SAAT CSS DIMATIKAN */}
      <div id="pdf-report-area-container" style={{ width: '100%', overflowX: 'auto' }}>
        <div 
          id="pdf-report-area" 
          style={{
            width: '790px',
            margin: '0 auto',
            padding: '3rem',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '1.5rem',
            color: '#1e293b',
            position: 'relative',
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {record.referralIssued && (
            <div style={{
              position: 'absolute',
              top: '2.5rem',
              right: '2.5rem',
              border: '4px solid #ef4444',
              color: '#ef4444',
              backgroundColor: '#ffffff',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '1.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '0.75rem',
              transform: 'rotate(12deg)',
              zIndex: 10
            }}>
              RUJUKAN OPERASI
            </div>
          )}
          
          {/* Header Laporan */}
          <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '2rem', letterSpacing: '-0.025em' }}>
                <span style={{ fontWeight: 800, color: '#2563eb' }}>OCU</span>
                <span style={{ fontWeight: 300, color: '#1e293b' }}>SENSE</span>
                <span style={{ fontSize: '1.25rem', color: '#2563eb' }}>.ai</span>
              </h2>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase' }}>
                Laporan Pemeriksaan Klinis (IoT)
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>
                ID Laporan: <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b' }}>{id}</span>
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                Waktu Pindai: <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{dayjs(record.timestamp).format('DD MMM YYYY, HH:mm')} WIB</span>
              </p>
            </div>
          </div>

          {/* Citra Medis */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Citra Medis (Ocular)
            </h3>
            <div style={{ backgroundColor: '#000000', borderRadius: '1rem', border: '1px solid #e2e8f0', height: '280px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src="/assets/mata.jpg" alt="Scanned Eye" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
            </div>
          </div>

          {/* Grid Hasil Medis */}
          <div style={{ display: 'flex', gap: '2rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Hasil Keputusan Klinis</h3>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>Diagnosis Final Dokter:</p>
              <p style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{record.diagnosis}</p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>Akurasi Deteksi Tepi (AI):</p>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>{record.confidenceScore}%</p>
            </div>
            
            <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>Status Peninjauan:</p>
              <p style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: 'bold', color: record.validationStatus === "validated" ? '#059669' : '#f97316' }}>
                {record.validationStatus === "validated" ? 'Tervalidasi (Dokter)' : 'Menunggu Validasi'}
              </p>
              <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: '#64748b' }}>Catatan Resep / Observasi Khusus:</p>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, fontStyle: 'italic', color: '#334155' }}>
                {record.doctorNotes ? `"${record.doctorNotes}"` : "Tidak ada catatan khusus yang diberikan."}
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '4rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
            <p style={{ margin: '0 0 0.25rem 0' }}>Dokumen ini dihasilkan secara otomatis oleh sistem arsitektur Ocusense AI IoT.</p>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Universitas Negeri Jakarta - Gemastik 2026</p>
          </div>

        </div>
      </div>
    </div>
  );
}