"use client";

import { TrendingUp, Award, Zap } from "lucide-react";

export default function ProgressCard() {
  // Mock data for the design demonstration
  const level = 4;
  const currentXP = 1262;
  const maxXP = 1500;
  const progressPercentage = (currentXP / maxXP) * 100;
  const ranking = 315;

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-sm transition-all duration-300 hover:shadow-sm">
      
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white dark:bg-white/5 shadow-sm dark:shadow-none rounded-xl text-indigo-500 dark:text-indigo-400">
            <TrendingUp size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Bosqich: {level}
          </span>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Progress</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {currentXP} / <span className="text-slate-400 dark:text-slate-500">{maxXP}</span>
            </span>
          </div>
          
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-500">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami tajriba (XP)</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{currentXP}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-500">
              <Award size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Reyting (Umumiy)</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{ranking} - o'rin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
