"use client";

import Link from "next/link";
import { Gift, Sparkles, Clock, ArrowLeft } from "lucide-react";

export default function GiftsPage() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 sm:p-14 max-w-xl w-full shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.3)] relative overflow-hidden">
        {/* Glowing Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Icon Header */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform hover:scale-105 transition-transform">
            <Gift size={40} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-md animate-bounce">
            <Sparkles size={16} />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-4">
          <Clock size={14} />
          Tez orada qo'shiladi
        </div>

        {/* Title & Description */}
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Sovg'alar Tizimi
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
          Ushbu bo'lim hozirda ishlab chiqilmoqda. Tez orada talabalar va o'qituvchilar uchun coinlar, sovg'alar va rag'batlantirish tizimi yo'lga qo'yiladi!
        </p>

        {/* Action Button */}
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all transform hover:scale-[1.02]"
        >
          <ArrowLeft size={18} />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
