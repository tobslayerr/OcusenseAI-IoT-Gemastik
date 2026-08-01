export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl border border-slate-100 premium-shadow p-8">
        <h3 className="font-outfit text-xl font-bold text-slate-800 mb-2 flex items-center gap-2"><i className="ph-fill ph-broadcast text-blue-600"></i> Penjaluran Peringatan Otomatis</h3>
        <p className="text-sm text-slate-500 mb-8 max-w-2xl">Atur destinasi peringatan dini. Sistem akan mengirim pesan otomatis via WhatsApp/SMS dan Email jika alat mendeteksi indikasi katarak.</p>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nomor WhatsApp</label>
              <input type="tel" defaultValue="+62 812 3456 7890" className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Surel Medis</label>
              <input type="email" defaultValue="dokter.jaga@rspusat.id" className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
            </div>
          </div>
          <div className="text-right pt-4 border-t border-slate-100">
            <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">Simpan Konfigurasi</button>
          </div>
        </form>
      </div>
    </div>
  );
}