import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="font-outfit text-2xl font-bold text-slate-800">Database Rekam Medis</h2>
        <p className="text-slate-500 text-sm mt-1">Gunakan tombol detail untuk melihat keseluruhan data alat dan hasil evaluasi.</p>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl premium-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400 font-semibold">
                <th className="px-6 py-5">Kode Pindai</th>
                <th className="px-6 py-5">Waktu Terekam</th>
                <th className="px-6 py-5">Hasil Diagnosis</th>
                <th className="px-6 py-5">Confidence Score</th>
                <th className="px-6 py-5">Status Validasi</th>
                <th className="px-6 py-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 font-outfit font-semibold text-slate-800">#SCN-8092</td>
                <td className="px-6 py-4 text-slate-500">28 Jul 2026, 14:32 WIB</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-red-600"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Indikasi Katarak</span>
                </td>
                <td className="px-6 py-4 font-outfit font-bold text-slate-700">94.2%</td>
                <td className="px-6 py-4"><StatusBadge status="validated" /></td>
                <td className="px-6 py-4 text-center">
                  <Link href="/history/SCN-8092" className="text-blue-600 hover:text-blue-800 font-semibold flex justify-center items-center gap-1"><i className="ph-bold ph-eye"></i> Lihat Detail</Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}