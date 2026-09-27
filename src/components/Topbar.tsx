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
  LogOut
} from "lucide-react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { io } from "socket.io-client";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function Topbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notificationsMenuOpen, setNotificationsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const [userRole, setUserRole] = useState("SUPERADMIN");
  const [userName, setUserName] = useState("Kebyu Edu");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("user_role") || "SUPERADMIN");
      const fName = localStorage.getItem("first_name") || "";
      const lName = localStorage.getItem("last_name") || "";
      if (fName || lName) setUserName(`${fName} ${lName}`.trim());
      
      const photo = localStorage.getItem("user_photo");
      if (photo && photo !== "null" && photo !== "undefined") {
        const cleanPhoto = photo.replace(/\\/g, '/');
        const photoPath = cleanPhoto.startsWith('/') ? cleanPhoto : `/${cleanPhoto}`;
        const baseUrl = `http://${window.location.hostname}:3001`;
        setUserPhoto(`${baseUrl}${photoPath}`);
      }

      // Fetch existing notifications
      const fetchNotifications = async () => {
        try {
          const { default: api } = await import('@/services/api');
          const res: any = await api.get('/notifications');
          setNotifications(res || []);
          if (res?.some((n: any) => !n.is_read)) {
            setHasNewNotifications(true);
          }
        } catch (err) {}
      };
      fetchNotifications();

      // WebSocket connection
      const userId = localStorage.getItem("user_id");
      if (userId) {
        const baseUrl = `http://${window.location.hostname}:3001`;
        const socket = io(baseUrl, {
          query: { userId }
        });

        socket.on('new-notification', (notification) => {
          toast.success(`Yangi xabar: ${notification.title}\n${notification.message}`, {
            duration: 5000,
            icon: '🔔',
          });
          setHasNewNotifications(true);
          setNotifications(prev => [notification, ...prev]);
        });

        return () => {
          socket.disconnect();
        };
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
              <div className="absolute top-full right-0 mt-3 w-36 bg-white/90 dark:bg-[#0f1523]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2">
                {(["uz", "ru", "en"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangMenuOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium"
                  >
                    {{ uz: "O'zbekcha", ru: "Русский", en: "English" }[l]}
                    {lang === l && <Check size={14} className="text-indigo-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-white/10 mx-1.5" />

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsMenuOpen(!notificationsMenuOpen);
                setHasNewNotifications(false);
              }}
              className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-full transition-colors group"
            >
              <Bell size={20} className={hasNewNotifications ? "animate-wiggle" : "group-hover:animate-wiggle"} />
              {hasNewNotifications && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)] animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white/95 dark:bg-[#0f1523]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Xabarnomalar</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n, idx) => (
                      <div key={idx} className={`p-4 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!n.is_read ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
                        onClick={async () => {
                          if (!n.is_read) {
                            try {
                              const { default: api } = await import('@/services/api');
                              await api.patch(`/notifications/${n.id}/read`);
                              setNotifications(notifications.map(item => item.id === n.id ? {...item, is_read: true} : item));
                            } catch(e) {}
                          }
                        }}
                      >
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{n.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      Sizda yangi xabarnomalar yo'q.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="h-5 w-px bg-slate-200 dark:bg-white/10 mx-1.5" />

          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 rounded-full transition-all"
          >
            {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* User Profile Pill Container */}
        <div className="relative">
          <button 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            onBlur={() => setTimeout(() => setProfileMenuOpen(false), 200)}
            className="flex items-center gap-3 p-1.5 pr-6 bg-white/60 dark:bg-[#151A27]/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 rounded-full hover:bg-white/80 dark:hover:bg-[#1A2035] transition-all shadow-sm"
          >
            {userPhoto ? (
               <img src={userPhoto} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-inner" />
            ) : (
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.3)] dark:shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                 {userName.charAt(0)}
               </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-[15px] font-bold text-slate-900 dark:text-white leading-none mb-1">{userName}</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest leading-none uppercase">{userRole}</p>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute top-full right-0 mt-3 w-48 bg-white/90 dark:bg-[#0f1523]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 mb-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{userRole}</p>
              </div>
              <button
                onClick={() => router.push("/dashboard/profile")}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors font-medium"
              >
                <User size={16} />
                Profil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium"
              >
                <LogOut size={16} />
                Chiqish
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
