export default function StatusBadge({ status }: { status: "pending" | "validated" }) {
  if (status === "validated") {
    return (
      <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        Sudah Divalidasi
      </span>
    );
  }
  return (
    <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
      Belum Validasi
    </span>
  );
}