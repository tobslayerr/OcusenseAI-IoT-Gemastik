/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import 'dayjs/locale/id';

dayjs.locale('id');

export default function ValidationFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [record, setRecord] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk form
  const [diagnosis, setDiagnosis] = useState("");
  const [isRujukan, setIsRujukan] = useState(false);
  const [notes, setNotes] = useState("");

  // Mengambil data dari API
  useEffect(() => {
    fetch(`/api/records/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecord(data.data);
          setDiagnosis(data.data.diagnosis); // Diagnosis bawaan AI
          setIsRujukan(data.data.diagnosis === "Katarak Matur"); 
        }
      });
  }, [id]);

  // Logika Cerdas: Auto-toggle rujukan operasi
  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDiagnosis(val);
    if (val === "Katarak Matur") setIsRujukan(true);
    else setIsRujukan(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch(`/api/records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validationStatus: "validated",
          diagnosis: diagnosis,
          referralIssued: isRujukan,
          doctorNotes: notes
        })
      });
      // Arahkan langsung ke halaman cetak PDF setelah sukses
      router.push(`/history/${id}`);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!record) return <div className="p-10 text-center font-bold animate-pulse text-blue-600">Memuat Data Medis...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/validation" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mb-2">
          <i className="ph-bold ph-arrow-left"></i> Kembali ke Antrean
        </Link>
        <h2 className="font-outfit text-3xl font-bold text-slate-800">Validasi Medis <span className="text-blue-600">#{id}</span></h2>
        <p className="text-slate-500 text-sm mt-1">Waktu Pindai: {dayjs(record.timestamp).format('DD MMMM YYYY, HH:mm WIB')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="bg-white p-3 rounded-3xl border border-slate-100 premium-shadow mb-6">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <img src="/assets/mata.jpg" className="w-full h-full object-cover grayscale opacity-80" alt="Scanned Eye" />
              <div className="absolute w-3/4 h-3/4 border-2 border-emerald-500 rounded-lg flex items-start bg-emerald-500/10">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-md">
                  AI DETECTION: {record.confidenceScore.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 premium-shadow flex flex-col h-full overflow-hidden relative">
            <div className="absolute top-0 w-full h-2 bg-blue-500"></div>
            <div className="p-8 pb-4">
              <h3 className="font-outfit text-xl font-bold text-slate-800">Tetapkan Keputusan Klinis</h3>
              <p className="text-sm text-slate-500 mt-1">Sistem Edge AI merekomendasikan: <strong className="text-slate-800">{record.diagnosis}</strong></p>
            </div>
            <div className="p-8 pt-4 flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Diagnosis Final</label>
                  <select value={diagnosis} onChange={handleDiagnosisChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-medium">
                    <option value="Katarak Matur">Katarak Matur (Katarak Berat)</option>
                    <option value="Katarak Imatur">Katarak Imatur</option>
                    <option value="Mata Normal">Mata Normal (Sanggah AI)</option>
                  </select>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isRujukan ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Terbitkan Rujukan Operasi</p>
                    <p className="text-xs text-slate-500 mt-0.5">Rujuk bedah Phacoemulsification</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isRujukan} onChange={(e) => setIsRujukan(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resep Obat / Catatan Khusus</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all resize-none" placeholder="Opsional: Masukkan catatan..."></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex justify-center items-center gap-2">
                  <i className={isSubmitting ? "ph-bold ph-spinner animate-spin text-xl" : "ph-bold ph-check-circle text-xl"}></i> 
                  {isSubmitting ? "Menyimpan ke Database..." : "Validasi & Simpan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}