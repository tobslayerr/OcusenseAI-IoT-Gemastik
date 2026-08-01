/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ValidationFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState("katarak_imatur");
  const [isRujukan, setIsRujukan] = useState(false);

  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setDiagnosis(val);
    if (val === "katarak_matur") setIsRujukan(true);
    else setIsRujukan(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push(`/history/${params.id}`);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <Link href="/validation" className="text-blue-600 text-sm font-semibold hover:underline flex items-center gap-1 mb-2">
          <i className="ph-bold ph-arrow-left"></i> Kembali ke Antrean
        </Link>
        <h2 className="font-outfit text-3xl font-bold text-slate-800">Validasi Medis <span className="text-blue-600">#{params.id}</span></h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <div className="bg-white p-3 rounded-3xl border border-slate-100 premium-shadow mb-6">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <img src="/assets/mata.jpg" className="w-full h-full object-cover grayscale opacity-80" alt="Scanned Eye" />
              <div className="absolute w-3/4 h-3/4 yolo-box rounded-lg flex items-start">
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg rounded-tl-md">EYE : 0.94</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 premium-shadow flex flex-col h-full overflow-hidden relative">
            <div className="absolute top-0 w-full h-2 bg-blue-500"></div>
            <div className="p-8 pb-4">
              <h3 className="font-outfit text-xl font-bold text-slate-800">Tetapkan Keputusan Klinis</h3>
              <p className="text-sm text-slate-500 mt-1">Sistem menyimpulkan probabilitas Katarak 94.2%.</p>
            </div>
            <div className="p-8 pt-4 flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Diagnosis Final</label>
                  <select value={diagnosis} onChange={handleDiagnosisChange} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-medium">
                    <option value="katarak_matur">Katarak Matur (Katarak Berat)</option>
                    <option value="katarak_imatur">Katarak Imatur (Setuju Analisis)</option>
                    <option value="normal">Mata Normal (Sanggah Analisis)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Terbitkan Rujukan Operasi</p>
                    <p className="text-xs text-slate-500 mt-0.5">Rujuk bedah Phacoemulsification</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isRujukan} onChange={(e) => setIsRujukan(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Resep Obat / Catatan Khusus</label>
                  <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all resize-none" placeholder="Masukkan catatan..."></textarea>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] flex justify-center items-center gap-2">
                  <i className={isSubmitting ? "ph-bold ph-spinner animate-spin text-xl" : "ph-bold ph-check-circle text-xl"}></i> 
                  {isSubmitting ? "Menyimpan ke DB..." : "Validasi & Simpan"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}