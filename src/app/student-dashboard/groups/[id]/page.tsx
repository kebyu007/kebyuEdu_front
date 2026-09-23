"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, PlayCircle, BookOpen, Clock, CalendarDays, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

interface LessonVideo {
  id: number;
  videoUrl: string;
}

interface Homework {
  status: string;
  deadline: string | null;
  grade: number | null;
}

interface Lesson {
  id: number;
  topic: string;
  date: string;
  videoCount: number;
  videos: LessonVideo[];
  homework: Homework;
}

interface GroupDetails {
  group: {
    name: string;
    status: string;
  };
  lessons: Lesson[];
}

export default function GroupLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get(`/students/me/groups/${params.id}/lessons`);
        setData(res as any);
      } catch (error) {
        console.error("Darslarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchLessons();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    // If it's a date string like "2026-09-21" or ISO datetime
    try {
      return format(new Date(dateString), "dd MMM, yyyy", { locale: uz });
    } catch {
      return dateString;
    }
  };

  const getHomeworkBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
      case "CHECKED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 size={14} />
            Qabul qilingan
          </div>
        );
      case "REJECTED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold border border-red-200 dark:border-red-500/30">
            <XCircle size={14} />
            Qaytarilgan
          </div>
        );
      case "PENDING":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-amber-500/30">
            <Clock size={14} />
            Kutilmoqda
          </div>
        );
      case "Berilgan":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-500/30">
            <AlertCircle size={14} />
            Berilgan (Topshirilmagan)
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-white/10">
            Berilmagan
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Ma'lumot topilmadi.</p>
        <button onClick={() => router.push('/student-dashboard/groups')} className="text-indigo-500 font-bold hover:underline">
          Ortga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/student-dashboard/groups')}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-white/10 transition-all text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-1">
            {data.group.name}
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span className={`w-2 h-2 rounded-full ${data.group.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-400"}`}></span>
            {data.group.status === "active" ? "Faol guruh" : "Tugagan guruh"} • Darslar va vazifalar
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mavzular</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Video</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Uyga vazifa Holati</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Uyga vazifa tugash vaqti</th>
                <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Dars sanasi</th>
              </tr>
            </thead>
            <tbody>
              {data.lessons && data.lessons.length > 0 ? (
                data.lessons.map((lesson) => (
                  <tr 
                    key={lesson.id}
                    onClick={() => router.push(`/student-dashboard/lessons/${lesson.id}`)}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group/row"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                          <BookOpen size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {lesson.topic || "Noma'lum mavzu"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center justify-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${lesson.videoCount > 0 ? 'border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-300 dark:border-slate-600 text-slate-400 bg-transparent'}`}>
                          <PlayCircle size={16} />
                        </div>
                        {lesson.videoCount > 0 && (
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-1 uppercase">Mavjud</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getHomeworkBadge(lesson.homework.status)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {lesson.homework.deadline ? formatDate(lesson.homework.deadline) : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-sm font-bold text-slate-700 dark:text-slate-300">
                        <CalendarDays size={14} className="text-indigo-500 dark:text-indigo-400" />
                        {lesson.date || "-"}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <BookOpen size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Darslar topilmadi</p>
                      <p className="text-sm mt-1">Bu guruhda hali hech qanday dars mavjud emas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exams Table */}
      {data.exams && data.exams.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Imtihonlar</h2>
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg overflow-hidden relative z-10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mavzu</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Maks ball</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">O'tish balli</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Sana</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-right">Holati</th>
                  </tr>
                </thead>
                <tbody>
                  {data.exams.map((exam: any) => (
                    <tr 
                      key={exam.id}
                      onClick={() => router.push(`/student-dashboard/groups/${params.id}/exam/${exam.id}`)}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group/row"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {exam.topic}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {exam.maxScore}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-rose-600 dark:text-rose-400">
                        {exam.minScore}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {exam.date ? formatDate(exam.date) : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {getHomeworkBadge(exam.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
