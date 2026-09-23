"use client";

import { 
  Search, 
  Bell, 
  Moon, 
  Sun,
  ChevronDown,
  Menu,
  Check,
  User,
  LogOut,
  Diamond
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentTopbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  const [userName, setUserName] = useState("O'quvchi");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("user_name");
      if (storedName) setUserName(storedName);
      
      const photo = localStorage.getItem("user_photo");
      if (photo && photo !== "null" && photo !== "undefined") {
        const cleanPhoto = photo.replace(/\\/g, '/');
        const photoPath = cleanPhoto.startsWith('/') ? cleanPhoto : `/${cleanPhoto}`;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
        setUserPhoto(`${baseUrl}${photoPath}`);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const currentLangLabel = {
    uz: "O'zbekcha",
    ru: "Русский",
    en: "English"
  }[lang];

  return (
    <header className="h-24 w-full sticky top-0 z-40 bg-transparent flex items-center justify-between px-6 lg:px-10 transition-colors duration-300">
      
      {/* Left side: Mobile menu & Search */}
      <div className="flex items-center gap-6 flex-1">
        <button className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
          <Menu size={24} />
        </button>

        <div className="relative group hidden sm:block max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Qidirish..."
            className="w-full pl-12 pr-5 py-3 bg-white/60 hover:bg-white/80 dark:bg-[#151A27]/80 dark:hover:bg-[#1A2035]/80 border border-slate-200/50 dark:border-white/5 rounded-full text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-sm backdrop-blur-md"
          />
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4">

        {/* Actions Pill Container */}
        <div className="hidden sm:flex items-center bg-white/60 dark:bg-[#151A27]/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-full p-2 shadow-sm">
          
          {/* Language Selector */}
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
            >
              {currentLangLabel}
              <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-[#151A27] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                {(['uz', 'ru', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setLangMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span className={`font-semibold ${lang === l ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {{ uz: "O'zbekcha", ru: "Русский", en: "English" }[l]}
                    </span>
                    {lang === l && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />

          {/* Theme Toggle */}
          {mounted && (
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {/* Notifications */}
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#151A27]"></span>
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
            className="flex items-center gap-3 pl-2 pr-4 py-2 bg-white/60 dark:bg-[#151A27]/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-full hover:bg-white dark:hover:bg-[#1A2035] transition-colors shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{userName}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">O'QUVCHI</span>
            </div>
            <ChevronDown size={16} className={`text-slate-400 dark:text-slate-500 transition-transform hidden sm:block ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Menu */}
          {profileMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#151A27] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 mb-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">O'quvchi</p>
              </div>
              
              <Link href="/student-dashboard/profile" className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <User size={18} className="text-slate-400" />
                Mening profilim
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <LogOut size={18} />
                Tizimdan chiqish
              </button>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}
