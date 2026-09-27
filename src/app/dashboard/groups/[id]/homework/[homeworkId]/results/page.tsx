"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X, CheckCircle2, XCircle, Loader2, Download, ExternalLink } from "lucide-react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function HomeworkResultsPage({ params }: { params: Promise<{ id: string; homeworkId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [homework, setHomework] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchResults = () => {
    api.get(`/homeworks/${resolvedParams.homeworkId}/results`)
      .then(setHomework)
      .catch(console.error);
  };

  useEffect(() => {
    fetchResults();
  }, [resolvedParams.homeworkId]);

  const getAPIUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseURL = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:3001`;
    return `${baseURL}/${path.replace(/\\/g, '/')}`;
  };

  const handleGrade = async (status: 'CHECKED' | 'REJECTED') => {
    if (!selectedSubmission) return;
    
    if (gradeInput && parseInt(gradeInput) > 100) {
      toast.error("Baho 100 dan oshmasligi kerak!");
      return;
    }

    try {
      setSubmitting(true);
      await api.patch(`/homeworks/answers/${selectedSubmission.answerId}/grade`, {
        status,
        grade: gradeInput ? parseInt(gradeInput) : undefined
      });
      toast.success(status === 'CHECKED' ? "Vazifa qabul qilindi!" : "Vazifa qaytarildi!");
      setSelectedSubmission(null);
      setGradeInput('');
      fetchResults(); // Refresh table
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Baholashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'pending', label: 'Kutayotganlar', count: homework?.stats?.pending || 0, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'rejected', label: 'Qaytarilganlar', count: homework?.stats?.rejected || 0, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'checked', label: 'Qabul qilinganlar', count: homework?.stats?.checked || 0, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'notSubmitted', label: 'Bajarilmagan', count: homework?.stats?.notSubmitted || 0, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{homework?.title || "Yuklanmoqda..."}</h1>
      </div>

      {/* Info Card */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 mb-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-wrap gap-16">
        <div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-2">Mavzu</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{homework?.title || "-"}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-2">Tugash vaqti</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{homework?.dueDate ? formatDateTime(homework.dueDate) : "-"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 md:gap-8 border-b border-slate-200 dark:border-white/10 mb-6">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-4 px-2 text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${tab.bg} ${tab.color}`}>
                {tab.count}
              </span>
            </div>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" 
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Table Area */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
              <th className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400">O'quvchi ismi</th>
              {activeTab !== 'notSubmitted' && (
                <th className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400 text-right">Uyga vazifa jo'natilgan vaqt</th>
              )}
            </tr>
          </thead>
          <tbody>
            {!homework ? (
              <tr>
                <td colSpan={2} className="px-8 py-20 text-center text-slate-500">Yuklanmoqda...</td>
              </tr>
            ) : homework.results[activeTab]?.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-8 py-20 text-center">
                  <p className="text-slate-400 dark:text-slate-500 font-medium">Ma'lumot mavjud emas</p>
                </td>
              </tr>
            ) : (
              homework.results[activeTab]?.map((student: any) => (
                <tr key={student.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {
                  if (activeTab !== 'notSubmitted' && student.answerId) {
                    setSelectedSubmission(student);
                    setGradeInput(student.grade ? String(student.grade) : '');
                  }
                }}>
                  <td className="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">{student.name}</td>
                  {activeTab !== 'notSubmitted' && (
                    <td className="px-8 py-5 text-sm font-medium text-slate-600 dark:text-slate-400 text-right">
                      {student.submitDate ? new Date(student.submitDate).toLocaleString('uz-UZ') : '-'}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121621] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedSubmission.name}</h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Yuborilgan vaqt: {new Date(selectedSubmission.submitDate).toLocaleString('uz-UZ')}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">Vazifa mazmuni:</h4>
                <div className="space-y-3">
                  {selectedSubmission.title && (
                    <div className="flex items-start gap-2">
                      {selectedSubmission.title.startsWith('http') ? (
                        <a href={selectedSubmission.title} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline break-all">
                          <ExternalLink size={16} className="shrink-0" />
                          {selectedSubmission.title}
                        </a>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedSubmission.title}</span>
                      )}
                    </div>
                  )}
                  {selectedSubmission.file && (
                    <a href={getAPIUrl(selectedSubmission.file)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors text-sm">
                      <Download size={16} />
                      Yuklab olish
                    </a>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Baho (ixtiyoriy)</label>
                  <div className="flex items-center px-3 py-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200/50 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      value={gradeInput}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        let val = parseInt(e.target.value);
                        if (val > 100) val = 100;
                        if (val < 0) val = 0;
                        setGradeInput(isNaN(val) ? '' : String(val));
                      }}
                      className="w-9 bg-transparent outline-none text-right font-black text-indigo-600 dark:text-indigo-400 placeholder-indigo-300 dark:placeholder-indigo-800 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0"
                    />
                    <span className="text-slate-400 dark:text-slate-500 font-bold ml-1 text-sm">/ 100</span>
                  </div>
                </div>
                
                {/* Custom Slider */}
                <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-visible flex items-center">
                  {/* Filled Track */}
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${gradeInput || 0}%` }}
                  />
                  {/* Native Range Input (Invisible but interactive) */}
                  <input 
                    type="range" 
                    min="0"
                    max="100"
                    step="1"
                    value={gradeInput || 0}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Custom Thumb indicator */}
                  <div 
                    className="absolute w-5 h-5 bg-white border-[3px] border-indigo-500 rounded-full shadow-lg transform -translate-x-1/2 pointer-events-none transition-transform"
                    style={{ left: `${gradeInput || 0}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-black text-slate-400 dark:text-slate-600 mt-3 px-1 uppercase tracking-wider">
                  <span>Nol</span>
                  <span>O'rtacha</span>
                  <span>A'lo</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
              <button 
                disabled={submitting}
                onClick={() => handleGrade('REJECTED')}
                className="px-5 py-2.5 rounded-xl bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-200 dark:hover:bg-red-500/20 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                Qaytarish
              </button>
              <button 
                disabled={submitting}
                onClick={() => handleGrade('CHECKED')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Qabul qilish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
