"use client";

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
  Send
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

  const MENU_ITEMS = [
    { name: t("nav.dashboard"), icon: Home, path: "/dashboard" },
    { name: t("nav.teachers"), icon: UserSquare2, path: "/dashboard/teachers" },
    { name: t("nav.groups"), icon: Layers, path: "/dashboard/groups" },
    { name: t("nav.students"), icon: Users, path: "/dashboard/students" },
    { name: t("nav.gifts"), icon: Gift, path: "/dashboard/gifts" },
    { name: t("nav.settings"), icon: Settings, path: "/dashboard/management" },
  ];

  const MANAGEMENT_ITEMS = [
    { name: t("nav.mgt.courses"), icon: BookOpen, path: "/dashboard/management/courses" },
    { name: t("nav.mgt.rooms"), icon: DoorOpen, path: "/dashboard/management/rooms" },
    { name: t("nav.mgt.staff"), icon: Contact, path: "/dashboard/management/staff" },
    { name: t("nav.mgt.coin"), icon: Coins, path: "/dashboard/management/coin" },
    { name: t("nav.mgt.messages"), icon: Send, path: "/dashboard/management/messages" },
  ];

  return (
    <aside className={`${isCollapsed ? "w-[90px]" : "w-[360px]"} h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white/60 dark:bg-white/5 backdrop-blur-xl flex flex-col z-50 transition-all duration-300`}>
      {/* Logo Section */}
      <div className={`h-20 flex items-center border-b border-slate-200 dark:border-white/5 transition-all duration-300 relative ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
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
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link 
              key={item.path} 
              href={item.path}
              title={isCollapsed ? item.name : ""}
              className={`flex items-center py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-4 gap-3"} ${
                isActive 
                  ? "text-white font-medium shadow-[0_0_20px_rgba(79,70,229,0.2)] dark:shadow-[0_0_20px_rgba(79,70,229,0.3)]" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 opacity-90" />
              )}
              
              <Icon 
                size={22} 
                className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} 
              />
              {!isCollapsed && (
                <span className="relative z-10 truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Subscription Alert Card */}
      {!isCollapsed && (
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
    </aside>
  );
}
