"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";
import api from "@/services/api";

interface ScheduleGroup {
  id: number;
  name: string;
  start_date: string;
  start_time: string;
  weekday: number[];
  course_name: string;
  room_name: string;
  teacher_name: string;
}

export default function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeGroups, setActiveGroups] = useState<ScheduleGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/students/me/dashboard");
        if (response?.activeGroups) {
          setActiveGroups(response.activeGroups);
        }
      } catch (error) {
        console.error("Dashboard yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const daysOfWeek = ["Dsh", "Ssh", "Chr", "Pay", "Jum", "Sha", "Yak"];
  const monthNames = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
    "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
  ];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Calculate days in month and starting day
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const emptyDaysCount = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // JS getDay() -> 0: Sun, 1: Mon. We want Mon to be index 0
  
  const calendarDays = [];
  for (let i = 0; i < emptyDaysCount; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  // Calculate class days based on activeGroups
  const classDaysSet = new Set<number>();
  const todayDateObj = new Date();
  // Strip time for accurate day comparison
  todayDateObj.setHours(0, 0, 0, 0);

  const isCurrentMonth = todayDateObj.getFullYear() === year && todayDateObj.getMonth() === month;
  const todayNum = isCurrentMonth ? todayDateObj.getDate() : -1;

  calendarDays.forEach((day) => {
    if (day !== null) {
      const dateObj = new Date(year, month, day);
      dateObj.setHours(0, 0, 0, 0); // Strip time
      
      const jsDay = dateObj.getDay();
      const backendDay = jsDay === 0 ? 7 : jsDay; // 1-Monday, 7-Sunday

      const hasClass = activeGroups.some((group) => {
        const groupStartDate = new Date(group.start_date);
        groupStartDate.setHours(0, 0, 0, 0); // Strip time
        
        return group.weekday.includes(backendDay) && dateObj.getTime() >= groupStartDate.getTime();
      });
      
      if (hasClass) {
        classDaysSet.add(day);
      }
    }
  });

  // Calculate today's specific schedule (respecting start_date)
  const todayJsDay = todayDateObj.getDay();
  const todayBackendDay = todayJsDay === 0 ? 7 : todayJsDay;
  const todaysSchedule = activeGroups.filter((g) => {
    const groupStartDate = new Date(g.start_date);
    groupStartDate.setHours(0, 0, 0, 0);
    return g.weekday.includes(todayBackendDay) && todayDateObj.getTime() >= groupStartDate.getTime();
  });

  return (
    <div className="w-full max-w-5xl bg-white dark:bg-[#121621] border border-slate-200 dark:border-white/5 rounded-3xl shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-[500px]">
      
      {loading ? (
        <div className="w-full h-full flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : (
        <>
          {/* Calendar Side */}
          <div className="flex-1 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-white/5 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarIcon className="text-indigo-500" size={20} />
                  {monthNames[month]} {year}
                </h2>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="flex-1 flex flex-col mt-4">
              <div className="w-full max-w-[350px]">
                {/* Weekdays */}
                <div className="grid grid-cols-7 mb-4">
                  {daysOfWeek.map((day, i) => (
                    <div key={i} className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-y-4 gap-x-2 place-items-center">
                  {calendarDays.map((day, i) => {
                    if (day === null) {
                      return <div key={`empty-${i}`} className="w-10 h-10" />;
                    }

                    const isClassDay = classDaysSet.has(day);
                    const isToday = day === todayNum;

                    return (
                      <div key={day} className="flex justify-center items-center w-10 h-10">
                        <button 
                          className={`
                            w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all relative
                            ${isToday 
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30" 
                              : isClassDay
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-semibold"
                              : "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                            }
                          `}
                        >
                          <span className={`text-sm ${isToday || isClassDay ? 'font-bold' : 'font-medium'}`}>
                            {day}
                          </span>
                          
                          {isClassDay && !isToday && (
                            <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></div>
                          )}
                          {isClassDay && isToday && (
                            <div className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Cards Side */}
          <div className="w-full lg:w-[400px] p-8 lg:p-10 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Bugungi darslar
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {todayDateObj.getDate()}-{monthNames[todayDateObj.getMonth()]} uchun jadval
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {todaysSchedule.length > 0 ? (
                todaysSchedule.map((schedule, idx) => (
                  <div 
                    key={schedule.id || idx}
                    className="group relative bg-white dark:bg-[#1A2035] rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm"
                  >
                    <div className={`absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl ${
                      idx % 2 === 0 ? "bg-indigo-500" : "bg-emerald-500"
                    }`} />
                    
                    <div className="pl-3">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`text-xs font-bold px-2 py-1 rounded-md ${
                          idx % 2 === 0
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}>
                          {schedule.start_time}
                        </div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {schedule.course_name}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">{schedule.room_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <Clock size={14} className="text-slate-400" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">{schedule.teacher_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <CalendarIcon size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Bugun dars yo'q
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
