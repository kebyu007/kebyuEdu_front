"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import toast from "react-hot-toast";
import {
  CreditCard,
  Plus,
  Search,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Banknote,
  CalendarDays,
  UserCircle
} from "lucide-react";

export default function PaymentsPage() {
  const { t } = useLanguage();
  
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("");
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"PAYMENT" | "CHARGE">("PAYMENT");
  const [isSaving, setIsSaving] = useState(false);
  const [isStudentSelectOpen, setIsStudentSelectOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    method: "CASH",
    month: new Date().toISOString().slice(0, 7),
    comment: ""
  });

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payments') as any;
      setPayments(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users', {
        params: { role: 'STUDENT', status: 'active', limit: 1000 } // Get all active students for dropdown
      }) as any;
      setStudents(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  // Filtering Logic
  const filteredPayments = payments.filter(p => {
    const matchesSearch = searchInput === "" || 
      (p.student?.first_name + " " + p.student?.last_name).toLowerCase().includes(searchInput.toLowerCase()) ||
      p.student?.phone?.includes(searchInput);
    
    const matchesMethod = methodFilter === "ALL" || p.method === methodFilter;
    const matchesMonth = monthFilter === "" || p.month === monthFilter;
    
    return matchesSearch && matchesMethod && matchesMonth;
  });

  const filteredDropdownStudents = students.filter(st => 
    (st.first_name + " " + st.last_name).toLowerCase().includes(studentSearch.toLowerCase()) || 
    st.phone?.includes(studentSearch)
  );

  // Pagination Logic
  const total = filteredPayments.length;
  const totalPages = Math.ceil(total / limit);
  const currentPayments = filteredPayments.slice((page - 1) * limit, page * limit);

  // Stats
  const totalRevenue = filteredPayments.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const cashRevenue = filteredPayments.filter(p => p.method === 'CASH').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const cardRevenue = filteredPayments.filter(p => p.method === 'CARD' || p.method === 'TRANSFER').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.amount) {
      toast.error("O'quvchi va summani kiritish majburiy!");
      return;
    }

    setIsSaving(true);
    try {
      if (drawerTab === "PAYMENT") {
        await api.post('/payments', {
          student_id: Number(formData.student_id),
          amount: Number(formData.amount),
          method: formData.method,
          month: formData.month,
          comment: formData.comment
        });
        toast.success("To'lov muvaffaqiyatli qabul qilindi!");
      } else {
        await api.post('/payments/charge', {
          student_id: Number(formData.student_id),
          amount: Number(formData.amount),
          month: formData.month,
          comment: formData.comment
        });
        toast.success("O'quvchi balansidan muvaffaqiyatli yechib olindi (Qarz yozildi)!");
      }
      
      setIsDrawerOpen(false);
      setIsStudentSelectOpen(false);
      setFormData({
        student_id: "",
        amount: "",
        method: "CASH",
        month: new Date().toISOString().slice(0, 7),
        comment: ""
      });
      fetchPayments();
      fetchStudents(); // Refresh students to get updated balances
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'CASH': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{t("pay.method.CASH")}</span>;
      case 'CARD': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">{t("pay.method.CARD")}</span>;
      case 'TRANSFER': return <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">{t("pay.method.TRANSFER")}</span>;
      default: return <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-500/10 text-slate-600 border border-slate-500/20">{method}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <CreditCard size={28} />
            </div>
            Moliya va To'lovlar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Barcha qabul qilingan to'lovlar va moliyaviy statistika
          </p>
        </div>

        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all transform hover:scale-[1.02] shadow-[0_8px_16px_rgba(99,102,241,0.25)] shrink-0"
        >
          <Plus size={18} />
          Yangi to'lov
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <Wallet size={20} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Jami Tushum</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{totalRevenue.toLocaleString()} so'm</h3>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <Banknote size={20} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Naqd Pul Orqali</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{cashRevenue.toLocaleString()} so'm</h3>
        </div>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <CreditCard size={20} />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Plastik / O'tkazma</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{cardRevenue.toLocaleString()} so'm</h3>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-sm">
        
        {/* Table Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="O'quvchi ismi, familiyasi..."
              className="w-full pl-10 pr-8 py-2.5 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
            />
            {searchInput && (
              <button 
                onClick={() => {
                  setSearchInput("");
                  setPage(1);
                }} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters Right */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-700 dark:text-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-800">Barcha turlar</option>
              <option value="CASH" className="bg-white dark:bg-slate-800">{t("pay.method.CASH")}</option>
              <option value="CARD" className="bg-white dark:bg-slate-800">{t("pay.method.CARD")}</option>
              <option value="TRANSFER" className="bg-white dark:bg-slate-800">{t("pay.method.TRANSFER")}</option>
            </select>

            {/* Month Filter */}
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-700 dark:text-slate-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4 pl-6">O'quvchi</th>
                <th className="p-4">Miqdor</th>
                <th className="p-4">To'lov turi</th>
                <th className="p-4">Oy</th>
                <th className="p-4">Sana</th>
                <th className="p-4 pr-6">Qabul Qildi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-32"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-24"></div></td>
                    <td className="p-4 pr-6"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-28"></div></td>
                  </tr>
                ))
              ) : currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    To'lovlar topilmadi
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr 
                    key={payment.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs">
                          {payment.student?.first_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {payment.student?.first_name} {payment.student?.last_name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {payment.student?.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {Number(payment.amount).toLocaleString()} so'm
                      </span>
                    </td>
                    <td className="p-4">
                      {getMethodBadge(payment.method)}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {payment.month || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {payment.admin?.first_name} {payment.admin?.last_name}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && total > 0 && (
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-white/10 gap-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Jami <span className="font-bold text-slate-800 dark:text-white">{total}</span> ta to'lovdan{" "}
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

      {/* Slide-over Drawer for New Payment */}
      <div 
        className={`fixed inset-0 bg-slate-900/30 dark:bg-[#0B0F19]/60 backdrop-blur-[2px] z-[60] transition-all duration-500 ease-in-out ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white/90 dark:bg-[#0f1523]/95 backdrop-blur-3xl border-l border-slate-200 dark:border-white/10 shadow-2xl z-[70] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col sm:rounded-l-[2rem] ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between p-8 pb-6 border-b border-slate-200/60 dark:border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {drawerTab === "PAYMENT" ? "To'lov qabul qilish" : "Qarz yozish (Yechish)"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {drawerTab === "PAYMENT" ? "Yangi to'lovni tizimga kiritish" : "O'quvchi balansidan oylik to'lovni ushlab qolish"}
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 pt-6">
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
            <button
              onClick={() => setDrawerTab("PAYMENT")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                drawerTab === "PAYMENT" 
                  ? "bg-white dark:bg-[#1a2333] text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              To'lov qabul qilish
            </button>
            <button
              onClick={() => setDrawerTab("CHARGE")}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                drawerTab === "CHARGE" 
                  ? "bg-white dark:bg-[#1a2333] text-rose-600 dark:text-rose-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Qarz yozish (Yechish)
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          <form onSubmit={handleSavePayment} id="payment-form" className="space-y-6">
            
            {/* Student Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                O'quvchini tanlang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCircle size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                <div 
                  onClick={() => setIsStudentSelectOpen(!isStudentSelectOpen)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer flex items-center justify-between transition-all hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span className={formData.student_id ? "text-slate-900 dark:text-white" : "text-slate-500"}>
                    {formData.student_id 
                      ? (() => {
                          const s = students.find(st => st.id === Number(formData.student_id));
                          return s ? `${s.first_name} ${s.last_name} (${s.phone})` : "Tanlang...";
                        })()
                      : "Tanlang..."}
                  </span>
                  <ChevronRight size={16} className={`text-slate-400 transition-transform ${isStudentSelectOpen ? 'rotate-90' : ''}`} />
                </div>
                
                {isStudentSelectOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white/95 dark:bg-[#1a2333]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-xl max-h-64 flex flex-col z-50 animate-in fade-in slide-in-from-top-2">
                    
                    {/* Search Input inside Dropdown */}
                    <div className="p-2 border-b border-slate-200 dark:border-white/10 sticky top-0 bg-white/95 dark:bg-[#1a2333]/95 rounded-t-xl z-10">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          autoFocus
                          placeholder="Ism yoki raqam bo'yicha izlash..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="overflow-y-auto no-scrollbar divide-y divide-slate-100 dark:divide-white/5">
                      {filteredDropdownStudents.length === 0 ? (
                        <div className="p-4 text-sm font-medium text-slate-500 text-center">O'quvchilar topilmadi</div>
                      ) : (
                        filteredDropdownStudents.map(st => (
                          <div 
                            key={st.id}
                            onClick={() => {
                              setFormData({...formData, student_id: String(st.id)});
                              setIsStudentSelectOpen(false);
                              setStudentSearch(""); // clear search
                            }}
                            className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <div className="flex flex-col">
                              <span>{st.first_name} {st.last_name}</span>
                              <span className="text-xs text-slate-400 font-normal">{st.phone}</span>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                              Number(st.balance) < 0 
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' 
                                : Number(st.balance) > 0 
                                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {Number(st.balance).toLocaleString()} so'm
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                To'lov miqdori <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Banknote size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Masalan: 250000"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">SO'M</span>
              </div>
            </div>

            {/* Method (Only for PAYMENT) */}
            {drawerTab === "PAYMENT" && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  To'lov turi <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['CASH', 'CARD', 'TRANSFER'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData({ ...formData, method: m })}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        formData.method === m
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
                          : "border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10"
                      }`}
                    >
                      {t(`pay.method.${m}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Month */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Qaysi oy uchun
              </label>
              <div className="relative">
                <CalendarDays size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="To'lov haqida qo'shimcha ma'lumot..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/20 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
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
            form="payment-form"
            disabled={isSaving}
            className={`px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-70 flex items-center justify-center gap-2 ${
              drawerTab === "PAYMENT"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/30"
                : "bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 shadow-rose-500/30"
            }`}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Check size={18} />
            )}
            <span>{isSaving ? "Bajarilmoqda..." : (drawerTab === "PAYMENT" ? "To'lovni saqlash" : "Qarz yozish")}</span>
          </button>
        </div>
      </div>
      
    </div>
  );
}
