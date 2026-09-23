"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white p-6 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 sm:p-14 max-w-lg w-full text-center shadow-2xl relative z-10">
        
        <div className="relative mb-6 flex justify-center items-center">
          <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 tracking-wider">
            404
          </span>
          <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-md animate-bounce">
            <Sparkles size={16} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">
          <Clock size={14} />
          Tez orada qo'shiladi / Sahifa topilmadi
        </div>

        <h2 className="text-2xl font-extrabold mb-3">
          Ushbu bo'lim ishlanmoqda
        </h2>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
          Siz qidirayotgan sahifa hali yaratilmagan yoki tez orada tizimga qo'shiladi.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
        >
          <ArrowLeft size={18} />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
