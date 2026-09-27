"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, X, Search, Archive, ChevronLeft, ChevronRight, UploadCloud, RotateCcw, CheckCircle2, BookOpen, Clock, Calendar, Coins, Layers } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

const API_BASE_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:3001/api/v1` : "http://localhost:3001/api/v1";

interface Course {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_hours: number;
  duration_month: number;
  photo: string | null;
  status: string;
  createdAt: string;
  _count?: {
    groups: number;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(9); // 3x3 grid
  
  // Search state with Debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  
  // Status filter state (active / inactive)
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");

  const [isLoading, setIsLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    duration_hours: 120,
    duration_month: 6,
    price: 2000000,
    description: ""
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Debounce search input (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch courses with status filter, search and pagination
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
      });

      if (search.trim()) {
        queryParams.append("search", search.trim());
      }

      const res: any = await api.get(`/courses?${queryParams.toString()}`);
      
      setCourses(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Kurslarni olishda xato", error);
      setCourses([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, limit, search, statusFilter]);

  const handleStatusFilterChange = (status: "active" | "inactive") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setEditingCourseId(null);
    setFormData({
      name: "",
      duration_hours: 120,
      duration_month: 6,
      price: 2000000,
      description: ""
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setEditMode(true);
    setEditingCourseId(course.id);
    setFormData({
      name: course.name,
      duration_hours: course.duration_hours || 120,
      duration_month: course.duration_month || 6,
      price: Number(course.price) || 2000000,
      description: course.description || ""
    });
    
    if (course.photo) {
      setPhotoPreview(`${API_BASE_URL.replace('/api/v1', '')}/${course.photo}`);
    } else {
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete.id}`);
      toast.success("Kurs arxivlandi!");
      setDeleteModalOpen(false);
      fetchCourses();
    } catch (error) {
      console.error("Arxivlashda xato", error);
    }
  };

  const handleRestoreCourse = async (course: Course) => {
    try {
      await api.patch(`/courses/${course.id}`, { status: "active" });
      toast.success("Kurs faol holatga qaytarildi!");
      fetchCourses();
    } catch (error) {
      console.error("Kursni tiklashda xato", error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Kurs nomi kiritilishi shart!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("price", formData.price.toString());
      payload.append("duration_hours", formData.duration_hours.toString());
      payload.append("duration_month", formData.duration_month.toString());
      
      if (formData.description) {
        payload.append("description", formData.description.trim());
      }

      if (photoFile) {
        payload.append("photo", photoFile);
      }

      if (editMode && editingCourseId) {
        await api.patch(`/courses/${editingCourseId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Kurs ma'lumotlari yangilandi!");
      } else {
        await api.post("/courses", payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("Yangi kurs qo'shildi!");
      }

      setIsDrawerOpen(false);
      fetchCourses();
    } catch (error) {
      console.error("Saqlashda xato", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Main Container */}

      {/* Main Container */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-sm">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5">
            <button 
              onClick={() => handleStatusFilterChange("active")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === "active"
                  ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CheckCircle2 size={16} />
              Faol Kurslar
            </button>
            <button 
              onClick={() => handleStatusFilterChange("inactive")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                statusFilter === "inactive"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Archive size={16} />
              Arxiv
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative max-w-xs w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Kurs nomi bo'yicha..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button 
              onClick={handleOpenAdd}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all transform hover:scale-[1.02] shadow-[0_8px_16px_rgba(99,102,241,0.25)] shrink-0"
            >
              <Plus size={18} />
              Kurs qo'shish
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Kurslar yuklanmoqda...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24 text-slate-500 dark:text-slate-400 gap-2">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <p className="font-semibold text-base">Kurslar topilmadi</p>
            <p className="text-xs text-slate-400">
              {statusFilter === "inactive" ? "Arxivda hozircha hech qanday kurs yo'q" : "So'rov bo'yicha hech qanday kurs mos kelmadi"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const bgGradients = [
                "bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-indigo-950/30 dark:to-slate-900/40 border-indigo-200/50 dark:border-indigo-500/10",
                "bg-gradient-to-br from-purple-50/80 to-pink-50/50 dark:from-purple-950/30 dark:to-slate-900/40 border-purple-200/50 dark:border-purple-500/10",
                "bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/30 dark:to-slate-900/40 border-emerald-200/50 dark:border-emerald-500/10"
              ];
              const cardBg = bgGradients[idx % bgGradients.length];

              return (
                <div key={course.id} className={`${cardBg} rounded-2xl p-6 border shadow-sm transition-transform hover:scale-[1.02] duration-300 flex flex-col justify-between`}>
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-3">
                        {course.photo ? (
                          <img src={`${API_BASE_URL.replace('/api/v1', '')}/${course.photo}`} alt={course.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-white/10 shadow-sm" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-white/5 font-bold">
                            <BookOpen size={22} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{course.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {course.description || "Tavsif berilmagan"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {statusFilter === "active" ? (
                          <>
                            <button 
                              onClick={() => handleOpenEdit(course)}
                              title="Tahrirlash"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(course)}
                              title="Arxivlash"
                              className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/60 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Archive size={16} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleRestoreCourse(course)}
                            title="Arxivdan qaytarish"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                          >
                            <RotateCcw size={14} />
                            Tiklash
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200/40 dark:border-white/5 mt-4 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5">
                      <Clock size={12} className="text-indigo-500" />
                      {course.duration_hours || 120} soat
                    </span>
                    <span className="flex items-center gap-1 bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5">
                      <Calendar size={12} className="text-purple-500" />
                      {course.duration_month || 6} oy
                    </span>
                    <span className="flex items-center gap-1 bg-white/80 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5">
                      <Coins size={12} className="text-amber-500" />
                      {Number(course.price || 0).toLocaleString()} so'm
                    </span>
                    {course._count?.groups !== undefined && (
                      <span className="flex items-center gap-1 bg-white/80 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5 ml-auto">
                        <Layers size={12} />
                        {course._count.groups} guruh
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && total > 0 && (
          <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/10 gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jami <span className="font-bold text-slate-800 dark:text-white">{total}</span> ta kursdan{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {(page - 1) * limit + 1}-{Math.min(page * limit, total)}
              </span> ko'rsatilmoqda
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button 
                      key={i} 
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                        page === i + 1 
                          ? "bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)]" 
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 dark:bg-[#0B0F19]/60 backdrop-blur-[2px] z-[60] transition-all duration-500 ease-in-out ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white/90 dark:bg-[#0f1523]/95 backdrop-blur-3xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col sm:rounded-l-[2rem] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-start justify-between p-8 pb-6 border-b border-slate-200/60 dark:border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editMode ? "Kursni tahrirlash" : "Kurs qo'shish"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {editMode ? "Kurs ma'lumotlarini o'zgartiring." : "Yangi kurs ma'lumotlarini kiriting."}
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {/* Nomi */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Kurs nomi <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Masalan: Full-Stack Bootcamp" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dars soatlari */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Dars soati</label>
              <input 
                type="number" 
                min={1}
                value={formData.duration_hours}
                onChange={(e) => setFormData({...formData, duration_hours: Number(e.target.value)})}
                placeholder="120" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            {/* Kurs davomiyligi oylarda */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Davomiyligi (oy)</label>
              <input 
                type="number" 
                min={1}
                value={formData.duration_month}
                onChange={(e) => setFormData({...formData, duration_month: Number(e.target.value)})}
                placeholder="6" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Narx */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Kurs narxi (so'mda) <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              min={0}
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              placeholder="2000000" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Muqova rasmi (ixtiyoriy)</label>
            <label className="w-full p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-black/20 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer relative overflow-hidden">
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-md">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-white font-semibold text-xs">O'zgartirish</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center shadow-sm">
                    <UploadCloud className="text-indigo-500" size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Rasm yuklash uchun bosing</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">JPG yoki PNG (max. 5MB)</p>
                  </div>
                </>
              )}
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Tavsif (Description)</label>
            <textarea 
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Kurs haqida qisqacha ma'lumot..." 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            />
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white/80 dark:bg-transparent backdrop-blur-xl flex items-center justify-end gap-3 rounded-bl-[2rem]">
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Bekor qilish
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_8px_16px_rgba(99,102,241,0.3)] transition-all transform hover:scale-[1.02] disabled:opacity-70"
          >
            {isSaving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>

      {/* Delete / Archive Confirmation Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 dark:bg-[#0B0F19]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          deleteModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDeleteModalOpen(false)}
      >
        <div 
          className={`bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform transition-all duration-300 ease-out ${
            deleteModalOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="relative w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
                <Archive size={32} className="text-amber-500" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Kursni arxivlaysizmi?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-white">{courseToDelete?.name}</span> kursini arxivga o'tkazmoqchimisiz? Keyinchalik uni Arxiv tabidan qayta tiklashingiz mumkin.
            </p>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmArchive}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-[0_8px_16px_rgba(245,158,11,0.3)] transition-all transform hover:scale-[1.02]"
              >
                Ha, Arxivlash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
