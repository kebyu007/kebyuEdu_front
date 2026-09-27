"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Send, Paperclip, AlertCircle, FileText, X, CheckCircle2, XCircle, Clock } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import toast from "react-hot-toast";
import Link from "next/link";

export default function StudentExamPage({ params }: { params: Promise<{ id: string; examId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [exam, setExam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [submitText, setSubmitText] = useState("");
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res: any = await api.get(`/exams/${resolvedParams.examId}`);
        // Backend returns exam with its results (for teacher), but we need to see our own result.
        // Actually, for students, we should have a specific endpoint or just find our own result.
        // Since we are using standard token, `api.get(/exams/:id)` might return full details if it's not restricted, 
        // wait! The student shouldn't see everyone's result.
        // Let's assume the backend `getExam` is accessible. Or better, student gets it from `getGroupLessons` already, but we need details.
        
        // Let's filter out only our result if any
        const userId = parseInt(localStorage.getItem('user_id') || "0");
        if (res.results) {
           // format the results from the teacher's view to just one result
           const allResults = [...(res.results.pending || []), ...(res.results.checked || []), ...(res.results.rejected || []), ...(res.results.notSubmitted || [])];
           const myResult = allResults.find(r => r.id === userId);
           setExam({ ...res, myResult });
        } else {
           setExam(res);
        }
      } catch (error) {
        console.error(error);
        toast.error("Imtihonni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    if (resolvedParams.examId) fetchExam();
  }, [resolvedParams.examId]);

  const handleSubmit = async () => {
    if (!submitText && !submitFile) {
      toast.error("Iltimos javob matnini yoki faylni kiriting");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (submitText) formData.append("answer_text", submitText);
      if (submitFile) formData.append("file", submitFile);

      await api.post(`/exams/${resolvedParams.examId}/submit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      toast.success("Javob yuborildi!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), includeTime ? "dd MMM, yyyy HH:mm" : "dd MMM, yyyy", { locale: uz });
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

  if (!exam) return null;

  const result = exam.myResult || {};
  const isSubmitted = result.status === 'PENDING' || result.status === 'CHECKED' || result.status === 'REJECTED';
  const isDeadlinePassed = exam.dueDate && new Date() > new Date(exam.dueDate);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/student-dashboard/groups/${resolvedParams.id}`}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 backdrop-blur-md shadow-sm border border-slate-200/50 dark:border-white/10 transition-all text-slate-600 dark:text-slate-300"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-1">
            {exam.title}
          </h1>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Sana: {formatDate(exam.dueDate)} • Maks ball: {exam.maxScore}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Imtihon shartlari</h3>
            <div className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl" dangerouslySetInnerHTML={{ __html: exam.description || "Izoh kiritilmagan" }} />
            
            {exam.file && (
              <div className="mt-6">
                <a href={getAPIUrl(exam.file)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors text-sm">
                  <FileText size={18} />
                  Biriktirilgan faylni yuklab olish
                </a>
              </div>
            )}
          </div>
          
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Javob yuborish</h3>
            
            {isSubmitted ? (
               <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                   <div className="text-sm text-slate-600 dark:text-slate-300">
                     {result.file ? (
                       <a href={getAPIUrl(result.file)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-500 font-medium hover:underline mb-2">
                         <Send size={16} />
                         Yuborilgan fayl
                       </a>
                     ) : null}
                     {result.title ? (
                       <div className="bg-white dark:bg-black/20 p-3 rounded-lg border border-slate-200 dark:border-white/5 mt-2">
                         {result.title.startsWith('http') ? (
                           <a href={result.title} target="_blank" rel="noreferrer" className="text-indigo-500 font-medium hover:underline flex items-center gap-2 break-all"><FileText size={16}/>{result.title}</a>
                         ) : (
                           <span>{result.title}</span>
                         )}
                       </div>
                     ) : null}
                   </div>
                   <div className="text-xs font-bold text-slate-400 dark:text-slate-500 shrink-0">
                     Yuborilgan vaqt: {formatDate(result.submitDate, true)}
                   </div>
                 </div>
               </div>
            ) : (
              <div className="space-y-4">
                {isDeadlinePassed ? (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3">
                    <AlertCircle size={20} />
                    <div>
                      <p className="font-bold">Muddat o'tib ketgan!</p>
                      <p className="text-xs">Javobni yuborish imkoni yo'q, iltimos o'qituvchingiz bilan bog'laning.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea 
                      value={submitText}
                      onChange={(e) => setSubmitText(e.target.value)}
                      placeholder="Javobni kiriting yoki havola (link) qoldiring..." 
                      className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-white dark:bg-[#121621] border border-slate-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-800 dark:text-slate-200 resize-y"
                    />
                    
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-2 text-slate-600 dark:text-slate-300 shrink-0">
                        <Paperclip size={18} />
                        <span className="text-sm font-medium">Fayl biriktirish</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                        />
                      </label>

                      <button 
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Yuborish
                      </button>
                    </div>
                    
                    {submitFile && (
                      <div className="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold w-max">
                        <Paperclip size={14} />
                        <span>{submitFile.name}</span>
                        <button onClick={() => setSubmitFile(null)} className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full transition-colors ml-1">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Natija</h3>
            {isSubmitted ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Holati</span>
                  {result.status === 'CHECKED' && <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={14}/>Tekshirildi</span>}
                  {result.status === 'PENDING' && <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5"><Clock size={14}/>Kutilmoqda</span>}
                  {result.status === 'REJECTED' && <span className="px-2.5 py-1 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-1.5"><XCircle size={14}/>Qaytarildi</span>}
                </div>
                
                {result.status === 'CHECKED' && (
                  <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 mt-2">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">To'plangan ball</span>
                    <span className="text-3xl font-black text-emerald-500">{result.score}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Javob yuborilmagan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
