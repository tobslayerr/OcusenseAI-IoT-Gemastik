interface TelemetryCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: string;
  iconBgColor: string;
  iconTextColor: string;
}

export default function TelemetryCard({ title, value, subtitle, icon, iconBgColor, iconTextColor }: TelemetryCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 premium-shadow flex justify-between items-center">
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="text-lg font-outfit font-bold text-slate-800">
          {value} {subtitle && <span className="text-sm font-medium text-slate-500">({subtitle})</span>}
        </div>
      </div>
      <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center ${iconTextColor}`}>
        <i className={`ph-fill ${icon} text-2xl`}></i>
      </div>
    </div>
  );
}