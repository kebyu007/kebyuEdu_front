"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ManagementLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTabs = ["/dashboard/management/courses", "/dashboard/management/rooms", "/dashboard/management/staff"].includes(pathname);

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!showTabs) return;

    const updateIndicator = () => {
      // Find the active link based on the pathname
      const activeLink = document.querySelector(`a[data-mgmttab="${pathname}"]`) as HTMLElement;
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
        });
      }
    };

    updateIndicator();
    
    const observer = new ResizeObserver(updateIndicator);
    const container = document.querySelector('.mgmt-tabs-container');
    if (container) observer.observe(container);
    
    window.addEventListener('resize', updateIndicator);
    
    const t1 = setTimeout(updateIndicator, 100);
    const t2 = setTimeout(updateIndicator, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, showTabs]);

  return (
    <div className="w-full">
      {showTabs && (
        <>
          <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Boshqarish</h1>
          
          {/* Management Navigation Tabs with Animation */}
          <div className="relative flex items-center gap-6 border-b border-slate-200 dark:border-white/10 mb-8 px-2 mgmt-tabs-container">
            <Link 
              href="/dashboard/management/courses" 
              data-mgmttab="/dashboard/management/courses"
              className={`pb-3 font-semibold transition-colors relative z-10 ${
                pathname === "/dashboard/management/courses" 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Kurslar
            </Link>
            <Link 
              href="/dashboard/management/rooms" 
              data-mgmttab="/dashboard/management/rooms"
              className={`pb-3 font-semibold transition-colors relative z-10 ${
                pathname === "/dashboard/management/rooms" 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Xonalar
            </Link>
            <Link 
              href="/dashboard/management/staff" 
              data-mgmttab="/dashboard/management/staff"
              className={`pb-3 font-semibold transition-colors relative z-10 ${
                pathname === "/dashboard/management/staff" 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Xodimlar
            </Link>

            {/* Sliding Indicator Line */}
            <div 
              className="absolute bottom-[-1px] h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 transition-all duration-300 ease-out origin-left rounded-t-full"
              style={{
                transform: `translateX(${indicatorStyle.left}px) scaleX(${indicatorStyle.width ? indicatorStyle.width / 100 : 1})`,
                width: '100px', // Base width for scaling
                opacity: indicatorStyle.width > 0 ? 1 : 0
              }}
            />
          </div>
        </>
      )}

      {children}
    </div>
  );
}
