"use client";

import { useState, use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

export default function LessonDetailsPage({ params }: { params: Promise<{ id: string, date: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [attendanceTab, setAttendanceTab] = useState("Teacher");
  const [attendanceType, setAttendanceType] = useState("Boshqa");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [group, setGroup] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [existingLessonId, setExistingLessonId] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const targetDateStr = resolvedParams.date || new Date().toISOString().split("T")[0];

  // Fetch group & students & existing lesson
  useEffect(() => {
    const fetchGroupData = async () => {
      setIsLoading(true);
      try {
        const res: any = await api.get(`/groups/${resolvedParams.id}`);
        if (res) {
          setGroup(res);
          if (res.studentGroups) {
            const studentList = res.studentGroups.map((sg: any) => sg.student);
            setStudents(studentList);
            const initialMap: Record<number, boolean> = {};
            studentList.forEach((st: any) => {
              initialMap[st.id] = true;
            });
            setAttendanceMap(initialMap);
          }
        }

        try {
          const lessonRes: any = await api.get(`/lessons/by-date?groupId=${resolvedParams.id}&date=${targetDateStr}`);
          if (lessonRes && lessonRes.id) {
            setExistingLessonId(lessonRes.id);
            setIsEditMode(true);
            setTopic(lessonRes.topic || "");
            setDescription(lessonRes.description || "");
            
            if (lessonRes.attendances && lessonRes.attendances.length > 0) {
              const editMap: Record<number, boolean> = {};
              lessonRes.attendances.forEach((a: any) => {
                editMap[a.student_id] = a.isPresent;
              });
              setAttendanceMap(prev => ({ ...prev, ...editMap }));
            }
          }
        } catch (lessonErr) {
          // Lesson not found, normal create mode
        }

      } catch (err) {
        console.error("Guruh ma'lumotlarini olishda xato", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupData();
  }, [resolvedParams.id]);

  // Rolling study months calculation matching group details
  const { studyMonths, matchedMonthIndex } = useMemo(() => {
    const durationMonths = group?.course?.duration_month || 6;
    const weekdays = group?.weekday && group.weekday.length > 0 ? group.weekday : [1, 3, 5];
    const startDateStr = group?.start_date || new Date().toISOString();

    const startDate = new Date(startDateStr);
    const validStartDate = isNaN(startDate.getTime()) ? new Date() : startDate;
    validStartDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthShortUz = [
      "Yan", "Fev", "Mar", "Apr", "May", "Iyun",
      "Iyul", "Avg", "Sep", "Okt", "Noy", "Dek"
    ];

    const result = [];
    let foundIndex = 0;

    for (let m = 0; m < durationMonths; m++) {
      const mStart = new Date(
        validStartDate.getFullYear(),
        validStartDate.getMonth() + m,
        validStartDate.getDate()
      );

      const mEnd = new Date(
        validStartDate.getFullYear(),
        validStartDate.getMonth() + m + 1,
        validStartDate.getDate() - 1
      );

      const daysInMonth = [];
      const cur = new Date(mStart);

      while (cur <= mEnd) {
        const jsDay = cur.getDay();
        const sysDay = jsDay === 0 ? 7 : jsDay;

        const curZero = new Date(cur);
        curZero.setHours(0, 0, 0, 0);

        if (weekdays.includes(sysDay)) {
          const isPast = curZero < today;
          const isToday = curZero.getTime() === today.getTime();
          const fullDate = cur.toISOString().split("T")[0];

          if (fullDate === targetDateStr) {
            foundIndex = m;
          }

          daysInMonth.push({
            dateObj: new Date(cur),
            m: monthShortUz[cur.getMonth()],
            d: cur.getDate(),
            fullDate,
            isPast,
            isToday
          });
        }
        cur.setDate(cur.getDate() + 1);
      }

      const periodLabel = `${mStart.getDate()}-${monthShortUz[mStart.getMonth()]} — ${mEnd.getDate()}-${monthShortUz[mEnd.getMonth()]}`;

      result.push({
        id: m + 1,
        name: `${m + 1}-o'quv oyi (${periodLabel})`,
        days: daysInMonth
      });
    }

    return { studyMonths: result, matchedMonthIndex: foundIndex };
  }, [group, targetDateStr]);

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);

  useEffect(() => {
    if (studyMonths.length > 0) {
      setCurrentMonthIdx(matchedMonthIndex);
    }
  }, [studyMonths, matchedMonthIndex]);

  const currentMonth = studyMonths[currentMonthIdx] || studyMonths[0];

  const handleDayClick = (clickedDay: any) => {
    if (!clickedDay.isPast && !clickedDay.isToday) {
      toast.error("Dars boshlanishiga hali bor");
      return;
    }
    router.push(`/dashboard/groups/${resolvedParams.id}/lesson/${clickedDay.fullDate}`);
  };

  const toggleAttendance = (studentId: number) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleSave = async () => {
    if (!topic.trim()) {
      toast.error("Dars mavzusi kiritilishi shart!");
      return;
    }

    const teacher = group?.groupTeachers?.[0]?.teacher;
    if (!teacher) {
      toast.error("Guruhga o'qituvchi biriktirilmagan!");
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        group_id: Number(resolvedParams.id),
        teacher_id: teacher.id,
        topic: topic.trim(),
        description: description.trim() || topic.trim(),
        date: targetDateStr
      };

      let resId = existingLessonId;

      if (isEditMode && existingLessonId) {
        // Edit existing lesson
        const res: any = await api.patch(`/lessons/${existingLessonId}`, payload);
        resId = existingLessonId;
      } else {
        // Create new lesson
        const res: any = await api.post("/lessons", payload);
        resId = res?.id;
      }
      
      if (resId) {
        const attendanceList = students.map(st => ({
          student_id: st.id,
          isPresent: attendanceMap[st.id] ?? true
        }));
        try {
          await api.post(`/lessons/${resId}/attendance`, { attendances: attendanceList });
        } catch (attErr: any) {
          console.error("Davomat kiritishda xato", attErr);
          toast.error(attErr.response?.data?.message || "Davomat kiritishda xatolik");
        }
      }

      toast.success(isEditMode ? "Dars ma'lumotlari yangilandi!" : "Dars va davomat saqlandi!");
      router.push(`/dashboard/groups/${resolvedParams.id}`);
    } catch (error: any) {
      console.error("Darsni saqlashda xato", error);
      toast.error(error.response?.data?.message || "Darsni saqlashda xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateUz = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  const primaryTeacher = group?.groupTeachers?.[0]?.teacher;

  return (
    <div className="w-full max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push(`/dashboard/groups/${resolvedParams.id}`)}
          className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-2 text-sm font-semibold"
        >
          <ArrowLeft size={18} />
          Guruhga qaytish
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {group?.name || "Guruh darsi"}
        </h1>
      </div>

      <div className="bg-white/80 dark:bg-[#0f1523]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 shadow-sm">
        
        {/* Calendar Navigator */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setCurrentMonthIdx(Math.max(0, currentMonthIdx - 1))}
              disabled={currentMonthIdx === 0}
              className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {currentMonth?.name || "O'quv oyi"}
            </h3>
            <button 
              onClick={() => setCurrentMonthIdx(Math.min((studyMonths.length || 1) - 1, currentMonthIdx + 1))}
              disabled={currentMonthIdx >= (studyMonths.length || 1) - 1}
              className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {currentMonth?.days?.map((dItem: any, idx: number) => {
              const isSelected = dItem.fullDate === targetDateStr;
              const isPast = dItem.isPast;
              return (
                <button 
                  key={idx}
                  onClick={() => handleDayClick(dItem)}
                  title={dItem.fullDate}
                  className={`w-[60px] h-[72px] flex-shrink-0 flex flex-col items-center justify-center rounded-xl border transition-all ${
                    isSelected 
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30 transform scale-105" 
                      : isPast
                      ? "bg-slate-100/40 dark:bg-white/5 border-slate-200/50 dark:border-white/5 opacity-40 hover:opacity-80"
                      : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/50"
                  }`}
                >
                  <span className={`text-xs font-semibold ${isSelected ? "text-emerald-100" : "text-slate-500 dark:text-slate-400"}`}>{dItem.m}</span>
                  <span className={`text-xl font-bold ${isSelected ? "text-white" : isPast ? "text-slate-400 dark:text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>{dItem.d}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Internal Tabs */}
        <div className="flex items-center gap-8 border-b border-slate-200 dark:border-white/10 mb-8">
          {["Teacher"].map(tab => (
            <button
              key={tab}
              onClick={() => setAttendanceTab(tab)}
              className={`pb-4 text-sm font-semibold transition-all border-b-2 ${
                attendanceTab === tab 
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" 
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab === "Teacher" ? "O'qituvchi" : tab}
            </button>
          ))}
        </div>

          {/* Ma'lumot Card */}
        <div className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 mb-8 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Dars ma'lumoti</h4>
          <div className="flex flex-wrap items-center gap-12 sm:gap-16">
            <div className="flex items-center gap-4">
              {primaryTeacher?.photo ? (
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/${primaryTeacher.photo.replace(/\\/g, '/')}`}
                  alt={`${primaryTeacher.first_name} ${primaryTeacher.last_name}`}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/30 shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {primaryTeacher?.first_name?.charAt(0) || "O"}{primaryTeacher?.last_name?.charAt(0) || "T"}
                </div>
              )}
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-lg">
                  {primaryTeacher ? `${primaryTeacher.first_name} ${primaryTeacher.last_name}` : "O'qituvchi biriktirilmagan"}
                </h5>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">Asosiy o'qituvchi</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dars kuni</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{formatDateUz(targetDateStr)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Dars vaqti</p>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">{group?.start_time || "09:30"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Holat</p>
              {existingLessonId ? (
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Dars o'tilgan</p>
              ) : (
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">O'tilmagan</p>
              )}
            </div>
          </div>
        </div>

        {/* Yo'qlama Card */}
        <div className="bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-8">Yo'qlama va mavzu {existingLessonId ? "ko'rish" : "kiritish"}</h4>
          
          {/* Radios */}
          <div className="flex items-center gap-8 mb-8">
            <label className={`flex items-center gap-3 ${existingLessonId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}`} onClick={() => !existingLessonId && setAttendanceType("O'quv reja")}>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${attendanceType === "O'quv reja" ? "border-emerald-500" : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-400"}`}>
                {attendanceType === "O'quv reja" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
              </div>
              <span className={`text-sm font-semibold transition-colors ${attendanceType === "O'quv reja" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                O'quv reja bo'yicha
              </span>
            </label>
            <label className={`flex items-center gap-3 ${existingLessonId ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'}`} onClick={() => !existingLessonId && setAttendanceType("Boshqa")}>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${attendanceType === "Boshqa" ? "border-emerald-500" : "border-slate-300 dark:border-slate-600 group-hover:border-emerald-400"}`}>
                {attendanceType === "Boshqa" && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
              </div>
              <span className={`text-sm font-semibold transition-colors ${attendanceType === "Boshqa" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                Boshqa
              </span>
            </label>
          </div>

          {/* Inputs */}
          <div className="space-y-6 mb-10">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2.5">
                Mavzu <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={topic}
                disabled={!!existingLessonId}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Dars mavzusini kiriting..."
                className={`w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm ${existingLessonId ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2.5">Tavsif (ixtiyoriy)</label>
              <input 
                type="text" 
                value={description}
                disabled={!!existingLessonId}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dars haqida qo'shimcha ma'lumot..."
                className={`w-full px-5 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm ${existingLessonId ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500">O'quvchilar ro'yxati yuklanmoqda...</div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-slate-500">Guruhda hali o'quvchilar biriktirilmagan.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10">
                    <th className="py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 w-16 px-2">#</th>
                    <th className="py-4 text-xs font-semibold text-slate-500 dark:text-slate-400">O'quvchi ismi</th>
                    <th className="py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right pr-4">Davomat (Keldi)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, idx) => {
                    const isPresent = attendanceMap[st.id] ?? true;
                    return (
                      <tr key={st.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="py-5 text-sm font-bold text-slate-400 px-2">{idx + 1}</td>
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            {st.photo ? (
                              <img 
                                src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/${st.photo.replace(/\\/g, '/')}`}
                                alt={`${st.first_name} ${st.last_name}`}
                                className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
                                {st.first_name?.charAt(0)}{st.last_name?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {st.first_name} {st.last_name}
                              </span>
                              {st.phone && <span className="text-xs text-slate-400">{st.phone}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right pr-4">
                          <button
                            type="button"
                            disabled={!!existingLessonId}
                            onClick={() => !existingLessonId && toggleAttendance(st.id)}
                            className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative inline-flex items-center ${
                              isPresent ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20"
                            } ${existingLessonId ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                              isPresent ? "translate-x-7" : "translate-x-0"
                            }`} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-10 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving || !!existingLessonId}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold text-white transition-all transform ${
                existingLessonId 
                  ? 'bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-[0_8px_16px_rgba(16,185,129,0.25)] hover:scale-[1.02]'
              }`}
            >
              {isSaving ? "Saqlanmoqda..." : (existingLessonId ? "Dars allaqachon saqlangan" : "Saqlash")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
