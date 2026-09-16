"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionCardProps {
  title: string;
  children?: React.ReactNode;
}

export default function AccordionCard({ title, children }: AccordionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-semibold text-slate-900 dark:text-white transition-colors">{title}</span>
        <ChevronDown 
          size={20} 
          className={`text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-indigo-500 dark:text-indigo-400" : ""}`} 
        />
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-5 border-t border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-black/20 transition-colors">
          {children || <p className="text-sm text-slate-500 dark:text-slate-400 italic">Ma'lumot topilmadi.</p>}
        </div>
      </div>
    </div>
  );
}
