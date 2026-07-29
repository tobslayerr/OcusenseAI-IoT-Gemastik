"use client";

import NotifDropdown from "./NotifDropdown";

export default function Navbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  return (
    <header className="h-20 glass-nav border-b border-slate-200/60 px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 print-hide">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-blue-600">
          <i className="ph ph-list text-2xl"></i>
        </button>
        <h1 className="font-outfit text-xl font-semibold text-slate-800">{title}</h1>
      </div>
      
      <NotifDropdown />
    </header>
  );
}