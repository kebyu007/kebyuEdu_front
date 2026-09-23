"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { 
  Home, 
  Users, 
  Layers, 
  UserSquare2, 
  Gift, 
  Settings,
  BellRing,
  RefreshCw,
  ChevronLeft,
  BookOpen,
  DoorOpen,
  Contact,
  Coins,
  Send,
  CreditCard
} from "lucide-react";

export default function Sidebar({ 
  isCollapsed = false, 
  toggleCollapse 
}: { 
  isCollapsed?: boolean; 
  toggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isManagementActive = pathname.startsWith("/dashboard/management") || pathname.startsWith("/management");

  const [userRole, setUserRole] = useState("Foydalanuvchi");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("user_role") || "Foydalanuvchi");
    }
  }, []);

  const isTeacher = userRole === "TEACHER" || userRole === "O'qituvchi";

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    // Determine initial open state based on pathname
    return {
      "Guruhlar": pathname.includes("/dashboard/groups") || pathname.includes("/dashboard/gathering-groups")
    };
  });

  const toggleSubMenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  let MENU_ITEMS: any[] = [
    { name: t("nav.dashboard"), icon: Home, path: "/dashboard" },
    { name: t("nav.teachers"), icon: UserSquare2, path: "/dashboard/teachers" },
    { name: t("nav.groups"), icon: Layers, path: "/dashboard/groups" },
    { name: t("nav.students"), icon: Users, path: "/dashboard/students" },
    { name: t("nav.payments"), icon: CreditCard, path: "/dashboard/payments" },
    { name: t("nav.gifts"), icon: Gift, path: "/dashboard/gifts" },
    { name: t("nav.settings"), icon: Settings, path: "/dashboard/management" },
  ];

  if (isTeacher) {
    MENU_ITEMS = [
      { 
        name: t("nav.groups") || "Guruhlar", 
        icon: Layers, 
        subItems: [
          { name: "Guruhlar", path: "/dashboard/groups" },
          { name: "Yig'ilayotgan guruhlar", path: "/dashboard/gathering-groups" },
        ] 
      },
      { name: "Profil", icon: UserSquare2, path: "/dashboard/profile" },
    ];
  }

  const MANAGEMENT_ITEMS = [
    { name: t("nav.mgt.courses"), icon: BookOpen, path: "/dashboard/management/courses" },
    { name: t("nav.mgt.rooms"), icon: DoorOpen, path: "/dashboard/management/rooms" },
    { name: t("nav.mgt.staff"), icon: Contact, path: "/dashboard/management/staff" },
    { name: t("nav.mgt.coin"), icon: Coins, path: "/dashboard/management/coin" },
    { name: t("nav.mgt.messages"), icon: Send, path: "/dashboard/management/messages" },
  ];

  return (
    <aside className={`${isCollapsed ? "w-[90px]" : "w-[360px]"} h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl flex flex-col z-50 transition-all duration-300 rounded-r-3xl`}>
      {/* Logo Section */}
      <div className={`h-24 flex items-center border-b border-slate-200 dark:border-white/5 transition-all duration-300 relative ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
        <div className={`flex items-center w-full ${isCollapsed ? "justify-center" : "justify-start pl-2"}`}>
          <Logo className="h-[54px]" hideText={isCollapsed} />
        </div>
        {/* Collapse button */}
        <button 
          onClick={toggleCollapse}
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md transition-all duration-300 z-50"
        >
          <ChevronLeft size={18} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto py-6 space-y-2 no-scrollbar ${isCollapsed ? "px-3" : "px-5"}`}>
        {MENU_ITEMS.map((item) => {
          const isActive = item.path === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.path || pathname.startsWith(item.path + '/');
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isSubMenuOpen = openMenus[item.name] || (hasSubItems && item.subItems.some((sub: any) => pathname === sub.path || pathname.startsWith(sub.path + '/')));
          const Icon = item.icon;

          if (hasSubItems) {
            return (
              <div key={item.name} className="flex flex-col gap-1">
                <button
                  onClick={(e) => toggleSubMenu(item.name, e)}
                  title={isCollapsed ? item.name : ""}
                  className={`flex items-center justify-between py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-4"} text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5`}
                >
                  <div className={`flex items-center ${isCollapsed ? "" : "gap-3"}`}>
                    <Icon size={22} className={`relative z-10 transition-transform duration-300 ${isSubMenuOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 group-hover:scale-110"}`} />
                    {!isCollapsed && <span className={`relative z-10 font-bold ${isSubMenuOpen ? "text-indigo-600 dark:text-indigo-400" : ""}`}>{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronLeft size={16} className={`transition-transform duration-300 ${isSubMenuOpen ? "-rotate-90 text-indigo-500" : "text-slate-400"}`} />
                  )}
                </button>
                
                {/* Sub items */}
                {!isCollapsed && (
                  <div className={`flex flex-col gap-1 overflow-hidden transition-all duration-300 ${isSubMenuOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    {item.subItems.map((sub: any) => {
                      const isSubActive = pathname === sub.path || pathname.startsWith(sub.path + '/');
                      return (
                        <Link 
                          key={sub.path} 
                          href={sub.path}
                          className={`flex items-center py-2.5 px-4 ml-8 rounded-xl transition-all duration-300 text-sm font-semibold ${
                            isSubActive 
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                          }`}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link 
              key={item.path} 
              href={item.path}
              title={isCollapsed ? item.name : ""}
              className={`flex items-center py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-4 gap-3"} ${
                (isActive || (item.path === "/dashboard/management" && isManagementActive))
                  ? "text-white font-medium shadow-[0_0_20px_rgba(79,70,229,0.2)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)]" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {/* Active Background Glow */}
              {(isActive || (item.path === "/dashboard/management" && isManagementActive)) && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-90" />
              )}
              
              <Icon 
                size={22} 
                className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} 
              />
              {!isCollapsed && (
                <span className="relative z-10 truncate font-semibold">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Subscription Alert Card */}
      {!isCollapsed && !isTeacher && (
        <div className="p-5 mt-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 border border-red-200 dark:border-red-500/20 p-4 group transition-colors duration-300">
            {/* Pulsing glow behind */}
            <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 blur-xl rounded-full animate-pulse opacity-50" />
            
            <div className="relative z-10 flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg text-red-500 dark:text-red-400">
                <BellRing size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-600 dark:text-red-400">{t("sub.title")}</h4>
                <p className="text-xs text-red-500/80 dark:text-red-300/80">{t("sub.expired")}</p>
              </div>
            </div>
            
            <button className="relative z-10 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 dark:hover:from-red-400 dark:hover:to-red-500 text-white text-sm font-medium py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] dark:shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              {t("sub.renew")}
            </button>
          </div>
        </div>
      )}

      {/* Secondary Management Menu */}
      <div 
        className={`absolute top-0 left-full h-full bg-white/70 dark:bg-white/5 backdrop-blur-2xl border-r border-slate-200 dark:border-white/10 shadow-[20px_0_40px_rgba(0,0,0,0.05)] transition-all duration-300 overflow-hidden flex flex-col z-40 rounded-r-[2rem] ${
          pathname === "/dashboard/management" ? "w-[240px] opacity-100" : "w-0 opacity-0 border-r-0"
        }`}
      >
        <div className="h-24 flex items-center px-6 border-b border-slate-200/50 dark:border-white/5 whitespace-nowrap">
           <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors">
              <ChevronLeft size={18} />
              {t("nav.mgt.menu")}
           </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto no-scrollbar whitespace-nowrap">
           {MANAGEMENT_ITEMS.map(item => {
             const isActive = pathname === item.path || pathname.startsWith(item.path);
             const Icon = item.icon;
             return (
               <Link 
                 href={item.path} 
                 key={item.path} 
                 className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                   isActive 
                     ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-medium" 
                     : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                 }`}
               >
                 <Icon size={20} className={isActive ? "text-indigo-500" : ""} />
                 <span>{item.name}</span>
               </Link>
             )
           })}
        </nav>
      </div>
    </aside>
  );
}
