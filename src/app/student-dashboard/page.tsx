"use client";

import ScheduleCalendar from "@/components/student/ScheduleCalendar";
import ProgressCard from "@/components/student/ProgressCard";
import { useEffect, useState } from "react";

export default function StudentDashboardPage() {
  const [userName, setUserName] = useState("O'quvchi");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("user_name");
      if (storedName) {
        setUserName(storedName);
      }
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Greeting Section */}
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2 transition-all">
            Salom, {userName}!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
            Sizning ta'lim sarguzashtingiz davom etmoqda. Tizimga xush kelibsiz.
          </p>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Schedule Calendar (Full Width) */}
        <div className="xl:col-span-12">
          <ScheduleCalendar />
        </div>

      </div>
    </div>
  );
}
