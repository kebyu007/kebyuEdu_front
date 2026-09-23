"use client";

import { useState, use, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, BarChart2, X, ChevronRight, Check, User, Clock, CheckCircle2, MoreVertical, Calendar as CalendarIcon, MapPin, PlayCircle, Trash2, UploadCloud, TrendingUp, AlertCircle, Award, Plus, Minus, CheckSquare } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "@/services/api";
import toast from "react-hot-toast";

export default function GroupDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const initialTab = searchParams.get("tab") || "Ma'lumotlar";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [userRole, setUserRole] = useState("Foydalanuvchi");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("user_role") || "Foydalanuvchi");
    }
  }, []);

  const isTeacher = userRole === "TEACHER" || userRole === "O'qituvchi";

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const TABS = ["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"];

  useEffect(() => {
    const updateIndicator = () => {
      const el = document.querySelector(`button[data-maintab="${activeTab}"]`) as HTMLElement;
      if (el) {
        setIndicatorStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    };

    updateIndicator();
    
    const observer = new ResizeObserver(updateIndicator);
    const currentEl = document.querySelector(`button[data-maintab="${activeTab}"]`);
    if (currentEl) observer.observe(currentEl);
    
    window.addEventListener('resize', updateIndicator);
    
    // Fallbacks for font loading or hydration delays
    const t1 = setTimeout(updateIndicator, 100);
    const t2 = setTimeout(updateIndicator, 500);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTab, searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const paramsString = searchParams.toString();
    const newParams = new URLSearchParams(paramsString);
    newParams.set("tab", tab);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  
  const [darslikTab, setDarslikTab] = useState("Uyga vazifa");
  
  const [darslikIndicator, setDarslikIndicator] = useState({ left: 0, width: 0 });
  const DARSLIK_TABS = ["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"];

  useEffect(() => {
    if (activeTab !== "Guruh darsliklari") return;

    const updateIndicator = () => {
      const el = document.querySelector(`button[data-darsliktab="${darslikTab}"]`) as HTMLElement;
      if (el) {
        setDarslikIndicator({
          left: el.offsetLeft,
          width: el.offsetWidth,
        });
      }
    };

    updateIndicator();
    
    const observer = new ResizeObserver(updateIndicator);
    const currentEl = document.querySelector(`button[data-darsliktab="${darslikTab}"]`);
    if (currentEl) observer.observe(currentEl);
    
    window.addEventListener('resize', updateIndicator);
    
    // Fallbacks for font loading or conditional rendering delays
    const t1 = setTimeout(updateIndicator, 100);
    const t2 = setTimeout(updateIndicator, 500);
    const t3 = setTimeout(updateIndicator, 1000); // extra fallback just in case

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [darslikTab, activeTab]);
  
  // States for expanding schedules and months
  const [showAllSchedules, setShowAllSchedules] = useState(false);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(1);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadLessonId, setUploadLessonId] = useState<string>('');
  const [videoTitle, setVideoTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLessonSelectOpen, setIsLessonSelectOpen] = useState(false);

  // Video Edit/Delete States
  const [editVideoId, setEditVideoId] = useState<number | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState("");
  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false);
  const [activeVideoMenu, setActiveVideoMenu] = useState<number | null>(null);
  const [isUpdatingVideo, setIsUpdatingVideo] = useState(false);

  const [deleteVideoId, setDeleteVideoId] = useState<number | null>(null);
  const [isDeleteVideoModalOpen, setIsDeleteVideoModalOpen] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);

  // Homework Edit/Delete States
  const [editHomeworkId, setEditHomeworkId] = useState<number | null>(null);
  const [editHomeworkTitle, setEditHomeworkTitle] = useState("");
  const [isEditHomeworkModalOpen, setIsEditHomeworkModalOpen] = useState(false);
  const [activeHomeworkMenu, setActiveHomeworkMenu] = useState<number | null>(null);
  const [isUpdatingHomework, setIsUpdatingHomework] = useState(false);

  const [deleteHomeworkId, setDeleteHomeworkId] = useState<number | null>(null);
  const [isDeleteHomeworkModalOpen, setIsDeleteHomeworkModalOpen] = useState(false);
  const [isDeletingHomework, setIsDeletingHomework] = useState(false);

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleUploadVideo = async () => {
    if (uploadFiles.length === 0) {
      toast.error("Iltimos, fayl tanlang!");
      return;
    }
    if (!uploadLessonId) {
      toast.error("Iltimos, darsni tanlang!");
      return;
    }

    try {
      setIsUploading(true);
      
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("lesson_id", uploadLessonId);
        formData.append("group_id", resolvedParams.id);
        if (videoTitle) {
          formData.append("title", videoTitle);
        }
        
        await api.post("/lesson-videos", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      toast.success("Videolar muvaffaqiyatli yuklandi!");
      setIsAddVideoModalOpen(false);
      setUploadFiles([]);
      setUploadLessonId('');
      setVideoTitle('');
      
      const videoRes: any = await api.get(`/groups/${resolvedParams.id}/lesson-videos`);
      if (videoRes) setLessonVideos(videoRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateVideo = async () => {
    if (!editVideoId || !editVideoTitle) return;
    try {
      setIsUpdatingVideo(true);
      await api.put(`/lesson-videos/${editVideoId}`, { title: editVideoTitle });
      toast.success("Video nomi yangilandi!");
      setIsEditVideoModalOpen(false);
      setEditVideoId(null);
      setEditVideoTitle("");
      const videoRes: any = await api.get(`/groups/${resolvedParams.id}/lesson-videos`);
      if (videoRes) setLessonVideos(videoRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingVideo(false);
    }
  };

  const confirmDeleteVideo = async () => {
    if (!deleteVideoId) return;
    try {
      setIsDeletingVideo(true);
      await api.delete(`/lesson-videos/${deleteVideoId}`);
      toast.success("Video o'chirildi!");
      setIsDeleteVideoModalOpen(false);
      setDeleteVideoId(null);
      const videoRes: any = await api.get(`/groups/${resolvedParams.id}/lesson-videos`);
      if (videoRes) setLessonVideos(videoRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingVideo(false);
    }
  };

  const handleUpdateHomework = async () => {
    if (!editHomeworkId || !editHomeworkTitle) return;
    try {
      setIsUpdatingHomework(true);
      await api.put(`/homeworks/${editHomeworkId}`, { title: editHomeworkTitle });
      toast.success("Uy vazifasi nomi yangilandi!");
      setIsEditHomeworkModalOpen(false);
      setEditHomeworkId(null);
      setEditHomeworkTitle("");
      const hwRes: any = await api.get(`/groups/${resolvedParams.id}/homeworks`);
      if (hwRes) setHomeworks(hwRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdatingHomework(false);
    }
  };

  const confirmDeleteHomework = async () => {
    if (!deleteHomeworkId) return;
    try {
      setIsDeletingHomework(true);
      await api.delete(`/homeworks/${deleteHomeworkId}`);
      toast.success("Uy vazifasi o'chirildi!");
      setIsDeleteHomeworkModalOpen(false);
      setDeleteHomeworkId(null);
      const hwRes: any = await api.get(`/groups/${resolvedParams.id}/homeworks`);
      if (hwRes) setHomeworks(hwRes);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingHomework(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!deleteExamId) return;
    try {
      setIsDeletingExam(true);
      await api.delete(`/exams/${deleteExamId}`);
      toast.success("Imtihon muvaffaqiyatli o'chirildi!");
      const examRes: any = await api.get(`/groups/${resolvedParams.id}/exams`);
      if (examRes) setExams(examRes);
      setDeleteExamId(null);
    } catch (error) {
      toast.error("Imtihonni o'chirishda xatolik yuz berdi");
    } finally {
      setIsDeletingExam(false);
    }
  };

  // Exam accordion state
  const [expandedExamId, setExpandedExamId] = useState<number | null>(null);
  const [deleteExamId, setDeleteExamId] = useState<number | null>(null);
  const [isDeletingExam, setIsDeletingExam] = useState(false);

  // Statistics Drawer State
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const [group, setGroup] = useState<any>(null);
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [lessonVideos, setLessonVideos] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [journal, setJournal] = useState<any[]>([]);
  const [attendanceTable, setAttendanceTable] = useState<{lessons: any[], students: any[]}>({ lessons: [], students: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});
  
  const [pendingAttendance, setPendingAttendance] = useState<Record<number, Record<number, boolean | null>>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState<Record<number, boolean>>({});

  const toggleStudentExpanded = (studentId: string) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Fetch data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const [groupRes, hwRes, videoRes, examRes, statsRes, journalRes, attendanceRes]: [any, any, any, any, any, any, any] = await Promise.all([
          api.get(`/groups/${resolvedParams.id}`),
          api.get(`/groups/${resolvedParams.id}/homeworks`),
          api.get(`/groups/${resolvedParams.id}/lesson-videos`),
          api.get(`/groups/${resolvedParams.id}/exams`),
          api.get(`/groups/${resolvedParams.id}/statistics`),
          api.get(`/groups/${resolvedParams.id}/journal`),
          api.get(`/groups/${resolvedParams.id}/attendance`),
        ]);

        if (groupRes) {
          setGroup(groupRes);
        }
        if (hwRes) setHomeworks(hwRes);
        if (videoRes) setLessonVideos(videoRes);
        if (examRes) setExams(examRes);
        if (statsRes) setStatistics(statsRes);
        if (journalRes) setJournal(journalRes);
        if (attendanceRes) setAttendanceTable(attendanceRes);

      } catch (err) {
        console.error("Failed to fetch group data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupData();
  }, [resolvedParams.id]);

  const WEEKDAY_NAMES: { [key: number]: string } = {
    1: "Du", 2: "Se", 3: "Chor", 4: "Pay", 5: "Ju", 6: "Sha", 7: "Yak"
  };

  const formatDays = (weekdays?: number[]) => {
    if (!weekdays || weekdays.length === 0) return "-";
    return weekdays.map(d => WEEKDAY_NAMES[d] || d).join(", ");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const mockGroup = {
    name: group?.name || "Noma'lum guruh",
    status: group?.status || "active",
    course: group?.course?.name || "Noma'lum kurs",
    room: group?.room?.name || "Noma'lum xona",
    schedule: group?.weekday ? `${formatDays(group.weekday)} (${group.start_time || ''})` : "-",
    teacher: group?.groupTeachers?.[0]?.teacher ? `${group.groupTeachers[0].teacher.first_name} ${group.groupTeachers[0].teacher.last_name}` : "Biriktirilmagan",
    studentsCount: group?.studentGroups?.length || 0,
    maxStudents: group?.max_student || 15,
    startDate: formatDate(group?.start_date),
  };

  const SCHEDULES = [
    { id: 1, teacher: mockGroup.teacher, days: "Du/Se/Ch/Pa/Ju", time: "09:30 dan - 12:30 gacha", period: "15 Yan, 2026 - 27 Iyun, 2026", room: mockGroup.room }
  ];

  const { studyMonths, defaultCurrentMonthIndex } = useMemo(() => {
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
    let activeIndex = 0;

    for (let m = 0; m < durationMonths; m++) {
      // Rolling study month m: from (startDate + m months) to (startDate + m+1 months - 1 day)
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

          daysInMonth.push({
            dateObj: new Date(cur),
            m: monthShortUz[cur.getMonth()],
            d: cur.getDate(),
            fullDate: cur.toISOString().split("T")[0],
            isPast,
            isToday
          });
        }
        cur.setDate(cur.getDate() + 1);
      }

      const isCurrent = (
        today >= mStart && today <= mEnd
      ) || (
        m === 0 && today < validStartDate
      );

      if (isCurrent) {
        activeIndex = m;
      }

      const periodLabel = `${mStart.getDate()}-${monthShortUz[mStart.getMonth()]} — ${mEnd.getDate()}-${monthShortUz[mEnd.getMonth()]}`;

      result.push({
        id: m + 1,
        name: `${m + 1}-o'quv oyi (${periodLabel})`,
        isCurrent,
        days: daysInMonth
      });
    }

    return { studyMonths: result, defaultCurrentMonthIndex: activeIndex };
  }, [group]);

  useEffect(() => {
    if (studyMonths.length > 0) {
      setCurrentMonthView(defaultCurrentMonthIndex + 1);
    }
  }, [studyMonths, defaultCurrentMonthIndex]);

  const handleDayClick = (monthName: string, day: any) => {
    if (!day.isPast && !day.isToday) {
      toast.error("Dars boshlanishiga hali bor");
      return;
    }
    const dateStr = day.fullDate || `2026-09-${String(day.d).padStart(2, '0')}`;
    router.push(`/dashboard/groups/${resolvedParams.id}/lesson/${dateStr}`);
  };

  const renderMonthDays = (month: any) => {
    if (!month || !month.days || month.days.length === 0) {
      return (
        <div className="text-xs text-slate-400 italic py-4">
          Ushbu oyda dars kunlari mavjud emas.
        </div>
      );
    }
    return (
      <div className="flex flex-wrap gap-2.5">
        {month.days.map((day: any, idx: number) => {
          const isPast = day.isPast;
          const isToday = day.isToday;
          const isCompleted = attendanceTable?.lessons?.some((l: any) => l.date === day.fullDate);
          return (
            <button 
              key={idx}
              onClick={() => handleDayClick(month.name, day)}
              title={`${day.fullDate}${isPast ? " (O'tgan dars)" : isToday ? " (Bugungi dars)" : ""}`}
              className={`w-14 h-16 flex flex-col items-center justify-center rounded-xl border transition-all group relative backdrop-blur-md overflow-hidden ${
                isToday
                  ? "bg-indigo-600/80 dark:bg-indigo-500/40 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105 z-10 hover:bg-indigo-500/90 hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]"
                  : isCompleted
                  ? "bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : isPast
                  ? "bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 opacity-50 hover:opacity-100 hover:bg-white/20 hover:border-white/30 cursor-pointer"
                  : "bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 hover:bg-indigo-500/20 hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]"
              }`}
            >
              {isCompleted && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f1523] flex items-center justify-center z-10">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <span className={`text-[11px] font-semibold transition-colors ${
                isToday ? "text-indigo-100" : isCompleted ? "text-emerald-600 group-hover:text-white" : "text-slate-500 dark:text-slate-400 group-hover:text-indigo-500"
              }`}>
                {day.m}
              </span>
              <span className={`text-lg font-bold transition-colors ${
                isToday ? "text-white" : isPast ? "text-slate-400 dark:text-slate-500" : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              }`}>
                {day.d}
              </span>
              {isPast && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-400/60 dark:bg-slate-500/60"></div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Guruh ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {mockGroup.name}
            </h1>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
              mockGroup.status === "active" 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
            }`}>
              {mockGroup.status === "active" ? "Aktiv" : "Tugallangan"}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setIsStatsOpen(true)}
          className="bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all shadow-sm shrink-0"
        >
          <BarChart2 size={18} />
          Statistika
        </button>
      </div>

      {/* Tabs */}
      <div className="relative flex items-center gap-6 border-b border-slate-200 dark:border-white/10 mb-8 overflow-x-auto no-scrollbar">
        {/* Animated Sliding Border (GPU Accelerated) */}
        <div 
          className="absolute bottom-[-1px] left-0 h-[2px] w-[1px] bg-indigo-600 dark:bg-indigo-400 transition-transform duration-300 ease-out origin-left"
          style={{
            transform: `translateX(${indicatorStyle.left}px) scaleX(${indicatorStyle.width})`
          }}
        />

        {TABS.map((tab) => (
          <button
            key={tab}
            data-maintab={tab}
            onClick={() => handleTabChange(tab)}
            className={`pb-4 text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
              activeTab === tab 
                ? "text-indigo-600 dark:text-indigo-400" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Ma'lumotlar" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Guruh mentorlari */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Guruh mentorlari</h3>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                {group?.groupTeachers && group.groupTeachers.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-6 py-4">
                    {group.groupTeachers.map((gt: any) => {
                      const t = gt.teacher;
                      const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
                      const photoUrl = t?.photo ? `${backendUrl}/${t.photo.replace(/\\/g, '/')}` : null;
                      return (
                        <div key={gt.id || t?.id} className="flex flex-col items-center gap-2">
                          {photoUrl ? (
                            <img 
                              src={photoUrl} 
                              alt={`${t?.first_name} ${t?.last_name}`} 
                              className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/30 shadow-md"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                              {t?.first_name?.charAt(0)}{t?.last_name?.charAt(0)}
                            </div>
                          )}
                          <div className="text-center">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md mb-1 inline-block border border-indigo-100 dark:border-indigo-500/20">
                              O'qituvchi
                            </span>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">
                              {t?.first_name} {t?.last_name}
                            </h4>
                            {t?.phone && <p className="text-xs text-slate-500 dark:text-slate-400">{t.phone}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm font-medium">
                    O'qituvchi biriktirilmagan
                  </div>
                )}
              </div>
            </div>

            {/* Parametrlar */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Parametrlar</h3>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6 flex-1">
                <div className="space-y-4">
                  {[
                    { label: "Kurs:", value: mockGroup.course, isBold: true },
                    { label: "Xona:", value: mockGroup.room },
                    { label: "O'quvchilar sig'imi:", value: mockGroup.maxStudents },
                    { label: "Mavjud o'quvchilar:", value: mockGroup.studentsCount },
                    { label: "Dars jadvali:", value: mockGroup.schedule },
                    { label: "Boshlanish sanasi:", value: mockGroup.startDate },
                  ].map((param, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {param.label}
                      </span>
                      <span className={`text-sm ${param.isBold ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                        {param.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Dars jadvali */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Dars jadvali</h3>
            
            <div className="space-y-4 mb-8">
              <div className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                <div className="flex-1">
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {mockGroup.teacher}
                  </span>
                </div>
                <div className="flex-[0.8] text-left">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {formatDays(group?.weekday)}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {group?.start_time ? `${group.start_time} dan` : "-"}
                  </span>
                </div>
                <div className="flex-[1.5] text-left">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Boshlanish: {mockGroup.startDate}
                  </span>
                </div>
                <div className="flex-[0.8] text-right">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    {mockGroup.room}
                  </span>
                </div>
              </div>
            </div>

            {/* Expansion Button for Schedule */}
            {!showAllSchedules && (
              <div className="flex justify-center mb-10">
                <button 
                  onClick={() => setShowAllSchedules(true)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm dark:shadow-none"
                >
                  Yana ko'rsatish (9)
                </button>
              </div>
            )}

            {/* Months Section */}
            {!showAllMonths ? (
              // Single month view with controls
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <button 
                    onClick={() => setCurrentMonthView(Math.max(1, currentMonthView - 1))}
                    disabled={currentMonthView <= 1}
                    className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {studyMonths[currentMonthView - 1]?.name || "1-o'quv oyi"}
                    </h4>
                    {studyMonths[currentMonthView - 1]?.isCurrent && (
                      <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-md">
                        Joriy oy
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => setCurrentMonthView(Math.min(studyMonths.length, currentMonthView + 1))}
                    disabled={currentMonthView >= studyMonths.length}
                    className="p-1.5 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {renderMonthDays(studyMonths[currentMonthView - 1])}
                
                <div className="flex justify-center mt-12">
                  <button 
                    onClick={() => setShowAllMonths(true)}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm dark:shadow-none"
                  >
                    Barchasini ko'rish
                  </button>
                </div>
              </div>
            ) : (
              // All months view
              <div className="space-y-12 animate-in fade-in duration-500">
                {studyMonths.map((month) => (
                  <div key={month.id}>
                    <div className="flex items-center gap-3 mb-6">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {month.name}
                      </h4>
                      {month.isCurrent && (
                        <span className="px-2.5 py-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-md">
                          Joriy oy
                        </span>
                      )}
                    </div>
                    {renderMonthDays(month)}
                  </div>
                ))}
                
                <div className="flex justify-center mt-12 border-t border-slate-100 dark:border-white/10 pt-8">
                  <button 
                    onClick={() => {
                      setShowAllMonths(false);
                      setCurrentMonthView(defaultCurrentMonthIndex + 1);
                    }}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shadow-sm dark:shadow-none"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* O'quvchilar Progressi */}
          <div className="relative bg-white/10 dark:bg-[#0B0F19]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2rem] p-4 sm:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden mt-6">
            {/* Background glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200">O'quvchilar ro'yxati</h3>
            </div>
            
            {/* Tabs for Active / Inactive */}
            <div className="relative z-10 flex items-center gap-6 border-b border-slate-200/50 dark:border-white/10 mb-8">
               <button className="px-2 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 shadow-[0_2px_10px_rgba(79,70,229,0.2)]">Faollar ({attendanceTable?.students?.length || 0})</button>
               <button className="px-2 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">To'xtatganlar (0)</button>
            </div>

            <div className="relative z-10 space-y-4">
              {attendanceTable?.students?.map((student: any) => {
                const isExpanded = expandedStudents[student.id];
                
                return (
                  <div key={student.id} className={`border rounded-[1.5rem] transition-all duration-500 ${isExpanded ? "bg-white/40 dark:bg-white/[0.08] border-indigo-200/50 dark:border-indigo-500/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]" : "bg-white/20 dark:bg-white/[0.03] border-white/20 dark:border-white/5 hover:bg-white/30 dark:hover:bg-white/[0.06] hover:border-white/40"}`}>
                    {/* Student Header - Accordion Toggle */}
                    <div 
                      onClick={() => toggleStudentExpanded(student.id)}
                      className="p-5 flex items-center justify-between cursor-pointer rounded-[1.5rem]"
                    >
                      <div className="flex items-center gap-4">
                        {student.image ? (
                           <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                             {student.name.charAt(0)}
                           </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>• {group?.course?.name || 'Kurs'} | {group?.days || 'oyma-oy'} | {new Date(group?.start_date || Date.now()).toLocaleDateString('uz-UZ')}</span>
                          </p>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        {isExpanded ? <Minus size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                    
                    {/* Timeline View - Expanded */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                      <div className="px-6 pb-6 pt-2 border-t border-slate-200/50 dark:border-white/10">
                        <div className="flex items-center mb-4 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                           <span className="mr-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]">1-o'quv oyi</span>
                           <ChevronRight size={14} className="text-indigo-400" />
                        </div>
                        <div className="flex items-center gap-2.5 overflow-x-auto overflow-y-hidden pb-4 pt-32 -mt-24 px-1 no-scrollbar">
                          {studyMonths[currentMonthView - 1]?.days?.map((dayObj: any, index: number) => {
                            // Find matching lesson from DB
                            const matchedLesson = attendanceTable?.lessons?.find((l: any) => l.date.startsWith(dayObj.fullDate));
                            
                            const isPresent = matchedLesson ? student.attendances?.[matchedLesson.id] : undefined;
                            const hwStatus = matchedLesson ? student.homeworks?.[matchedLesson.id] : undefined;
                            
                            let boxBg = "bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/5 text-slate-500 hover:bg-white/30 dark:hover:bg-white/10 hover:border-white/40 shadow-sm backdrop-blur-md"; 
                            let title = dayObj.isPast ? "Davomat qilinmagan" : "Hali vaqti kelmagan";
                            let topic = matchedLesson?.topic || "Noma'lum mavzu";
                            let statusIcon = null;
                            
                            if (matchedLesson && isPresent == null) {
                                title = "Davomat belgilanmagan";
                            }
                            
                            if (matchedLesson && isPresent === false) {
                              boxBg = "bg-rose-500/20 dark:bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 hover:border-rose-500/40 shadow-[0_4px_12px_rgba(244,63,94,0.15)] backdrop-blur-md";
                              title = "Darsga kelmagan";
                            } else if (matchedLesson && isPresent === true) {
                              if (hwStatus === "ACCEPTED" || hwStatus === "CHECKED" || hwStatus === "GRADED") {
                                boxBg = "bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/40 shadow-[0_4px_12px_rgba(16,185,129,0.15)] backdrop-blur-md";
                                title = "Vazifa qabul qilindi";
                              } else if (hwStatus === "PENDING") {
                                boxBg = "bg-amber-500/20 dark:bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 hover:border-amber-500/40 shadow-[0_4px_12px_rgba(245,158,11,0.15)] backdrop-blur-md";
                                title = "Vazifa tekshirilmoqda";
                              } else if (hwStatus === "NOT_SUBMITTED") {
                                boxBg = "bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-400 text-white shadow-[0_8px_16px_rgba(245,158,11,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_20px_rgba(245,158,11,0.5)]";
                                title = "Vazifa topshirmagan";
                              } else if (hwStatus === "REJECTED") {
                                boxBg = "bg-gradient-to-br from-rose-500 to-rose-700 text-white border border-rose-400 shadow-[0_8px_16px_rgba(244,63,94,0.4)] hover:-translate-y-1 hover:shadow-[0_12px_20px_rgba(244,63,94,0.5)]";
                                title = "Vazifa qaytarildi";
                              } else {
                                boxBg = "bg-indigo-500/20 dark:bg-indigo-500/10 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/30 hover:border-indigo-500/40 shadow-[0_4px_12px_rgba(99,102,241,0.15)] backdrop-blur-md";
                                title = "Kelgan";
                              }
                            }

                            const isStart = index < 2;
                            const isEnd = index >= studyMonths[currentMonthView - 1].days.length - 2;
                            
                            return (
                              <div 
                                key={dayObj.fullDate}
                                className={`group relative flex flex-col items-center justify-center w-[52px] h-[56px] rounded-[14px] transition-all duration-300 ease-out cursor-pointer shrink-0 ${boxBg}`}
                              >
                                {/* Tooltip */}
                                <div className={`absolute bottom-full mb-3 w-max opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none z-50 ${isStart ? "left-0" : isEnd ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
                                   <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white py-2 px-3 rounded-xl shadow-2xl flex flex-col items-center">
                                      <span className="text-xs font-bold">{title}</span>
                                      <span className="text-[10px] text-slate-400 mt-0.5">{matchedLesson ? `Mavzu: ${topic}` : "Mavzu belgilanmagan"}</span>
                                      <div className={`absolute top-full border-[5px] border-transparent border-t-slate-900/90 ${isStart ? "left-[26px] -translate-x-1/2" : isEnd ? "right-[26px] translate-x-1/2" : "left-1/2 -translate-x-1/2"}`}></div>
                                   </div>
                                </div>

                                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-1">
                                  {dayObj.m}
                                </span>
                                <span className="text-lg font-black leading-none">
                                  {dayObj.d.toString().padStart(2, '0')}
                                </span>
                                
                                {statusIcon && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-900"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex justify-center mt-4">
                           <button className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl border border-indigo-400 shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_10px_25px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-0.5">
                              Barchasini ko'rish
                           </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Placeholders for other tabs */}
      {activeTab === "Guruh darsliklari" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guruh darsliklari</h2>
              <div className="relative flex p-1.5 bg-white/10 dark:bg-[#0B0F19]/60 backdrop-blur-2xl rounded-xl border border-white/20 dark:border-white/10 shadow-inner overflow-x-auto no-scrollbar">
                {/* Sliding Pill */}
                <div 
                  className="absolute top-1.5 bottom-1.5 left-0 bg-white/40 dark:bg-indigo-500/20 backdrop-blur-lg rounded-lg border border-white/50 dark:border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.15)] transition-all duration-300 ease-out"
                  style={{ 
                    width: `${darslikIndicator.width}px`,
                    transform: `translateX(${darslikIndicator.left}px)`
                  }}
                />

                {DARSLIK_TABS.map((tab) => (
                  <button
                    key={tab}
                    data-darsliktab={tab}
                    onClick={() => setDarslikTab(tab)}
                    className={`relative z-10 px-4 py-2 text-sm font-semibold transition-colors duration-300 whitespace-nowrap rounded-lg ${
                      darslikTab === tab 
                        ? "text-indigo-800 dark:text-indigo-300" 
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={() => {
                if (darslikTab === "Videolar") {
                  setIsAddVideoModalOpen(true);
                } else if (darslikTab === "Imtihonlar") {
                  router.push(`/dashboard/groups/${resolvedParams.id}/exam/create`);
                } else {
                  router.push(`/dashboard/groups/${resolvedParams.id}/homework/create`);
                }
              }}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-sm transform hover:scale-[1.02] shrink-0 w-full md:w-auto text-center ${
                darslikTab === "Videolar"
                  ? "bg-emerald-500 hover:bg-emerald-600 shadow-[0_8px_16px_rgba(16,185,129,0.25)]"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-[0_8px_16px_rgba(99,102,241,0.25)]"
              }`}
            >
              Qo'shish
            </button>
          </div>

          {darslikTab === "Uyga vazifa" && (
            <div className="w-full overflow-x-auto pb-4 animate-in fade-in duration-200">
              <div className="min-w-[900px] space-y-3">
              {/* Header row */}
              <div className="flex items-center px-6 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="w-12 pl-2">#</div>
                <div className="flex-1">Mavzu</div>
                <div className="w-16 flex justify-center"><User size={16} /></div>
                <div className="w-16 flex justify-center text-amber-500"><Clock size={16} /></div>
                <div className="w-16 flex justify-center text-emerald-500"><CheckCircle2 size={16} /></div>
                <div className="w-40">Berilgan vaqt</div>
                <div className="w-40">Tugash vaqti</div>
                <div className="w-32">Dars sanasi</div>
                <div className="w-10"></div>
              </div>

              {/* Body rows */}
              {homeworks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Uyga vazifalar topilmadi.</div>
              ) : (
                homeworks.map(hw => (
                    <div 
                      key={hw.id} 
                      onClick={() => router.push(`/dashboard/groups/${resolvedParams.id}/homework/${hw.id}/results`)}
                      className={`flex items-center px-6 py-5 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[1.25rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] dark:shadow-none hover:shadow-lg hover:shadow-indigo-500/5 transition-all group cursor-pointer ${activeHomeworkMenu === hw.id ? "relative z-[60]" : "relative z-10"}`}
                    >
                      <div className="w-12 pl-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{hw.id}</div>
                      <div className="flex-1 text-sm font-bold text-slate-900 dark:text-white">{hw.topic}</div>
                      <div className="w-16 flex justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">{hw.users}</div>
                      <div className="w-16 flex justify-center text-sm font-semibold text-amber-600 dark:text-amber-400">{hw.clock}</div>
                      <div className="w-16 flex justify-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">{hw.check}</div>
                      <div className="w-40 text-sm font-medium text-slate-600 dark:text-slate-400">{formatDateTime(hw.assignedTime)}</div>
                      <div className="w-40 text-sm font-medium text-slate-600 dark:text-slate-400">{formatDateTime(hw.endTime)}</div>
                      <div className="w-32 text-sm font-medium text-slate-600 dark:text-slate-400">{formatDate(hw.date)}</div>
                      <div className="w-10 flex justify-end relative">
                        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveHomeworkMenu(activeHomeworkMenu === hw.id ? null : hw.id); }}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                            >
                              <MoreVertical size={20} />
                            </button>
                            {activeHomeworkMenu === hw.id && (
                              <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditHomeworkId(hw.id);
                                    setEditHomeworkTitle(hw.topic);
                                    setIsEditHomeworkModalOpen(true);
                                    setActiveHomeworkMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                  Tahrirlash
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteHomeworkId(hw.id);
                                    setIsDeleteHomeworkModalOpen(true);
                                    setActiveHomeworkMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                  O'chirish
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-6 h-6"></div>
                        )}
                      </div>
                    </div>
                ))
              )}
            </div>
          </div>
          )}

          {darslikTab === "Videolar" && (
            <div className="w-full overflow-x-auto pb-32 animate-in fade-in duration-200">
              <div className="min-w-[900px] space-y-3">
                {/* Header row */}
                <div className="flex items-center px-6 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="w-12 pl-2">#</div>
                  <div className="w-48">Video nomi</div>
                  <div className="flex-1">Dars nomi</div>
                  <div className="w-24 text-center">Status</div>
                  <div className="w-32 text-center">Dars sanasi</div>
                  <div className="w-24 text-center">Hajmi</div>
                  <div className="w-40 text-center">Qo'shilgan vaqti</div>
                  <div className="w-10"></div>
                </div>

                {/* Body rows */}
                {lessonVideos.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">Videolar topilmadi.</div>
                ) : (
                  lessonVideos.map(vid => (
                    <div 
                      key={vid.id} 
                      onClick={() => { setActiveVideo(vid); setIsVideoModalOpen(true); }}
                      className={`flex items-center px-6 py-5 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[1.25rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] dark:shadow-none hover:shadow-lg hover:shadow-indigo-500/5 transition-all group cursor-pointer ${activeVideoMenu === vid.id ? "relative z-[60]" : "relative z-10"}`}
                    >
                      <div className="w-12 pl-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{vid.id}</div>
                      <div className="w-48 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <PlayCircle size={18} className="text-indigo-500" />
                        {vid.name}
                      </div>
                      <div className="flex-1 text-sm font-bold text-slate-900 dark:text-white">{vid.lesson}</div>
                      <div className="w-24 flex justify-center">
                        <span className="px-2 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-md border border-emerald-200/50 dark:border-emerald-500/20">{vid.status}</span>
                      </div>
                      <div className="w-32 flex justify-center text-sm font-medium text-slate-600 dark:text-slate-400">{formatDate(vid.date)}</div>
                      <div className="w-24 flex justify-center text-sm font-medium text-slate-600 dark:text-slate-400">{vid.size}</div>
                      <div className="w-40 flex justify-center text-sm font-medium text-slate-600 dark:text-slate-400">{formatDateTime(vid.added)}</div>
                      <div className="w-10 flex justify-end relative">
                        {(userRole === 'ADMIN' || userRole === 'SUPERADMIN') ? (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setActiveVideoMenu(activeVideoMenu === vid.id ? null : vid.id); }}
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                            >
                              <MoreVertical size={20} />
                            </button>
                            {activeVideoMenu === vid.id && (
                              <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditVideoId(vid.id);
                                    setEditVideoTitle(vid.name);
                                    setIsEditVideoModalOpen(true);
                                    setActiveVideoMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                  Tahrirlash
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteVideoId(vid.id);
                                    setIsDeleteVideoModalOpen(true);
                                    setActiveVideoMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                >
                                  O'chirish
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-6 h-6"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {darslikTab === "Imtihonlar" && (
            <div className="w-full overflow-x-auto pb-4 animate-in fade-in duration-200">
              <div className="min-w-[900px] space-y-3">
                <div className="flex items-center px-6 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="w-12 pl-2">#</div>
                  <div className="flex-1">Imtihon mavzusi</div>
                  <div className="w-32 text-center">O'tish bali</div>
                  <div className="w-32 text-center">Maks. bal</div>
                  <div className="w-32 text-center">Topshirdi</div>
                  <div className="w-40 text-center">Sana</div>
                  <div className="w-32 text-center">Status</div>
                  <div className="w-10"></div>
                </div>

                {exams.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">Imtihonlar topilmadi.</div>
                ) : (
                  exams.map(exam => (
                    <div key={exam.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[1.25rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] dark:shadow-none hover:shadow-lg hover:shadow-indigo-500/5 transition-all group overflow-hidden">
                      <div 
                        onClick={() => setExpandedExamId(expandedExamId === exam.id ? null : exam.id)}
                        className="flex items-center px-6 py-5 cursor-pointer"
                      >
                        <div className="w-12 pl-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{exam.id}</div>
                        <div className="flex-1 text-sm font-bold text-slate-900 dark:text-white">{exam.topic}</div>
                        <div className="w-32 flex justify-center text-sm font-bold text-rose-600 dark:text-rose-400">{exam.minScore}</div>
                        <div className="w-32 flex justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">{exam.maxScore}</div>
                        <div className="w-32 flex justify-center text-sm font-semibold text-slate-600 dark:text-slate-300">{exam.students} ta</div>
                        <div className="w-40 flex justify-center text-sm font-medium text-slate-600 dark:text-slate-400">{exam.date}</div>
                        <div className="w-32 flex justify-center">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                            exam.status === 'Yakunlangan' 
                              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20' 
                              : 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20'
                          }`}>
                            {exam.status}
                          </span>
                        </div>
                        <div className="w-10 flex justify-end">
                          <div className={`p-1 rounded-lg text-slate-400 transition-transform duration-300 ${expandedExamId === exam.id ? 'rotate-90' : ''}`}>
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Accordion Content for Exam Results */}
                      {expandedExamId === exam.id && (
                        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 fade-in duration-200 border-t border-slate-100 dark:border-white/5">
                          <div className="flex justify-end gap-3 mb-4">
                            <button 
                              onClick={() => setDeleteExamId(exam.id)}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                            >
                              <Trash2 size={16} />
                              O'chirish
                            </button>
                            <button 
                              onClick={() => router.push(`/dashboard/groups/${resolvedParams.id}/exam/${exam.id}/results`)}
                              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                            >
                              <CheckSquare size={16} />
                              Baholash
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            
                            {/* Passed Students */}
                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4">
                              <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                <CheckCircle2 size={16} />
                                O'tganlar ({exam.passed.length})
                              </h4>
                              <div className="space-y-2">
                                {exam.passed.map((student: any) => (
                                  <div key={student.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-sm border border-emerald-50 dark:border-white/5">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{student.name}</span>
                                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{student.score} ball</span>
                                  </div>
                                ))}
                                {exam.passed.length === 0 && <p className="text-xs text-slate-500 italic">Hech kim yo'q</p>}
                              </div>
                            </div>
                            
                            {/* Failed Students */}
                            <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-xl p-4">
                              <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2">
                                <X size={16} />
                                O'tmaganlar ({exam.failed.length})
                              </h4>
                              <div className="space-y-2">
                                {exam.failed.map((student: any) => (
                                  <div key={student.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-2.5 rounded-lg shadow-sm border border-rose-50 dark:border-white/5">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{student.name}</span>
                                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{student.score} ball</span>
                                  </div>
                                ))}
                                {exam.failed.length === 0 && <p className="text-xs text-slate-500 italic">Hech kim yo'q</p>}
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {darslikTab === "Jurnal" && (
            <div className="w-full overflow-x-auto pb-4 animate-in fade-in duration-200">
              <div className="min-w-[700px] space-y-3">
                <div className="flex items-center px-6 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <div className="w-12 pl-2">#</div>
                  <div className="flex-1">O'quvchi ismi</div>
                  <div className="w-32 text-center">O'rtacha baho</div>
                  <div className="w-32 text-center">Oxirgi baho</div>
                  <div className="w-32 text-center">Reyting</div>
                  <div className="w-10"></div>
                </div>

                {journal.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">Jurnal ma'lumotlari yo'q.</div>
                ) : (
                  journal.map((student, idx) => (
                    <div 
                      key={student.id} 
                      className="flex items-center px-6 py-5 bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[1.25rem] shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] dark:shadow-none hover:shadow-lg transition-all group"
                    >
                      <div className="w-12 pl-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{idx + 1}</div>
                      <div className="flex-1 flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-white">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </div>
                      <div className="w-32 flex justify-center">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-md">
                          {student.average} %
                        </div>
                      </div>
                      <div className="w-32 flex justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {student.lastGrade}
                      </div>
                      <div className="w-32 flex justify-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                          student.status === 'A+' || student.status === 'A'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : student.status === 'B' 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {student.status}
                        </span>
                      </div>
                      <div className="w-10 flex justify-end">
                        <button className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      )}
      {activeTab === "Akademik davomati" && (
        <div className="relative bg-white/10 dark:bg-[#0B0F19]/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2rem] p-4 sm:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden animate-in fade-in duration-500">
          {/* Background glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4 mb-8">
            <h2 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-900 dark:from-white dark:to-indigo-200">Davomat</h2>
            <div className="flex items-center gap-3">
              {Object.keys(pendingAttendance).length > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/groups/${resolvedParams.id}/attendance`, {
                        attendances: pendingAttendance
                      });
                      toast.success("Davomat muvaffaqiyatli saqlandi!");
                      setPendingAttendance({});
                      // Refetch data
                      const res = await api.get(`/groups/${resolvedParams.id}/attendance`);
                      if (res) setAttendanceTable(res);
                    } catch (error) {
                      toast.error("Xatolik yuz berdi");
                    }
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-[0_8px_16px_rgba(99,102,241,0.25)] transition-all animate-in zoom-in duration-300"
                >
                  Saqlash
                </button>
              )}
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Jami darslar:</span>
              <span className="px-4 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-300 shadow-[inset_0_2px_10px_rgba(99,102,241,0.2)]">
                {studyMonths[currentMonthView - 1]?.days?.length || 0} ta
              </span>
            </div>
          </div>
          
          <div className="relative z-10 w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[800px] space-y-4">
              {/* Header row */}
              <div className="flex items-center px-6 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-white/10 mb-4">
                <div className="w-12 pl-2">#</div>
                <div className="w-48 shrink-0">O'quvchi ismi</div>
                {studyMonths[currentMonthView - 1]?.days?.map(dayObj => (
                  <div key={dayObj.fullDate} className="w-16 flex flex-col items-center justify-center shrink-0">
                    <span className="truncate" title={new Date(dayObj.fullDate).toLocaleDateString("uz-UZ")}>
                      {dayObj.d}-{dayObj.m.toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Body rows */}
              {attendanceTable.students.map((student, idx) => (
                <div 
                  key={student.id} 
                  className="flex items-center px-6 py-4 bg-white/20 dark:bg-white/[0.03] border border-white/20 dark:border-white/5 rounded-[1.5rem] hover:bg-white/30 dark:hover:bg-white/[0.06] hover:border-white/40 transition-all duration-300 group"
                >
                  <div className="w-12 pl-2 text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">{idx + 1}</div>
                  <div className="w-48 text-sm font-bold text-slate-900 dark:text-white flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <span className="truncate">{student.name}</span>
                  </div>
                  
                  {studyMonths[currentMonthView - 1]?.days?.map(dayObj => {
                    const matchedLesson = attendanceTable?.lessons?.find((l: any) => l.date.startsWith(dayObj.fullDate));
                    
                    if (!matchedLesson) {
                      return (
                        <div key={dayObj.fullDate} className="w-16 flex justify-center shrink-0">
                          <span className="text-slate-300 dark:text-slate-600 font-bold">-</span>
                        </div>
                      );
                    }

                    const isLocked = attendanceTable.students.some(s => s.attendances[matchedLesson.id] != null);
                    
                    const localState = pendingAttendance[matchedLesson.id]?.[student.id];
                    const dbState = student.attendances[matchedLesson.id];
                    const currentStatus = localState !== undefined ? localState : dbState;

                    return (
                      <div key={dayObj.fullDate} className="w-16 flex justify-center shrink-0">
                        <button
                          disabled={isLocked}
                          onClick={() => {
                            if (isLocked) return;
                            
                            // Toggle: null -> true -> false -> null
                            let newStatus: boolean | null = null;
                            if (currentStatus === null || currentStatus === undefined) newStatus = true;
                            else if (currentStatus === true) newStatus = false;
                            else newStatus = null;
                            
                            setPendingAttendance(prev => ({
                              ...prev,
                              [matchedLesson.id]: {
                                ...(prev[matchedLesson.id] || {}),
                                [student.id]: newStatus
                              }
                            }));
                          }}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-md ${
                            isLocked ? 'cursor-not-allowed opacity-60 ' : 'active:scale-90 hover:shadow-lg'
                          } ${
                            currentStatus === true 
                              ? 'bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.15)]' 
                              : currentStatus === false 
                              ? 'bg-rose-500/20 dark:bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/30 shadow-[0_4px_12px_rgba(244,63,94,0.15)]' 
                              : 'bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 text-slate-400 hover:bg-white/20 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {currentStatus === true ? (
                            <Check size={16} strokeWidth={3} />
                          ) : currentStatus === false ? (
                            <X size={16} strokeWidth={3} />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-slate-300 dark:bg-slate-600' : 'bg-slate-400 dark:bg-slate-400'}`} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Save Buttons Row */}
              {attendanceTable.students.length > 0 && (
                <div className="flex items-center px-6 py-4 border-t border-slate-200 dark:border-white/10 mt-4">
                  <div className="w-12 pl-2 shrink-0"></div>
                  <div className="w-48 shrink-0"></div>
                  {studyMonths[currentMonthView - 1]?.days?.map(dayObj => {
                    const matchedLesson = attendanceTable?.lessons?.find((l: any) => l.date.startsWith(dayObj.fullDate));
                    
                    if (!matchedLesson) {
                      return <div key={dayObj.fullDate} className="w-16 shrink-0"></div>;
                    }

                    const isLocked = attendanceTable.students.some(s => s.attendances[matchedLesson.id] != null);
                    const hasPendingChanges = pendingAttendance[matchedLesson.id] && Object.values(pendingAttendance[matchedLesson.id]).some(val => val !== null && val !== undefined);

                    return (
                      <div key={dayObj.fullDate} className="w-16 flex justify-center shrink-0">
                        {!isLocked && (
                          <button
                            disabled={!hasPendingChanges || isSavingAttendance[matchedLesson.id]}
                            onClick={async () => {
                              const lessonPending = pendingAttendance[matchedLesson.id] || {};
                              
                              const dtos = Object.entries(lessonPending)
                                .filter(([_, val]) => val !== null && val !== undefined)
                                .map(([studentId, val]) => ({
                                  student_id: parseInt(studentId),
                                  isPresent: val
                                }));
                                
                              if (dtos.length === 0) return;
                              
                              setIsSavingAttendance(prev => ({ ...prev, [matchedLesson.id]: true }));
                              try {
                                await api.post(`/lessons/${matchedLesson.id}/attendance`, {
                                  attendances: dtos
                                });
                                toast.success("Davomat saqlandi!");
                                // Hard reload to fetch new state and lock
                                window.location.reload();
                              } catch (e: any) {
                                toast.error(e.response?.data?.message || "Xatolik yuz berdi");
                                setIsSavingAttendance(prev => ({ ...prev, [matchedLesson.id]: false }));
                              }
                            }}
                            className={`w-11 h-9 rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-md border ${
                              hasPendingChanges 
                                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 border-indigo-400 hover:shadow-[0_8px_20px_rgba(79,70,229,0.5)] text-white hover:-translate-y-0.5' 
                                : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                            }`}
                            title="Saqlash"
                          >
                            {isSavingAttendance[matchedLesson.id] ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <CheckCircle2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {attendanceTable.students.length === 0 && (
                <div className="text-center py-8 text-slate-500">O'quvchilar yo'q.</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modals for Videos */}
      {isVideoModalOpen && activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden shadow-2xl w-full max-w-5xl border border-white/10 flex flex-col relative animate-in zoom-in-95 duration-400 ease-out">
            
            {/* Close Button Floating */}
            <button 
              onClick={() => setIsVideoModalOpen(false)} 
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 shadow-lg"
            >
              <X size={20} />
            </button>

            {/* Video Player Edge to Edge */}
            <div className="aspect-video bg-black/80 w-full relative">
              <video 
                src={activeVideo.url ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'}/${activeVideo.url.replace(/\\/g, '/')}` : ''} 
                controls 
                className="w-full h-full object-contain" 
                autoPlay 
              />
            </div>
            
            {/* Footer Details - Glassmorphism */}
            <div className="p-6 md:p-8 bg-white/5 border-t border-white/10">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[inset_0_2px_10px_rgba(99,102,241,0.2)]">
                  <PlayCircle size={26} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xl tracking-tight">{activeVideo.lesson}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{activeVideo.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Hajmi:</span>
                  <span className="font-bold text-slate-200 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">{activeVideo.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">Yuklangan sana:</span>
                  <span className="font-bold text-slate-200 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">{new Date(activeVideo.added).toLocaleString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddVideoModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Qo'shish</h3>
              <button onClick={() => setIsAddVideoModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              
              {/* Title Selection */}
              <div className="mb-6 relative">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Video sarlavhasi (Ixtiyoriy)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 1-dars videosi"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm hover:border-emerald-500/30"
                />
              </div>

              {/* Lesson Selection */}
              <div className="mb-6 relative">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="text-red-500 mr-1">*</span>Darsni tanlang
                </label>
                <div className="relative">
                  <button 
                    onClick={() => setIsLessonSelectOpen(!isLessonSelectOpen)}
                    className="w-full px-4 py-3.5 text-sm text-left rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all flex items-center justify-between shadow-sm hover:border-emerald-500/30"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {uploadLessonId 
                        ? (() => {
                            const lesson = attendanceTable.lessons.find(l => l.id.toString() === uploadLessonId);
                            return lesson ? `${formatDate(lesson.date)} - ${lesson.topic || "Mavzusiz"}` : "Darsni tanlang";
                          })()
                        : "Ro'yxatdan kerakli darsni tanlang"}
                    </span>
                    <ChevronRight size={18} className={`text-slate-400 transition-transform duration-300 ${isLessonSelectOpen ? "rotate-90 text-emerald-500" : ""}`} />
                  </button>
                  
                  {/* Custom Dropdown Menu */}
                  {isLessonSelectOpen && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto">
                      {attendanceTable.lessons.length === 0 ? (
                        <div className="px-4 py-4 text-sm font-medium text-slate-500 text-center">Guruhda o'tilgan darslar mavjud emas</div>
                      ) : (
                        attendanceTable.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setUploadLessonId(lesson.id.toString());
                              setIsLessonSelectOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3.5 text-sm transition-all flex items-center justify-between border-b border-slate-100 dark:border-white/5 last:border-0 ${
                              uploadLessonId === lesson.id.toString() 
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold" 
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium"
                            }`}
                          >
                            <span>{formatDate(lesson.date)} - {lesson.topic || "Mavzusiz"}</span>
                            {uploadLessonId === lesson.id.toString() && <Check size={16} />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Dropzone */}
              <label className="w-full border-2 border-dashed border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group mb-6 relative block">
                <input 
                  type="file" 
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="video/mp4,video/webm,video/ogg,video/avi,video/x-matroska,video/quicktime"
                  onChange={handleFileChange}
                />
                <div className="w-14 h-14 mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud size={28} strokeWidth={2} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                  Videofayllarni yuklash uchun ushbu hudud ustiga bosing
                </p>
                <p className="text-xs font-medium text-slate-400">
                  Videofayl: .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov formatlaridan birida bo'lishi kerak
                </p>
              </label>

              {/* Uploaded Files Form */}
              {uploadFiles.length > 0 && (
                <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-300">
                  <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <div className="col-span-10">Fayl nomi</div>
                    <div className="col-span-2 text-center">O'chirish</div>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-48 overflow-y-auto">
                    {uploadFiles.map((file, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 items-center bg-white dark:bg-transparent hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-10 text-sm font-semibold text-slate-900 dark:text-white truncate pr-2 flex items-center gap-2" title={file.name}>
                          <PlayCircle size={16} className="text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <button 
                            onClick={() => setUploadFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] rounded-b-2xl">
              <button 
                onClick={() => {
                  setIsAddVideoModalOpen(false);
                  setUploadFiles([]);
                  setUploadLessonId('');
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={handleUploadVideo}
                disabled={isUploading}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-[0_8px_16px_rgba(16,185,129,0.25)] transform hover:scale-[1.02]"
              >
                {isUploading ? "Yuklanmoqda..." : "Fayllarni yuklash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Modal */}
      {isEditVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditVideoModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Videoni tahrirlash</h3>
              <button onClick={() => setIsEditVideoModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Video sarlavhasi
              </label>
              <input
                type="text"
                value={editVideoTitle}
                onChange={(e) => setEditVideoTitle(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setIsEditVideoModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors">Bekor qilish</button>
              <button onClick={handleUpdateVideo} disabled={isUpdatingVideo} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                {isUpdatingVideo ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Video Modal */}
      {isDeleteVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDeleteVideoModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4 border-4 border-red-50 dark:border-red-500/10">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Videoni o'chirish</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Haqiqatan ham ushbu videoni butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => setIsDeleteVideoModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmDeleteVideo} 
                disabled={isDeletingVideo} 
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isDeletingVideo ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Homework Modal */}
      {isEditHomeworkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditHomeworkModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Uy vazifasini tahrirlash</h3>
              <button onClick={() => setIsEditHomeworkModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Mavzu (Sarlavha)
              </label>
              <input
                type="text"
                value={editHomeworkTitle}
                onChange={(e) => setEditHomeworkTitle(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
              />
            </div>
            
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setIsEditHomeworkModalOpen(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors">Bekor qilish</button>
              <button onClick={handleUpdateHomework} disabled={isUpdatingHomework} className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                {isUpdatingHomework ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Homework Modal */}
      {isDeleteHomeworkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDeleteHomeworkModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4 border-4 border-red-50 dark:border-red-500/10">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vazifani o'chirish</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Haqiqatan ham ushbu uy vazifasini va unga biriktirilgan barcha o'quvchilar javoblarini butunlay o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
              </p>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => setIsDeleteHomeworkModalOpen(false)} 
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmDeleteHomework} 
                disabled={isDeletingHomework} 
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                {isDeletingHomework ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Statistics Drawer */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsStatsOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Guruh statistikasi</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{mockGroup.name}</p>
                </div>
              </div>
              <button onClick={() => setIsStatsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
              
              {/* Overall Performance */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-500" />
                  O'zlashtirish dinamikasi (Oxirgi 1 oy)
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 h-64 shadow-sm">
                  {statistics && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statistics.performance || [
                        { name: '1-hafta', ball: 65 },
                        { name: '2-hafta', ball: 72 },
                        { name: '3-hafta', ball: 85 },
                        { name: '4-hafta', ball: 82 },
                      ]}>
                        <defs>
                          <linearGradient id="colorBall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="ball" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorBall)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Attendance and Payment Pies */}
              {statistics && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Davomat</h4>
                    <div className="relative w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statistics.attendanceDistribution || [{value: 85}, {value: 15}]} innerRadius={35} outerRadius={45} dataKey="value" stroke="none">
                            <Cell fill="#10b981" />
                            <Cell fill="#f1f5f9" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">85%</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <TrendingUp size={12} /> +5% o'sish
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">To'lovlar</h4>
                    <div className="relative w-24 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statistics.paymentStatus || [{value: 18}, {value: 3}]} innerRadius={35} outerRadius={45} dataKey="value" stroke="none">
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f43f5e" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">18/21</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle size={12} /> 3 ta qarzdor
                    </div>
                  </div>
                </div>
              )}

              {/* Homework Stats */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Uyga vazifalar statistikasi
                </h4>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-4 shadow-sm">
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Vaqtida topshirganlar (bajarilgan)</span>
                      <span className="font-bold text-emerald-600">{statistics.homeworkCompletion?.[0]?.value || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${statistics.homeworkCompletion?.[0]?.value || 0}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Topshirmaganlar</span>
                      <span className="font-bold text-rose-600">{statistics.homeworkCompletion?.[1]?.value || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${statistics.homeworkCompletion?.[1]?.value || 0}%` }}></div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Delete Exam Modal */}
      {deleteExamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#151A27] rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Imtihonni o'chirish</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Rostdan ham bu imtihonni o'chirmoqchimisiz? Ushbu amalni ortga qaytarib bo'lmaydi va barcha o'quvchilarning baholari ham o'chib ketadi.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteExamId(null)}
                  disabled={isDeletingExam}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold transition-colors disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={handleDeleteExam}
                  disabled={isDeletingExam}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeletingExam ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <Trash2 size={18} />
                  )}
                  Ha, o'chirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
