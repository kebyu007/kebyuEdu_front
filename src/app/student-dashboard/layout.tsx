"use client";

import { useState, useEffect } from "react";
import StudentSidebar from "@/components/StudentSidebar";
import StudentTopbar from "@/components/StudentTopbar";
import AuthGuard from "@/components/AuthGuard";
import { useRouter } from "next/navigation";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  // Role check logic (redirect if teacher/admin)
  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role && (role === "TEACHER" || role === "ADMIN")) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-300">
        
        {/* Background ambient effects - same as admin panel */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen transition-colors duration-300" />
          <div className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen transition-colors duration-300" />
        </div>

        <StudentSidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        
        <div className={`flex-1 flex flex-col z-10 transition-all duration-300 relative ${isSidebarCollapsed ? "pl-[90px]" : "pl-[360px]"}`}>
          
          <StudentTopbar />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6 lg:p-10 no-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
