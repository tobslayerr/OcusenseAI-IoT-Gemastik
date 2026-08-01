import TelemetryCard from "@/components/ui/TelemetryCard";

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TelemetryCard 
          title="Lokasi Perangkat" 
          value="Area Medis A" 
          subtitle="Online" 
          icon="ph-broadcast" 
          iconBgColor="bg-slate-50" 
          iconTextColor="text-slate-600" 
        />
        <TelemetryCard 
          title="Daya Alat Tersisa" 
          value={<span className="flex items-center gap-2"><i className="ph-fill ph-battery-high text-green-500"></i> 86%</span>} 
          subtitle="INA219 Sensor" 
          icon="ph-lightning" 
          iconBgColor="bg-blue-50" 
          iconTextColor="text-blue-600" 
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl premium-shadow p-2">
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-6 lg:p-10 min-h-100 flex flex-col justify-center">
          <div className="w-full max-w-3xl mx-auto">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 premium-shadow animate-bounce">
                <i className="ph-fill ph-camera text-3xl text-blue-500"></i>
              </div>
              <h3 className="font-outfit text-xl font-bold text-slate-800">Menunggu Pemindaian...</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Sistem bersiap menganalisis citra mata secara otomatis melalui YOLOv8 dan CNN EfficientNet.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}