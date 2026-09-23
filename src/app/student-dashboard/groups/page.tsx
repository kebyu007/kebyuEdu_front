"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, BookOpen, Eye, X, Calendar, User as UserIcon } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface GroupTeacher {
  name: string;
  photo: string | null;
  role: string;
}

interface StudentGroup {
  id: number;
  name: string;
  course_name: string;
  status: string;
  start_date: string;
  start_time: string;
  weekday: number[];
  teachers: GroupTeacher[];
}

export default function StudentGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"faol" | "tugagan">("faol");

  // Modal State
  const [selectedGroup, setSelectedGroup] = useState<StudentGroup | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/students/me/groups");
        setGroups(res as any);
      } catch (error) {
        console.error("Guruhlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM, yyyy", { locale: uz });
  };

  const formatWeekdays = (days: number[]) => {
    if (!days || days.length === 0) return "-";
    const dayMap: Record<number, string> = {
      1: "Du", 2: "Se", 3: "Ch", 4: "Pa", 5: "Ju", 6: "Sh", 0: "Ya", 7: "Ya"
    };
    return days.map(d => dayMap[d] || d).join(", ");
  };

  const calculateEndTime = (startTime: string) => {
    if (!startTime) return "";
    // Assume 3 hours for display if end time is not provided (e.g. Bootcamp standard)
    // Format: "09:30"
    const [h, m] = startTime.split(":");
    if (!h || !m) return startTime;
    const endH = (parseInt(h) + 3).toString().padStart(2, "0");
    return `${startTime} - ${endH}:${m}`;
  };

  const getAPIUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    return `${baseURL.replace("/api/v1", "")}/${path}`;
  };

  // Filter groups based on the active tab
  const filteredGroups = groups.filter((g) => {
    if (activeTab === "faol") {
      return g.status === "active";
    } else {
      return g.status !== "active";
    }
  });

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
          Guruhlarim
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Siz tahsil olayotgan va tamomlagan barcha guruhlaringiz ro'yxati
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-white/10 mb-6">
        <button
          onClick={() => setActiveTab("faol")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeTab === "faol"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Faol
          {activeTab === "faol" && (
            <span className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("tugagan")}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${
            activeTab === "tugagan"
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Tugagan
          {activeTab === "tugagan" && (
            <span className="absolute -bottom-[1px] left-0 w-full h-[3px] bg-indigo-600 dark:bg-indigo-400 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guruh nomi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Yo'nalishi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">O'qituvchi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Boshlash vaqti</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group, index) => (
                  <tr 
                    key={group.id} 
                    onClick={() => router.push(`/student-dashboard/groups/${group.id}`)}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group/row cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover/row:text-indigo-600 dark:group-hover/row:text-indigo-400 transition-colors">
                        {group.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {group.course_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGroup(group);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-colors"
                        >
                          <Eye size={14} />
                          O'qituvchilar
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {formatDate(group.start_date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <Users size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Guruhlar topilmadi</p>
                      <p className="text-sm mt-1">Ushbu ro'yxatda hozircha hech qanday guruh yo'q.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teachers Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 dark:bg-[#0B0E14]/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedGroup(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-4xl bg-white/60 dark:bg-[#121621]/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-8 py-8 border-b border-white/20 dark:border-white/5 flex items-start justify-between bg-gradient-to-r from-white/40 to-transparent dark:from-white/5 dark:to-transparent">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
                  {selectedGroup.name}
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 border border-white/50 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 font-bold backdrop-blur-md">
                  <span className={`w-2 h-2 rounded-full mr-2 ${selectedGroup.status === "active" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-400"}`}></span>
                  {selectedGroup.status === "active" ? "Faol" : "Tugagan"}
                </div>
              </div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white dark:bg-white/5 dark:hover:bg-white/20 border border-white/50 dark:border-white/10 text-slate-500 dark:text-slate-300 shadow-sm transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Table */}
            <div className="p-8">
              <div className="bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/5 overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/40 dark:border-white/5 bg-white/30 dark:bg-white/5">
                        <th className="px-6 py-5 text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">O'qituvchi</th>
                        <th className="px-6 py-5 text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">Roli</th>
                        <th className="px-6 py-5 text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">Dars kunlari</th>
                        <th className="px-6 py-5 text-xs font-black text-indigo-900 dark:text-indigo-200 uppercase tracking-widest">Dars vaqti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGroup.teachers && selectedGroup.teachers.length > 0 ? (
                        selectedGroup.teachers.map((teacher, idx) => (
                          <tr key={idx} className="border-b last:border-b-0 border-white/30 dark:border-white/5 hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 dark:border-white/10 bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shadow-sm">
                                  {teacher.photo ? (
                                    <img src={getAPIUrl(teacher.photo)} alt={teacher.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase">
                                      {teacher.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                  {teacher.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg ${teacher.role === 'Teacher' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300'}`}>
                                {teacher.role}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {formatWeekdays(selectedGroup.weekday)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-black text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-white/50 dark:border-white/5">
                                {calculateEndTime(selectedGroup.start_time)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center opacity-50">
                              <Users size={32} className="mb-3 text-slate-500" />
                              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">O'qituvchilar biriktirilmagan</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
