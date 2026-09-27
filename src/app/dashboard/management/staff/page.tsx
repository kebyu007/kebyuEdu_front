"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Edit2, X, Search, Archive, ChevronLeft, ChevronRight, UploadCloud, 
  UserCircle, RotateCcw, CheckCircle2, ShieldAlert, UserCheck, ShieldCheck, 
  Users, Key, Check, Shield, Layers, Settings, ChevronDown, Lock
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

const API_BASE_URL = typeof window !== 'undefined' ? `http://${window.location.hostname}:3001/api/v1` : "http://localhost:3001/api/v1";

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  role: "SUPERADMIN" | "ADMIN" | "TEACHER" | "STUDENT";
  status: "active" | "inactive";
  photo: string | null;
  address?: string;
  birth_date?: string;
  attributes?: {
    permissions?: Record<string, string[]>;
  };
  createdAt: string;
}

interface PermissionItem {
  key: string;
  module: string;
  action: string;
  label: string;
}

interface PermissionGroup {
  id: string;
  label: string;
  items: PermissionItem[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "asosiy",
    label: "Asosiy oynalar",
    items: [
      { key: "asosiy.read", module: "asosiy", action: "read", label: "Asosiy aynani ko'rish" },
      { key: "payments.read", module: "payments", action: "read", label: "To'lovlarni ko'rish" },
      { key: "reports.read", module: "reports", action: "read", label: "Hisobotlarni ko'rish" },
    ],
  },
  {
    id: "teachers",
    label: "O'qituvchilar",
    items: [
      { key: "teachers.create", module: "teachers", action: "create", label: "Qo'shish" },
      { key: "teachers.read", module: "teachers", action: "read", label: "Ko'rish" },
      { key: "teachers.update", module: "teachers", action: "update", label: "O'zgartirish" },
      { key: "teachers.delete", module: "teachers", action: "delete", label: "O'chirish" },
      { key: "teachers.export", module: "teachers", action: "export", label: "Yuklab olish" },
      { key: "teachers.add_coin", module: "teachers", action: "add_coin", label: "Coin qo'shish" },
      { key: "teachers.remove_coin", module: "teachers", action: "remove_coin", label: "Coin olib tashlash" },
      { key: "teachers.view_archive", module: "teachers", action: "view_archive", label: "Arxivni ko'rish" },
    ],
  },
  {
    id: "students",
    label: "Talabalar",
    items: [
      { key: "students.create", module: "students", action: "create", label: "Qo'shish" },
      { key: "students.read", module: "students", action: "read", label: "Ko'rish" },
      { key: "students.update", module: "students", action: "update", label: "O'zgartirish" },
      { key: "students.delete", module: "students", action: "delete", label: "O'chirish" },
      { key: "students.export", module: "students", action: "export", label: "Yuklab olish" },
      { key: "students.add_coin", module: "students", action: "add_coin", label: "Coin qo'shish" },
    ],
  },
  {
    id: "groups",
    label: "Guruhlar",
    items: [
      { key: "groups.create", module: "groups", action: "create", label: "Qo'shish" },
      { key: "groups.read", module: "groups", action: "read", label: "Ko'rish" },
      { key: "groups.update", module: "groups", action: "update", label: "O'zgartirish" },
      { key: "groups.delete", module: "groups", action: "delete", label: "O'chirish" },
    ],
  },
  {
    id: "courses_rooms",
    label: "Kurslar va Xonalar",
    items: [
      { key: "courses.create", module: "courses", action: "create", label: "Kurs yaratish" },
      { key: "courses.read", module: "courses", action: "read", label: "Kurslarni ko'rish" },
      { key: "courses.update", module: "courses", action: "update", label: "Kursni tahrirlash" },
      { key: "courses.delete", module: "courses", action: "delete", label: "Kursni o'chirish" },
      { key: "rooms.create", module: "rooms", action: "create", label: "Xona yaratish" },
      { key: "rooms.read", module: "rooms", action: "read", label: "Xonalarni ko'rish" },
      { key: "rooms.update", module: "rooms", action: "update", label: "Xonani tahrirlash" },
      { key: "rooms.delete", module: "rooms", action: "delete", label: "Xonani o'chirish" },
    ],
  },
  {
    id: "payments_reports",
    label: "Moliya va Hisobotlar",
    items: [
      { key: "payments.create", module: "payments", action: "create", label: "To'lov qabul qilish" },
      { key: "payments.read", module: "payments", action: "read", label: "To'lovlar ro'yxatini ko'rish" },
      { key: "reports.read", module: "reports", action: "read", label: "Hisobotlarni ko'rish" },
    ],
  },
  {
    id: "users",
    label: "Hodimlar boshqaruvi",
    items: [
      { key: "users.create", module: "users", action: "create", label: "Qo'shish" },
      { key: "users.read", module: "users", action: "read", label: "Ko'rish" },
      { key: "users.update", module: "users", action: "update", label: "O'zgartirish" },
      { key: "users.delete", module: "users", action: "delete", label: "O'chirish" },
    ],
  },
];

