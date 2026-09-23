import React from "react";
import { Rocket, Construction, Sparkles } from "lucide-react";

export default function ComingSoon({ title = "Tez kunda" }: { title?: string }) {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700 zoom-in-95">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/30 blur-3xl rounded-full" />
        <div className="relative bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-3xl shadow-xl flex items-center justify-center">
          <Rocket className="w-16 h-16 text-indigo-500 dark:text-indigo-400 animate-bounce" />
          <Sparkles className="w-8 h-8 text-amber-500 absolute -top-2 -right-2 animate-pulse" />
        </div>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
        {title} qismi V2 da qo'shiladi!
      </h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
        Biz hozircha tizimning V1 (Birinchi) versiyasidamiz. Siz turgan ushbu qism ustida qizg'in ish ketyapti va u keyingi yangilanishlarda ishga tushiriladi! 🚀
      </p>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold border border-slate-200 dark:border-white/10">
        <Construction size={18} />
        Jarayonda...
      </div>
    </div>
  );
}
