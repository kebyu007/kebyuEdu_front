"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { 
  Home, 
  CreditCard, 
  Users, 
  BarChart2, 
  Trophy, 
  ShoppingCart, 
  MonitorPlay, 
  Settings,
  ChevronLeft
} from "lucide-react";

interface StudentSidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function StudentSidebar({ isCollapsed, toggleCollapse }: StudentSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Bosh sahifa", icon: Home, href: "/student-dashboard" },
    { label: "To'lovlarim", icon: CreditCard, href: "/student-dashboard/payments" },
    { label: "Guruhlarim", icon: Users, href: "/student-dashboard/groups" },
    { label: "Ko'rsatkichlarim", icon: BarChart2, href: "/student-dashboard/metrics" },
    { label: "Reyting", icon: Trophy, href: "/student-dashboard/ranking" },
    { label: "Do'kon", icon: ShoppingCart, href: "/student-dashboard/store" },
    { label: "Qo'shimcha darslar", icon: MonitorPlay, href: "/student-dashboard/extra-classes" },
    { label: "Sozlamalar", icon: Settings, href: "/student-dashboard/settings" },
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

      <nav className={`flex-1 overflow-y-auto py-6 space-y-2 no-scrollbar ${isCollapsed ? "px-3" : "px-5"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const activeClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-100";
          const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white";

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isCollapsed ? "justify-center px-0" : "px-4 gap-4"} ${isActive ? activeClass : inactiveClass}`}
            >
              <div className={`flex items-center justify-center ${isCollapsed ? "w-12 h-12 rounded-xl" : ""}`}>
                <Icon size={isCollapsed ? 24 : 22} className={`relative z-10 transition-transform duration-300 ${!isActive && "group-hover:scale-110"}`} />
              </div>
              
              {!isCollapsed && (
                <span className={`relative z-10 font-bold whitespace-nowrap`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
