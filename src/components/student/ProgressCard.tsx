"use client";

import { Award, TrendingUp, Trophy, Star } from "lucide-react";

export default function ProgressCard() {
  // Bular hozircha mock ma'lumotlar. Backendga qo'shilgach API orqali keladi.
  const stats = {
    coins: 6121,
    level: 4,
    xp: 1262,
    max_xp: 1500,
    rating: 315
  };

  const xpPercentage = Math.round((stats.xp / stats.max_xp) * 100);

  return (
    <div className="relative overflow-hidden bg-white/20 dark:bg-[#1A1A2E]/40 backdrop-blur-xl border border-white/30 dark:border-white/10 p-6 rounded-3xl shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
      {/* Orqa fon nur effekti */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Kumushlar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shadow-inner border border-white/50 dark:border-white/5">
              <Award className="text-amber-500 drop-shadow-md" size={26} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Kumushlar</p>
              <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300">
                {stats.coins.toLocaleString()}
              </h3>
            </div>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <span className="font-bold text-amber-600 dark:text-amber-400">Top 5%</span>
          </div>
        </div>

        {/* Bosqich va XP */}
        <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-indigo-500" size={20} />
              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-lg">Bosqich: {stats.level}</h4>
            </div>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">
              {stats.xp} / {stats.max_xp} XP
            </span>
          </div>
          
          <div className="relative w-full h-3 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${xpPercentage}%` }}
            >
              {/* Shimmer effekti */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {/* Reyting */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
              <Star className="text-indigo-600 dark:text-indigo-400 fill-indigo-600 dark:fill-indigo-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Umumiy reyting</p>
              <p className="font-bold text-slate-800 dark:text-white">
                {stats.rating} - o'rin
              </p>
            </div>
          </div>
          <button className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors hover:text-indigo-700 dark:hover:text-indigo-300">
            Batafsil ko'rish
          </button>
        </div>
      </div>
    </div>
  );
}
