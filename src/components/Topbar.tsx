"use client";

import { 
  Search, 
  Bell, 
  Moon, 
  Sun,
  ChevronDown,
  Menu,
  Check
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const currentLangLabel = {
    uz: "O'zbekcha",
    ru: "Русский",
    en: "English"
  }[lang];

  return (
    <header className="h-20 w-full sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F19]/60 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 transition-colors duration-300">
      
      {/* Left side: Mobile menu & Search */}
      <div className="flex items-center gap-6 flex-1">
        <button className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
          <Menu size={24} />
        </button>

        <div className="relative group hidden sm:block max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder={t("topbar.search")}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-100 hover:bg-slate-200/70 dark:bg-white/5 dark:hover:bg-white/[0.07] border border-transparent dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-white dark:focus:bg-white/10 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        
        {/* Language Selector */}
        <div className="relative hidden sm:block">
          <button 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            {currentLangLabel}
            <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {langMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2">
              {(["uz", "ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setLangMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  {{ uz: "O'zbekcha", ru: "Русский", en: "English" }[l]}
                  {lang === l && <Check size={14} className="text-indigo-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors group">
            <Bell size={20} className="group-hover:animate-wiggle" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0B0F19]"></span>
          </button>
          
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />

        {/* User Profile */}
        <button className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)] dark:shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            A
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">Abduxoshim</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{t("topbar.admin")}</p>
          </div>
        </button>

      </div>
    </header>
  );
}
