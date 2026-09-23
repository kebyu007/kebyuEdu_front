"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, UploadCloud, ChevronDown, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import api from "@/services/api";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreateHomeworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [quillContent, setQuillContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingLessons, setIsLoadingLessons] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch lessons for the group
  useEffect(() => {
    const fetchLessons = async () => {
      setIsLoadingLessons(true);
      try {
        const res: any = await api.get(`/lessons?groupId=${resolvedParams.id}`);
        if (Array.isArray(res)) {
          setLessons(res);
          if (res.length > 0) {
            setSelectedLessonId(res[0].id.toString());
            setTitle(res[0].topic || "");
          }
        }
      } catch (err) {
        console.error("Darslarni olishda xato", err);
      } finally {
        setIsLoadingLessons(false);
      }
    };
    fetchLessons();
  }, [resolvedParams.id]);

  const handleLessonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedLessonId(val);
    const found = lessons.find(l => l.id.toString() === val);
    if (found) {
      setTitle(found.topic);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLessonId) {
      toast.error("Iltimos, mavzuni (darsni) tanlang!");
      return;
    }

    const finalTitle = title.trim() || "Uyga vazifa";

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("lesson_id", selectedLessonId);
      formData.append("title", finalTitle);
      
      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await api.post("/homeworks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Uyga vazifa muvaffaqiyatli e'lon qilindi!");
      router.push(`/dashboard/groups/${resolvedParams.id}`);
    } catch (error: any) {
      console.error("Vazifa yaratishda xato", error);
      toast.error(error.response?.data?.message || "Vazifani e'lon qilishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yangi uyga vazifa yaratish</h1>
      </div>

      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        
        {/* Mavzu */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            <span className="text-red-500 mr-1">*</span>Mavzu (Dars)
          </label>
          <div className="relative">
            {isLoadingLessons ? (
              <div className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-400 text-sm">
                Guruh darslari yuklanmoqda...
              </div>
            ) : lessons.length === 0 ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Vazifa sarlavhasini kiriting..."
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <p className="text-xs text-amber-500 font-medium">
                  Eslatma: Guruhda hali darslar topilmadi. Tizim avtomatik dars yaratishi mumkin.
                </p>
              </div>
            ) : (
              <div className="relative">
                <select 
                  value={selectedLessonId}
                  onChange={handleLessonChange}
                  className="w-full appearance-none px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                >
                  <option value="" disabled className="bg-white dark:bg-slate-800">Mavzulardan birini tanlang</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id} className="bg-white dark:bg-slate-800">
                      Dars #{l.id}: {l.topic}
                    </option>
                  ))}
                </select>
                <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Izoh (React Quill) */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            Izoh (ixtiyoriy)
          </label>
          <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all focus-within:ring-2 focus-within:ring-indigo-500/50">
            <ReactQuill 
              theme="snow"
              value={quillContent}
              onChange={setQuillContent}
              placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
              className="premium-quill"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }, { 'font': [] }],
                  ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'align': [] }],
                  ['link']
                ]
              }}
            />
          </div>
          <style jsx global>{`
            .premium-quill .ql-toolbar {
              border: none !important;
              border-bottom: 1px solid rgba(226, 232, 240, 1) !important;
              background: rgba(248, 250, 252, 0.5);
              padding: 12px !important;
              font-family: inherit;
            }
            .dark .premium-quill .ql-toolbar {
              border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
              background: rgba(255, 255, 255, 0.05);
            }
            .premium-quill .ql-container {
              border: none !important;
              font-family: inherit;
              font-size: 1rem;
              min-height: 200px;
            }
            .premium-quill .ql-editor {
              padding: 20px;
              color: inherit;
            }
            .premium-quill .ql-editor.ql-blank::before {
              color: #94a3b8;
              font-style: normal;
            }
            .premium-quill .ql-stroke {
              stroke: #475569 !important;
            }
            .premium-quill .ql-fill {
              fill: #475569 !important;
            }
            .premium-quill .ql-picker {
              color: #475569 !important;
            }
            .dark .premium-quill .ql-stroke {
              stroke: #cbd5e1 !important;
            }
            .dark .premium-quill .ql-fill {
              fill: #cbd5e1 !important;
            }
            .dark .premium-quill .ql-picker {
              color: #cbd5e1 !important;
            }
            .premium-quill .ql-toolbar button:hover .ql-stroke,
            .premium-quill .ql-toolbar button.ql-active .ql-stroke,
            .premium-quill .ql-toolbar .ql-picker-label:hover .ql-stroke,
            .premium-quill .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
              stroke: #6366f1 !important;
            }
            .premium-quill .ql-toolbar button:hover .ql-fill,
            .premium-quill .ql-toolbar button.ql-active .ql-fill,
            .premium-quill .ql-toolbar .ql-picker-label:hover .ql-fill,
            .premium-quill .ql-toolbar .ql-picker-label.ql-active .ql-fill {
              fill: #6366f1 !important;
            }
            .premium-quill .ql-toolbar .ql-picker-label:hover,
            .premium-quill .ql-toolbar .ql-picker-label.ql-active {
              color: #6366f1 !important;
            }
            .premium-quill .ql-picker-options {
              background-color: rgba(255, 255, 255, 0.9) !important;
              backdrop-filter: blur(12px) !important;
              border: 1px solid rgba(0, 0, 0, 0.05) !important;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
              border-radius: 0.75rem !important;
              padding: 8px !important;
              margin-top: 8px !important;
              overflow: hidden;
            }
            .dark .premium-quill .ql-picker-options {
              background-color: rgba(15, 23, 42, 0.8) !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3) !important;
            }
            .premium-quill .ql-picker.ql-font .ql-picker-item,
            .premium-quill .ql-picker.ql-header .ql-picker-item {
              color: #475569 !important;
              padding: 8px 12px !important;
              border-radius: 0.5rem !important;
              transition: all 0.2s ease;
              font-family: inherit;
              font-size: 0.875rem !important;
              display: block !important;
            }
            .dark .premium-quill .ql-picker.ql-font .ql-picker-item,
            .dark .premium-quill .ql-picker.ql-header .ql-picker-item {
              color: #cbd5e1 !important;
            }
            .premium-quill .ql-picker.ql-font .ql-picker-item:hover,
            .premium-quill .ql-picker.ql-font .ql-picker-item.ql-selected,
            .premium-quill .ql-picker.ql-header .ql-picker-item:hover,
            .premium-quill .ql-picker.ql-header .ql-picker-item.ql-selected {
              color: white !important;
              background-color: #6366f1 !important;
            }
            .premium-quill .ql-picker.ql-align .ql-picker-item {
              padding: 4px !important;
              border-radius: 0.25rem !important;
              margin-bottom: 2px;
            }
            .premium-quill .ql-picker.ql-align .ql-picker-item:hover,
            .premium-quill .ql-picker.ql-align .ql-picker-item.ql-selected {
              background-color: #6366f1 !important;
            }
            .premium-quill .ql-picker.ql-align .ql-picker-item:hover .ql-stroke,
            .premium-quill .ql-picker.ql-align .ql-picker-item.ql-selected .ql-stroke {
              stroke: white !important;
            }
            .premium-quill .ql-picker.ql-align .ql-picker-item:hover .ql-fill,
            .premium-quill .ql-picker.ql-align .ql-picker-item.ql-selected .ql-fill {
              fill: white !important;
            }
            .premium-quill .ql-picker-label {
              padding-left: 8px !important;
              padding-right: 8px !important;
            }
          `}</style>
        </div>

        {/* File Upload */}
        <div className="mb-10">
          <label className="relative w-full border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group block">
            <input 
              type="file" 
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all">
              <UploadCloud size={24} />
            </div>
            {selectedFile ? (
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
                Tanlangan fayl: {selectedFile.name}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                Faylni tanlash yoki shu yerga tashlang (ixtiyoriy)
              </p>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/10">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all shadow-sm"
          >
            Bekor qilish
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-[0_8px_16px_rgba(99,102,241,0.25)] transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting ? "E'lon qilinmoqda..." : "E'lon qilish"}
          </button>
        </div>

      </div>
    </div>
  );
}
