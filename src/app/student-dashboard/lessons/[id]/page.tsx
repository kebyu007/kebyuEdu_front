"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, PlayCircle, Clock, CalendarDays, Send, FileText, VideoOff, AlertCircle, Paperclip, X } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LessonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitLink, setSubmitLink] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchLesson = async () => {
    try {
      const res = await api.get(`/students/me/lessons/${params.id}`);
      setData(res);
    } catch (error) {
      console.error("Darsni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchLesson();
  }, [params.id]);

  const handleSubmit = async () => {
    if (!submitLink.trim() && !submitFile) {
      toast.error("Iltimos, havola kiriting yoki fayl tanlang!");
      return;
    }
    
    if (submitFile && !submitFile.name.toLowerCase().endsWith('.zip')) {
      toast.error("Faqatgina .zip fayllar qabul qilinadi!");
      return;
    }

    const primaryHomework = data?.lesson?.homeworks?.[0];
    if (!primaryHomework) return;

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append("title", submitLink || (submitFile ? submitFile.name : "Vazifa"));
      if (submitFile) {
        formData.append("file", submitFile);
      }

      await api.post(`/students/me/homeworks/${primaryHomework.id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      toast.success("Vazifa muvaffaqiyatli yuborildi!");
      setSubmitLink("");
      setSubmitFile(null);
      fetchLesson(); // Refresh data to show submitted status
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Vazifani yuborishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined, includeTime = false) => {
    if (!dateString) return "-";
    try {
      const formatStr = includeTime ? "HH:mm dd MMM, yyyy" : "dd MMM, yyyy";
      return format(new Date(dateString), formatStr, { locale: uz });
    } catch {
      return dateString;
    }
  };

  const getAPIUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseURL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;
    return `${baseURL}/${path.replace(/\\/g, '/')}`;
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!data || !data.lesson) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Ma'lumot topilmadi.</p>
        <button onClick={() => router.back()} className="text-indigo-500 font-bold hover:underline">
          Ortga qaytish
        </button>
      </div>
    );
  }

  const { lesson, groupLessons } = data;
  const primaryHomework = lesson.homeworks && lesson.homeworks.length > 0 ? lesson.homeworks[0] : null;
  const studentAnswer = primaryHomework && primaryHomework.homeworkAnswerStudents && primaryHomework.homeworkAnswerStudents.length > 0 
    ? primaryHomework.homeworkAnswerStudents[0] 
    : null;
    
  const isDeadlinePassed = primaryHomework?.deadline ? new Date(primaryHomework.deadline).getTime() < new Date().getTime() : false;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push(`/student-dashboard/groups/${lesson.group.id}`)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-white/10 transition-all text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
            {lesson.group.name}
          </h1>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Dars mavzusi: <span className="text-indigo-600 dark:text-indigo-400">{lesson.topic}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Content (Left) */}
        <div className="flex-1 space-y-6">
          
          {/* Video Player Section */}
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg overflow-hidden flex flex-col p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{lesson.topic}</h2>
            
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-black/40 border border-slate-200/50 dark:border-white/5 flex items-center justify-center">
              {lesson.lessonVideos && lesson.lessonVideos.length > 0 ? (
                <video 
                  src={getAPIUrl(lesson.lessonVideos[0].videoUrl)} 
                  controls 
                  className="w-full h-full object-contain"
                  controlsList="nodownload"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <VideoOff size={64} className="mb-4 opacity-20" />
                  <p className="text-xl font-bold text-slate-500 dark:text-slate-400">Video mavjud emas</p>
                </div>
              )}
            </div>
          </div>

          {/* Homeworks Section */}
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText size={20} className="text-indigo-500" />
                Vazifalar
              </h3>
              {studentAnswer && studentAnswer.grade !== null && (
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  Ball: <span className="text-emerald-500 text-lg ml-1">{studentAnswer.grade}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              
              {/* Task Details Box */}
              <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100/50 dark:border-orange-500/10 transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/10">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Uyga vazifa</h4>
                  {primaryHomework?.deadline ? (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-md ${isDeadlinePassed ? 'bg-red-500 shadow-red-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
                      <Clock size={14} />
                      Muddat: {formatDate(primaryHomework.deadline, true)}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-slate-400">Muddat belgilanmagan</div>
                  )}
                </div>
                
                {primaryHomework ? (
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {primaryHomework.title}
                    {primaryHomework.file && (
                      <a href={getAPIUrl(primaryHomework.file)} target="_blank" rel="noreferrer" className="block mt-3 text-indigo-500 hover:underline">
                        Faylni yuklab olish / Ko'rish
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    Ushbu dars uchun uy vazifasi belgilanmagan.
                  </div>
                )}
              </div>

              {/* Submissions Box */}
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-4">Mening jo'natmalarim</h4>
                
                {studentAnswer ? (
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300">
                      {studentAnswer.file ? (
                        <a href={getAPIUrl(studentAnswer.file)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-500 font-medium hover:underline">
                          <Send size={16} />
                          Yuborilgan fayl/havola: {studentAnswer.title || "Fayl"}
                        </a>
                      ) : (
                        <span>{studentAnswer.title}</span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                      Yuborilgan vaqt: {formatDate(studentAnswer.createdAt, true)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {isDeadlinePassed ? (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <div>
                          <p className="font-bold">Muddat o'tib ketgan!</p>
                          <p className="text-xs">Vazifani yuborish imkoni yo'q, iltimos o'qituvchingiz bilan bog'laning.</p>
                        </div>
                      </div>
                    ) : (
                      primaryHomework ? (
                        <div className="space-y-3">
                          <p className="italic mb-2 opacity-80">Vazifani yuborish uchun havola yoki fayl (faqat .zip) kiriting:</p>
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={submitLink}
                              onChange={(e) => setSubmitLink(e.target.value)}
                              placeholder="https://..." 
                              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121621] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-800 dark:text-slate-200"
                            />
                            
                            <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-300">
                              <Paperclip size={18} />
                              <span className="hidden sm:inline text-sm font-medium">Zip yuklash</span>
                              <input 
                                type="file" 
                                accept=".zip"
                                className="hidden" 
                                onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                              />
                            </label>

                            <button 
                              onClick={handleSubmit}
                              disabled={submitting}
                              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                              Yuborish
                            </button>
                          </div>
                          
                          {submitFile && (
                            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold w-max">
                              <Paperclip size={14} />
                              <span>{submitFile.name}</span>
                              <button onClick={() => setSubmitFile(null)} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full transition-colors ml-1">
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="italic">Ushbu dars uchun uy vazifasi yo'q.</p>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Teacher's Review Box */}
              {studentAnswer && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-lg">O'qituvchi izohi</h4>
                    
                    {studentAnswer.status === 'ACCEPTED' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">Vazifa qabul qilindi</span>
                    )}
                    {studentAnswer.status === 'REJECTED' && (
                      <span className="text-red-600 dark:text-red-400 font-black text-sm">Vazifa qaytarildi</span>
                    )}
                    {studentAnswer.status === 'CHECKED' && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">Tekshirildi</span>
                    )}
                    {studentAnswer.status === 'PENDING' && (
                      <span className="text-amber-500 dark:text-amber-400 font-black text-sm">Kutilmoqda</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {/* Assuming status or grade dictates if there's a comment for now */}
                    {(studentAnswer.status !== 'PENDING') ? (
                      <p className="mb-4">.</p>
                    ) : (
                      <p className="mb-4 italic opacity-50">Hali tekshirilmadi...</p>
                    )}
                    
                    {studentAnswer.gradedBy && (
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>Tekshiruvchi: {studentAnswer.gradedBy.first_name} {studentAnswer.gradedBy.last_name}</span>
                        <span>{formatDate(studentAnswer.updatedAt, true)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right) - Lessons List */}
        <div className="w-full xl:w-80 shrink-0">
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg p-4 sticky top-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 px-2">Barcha darslar</h3>
            
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {groupLessons.map((l: any) => {
                const isActive = l.id === lesson.id;
                return (
                  <Link 
                    key={l.id} 
                    href={`/student-dashboard/lessons/${l.id}`}
                    className={`block p-4 rounded-2xl transition-all duration-200 border ${
                      isActive 
                        ? 'bg-white dark:bg-white/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`font-bold text-sm mb-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      {l.topic || "Noma'lum mavzu"}
                    </div>
                    <div className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <CalendarDays size={12} />
                      Dars sanasi: {l.date ? formatDate(l.date) : "-"}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
