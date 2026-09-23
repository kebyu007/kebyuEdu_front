"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, UploadCloud, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import api from "@/services/api";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreateExamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [minScore, setMinScore] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deadlineHours, setDeadlineHours] = useState("24");

  const handleSubmit = async () => {
    if (!topic || !maxScore || !minScore || !description) {
      alert("Iltimos barcha majburiy maydonlarni to'ldiring");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("topic", topic);
      formData.append("maxScore", maxScore);
      formData.append("minScore", minScore);
      formData.append("description", description);
      formData.append("deadline_hours", deadlineHours);
      formData.append("group_id", resolvedParams.id);
      if (file) {
        formData.append("file", file);
      }

      await api.post("/exams", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      router.push(`/dashboard/groups/${resolvedParams.id}`);
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi");
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Yangi imtihon yaratish</h1>
      </div>

      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        
        {/* Mavzu */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            <span className="text-red-500 mr-1">*</span>Imtihon mavzusi
          </label>
          <div className="relative">
            <input 
              type="text" 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)} 
              placeholder="Masalan: Modul 1 (Oraliq) yoki Yakuniy imtihon..."
              className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" 
            />
          </div>
        </div>

        {/* Baholash (Scores) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              <span className="text-red-500 mr-1">*</span>Maksimal bal
            </label>
            <input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} placeholder="Masalan: 100" className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              <span className="text-red-500 mr-1">*</span>O'tish bali
            </label>
            <input type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} placeholder="Masalan: 60" className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              <span className="text-red-500 mr-1">*</span>Muhlat (soat)
            </label>
            <div className="relative">
              <select value={deadlineHours} onChange={(e) => setDeadlineHours(e.target.value)} className="w-full appearance-none px-5 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <option value="24">24 soat</option>
                <option value="48">48 soat</option>
                <option value="72">72 soat</option>
              </select>
              <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Izoh (React Quill) */}
        <div className="mb-8">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
            <span className="text-red-500 mr-1">*</span>Imtihon shartlari va izoh
          </label>
          <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white/50 dark:bg-black/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all focus-within:ring-2 focus-within:ring-indigo-500/50">
            <ReactQuill 
              theme="snow"
              value={description}
              onChange={setDescription}
              placeholder="Imtihon shartlari haqida batafsil ma'lumot kiriting..."
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
            /* Base SVG and Picker colors for Light Mode */
            .premium-quill .ql-stroke {
              stroke: #475569 !important; /* slate-600 */
            }
            .premium-quill .ql-fill {
              fill: #475569 !important;
            }
            .premium-quill .ql-picker {
              color: #475569 !important;
            }

            /* Dark Mode SVG and Picker colors */
            .dark .premium-quill .ql-stroke {
              stroke: #cbd5e1 !important; /* slate-300 */
            }
            .dark .premium-quill .ql-fill {
              fill: #cbd5e1 !important;
            }
            .dark .premium-quill .ql-picker {
              color: #cbd5e1 !important;
            }
            
            /* Hover States (Both Modes) */
            .premium-quill .ql-toolbar button:hover .ql-stroke,
            .premium-quill .ql-toolbar button.ql-active .ql-stroke,
            .premium-quill .ql-toolbar .ql-picker-label:hover .ql-stroke,
            .premium-quill .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
              stroke: #6366f1 !important; /* indigo-500 */
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
            
            /* Fix for dropdown menus to match Premium UI (Both Modes) */
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
            
            /* Text-based pickers (Font, Header) */
            .premium-quill .ql-picker.ql-font .ql-picker-item,
            .premium-quill .ql-picker.ql-header .ql-picker-item {
              color: #475569 !important; /* slate-600 */
              padding: 8px 12px !important;
              border-radius: 0.5rem !important;
              transition: all 0.2s ease;
              font-family: inherit;
              font-size: 0.875rem !important;
              display: block !important;
            }
            .dark .premium-quill .ql-picker.ql-font .ql-picker-item,
            .dark .premium-quill .ql-picker.ql-header .ql-picker-item {
              color: #cbd5e1 !important; /* slate-300 */
            }
            .premium-quill .ql-picker.ql-font .ql-picker-item:hover,
            .premium-quill .ql-picker.ql-font .ql-picker-item.ql-selected,
            .premium-quill .ql-picker.ql-header .ql-picker-item:hover,
            .premium-quill .ql-picker.ql-header .ql-picker-item.ql-selected {
              color: white !important;
              background-color: #6366f1 !important;
            }
            
            /* Icon-based pickers (Align) */
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
            
            /* Add some spacing for the picker labels */
            .premium-quill .ql-picker-label {
              padding-left: 8px !important;
              padding-right: 8px !important;
            }
          `}</style>
        </div>

        {/* File Upload */}
        <div className="mb-10 relative">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
          />
          <div className="w-full border-2 border-dashed border-slate-200 dark:border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-indigo-50/50 dark:hover:bg-white/5 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all group relative z-0">
            <div className="w-12 h-12 mb-4 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-all">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
              {file ? file.name : "Imtihon faylini (masalan PDF) tanlang yoki shu yerga tashlang"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/10">
          <button 
            onClick={() => router.back()}
            className="px-8 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-sm font-bold transition-all shadow-sm"
          >
            Bekor qilish
          </button>
          <button 
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-[0_8px_16px_rgba(99,102,241,0.25)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Yaratilmoqda..." : "Imtihonni yaratish"}
          </button>
        </div>

      </div>
    </div>
  );
}