// Predefined ABAC Role Templates
const ROLE_TEMPLATES: Record<string, string[]> = {
  ADMIN: [
    "asosiy.read", "payments.read", "reports.read",
    "teachers.create", "teachers.read", "teachers.update", "teachers.delete", "teachers.export", "teachers.add_coin", "teachers.remove_coin", "teachers.view_archive",
    "students.create", "students.read", "students.update", "students.delete", "students.export", "students.add_coin",
    "groups.create", "groups.read", "groups.update", "groups.delete",
    "courses.create", "courses.read", "courses.update", "courses.delete",
    "rooms.create", "rooms.read", "rooms.update", "rooms.delete",
    "payments.create", "payments.read", "reports.read",
    "users.read"
  ],
  MENEDJER: [
    "asosiy.read", "reports.read",
    "students.create", "students.read", "students.update", "students.export", "students.add_coin",
    "teachers.read", "teachers.export",
    "groups.create", "groups.read", "groups.update",
    "courses.read", "rooms.read"
  ],
  KASSIR: [
    "asosiy.read", "payments.read", "payments.create",
    "students.read", "groups.read"
  ],
  RECEPTSIYA: [
    "asosiy.read", "students.create", "students.read", "students.update",
    "groups.read", "courses.read", "rooms.read"
  ],
};

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  
  // Search state with Debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  
  // Role filter state (All, ADMIN, SUPERADMIN)
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  
  // Status filter state (active / inactive)
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");

  const [isLoading, setIsLoading] = useState(true);

  // Drawer and Modal states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    phone: "+998",
    email: "",
    first_name: "",
    last_name: "",
    role: "ADMIN" as "ADMIN" | "SUPERADMIN" | "TEACHER",
    address: "",
    birth_date: "",
    password: "",
    status: "active" as "active" | "inactive",
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ABAC Permissions State (selected permission keys e.g. ["teachers.create", "students.read"])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(ROLE_TEMPLATES.ADMIN);

  // Role Template Editor state for "Rollar" tab
  const [selectedRoleTemplate, setSelectedRoleTemplate] = useState<string>("ADMIN");
  const [templatePermissions, setTemplatePermissions] = useState<Record<string, string[]>>(ROLE_TEMPLATES);

  // Debounce search input (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch staff users with status filter, role filter, search and pagination
  const fetchStaff = async () => {
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

      if (roleFilter !== "ALL") {
        queryParams.append("role", roleFilter);
      }

      const res: any = await api.get(`/users?${queryParams.toString()}`);
      
      const allUsers: StaffMember[] = res.data || [];
      
      // If roleFilter is ALL, filter out pure students to display staff members (ADMIN, SUPERADMIN, TEACHER, etc.)
      const filteredStaff = roleFilter === "ALL" 
        ? allUsers.filter(u => u.role !== "STUDENT")
        : allUsers;

      setStaffList(filteredStaff);
      setTotal(res.meta?.total || filteredStaff.length);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Hodimlarni olishda xato", error);
      setStaffList([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, limit, search, roleFilter, statusFilter]);

  // Convert selected permission keys into backend JSON attributes format
  const buildPermissionsJson = (keys: string[]) => {
    const permissionsObj: Record<string, string[]> = {};

    PERMISSION_GROUPS.forEach(group => {
      group.items.forEach(item => {
        if (keys.includes(item.key)) {
          if (!permissionsObj[item.module]) {
            permissionsObj[item.module] = [];
          }
          if (!permissionsObj[item.module].includes(item.action)) {
            permissionsObj[item.module].push(item.action);
          }
        }
      });
    });

    return { permissions: permissionsObj };
  };

  // Convert backend attributes.permissions object back into array of permission keys
  const extractPermissionKeys = (attributesPermissions?: Record<string, string[]>) => {
    if (!attributesPermissions) return ROLE_TEMPLATES.ADMIN;
    
    // If user has wildcard permissions '*'
    if (attributesPermissions['*']?.includes('*')) {
      return PERMISSION_GROUPS.flatMap(g => g.items.map(i => i.key));
    }

    const keys: string[] = [];
    PERMISSION_GROUPS.forEach(group => {
      group.items.forEach(item => {
        const moduleActions = attributesPermissions[item.module];
        if (moduleActions && (moduleActions.includes(item.action) || moduleActions.includes('*'))) {
          keys.push(item.key);
        }
      });
    });

    return keys;
  };

  const handleOpenAddDrawer = () => {
    setEditMode(false);
    setFormData({
      id: 0,
      phone: "+998",
      email: "",
      first_name: "",
      last_name: "",
      role: "ADMIN",
      address: "",
      birth_date: "",
      password: "",
      status: "active",
    });
    setSelectedPermissions(ROLE_TEMPLATES.ADMIN);
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (staff: StaffMember) => {
    setEditMode(true);
    setFormData({
      id: staff.id,
      phone: staff.phone || "+998",
      email: staff.email || "",
      first_name: staff.first_name || "",
      last_name: staff.last_name || "",
      role: (staff.role as "ADMIN" | "SUPERADMIN" | "TEACHER") || "ADMIN",
      address: staff.address || "",
      birth_date: staff.birth_date ? staff.birth_date.split("T")[0] : "",
      password: "", // Don't prepopulate password for security
      status: staff.status === "inactive" ? "inactive" : "active",
    });
    
    const existingKeys = extractPermissionKeys(staff.attributes?.permissions);
    setSelectedPermissions(existingKeys);

    setPhotoFile(null);
    if (staff.photo) {
      setPhotoPreview(staff.photo.startsWith("http") ? staff.photo : `${API_BASE_URL.replace("/api/v1", "")}/${staff.photo}`);
    } else {
      setPhotoPreview(null);
    }
    setIsDrawerOpen(true);
  };

  const handleTogglePermission = (key: string) => {
    setSelectedPermissions(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleToggleGroupPermissions = (group: PermissionGroup) => {
    const groupKeys = group.items.map(i => i.key);
    const allSelected = groupKeys.every(k => selectedPermissions.includes(k));

    if (allSelected) {
      setSelectedPermissions(prev => prev.filter(k => !groupKeys.includes(k)));
    } else {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...groupKeys])));
    }
  };

  const handleApplyRoleTemplate = (roleKey: string) => {
    if (ROLE_TEMPLATES[roleKey]) {
      setSelectedPermissions(ROLE_TEMPLATES[roleKey]);
      toast.success(`${roleKey} roli uchun ruxsatnomalar shabloni yuklandi`);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim()) {
      toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }

    if (!editMode && !formData.password.trim()) {
      toast.error("Yangi hodim uchun parol kiritish majburiy!");
      return;
    }

    setIsSaving(true);

    try {
      const payload = new FormData();
      payload.append("first_name", formData.first_name.trim());
      payload.append("last_name", formData.last_name.trim());
      payload.append("phone", formData.phone.trim());
      payload.append("role", formData.role);
      payload.append("status", formData.status);
      
      if (formData.email.trim()) payload.append("email", formData.email.trim());
      if (formData.address.trim()) payload.append("address", formData.address.trim());
      if (formData.birth_date) payload.append("birth_date", formData.birth_date);
      if (formData.password.trim()) payload.append("password", formData.password.trim());

      // Pass ABAC permissions inside attributes
      const attributesObj = buildPermissionsJson(selectedPermissions);
      payload.append("attributes", JSON.stringify(attributesObj));

      if (photoFile) {
        payload.append("photo", photoFile);
      }

      if (editMode) {
        await api.patch(`/users/${formData.id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hodim va uning ABAC ruxsatlari muvaffaqiyatli yangilandi!");
      } else {
        await api.post("/users", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Yangi hodim va uning ABAC ruxsatlari muvaffaqiyatli yaratildi!");
      }

      setIsDrawerOpen(false);
      fetchStaff();
    } catch (error: any) {
      console.error("Hodimni saqlashda xato", error);
      const errMsg = error.response?.data?.message || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
      toast.error(typeof errMsg === "object" ? JSON.stringify(errMsg) : errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;
    setIsSaving(true);
    try {
      if (statusFilter === "active") {
        await api.patch(`/users/${staffToDelete.id}`, { status: "inactive" });
        toast.success("Hodim arxivlandi (nofaol qilindi)!");
      } else {
        await api.delete(`/users/${staffToDelete.id}`);
        toast.success("Hodim tizimdan o'chirildi!");
      }
      setDeleteModalOpen(false);
      setStaffToDelete(null);
      fetchStaff();
    } catch (error: any) {
      console.error("Hodimni o'chirishda xato", error);
      toast.error(error.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestoreStaff = async (staff: StaffMember) => {
    try {
      await api.patch(`/users/${staff.id}`, { status: "active" });
      toast.success("Hodim qayta tiklandi!");
      fetchStaff();
    } catch (error: any) {
      console.error("Hodimni tiklashda xato", error);
      toast.error("Hodimni tiklashda xatolik yuz berdi");
    }
  };

  // Helper for role badge colors
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return { label: "Super Admin", bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" };
      case "ADMIN":
        return { label: "Administrator", bg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
      case "TEACHER":
        return { label: "O'qituvchi", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
      default:
        return { label: role, bg: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
    }
  };

  const superAdminCount = staffList.filter(s => s.role === "SUPERADMIN").length;
  const adminCount = staffList.filter(s => s.role === "ADMIN").length;
  const activeCount = staffList.filter(s => s.status === "active").length;

  return (
    <div className="w-full space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Page Header & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hodimlar va ABAC Rollar boshqaruvi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tizim administratorlari, xodimlar hamda ularning modul ruxsatnomalarini (ABAC) sozlash
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-200/70 dark:bg-white/10 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "staff"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users size={16} />
            <span>Hodimlar ro'yxati</span>
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === "roles"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Key size={16} />
            <span>Rollar va ABAC Ruxsatlar</span>
          </button>
        </div>
      </div>

      {activeTab === "staff" ? (
        <>
          {/* Action Header */}
          <div className="flex justify-end">
            <button
              onClick={handleOpenAddDrawer}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-[0_8px_16px_rgba(99,102,241,0.25)] hover:shadow-[0_12px_20px_rgba(99,102,241,0.35)] transition-all transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              <span>Yangi hodim qo'shish</span>
            </button>
          </div>

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Jami Hodimlar</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{total}</h3>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <UserCheck size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Faol Hodimlar</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{activeCount}</h3>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Administratorlar</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{adminCount}</h3>
            </div>

            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <ShieldAlert size={20} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Superadminlar</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{superAdminCount}</h3>
            </div>
          </div>

          {/* Main Container */}
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm">
            
            {/* Table Controls */}
            <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                <button
                  onClick={() => {
                    setStatusFilter("active");
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    statusFilter === "active"
                      ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  Faol
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("inactive");
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    statusFilter === "inactive"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Archive size={16} />
                  Arxiv / Nofaol
                </button>
              </div>

              {/* Filters Right */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-700 dark:text-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                >
                  <option value="ALL" className="bg-white dark:bg-slate-800">Barcha rollar</option>
                  <option value="ADMIN" className="bg-white dark:bg-slate-800">Admin</option>
                  <option value="SUPERADMIN" className="bg-white dark:bg-slate-800">Super Admin</option>
                  <option value="TEACHER" className="bg-white dark:bg-slate-800">O'qituvchi</option>
                </select>

                {/* Search */}
                <div className="relative max-w-xs w-full">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Qidiruv..."
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
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto min-h-[350px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-4">Hodim</th>
                    <th className="px-6 py-4">Roli</th>
                    <th className="px-6 py-4">ABAC Ruxsatlar</th>
                    <th className="px-6 py-4">Telefon & Email</th>
                    <th className="px-6 py-4">Holati</th>
                    <th className="px-6 py-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-10 bg-slate-200 dark:bg-white/10 rounded-xl w-48"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-24"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-32"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-28"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-white/10 rounded-lg w-16"></div></td>
                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-200 dark:bg-white/10 rounded-xl w-16 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : staffList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-400 dark:text-slate-500">
                        <Users size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="font-bold text-base">Hodimlar topilmadi</p>
                        <p className="text-xs mt-1">Qidiruv mezonlarini o'zgartiring yoki yangi hodim qo'shing</p>
                      </td>
                    </tr>
                  ) : (
                    staffList.map((staff) => {
                      const badge = getRoleBadge(staff.role);
                      const photoUrl = staff.photo 
                        ? (staff.photo.startsWith("http") ? staff.photo : `${API_BASE_URL.replace("/api/v1", "")}/${staff.photo}`)
                        : null;

                      const staffPermKeys = extractPermissionKeys(staff.attributes?.permissions);
                      const isSuper = staff.role === "SUPERADMIN";

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                          {/* Name & Photo */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={`${staff.first_name} ${staff.last_name}`}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                  {staff.first_name?.[0]}{staff.last_name?.[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {staff.first_name} {staff.last_name}
                                </p>
                                <p className="text-xs text-slate-400">ID: #{staff.id}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>

                          {/* ABAC Permissions Summary */}
                          <td className="px-6 py-4">
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                                <ShieldAlert size={14} /> To'liq ruxsat (Superadmin)
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                                  {staffPermKeys.length} ta ruxsat berilgan
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Phone & Email */}
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{staff.phone}</p>
                            {staff.email && <p className="text-xs text-slate-400">{staff.email}</p>}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            {staff.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Faol
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold bg-red-500/10 text-red-600 dark:text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Arxiv / Nofaol
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {staff.status === "active" ? (
                                <>
                                  <button
                                    onClick={() => handleOpenEditDrawer(staff)}
                                    className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                    title="Tahrirlash va ABAC Ruxsatlarni o'zgartirish"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setStaffToDelete(staff);
                                      setDeleteModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                    title="Arxivlash"
                                  >
                                    <Archive size={16} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleRestoreStaff(staff)}
                                  className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                                  title="Qayta tiklash"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {!isLoading && total > 0 && (
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/10 gap-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Jami <span className="font-bold text-slate-800 dark:text-white">{total}</span> ta hodimdan{" "}
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
        </>
      ) : (
        /* ROLLAR & ABAC RUXSATLAR CONFIGURATOR (Matching User's Screenshot!) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Role List */}
          <div className="lg:col-span-4 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rollar ro'yxati</h2>
              </div>
            </div>

            <div className="space-y-3">
              {Object.keys(ROLE_TEMPLATES).map((roleKey) => {
                const isSelected = selectedRoleTemplate === roleKey;
                const count = (templatePermissions[roleKey] || ROLE_TEMPLATES[roleKey]).length;

                return (
                  <button
                    key={roleKey}
                    onClick={() => setSelectedRoleTemplate(roleKey)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-md"
                        : "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-bold"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isSelected ? "bg-indigo-500" : "bg-slate-400"}`} />
                      <span>{roleKey}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                      {count} ta ruxsat
                    </span>
                  </button>
                );
              })}
            </div>
            
            <p className="text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-white/10">
              Eslatma: Roldan tanlangan ruxsatlar yangi admin yaratishda avtomatik biriktiriladi.
            </p>
          </div>

          {/* Right Side: Checkbox Permissions Matrix (Exactly matching user's screenshot layout!) */}
          <div className="lg:col-span-8 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  "{selectedRoleTemplate}" Roli uchun ABAC Ruxsatnomalari
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ushbu rolga ega foydalanuvchilar qaysi bo'lim va harakatlarga kirishi mumkinligini belgilang
                </p>
              </div>
              <button
                onClick={() => {
                  toast.success(`"${selectedRoleTemplate}" shabloni saqlandi!`);
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Shablonni saqlash
              </button>
            </div>

            {/* Permission Groups Accordion / Grid */}
            <div className="space-y-6">
              {PERMISSION_GROUPS.map((group) => {
                const activeRoleKeys = templatePermissions[selectedRoleTemplate] || [];
                const isAllGroupSelected = group.items.every(i => activeRoleKeys.includes(i.key));

                return (
                  <div key={group.id} className="border border-slate-200 dark:border-white/10 rounded-2xl p-5 bg-white/40 dark:bg-black/20">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 mb-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={isAllGroupSelected}
                          onChange={() => {
                            const groupKeys = group.items.map(i => i.key);
                            setTemplatePermissions(prev => {
                              const current = prev[selectedRoleTemplate] || [];
                              const updated = isAllGroupSelected
                                ? current.filter(k => !groupKeys.includes(k))
                                : Array.from(new Set([...current, ...groupKeys]));
                              return { ...prev, [selectedRoleTemplate]: updated };
                            });
                          }}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                          isAllGroupSelected 
                            ? "bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)] border-none" 
                            : "border-2 border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 group-hover:border-indigo-400 dark:group-hover:border-indigo-500"
                        }`}>
                          {isAllGroupSelected && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {group.label}
                        </span>
                      </label>
                      <span className="text-xs text-slate-400 font-semibold">
                        {group.items.filter(i => activeRoleKeys.includes(i.key)).length} / {group.items.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {group.items.map((item) => {
                        const isChecked = activeRoleKeys.includes(item.key);

                        return (
                          <label
                            key={item.key}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                              isChecked
                                ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-[0_2px_10px_rgba(99,102,241,0.1)]"
                                : "bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setTemplatePermissions(prev => {
                                  const current = prev[selectedRoleTemplate] || [];
                                  const updated = isChecked
                                    ? current.filter(k => k !== item.key)
                                    : [...current, item.key];
                                  return { ...prev, [selectedRoleTemplate]: updated };
                                });
                              }}
                              className="hidden"
                            />
                            <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all duration-200 shrink-0 ${
                              isChecked 
                                ? "bg-indigo-500 text-white shadow-sm" 
                                : "border border-slate-300 dark:border-slate-500 bg-transparent"
                            }`}>
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span className="text-xs font-semibold">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* Slide-over Drawer for Add/Edit Staff & ABAC Permissions */}
      {/* Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 dark:bg-[#0B0F19]/60 backdrop-blur-[2px] z-[60] transition-all duration-500 ease-in-out ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[600px] bg-white/90 dark:bg-[#0f1523]/95 backdrop-blur-3xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col sm:rounded-l-[2rem] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between p-8 pb-6 border-b border-slate-200/60 dark:border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {editMode ? "Hodim ma'lumotlari & Ruxsatnomalar" : "Yangi hodim & ABAC Ruxsatlar"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Foydalanuvchi ma'lumotlari va tizim ruxsatnomalari (ABAC)</p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <form onSubmit={handleSaveStaff} id="staff-form" className="space-y-6">
                  
                  {/* Photo Upload */}
                  <div className="flex items-center gap-4">
                    <div className="relative group w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/5">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle size={40} className="text-slate-400" />
                      )}
                      <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <UploadCloud size={18} />
                        <span>Rasm yuklash</span>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Profil rasmi</p>
                      <p className="text-xs text-slate-400">JPG, PNG (max 2MB)</p>
                    </div>
                  </div>

                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Ism <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Ismini kiriting"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Familiya <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Familiyasini kiriting"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Telefon raqami <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+998901234567"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Lavozim (Roli) <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => {
                          const newRole = e.target.value as any;
                          setFormData({ ...formData, role: newRole });
                          if (ROLE_TEMPLATES[newRole]) {
                            setSelectedPermissions(ROLE_TEMPLATES[newRole]);
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
                      >
                        <option value="ADMIN" className="bg-white dark:bg-slate-800">Administrator</option>
                        <option value="SUPERADMIN" className="bg-white dark:bg-slate-800">Super Admin</option>
                        <option value="TEACHER" className="bg-white dark:bg-slate-800">O'qituvchi</option>
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Email (ixtiyoriy)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="hodim@example.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Parol {!editMode && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="password"
                        required={!editMode}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder={editMode ? "O'zgartirish uchun yangi parol kiriting" : "Kamida 6 ta belgi"}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>

                  {/* ABAC Permissions Section Header */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <Key size={16} className="text-indigo-500" />
                          ABAC Modul Ruxsatnomalari
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Ushbu hodim uchun individual ruxsatlarni belgilang</p>
                      </div>

                      {/* Quick Template Selector */}
                      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">Shablon:</span>
                        {Object.keys(ROLE_TEMPLATES).map((tmplKey) => (
                          <button
                            key={tmplKey}
                            type="button"
                            onClick={() => handleApplyRoleTemplate(tmplKey)}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all duration-300 transform hover:-translate-y-0.5"
                          >
                            {tmplKey}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Permission Accordions (Exactly matching user screenshot!) */}
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                      {PERMISSION_GROUPS.map((group) => {
                        const isAllSelected = group.items.every(i => selectedPermissions.includes(i.key));

                        return (
                          <div key={group.id} className="border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-50/50 dark:bg-white/5">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/10 mb-3">
                              <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                  type="checkbox"
                                  checked={isAllSelected}
                                  onChange={() => handleToggleGroupPermissions(group)}
                                  className="hidden"
                                />
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
                                  isAllSelected 
                                    ? "bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.4)] border-none" 
                                    : "border-2 border-slate-300 dark:border-white/20 bg-white/50 dark:bg-black/20 group-hover:border-indigo-400 dark:group-hover:border-indigo-500"
                                }`}>
                                  {isAllSelected && <Check size={14} strokeWidth={3} />}
                                </div>
                                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                                  {group.label}
                                </span>
                              </label>
                              <span className="text-[10px] font-bold text-slate-400">
                                {group.items.filter(i => selectedPermissions.includes(i.key)).length} / {group.items.length}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.items.map((item) => {
                                const isChecked = selectedPermissions.includes(item.key);
                                return (
                                  <label
                                    key={item.key}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                                      isChecked
                                        ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-[0_2px_10px_rgba(99,102,241,0.1)]"
                                        : "bg-white/50 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleTogglePermission(item.key)}
                                      className="hidden"
                                    />
                                    <div className={`w-4 h-4 rounded-[4px] flex items-center justify-center transition-all duration-200 shrink-0 ${
                                      isChecked 
                                        ? "bg-indigo-500 text-white shadow-sm" 
                                        : "border border-slate-300 dark:border-slate-500 bg-transparent"
                                    }`}>
                                      {isChecked && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <span className="text-xs font-semibold">{item.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

          </form>
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
            type="submit"
            form="staff-form"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-[0_8px_16px_rgba(99,102,241,0.3)] transition-all transform hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            <span>{isSaving ? "Saqlanmoqda..." : "Saqlash"}</span>
          </button>
        </div>
      </div>

      {/* Delete / Archive Confirmation Modal */}
      {deleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
              <Archive size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {statusFilter === "active" ? "Hodimni arxivlashni tasdiqlaysizmi?" : "Hodimni o'chirishni tasdiqlaysizmi?"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              <span className="font-bold text-slate-800 dark:text-slate-200">{staffToDelete.first_name} {staffToDelete.last_name}</span> 
              {statusFilter === "active" 
                ? " hodimi nofaol holatga o'tkaziladi. Keyinchalik uni qayta tiklashingiz mumkin." 
                : " hodimi tizimdan butunlay o'chiriladi."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
              >
                {isSaving ? "Bajarilmoqda..." : (statusFilter === "active" ? "Arxivlash" : "O'chirish")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

