"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreVertical, Users, GraduationCap, RefreshCw, X, Trash2, Edit2, AlertTriangle, Eye, ChevronDown, Search, Archive, RotateCcw, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";

function GlassSelect({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: {value: string, label: string}[], placeholder: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white flex items-center justify-between cursor-pointer transition-all hover:bg-white/80 dark:hover:bg-white/10 shadow-sm"
      >
        <span className="text-sm font-medium">{selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 py-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0f1523]/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] max-h-60 overflow-y-auto no-scrollbar"
          >
            <div 
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
            >
              {placeholder}
            </div>
            {options.map(opt => (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  value === opt.value 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
                }`}
              >
                {opt.label}
                {value === opt.value && <CheckCircle2 size={16} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const WEEKDAY_NAMES: { [key: number]: string } = {
  1: "Du",
  2: "Se",
  3: "Chor",
  4: "Pay",
  5: "Ju",
  6: "Sha",
  7: "Yak"
};

const WEEKDAY_FULL: { id: number; name: string }[] = [
  { id: 1, name: "Dushanba" },
  { id: 2, name: "Seshanba" },
  { id: 3, name: "Chorshanba" },
  { id: 4, name: "Payshanba" },
  { id: 5, name: "Juma" },
  { id: 6, name: "Shanba" },
  { id: 7, name: "Yakshanba" }
];

export default function GroupsPage() {
  const router = useRouter();
  
  // Tab & Status filter: "active" | "inactive"
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState("Foydalanuvchi");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("user_role") || "Foydalanuvchi");
    }
  }, []);

  const isTeacher = userRole === "TEACHER" || userRole === "O'qituvchi";

  // Selector data
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);

  // Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    course_id: "",
    room_id: "",
    start_time: "09:30",
    start_date: new Date().toISOString().split("T")[0],
    max_student: 15,
    description: ""
  });

  const [selectedDays, setSelectedDays] = useState<number[]>([1, 3, 5]);

  // Debounce search input (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch selectors (courses, rooms, teachers, students)
  // Fetch selectors (courses, rooms, teachers, students)
  const fetchSelectors = async () => {
    try {
      const [coursesRes, roomsRes, teachersRes, studentsRes]: [any, any, any, any] = await Promise.all([
        api.get("/courses?limit=100"),
        api.get("/rooms?limit=100"),
        api.get("/teachers?status=active&limit=100"),
        api.get("/users?role=STUDENT&limit=100")
      ]);
      setAvailableCourses(coursesRes.data || []);
      setAvailableRooms(roomsRes.data || []);
      setAvailableTeachers(teachersRes.data || []);
      setAvailableStudents(studentsRes.data || []);
    } catch (error) {
      console.error("Katalog ma'lumotlarini olishda xato", error);
    }
  };

  // Fetch groups with filters & pagination
  const fetchGroups = async () => {
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

      const res: any = await api.get(`/groups?${queryParams.toString()}`);
      setGroups(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Guruhlarni olishda xato", error);
      setGroups([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
    
    // Faqat o'qituvchi bo'lmagan foydalanuvchilar (admin/superadmin) uchun qo'shimcha ma'lumotlarni yuklash
    const role = localStorage.getItem("user_role");
    if (role !== "TEACHER" && role !== "O'qituvchi") {
      fetchSelectors();
    }
  }, [page, limit, search, statusFilter]);


  const handleStatusFilterChange = (status: "active" | "inactive") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setEditingGroupId(null);
    setFormData({
      name: "",
      course_id: availableCourses[0]?.id?.toString() || "",
      room_id: availableRooms[0]?.id?.toString() || "",
      start_time: "09:30",
      start_date: new Date().toISOString().split("T")[0],
      max_student: 15,
      description: ""
    });
    setSelectedDays([1, 3, 5]);
    setSelectedTeacherIds([]);
    setSelectedStudentIds([]);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (group: any) => {
    setEditMode(true);
    setEditingGroupId(group.id);
    setFormData({
      name: group.name,
      course_id: group.course_id ? group.course_id.toString() : (group.course?.id?.toString() || ""),
      room_id: group.room_id ? group.room_id.toString() : (group.room?.id?.toString() || ""),
      start_time: group.start_time || "09:30",
      start_date: group.start_date ? new Date(group.start_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      max_student: group.max_student || 15,
      description: group.description || ""
    });
    setSelectedDays(group.weekday || [1, 3, 5]);
    
    const teacherIds = group.groupTeachers?.map((gt: any) => gt.teacher?.id || gt.teacher_id).filter(Boolean) || [];
    setSelectedTeacherIds(teacherIds);

    const studentIds = group.studentGroups?.map((sg: any) => sg.student?.id || sg.student_id).filter(Boolean) || [];
    setSelectedStudentIds(studentIds);
    
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (group: any) => {
    setGroupToDelete(group);
    setDeleteModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!groupToDelete) return;
    try {
      await api.delete(`/groups/${groupToDelete.id}`);
      toast.success("Guruh arxivlandi!");
      setDeleteModalOpen(false);
      fetchGroups();
    } catch (error) {
      console.error("Guruhni arxivlashda xato", error);
    }
  };

  const handleRestoreGroup = async (group: any) => {
    try {
      await api.patch(`/groups/${group.id}`, { status: "active" });
      toast.success("Guruh faol holatga qaytarildi!");
      fetchGroups();
    } catch (error) {
      console.error("Guruhni tiklashda xato", error);
    }
  };

  const handleDayToggle = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleTeacherToggle = (teacherId: number) => {
    if (selectedTeacherIds.includes(teacherId)) {
      setSelectedTeacherIds(selectedTeacherIds.filter(id => id !== teacherId));
    } else {
      setSelectedTeacherIds([...selectedTeacherIds, teacherId]);
    }
  };

  const handleStudentToggle = (studentId: number) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(selectedStudentIds.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds([...selectedStudentIds, studentId]);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Guruh nomi kiritilishi shart!");
      return;
    }
    if (!formData.course_id) {
      toast.error("Kurs tanlanishi shart!");
      return;
    }
    if (!formData.room_id) {
      toast.error("Xona tanlanishi shart!");
      return;
    }
    if (selectedDays.length === 0) {
      toast.error("Kamida bitta dars kuni tanlanishi kerak!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        course_id: Number(formData.course_id),
        room_id: Number(formData.room_id),
        start_time: formData.start_time,
        start_date: formData.start_date,
        max_student: Number(formData.max_student) || 15,
        weekday: selectedDays,
        description: formData.description.trim() || undefined
      };

      let savedGroupId = editingGroupId;

      if (editMode && editingGroupId) {
        await api.patch(`/groups/${editingGroupId}`, payload);
        toast.success("Guruh ma'lumotlari yangilandi!");
      } else {
        const res: any = await api.post("/groups", payload);
        savedGroupId = res.id;
        toast.success("Yangi guruh qo'shildi!");
      }

      // Assign selected teachers if any
      if (savedGroupId && selectedTeacherIds.length > 0) {
        for (const tId of selectedTeacherIds) {
          try {
            await api.post(`/groups/${savedGroupId}/teachers`, { teacher_id: tId });
          } catch (e) {
            console.error("O'qituvchini biriktirishda xato", e);
          }
        }
      }

      // Assign selected students if any
      if (savedGroupId && selectedStudentIds.length > 0) {
        for (const sId of selectedStudentIds) {
          try {
            await api.post(`/groups/${savedGroupId}/students`, { student_id: sId });
          } catch (e) {
            console.error("Talabani biriktirishda xato", e);
          }
        }
      }

      setIsDrawerOpen(false);
      fetchGroups();
    } catch (error: any) {
      console.error("Guruhni saqlashda xato", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to format days: [1, 3, 5] -> "Du, Chor, Ju"
  const formatDays = (weekdays: number[]) => {
    if (!weekdays || weekdays.length === 0) return "-";
    return weekdays.map(d => WEEKDAY_NAMES[d] || d).join(", ");
  };

  // Helper to format teachers string
  const formatTeachers = (grp: any) => {
    if (!grp.groupTeachers || grp.groupTeachers.length === 0) return "Biriktirilmagan";
    return grp.groupTeachers.map((gt: any) => `${gt.teacher.first_name} ${gt.teacher.last_name}`).join(", ");
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Guruhlar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Tizimdagi guruhlar ro'yxati, dars jadvallari, kurs va xonalarga bog'liqliklar hamda arxiv boshqaruvi.
          </p>
        </div>
        {!isTeacher && (
          <button 
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all transform hover:scale-[1.02] shadow-[0_8px_16px_rgba(99,102,241,0.25)] shrink-0"
          >
            <Plus size={18} />
            Guruh qo'shish
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 gap-6 mb-8 ${!isTeacher ? 'md:grid-cols-3' : ''}`}>
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <Users size={20} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
            {isTeacher 
              ? (statusFilter === "active" ? "Sizning faol guruhlaringiz" : "Sizning arxivlangan guruhlaringiz") 
              : (statusFilter === "active" ? "Faol guruhlar" : "Arxivlangan guruhlar")}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{total}</h3>
        </div>

        {!isTeacher && (
          <>
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">O'qituvchilar</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{availableTeachers.length}</h3>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">O'quvchilar</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{availableStudents.length}</h3>
            </div>
          </>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm">
        
        {/* Table Controls (Tabs & Search) */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              Guruhlar (Faol)
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

          <div className="relative max-w-xs w-full">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Guruh nomi bo'yicha qidiruv..." 
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
          ) : groups.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-full py-24 text-slate-500 dark:text-slate-400 gap-2">
              <Archive className="w-12 h-12 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
              <p className="font-semibold text-base">Guruhlar topilmadi</p>
              <p className="text-xs text-slate-400">
                {statusFilter === "inactive" ? "Arxivda hozircha guruhlar yo'q" : "So'rov bo'yicha hech qanday guruh mos kelmadi"}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-white/5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 w-28">Status</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10">Guruh nomi</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10">Kurs</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 text-center">Davomiyligi</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 text-center">Dars vaqti</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10">Xona</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10">O'qituvchi</th>
                  <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 text-center">Talabalar</th>
                  {!isTeacher && (
                    <th className="py-4 px-6 border-b border-slate-200 dark:border-white/10 text-right w-24">Amallar</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {groups.map((grp) => (
                  <tr 
                    key={grp.id} 
                    onClick={() => router.push(`/dashboard/groups/${grp.id}`)}
                    className="group hover:bg-slate-50/50 dark:hover:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                      {grp.status === "active" ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md">
                          FAOL
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-md">
                          ARXIV
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{grp.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-xl">
                        {grp.course?.name || "Noma'lum kurs"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                      {grp.course?.duration_month ? `${grp.course.duration_month} oy` : "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{grp.start_time || "-"}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatDays(grp.weekday)}</p>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {grp.room?.name || "-"}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900 dark:text-white">
                      {formatTeachers(grp)}
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-900 dark:text-white text-center">
                      {grp._count?.studentGroups || 0} / {grp.max_student || 15}
                    </td>
                    {!isTeacher && (
                      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          {statusFilter === "active" ? (
                            <>
                              <button 
                                onClick={() => router.push(`/dashboard/groups/${grp.id}`)}
                                title="Ko'rish"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-all"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => handleOpenEdit(grp)}
                                title="Tahrirlash"
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-all"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(grp)}
                                title="Arxivlash"
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all"
                              >
                                <Archive size={16} />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => handleRestoreGroup(grp)}
                              title="Arxivdan qaytarish"
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30 transition-all"
                            >
                              <RotateCcw size={14} />
                              Qaytarish
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
              Jami <span className="font-bold text-slate-800 dark:text-white">{total}</span> ta guruhdan{" "}
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
                  Oldingi
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
                  Keyingi
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
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white/90 dark:bg-[#0f1523]/95 backdrop-blur-3xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col sm:rounded-l-[2rem] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between p-8 pb-6 border-b border-slate-200/60 dark:border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editMode ? "Guruhni tahrirlash" : "Guruh qo'shish"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {editMode ? "Guruh parametrlarini o'zgartiring." : "Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting."}
            </p>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {/* Guruh nomi */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Guruh nomi <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Masalan: Frontend n27" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Kurs */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Kurs <span className="text-red-500">*</span>
            </label>
            <GlassSelect 
              value={formData.course_id}
              onChange={(val) => setFormData({...formData, course_id: val})}
              placeholder="Tanlang..."
              options={availableCourses.map(c => ({
                value: c.id,
                label: `${c.name} ${c.duration_month ? `(${c.duration_month} oy)` : ''}`
              }))}
            />
          </div>

          {/* Xona */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Xona <span className="text-red-500">*</span>
            </label>
            <GlassSelect 
              value={formData.room_id}
              onChange={(val) => setFormData({...formData, room_id: val})}
              placeholder="Tanlang..."
              options={availableRooms.map(r => ({
                value: r.id,
                label: `${r.name} (Sig'im: ${r.capacity || 20})`
              }))}
            />
          </div>

          {/* Dars kunlari */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Dars kunlari <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {WEEKDAY_FULL.map(day => (
                <label key={day.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:border-indigo-300 transition-all cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedDays.includes(day.id)}
                    onChange={() => handleDayToggle(day.id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20 dark:bg-black/20"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{day.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dars vaqti */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
                Dars vaqti <span className="text-red-500">*</span>
              </label>
              <input 
                type="time" 
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>

            {/* Maksimal talabalar */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
                Maks. talabalar
              </label>
              <input 
                type="number" 
                min={1}
                value={formData.max_student}
                onChange={(e) => setFormData({...formData, max_student: Number(e.target.value)})}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
          </div>

          {/* Boshlanish sanasi */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Boshlanish sanasi <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              value={formData.start_date}
              onChange={(e) => setFormData({...formData, start_date: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>

          {/* O'qituvchilar */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">O'qituvchilar biriktirish</label>
            <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 flex items-center justify-center">
              <button 
                onClick={() => setIsTeacherModalOpen(true)}
                type="button"
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                <Plus size={16} />
                O'qituvchilarni tanlash
              </button>
            </div>
            {selectedTeacherIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTeacherIds.map(tId => {
                  const tObj = availableTeachers.find(t => t.id === tId);
                  const tName = tObj ? `${tObj.first_name} ${tObj.last_name}` : `O'qituvchi #${tId}`;
                  return (
                    <span key={tId} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg flex items-center gap-2 border border-indigo-100 dark:border-indigo-500/30">
                      {tName}
                      <button type="button" onClick={() => handleTeacherToggle(tId)} className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors">
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Talabalar */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Talabalarni biriktirish</label>
            <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 flex items-center justify-center">
              <button 
                onClick={() => setIsStudentModalOpen(true)}
                type="button"
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                <Plus size={16} />
                Talabalarni tanlash
              </button>
            </div>
            {selectedStudentIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedStudentIds.map(sId => {
                  const sObj = availableStudents.find(s => s.id === sId);
                  const sName = sObj ? `${sObj.first_name} ${sObj.last_name}` : `Talaba #${sId}`;
                  return (
                    <span key={sId} className="px-3 py-1 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-lg flex items-center gap-2 border border-purple-100 dark:border-purple-500/30">
                      {sName}
                      <button type="button" onClick={() => handleStudentToggle(sId)} className="hover:text-purple-900 dark:hover:text-purple-100 transition-colors">
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tavsif */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">Tavsif (ixtiyoriy)</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Guruh haqida qo'shimcha izoh..." 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
            />
          </div>
        </div>

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

      {/* Delete / Archive Confirmation Modal */}
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
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Guruhni arxivlaysizmi?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-white">{groupToDelete?.name}</span> guruhi arxivga o'tkaziladi. Keyinchalik Arxiv tabidan qayta tiklashingiz mumkin.
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

      {/* Teacher Assignment Modal */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 dark:bg-[#0B0F19]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          isTeacherModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsTeacherModalOpen(false)}
      >
        <div 
          className={`bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-out ${
            isTeacherModalOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">O'qituvchi biriktirish</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Guruh uchun o'qituvchilarni tanlang</p>
            </div>
            <button 
              onClick={() => setIsTeacherModalOpen(false)}
              className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
            {availableTeachers.length > 0 ? availableTeachers.map(t => (
              <label key={t.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5 transition-all cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedTeacherIds.includes(t.id)}
                  onChange={() => handleTeacherToggle(t.id)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-white/20 dark:bg-black/20"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{t.first_name} {t.last_name}</span>
              </label>
            )) : (
              <p className="text-center text-slate-500 text-sm">Aktiv o'qituvchilar topilmadi</p>
            )}
          </div>

          <div className="flex w-full gap-3">
            <button 
              onClick={() => setIsTeacherModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              Tayyor
            </button>
          </div>
        </div>
      </div>

      {/* Student Assignment Modal */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 dark:bg-[#0B0F19]/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          isStudentModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsStudentModalOpen(false)}
      >
        <div 
          className={`bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all duration-300 ease-out ${
            isStudentModalOpen ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Talaba biriktirish</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Guruh uchun talabalarni tanlang</p>
            </div>
            <button 
              onClick={() => setIsStudentModalOpen(false)}
              className="p-2 -mr-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
            {availableStudents.length > 0 ? availableStudents.map(s => (
              <label key={s.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-purple-200 dark:hover:border-purple-500/30 hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-all cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedStudentIds.includes(s.id)}
                  onChange={() => handleStudentToggle(s.id)}
                  className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 dark:border-white/20 dark:bg-black/20"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{s.first_name} {s.last_name}</span>
              </label>
            )) : (
              <p className="text-center text-slate-500 text-sm">O'quvchilar topilmadi</p>
            )}
          </div>

          <div className="flex w-full gap-3">
            <button 
              onClick={() => setIsStudentModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all"
            >
              Tayyor
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
