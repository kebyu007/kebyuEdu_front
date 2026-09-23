"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, X, Search, Archive, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, DoorOpen, Users, Layers } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/services/api";

interface Room {
  id: number;
  name: string;
  capacity: number;
  status: string;
  createdAt: string;
  _count?: {
    groups: number;
  };
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12); // 4x3 grid
  
  // Search state with Debounce
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  
  // Status filter state (active / inactive)
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive">("active");

  const [isLoading, setIsLoading] = useState(true);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    capacity: 20
  });

  // Debounce search input (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch rooms with status filter, search and pagination
  const fetchRooms = async () => {
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

      const res: any = await api.get(`/rooms?${queryParams.toString()}`);
      
      setRooms(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Xonalarni olishda xato", error);
      setRooms([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [page, limit, search, statusFilter]);

  const handleStatusFilterChange = (status: "active" | "inactive") => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setEditingRoomId(null);
    setFormData({
      name: "",
      capacity: 20
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditMode(true);
    setEditingRoomId(room.id);
    setFormData({
      name: room.name,
      capacity: Number(room.capacity) || 20
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setDeleteModalOpen(true);
  };

  const confirmArchive = async () => {
    if (!roomToDelete) return;
    try {
      await api.delete(`/rooms/${roomToDelete.id}`);
      toast.success("Xona arxivlandi!");
      setDeleteModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error("Arxivlashda xato", error);
    }
  };

  const handleRestoreRoom = async (room: Room) => {
    try {
      await api.patch(`/rooms/${room.id}`, { status: "active" });
      toast.success("Xona faol holatga qaytarildi!");
      fetchRooms();
    } catch (error) {
      console.error("Xonani tiklashda xato", error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Xona nomi kiritilishi shart!");
      return;
    }
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      toast.error("Xona sig'imi to'g'ri kiritilishi shart!");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        capacity: Number(formData.capacity)
      };

      if (editMode && editingRoomId) {
        await api.patch(`/rooms/${editingRoomId}`, payload);
        toast.success("Xona ma'lumotlari yangilandi!");
      } else {
        await api.post("/rooms", payload);
        toast.success("Yangi xona qo'shildi!");
      }

      setIsDrawerOpen(false);
      fetchRooms();
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
              Faol Xonalar
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
                placeholder="Xona nomi bo'yicha..." 
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
              Xonani qo'shish
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Xonalar yuklanmoqda...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24 text-slate-500 dark:text-slate-400 gap-2">
            <DoorOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
            <p className="font-semibold text-base">Xonalar topilmadi</p>
            <p className="text-xs text-slate-400">
              {statusFilter === "inactive" ? "Arxivda hozircha hech qanday xona yo'q" : "So'rov bo'yicha hech qanday xona mos kelmadi"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {rooms.map(room => (
              <div key={room.id} className="bg-white/80 dark:bg-black/20 rounded-2xl p-5 border border-slate-200/80 dark:border-white/5 transition-all hover:scale-[1.02] hover:shadow-md duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 font-bold">
                        <DoorOpen size={20} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{room.name}</h3>
                    </div>

                    <div className="flex items-center gap-1 -mt-1 -mr-1">
                      {statusFilter === "active" ? (
                        <>
                          <button 
                            onClick={() => handleOpenEdit(room)}
                            title="Tahrirlash"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(room)}
                            title="Arxivlash"
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Archive size={16} />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleRestoreRoom(room)}
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

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-slate-400" />
                    Sig'imi: <strong className="text-slate-800 dark:text-white font-bold">{room.capacity} ta</strong>
                  </span>
                  {room._count?.groups !== undefined && (
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-md">
                      <Layers size={12} className="text-indigo-500" />
                      {room._count.groups} guruh
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {!isLoading && total > 0 && (
          <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/10 gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jami <span className="font-bold text-slate-800 dark:text-white">{total}</span> ta xonadan{" "}
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
              {editMode ? "Xonani tahrirlash" : "Xonani qo'shish"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {editMode ? "Xona nom va sig'imini o'zgartiring." : "Yangi xona parametlarini kiriting."}
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
              Xona nomi <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Masalan: MFactor yoki Al-Xorazmiy" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Sig'imi */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-white mb-2">
              Xona sig'imi (o'quvchilar soni) <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              min={1}
              value={formData.capacity}
              onChange={(e) => setFormData({...formData, capacity: Number(e.target.value)})}
              placeholder="20" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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
              Xonani arxivlaysizmi?
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              <span className="font-semibold text-slate-700 dark:text-white">{roomToDelete?.name}</span> xonasini arxivga o'tkazmoqchimisiz? Keyinchalik uni Arxiv tabidan qayta tiklashingiz mumkin.
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
