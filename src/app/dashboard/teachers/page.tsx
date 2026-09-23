"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, X, Search, Archive, ChevronLeft, ChevronRight, UploadCloud, UserCircle, RotateCcw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  photo: string | null;
  createdAt: string;
  status: string;
  address?: string;
  teacherGroups?: { group: { id: number; name: string } }[];
}

interface Group {
  id: number;
  name: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  // Search state with Debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  
  // Status filter state (active / inactive)
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");

  const [isLoading, setIsLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    phone: "+998",
    email: "",
    first_name: "",
    last_name: "",
    address: "",
    password: ""
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  // Debounce search input (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch groups for assignment
  const fetchGroups = async () => {
    try {
      const res: any = await api.get('/groups?status=active&limit=100');
      setAvailableGroups(res.data || []);
    } catch (error) {
      console.error("Guruhlarni olishda xato", error);
    }
  };

  // Fetch teachers with status filter, search and pagination
  const fetchTeachers = async () => {
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

      const res: any = await api.get(`/teachers?${queryParams.toString()}`);
      
      setTeachers(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("O'qituvchilarni olishda xato", error);
      setTeachers([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, limit, search, statusFilter]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleStatusFilterChange = (status: "active" | "inactive") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleGroupToggle = (grpId: number) => {
    if (selectedGroupIds.includes(grpId)) {
      setSelectedGroupIds(selectedGroupIds.filter(id => id !== grpId));
    } else {
      setSelectedGroupIds([...selectedGroupIds, grpId]);
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setFormData({ id: 0, phone: "+998", email: "", first_name: "", last_name: "", address: "", password: "" });
    setPhotoFile(null);
    setPhotoPreview(null);
    setSelectedGroupIds([]);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditMode(true);
    setFormData({
      id: teacher.id,
      phone: teacher.phone || "+998",
      email: teacher.email || "",
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      address: teacher.address || "",
      password: ""
    });
    
    if (teacher.photo) {
      setPhotoPreview(`${API_BASE_URL.replace('/api/v1', '')}/${teacher.photo}`);
    } else {
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    
    const groupIds = teacher.teacherGroups?.map(tg => tg.group.id) || [];
    setSelectedGroupIds(groupIds);
    
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    try {
      await api.delete(`/teachers/${teacherToDelete.id}`);
      toast.success("O'qituvchi arxivlandi!");
      setDeleteModalOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error("Arxivlashda xato", error);
    }
  };

  const handleRestoreTeacher = async (teacher: Teacher) => {
    try {
      await api.patch(`/teachers/${teacher.id}`, { status: "active" });
      toast.success("O'qituvchi faol holatga qaytarildi!");
      fetchTeachers();
    } catch (error) {
      console.error("O'qituvchini tiklashda xato", error);
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
    if (!formData.first_name || !formData.last_name || !formData.phone) {
      toast.error("Ism, familiya va telefon raqam kiritilishi shart!");
      return;
    }

    if (!editMode && !formData.password) {
      toast.error("Yangi o'qituvchi uchun parol kiritilishi shart!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append("first_name", formData.first_name);
      payload.append("last_name", formData.last_name);
      payload.append("phone", formData.phone);
      
      if (formData.email) {
        payload.append("email", formData.email);
      }
      if (formData.address) {
        payload.append("address", formData.address);
      }
      
      if (formData.password) payload.append("password", formData.password);

      if (photoFile) {
        payload.append("photo", photoFile);
      }

      let savedTeacherId = formData.id;

      if (editMode) {
        await api.patch(`/teachers/${formData.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success("O'qituvchi ma'lumotlari yangilandi!");
      } else {
        const res: any = await api.post("/teachers", payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        savedTeacherId = res.id;
        toast.success("O'qituvchi qo'shildi!");
      }

      if (!editMode && selectedGroupIds.length > 0) {
        for (const groupId of selectedGroupIds) {
          try {
            await api.post(`/groups/${groupId}/teachers`, { teacher_id: savedTeacherId });
          } catch (e) {
            console.error(`Guruhga biriktirishda xato (Group ID: ${groupId})`, e);
          }
        }
        toast.success("Guruhlarga biriktirildi!");
      }

      setIsDrawerOpen(false);
      fetchTeachers();
    } catch (error) {
      console.error("Saqlashda xato", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">O'qituvchilar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Tizimdagi barcha o'qituvchilar ro'yxati, filtrlash, qidiruv va arxiv boshqaruvi.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all transform hover:scale-[1.02] shadow-[0_8px_16px_rgba(99,102,241,0.25)] shrink-0"
        >
          <Plus size={18} />
          O'qituvchi qo'shish
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm">
        
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs (Active / Archive) */}
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
              Faollar
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
          
          {/* Search Input with Debounce */}
          <div className="relative max-w-xs w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ism, familiya yoki raqam..." 
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[350px]">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-full py-24 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Yuklanmoqda...</p>
            </div>
          ) : teachers.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full py-24 text-slate-500 dark:text-slate-400 gap-2">
              <Archive className="w-12 h-12 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p className="font-semibold text-base">O'qituvchilar topilmadi</p>
              <p className="text-xs text-slate-400">
                {statusFilter === "inactive" 
                  ? "Arxivda hozircha hech qanday o'qituvchi yo'q" 
                  : "Qidiruv yoki filtr bo'yicha hech qanday ma'lumot mos kelmadi"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/5 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 w-12">#</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 font-medium">O'qituvchi FIO</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 font-medium">Guruhlar</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 font-medium">Telefon</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 font-medium">Manzil</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 font-medium">Holati</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 font-medium text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, index) => (
                  <tr key={teacher.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors">
                    <td className="py-4 px-6 text-sm text-slate-400 font-mono">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {teacher.photo ? (
                          <img src={`${API_BASE_URL.replace('/api/v1', '')}/${teacher.photo}`} alt={teacher.first_name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold">
                            {teacher.first_name ? teacher.first_name.charAt(0).toUpperCase() : <UserCircle size={24} />}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {teacher.first_name} {teacher.last_name}
                          </div>
                          {teacher.email && (
                            <div className="text-xs text-slate-400">{teacher.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {teacher.teacherGroups && teacher.teacherGroups.length > 0 ? (
                          teacher.teacherGroups.map((tg) => (
                            <span key={tg.group.id} className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200/60 dark:border-white/5">
                              {tg.group.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">Guruhsiz</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">{teacher.phone}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-300">{teacher.address || '-'}</td>
                    <td className="py-4 px-6">
                      {statusFilter === "active" ? (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20">
                          Faol
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-200 dark:border-amber-500/20">
                          Arxivlangan
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                        {statusFilter === "active" ? (
                          <>
                            <button 
                              onClick={() => handleOpenEdit(teacher)}
                              title="Tahrirlash"
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-xl transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(teacher)}
                              title="Arxivlash"
                              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                            >
                              <Archive size={16} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleRestoreTeacher(teacher)}
                            title="Arxivdan qaytarish"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition-all"
                          >
                            <RotateCcw size={14} />
                            Qaytarish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!isLoading && total > 0 && (
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/10 gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jami <span className="font-bold text-slate-800 dark:text-white">{total}</span> ta o'qituvchidan{" "}
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
              {editMode ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {editMode ? "O'qituvchi ma'lumotlarini o'zgartiring." : "Yangi o'qituvchi profili va hisobini yaratish."}
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Form Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Ism <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                placeholder="Ali" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Familiya <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                placeholder="Valiyev" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Telefon raqam <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Email (ixtiyoriy)</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Elektron pochtani kiriting" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Guruhlar */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Guruhlarga biriktirish {!editMode && <span className="text-xs text-slate-400 font-normal ml-2">(faqat yaratishda)</span>}</label>
            <div className={`w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 flex items-center justify-center ${editMode ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <button 
                onClick={() => !editMode && setIsGroupModalOpen(true)}
                disabled={editMode}
                type="button"
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors disabled:hover:text-indigo-400"
              >
                <Plus size={16} />
                Guruhlarni tanlash
              </button>
            </div>
            {selectedGroupIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedGroupIds.map(grpId => {
                  const grpName = availableGroups.find(g => g.id === grpId)?.name || 'Noma\'lum guruh';
                  return (
                    <span key={grpId} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg flex items-center gap-2">
                      {grpName}
                      {!editMode && (
                        <button onClick={() => handleGroupToggle(grpId)} className="hover:text-indigo-900 dark:hover:text-indigo-100">
                          <X size={14} />
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Surati (ixtiyoriy)</label>
            <label className="w-full p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-slate-50/50 dark:bg-black/20 flex flex-col items-center justify-center gap-3 transition-colors hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer relative overflow-hidden">
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              
              {photoPreview ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md">
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

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Manzil (ixtiyoriy)</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Manzilni kiriting" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Parol {!editMode && <span className="text-red-500">*</span>}</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder={editMode ? "O'zgartirish uchun yangi parolni kiriting" : "Parolni kiriting"} 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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

      {/* Group Assignment Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 dark:bg-[#0B0F19]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          isGroupModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsGroupModalOpen(false)}
      >
        <div 
          className={`bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-out ${
            isGroupModalOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Guruhga biriktirish</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Bir yoki bir nechta guruhni tanlang</p>
            </div>
            <button 
              onClick={() => setIsGroupModalOpen(false)}
              className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
            {availableGroups.length > 0 ? availableGroups.map(grp => (
              <label key={grp.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedGroupIds.includes(grp.id)}
                  onChange={() => handleGroupToggle(grp.id)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20 dark:bg-black/20"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{grp.name}</span>
              </label>
            )) : (
              <p className="text-center text-slate-500 text-sm">Aktiv guruhlar topilmadi</p>
            )}
          </div>

          <div className="flex w-full gap-3">
            <button 
              onClick={() => setIsGroupModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              Tayyor
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
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
              O'qituvchini arxivlaysizmi?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-white">{teacherToDelete?.first_name} {teacherToDelete?.last_name}</span> arxivga o'tkaziladi. Keyinchalik uni Arxiv tabidan qayta tiklashingiz mumkin.
            </p>

            <div className="flex w-full gap-3">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Bekor qilish
              </button>
              <button 
                onClick={confirmDelete}
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
