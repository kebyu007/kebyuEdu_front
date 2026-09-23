"use client";

import { useState } from "react";
import { Search, Archive, Layers, RefreshCw } from "lucide-react";

export default function GatheringGroupsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

  return (
    <div className="w-full animate-in fade-in zoom-in-95 duration-700 pb-12">
      <div className="flex flex-col gap-6 mb-8 mt-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Yig'ilayotgan guruhlar
        </h1>
        
        {/* Top Controls: Tabs */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border ${
              activeTab === "active" 
                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border-slate-200 dark:border-white/20" 
                : "bg-transparent text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5"
            }`}
          >
            <Layers size={18} className={activeTab === "active" ? "text-indigo-500" : ""} />
            Guruhlar
          </button>
          
          <button 
            onClick={() => setActiveTab("archive")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border ${
              activeTab === "archive" 
                ? "bg-white dark:bg-white/10 text-slate-900 dark:text-white border-slate-200 dark:border-white/20" 
                : "bg-transparent text-slate-500 hover:text-slate-700 border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5"
            }`}
          >
            <Archive size={18} className={activeTab === "archive" ? "text-indigo-500" : ""} />
            Arxiv
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Container for Table */}
      <div className="bg-white/70 dark:bg-[#0B0F19]/70 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.1)]">
        
        {/* Table Header */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold bg-slate-50/50 dark:bg-black/10">
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Guruh nomi</th>
                <th className="px-6 py-5">Kurs</th>
                <th className="px-6 py-5">Davomiyligi</th>
                <th className="px-6 py-5">Dars vaqti</th>
                <th className="px-6 py-5">Sana</th>
                <th className="px-6 py-5">O'qituvchi</th>
                <th className="px-6 py-5">Talabalar</th>
                <th className="px-6 py-5 text-right">
                  <button className="text-slate-400 hover:text-indigo-500 transition-colors">
                    <RefreshCw size={16} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Empty State */}
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                    Hozircha guruhlar yo'q
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}
