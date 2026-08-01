import Link from "next/link";

export default function ValidationPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-outfit text-2xl font-bold text-slate-800">Antrean Validasi Medis</h2>
        <p className="text-slate-500 text-sm mt-1">Sistem menyaring hasil yang memerlukan kepastian observasi klinis.</p>
      </div>
      
      <div className="border-b border-slate-200 mb-6">
        <nav className="-mb-px flex gap-8">
          <span className="border-b-2 border-blue-500 py-4 px-1 text-sm font-bold text-blue-600 cursor-pointer">Perlu Ditinjau (1)</span>
          <span className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-slate-500 cursor-pointer">Selesai Divalidasi</span>
        </nav>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl premium-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-red-50/50 border-b border-slate-100 text-xs uppercase tracking-widest text-slate-500 font-bold">
                <th className="px-6 py-5">Antrean Pindai</th>
                <th className="px-6 py-5">Waktu Masuk</th>
                <th className="px-6 py-5">Confidence Score</th>
                <th className="px-6 py-5 text-right">Tindakan Medis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr className="hover:bg-slate-50/80 transition-colors bg-white">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex justify-center items-center font-bold text-lg"><i className="ph-fill ph-warning-circle"></i></div>
                    <div>
                      <p className="font-outfit font-bold text-slate-800">#SCN-8092</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Indikasi Katarak</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-600 font-medium">Hari ini, 14:32 WIB</td>
                <td className="px-6 py-5 font-outfit font-bold text-red-600 text-lg">94.2%</td>
                <td className="px-6 py-5 text-right">
                  <Link href="/validation/SCN-8092" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all inline-flex items-center gap-2">
                    <i className="ph-bold ph-pencil-simple"></i> Isi Diagnosis
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}