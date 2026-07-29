"use client";

export default function ExportButton({ onClick, isLoading }: { onClick: () => void; isLoading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] cursor-pointer ${
        isLoading ? "opacity-75 cursor-not-allowed" : ""
      } print-hide`}
    >
      <i className={isLoading ? "ph-bold ph-spinner animate-spin text-lg" : "ph-bold ph-printer text-lg"}></i>
      {isLoading ? "Menyusun PDF..." : "Unduh Laporan PDF"}
    </button>
  );
}