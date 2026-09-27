"use client";

import { useState, useEffect } from "react";
import { Loader2, Calendar, Search, Filter, CreditCard, ChevronLeft, ChevronRight, CheckCircle2, Clock } from "lucide-react";
import api from "@/services/api";
import { format } from "date-fns";
import { uz } from "date-fns/locale";

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  month: string;
  comment: string;
  createdAt: string;
}

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("Barchasi");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res: any = await api.get("/payments/my-payments");
        setPayments(res);
      } catch (error) {
        console.error("To'lovlarni yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Filtering Logic
  const filteredPayments = payments.filter((payment) => {
    // Status Filter
    if (statusFilter !== "Barchasi") {
      const pStatus = payment.status === 'COMPLETED' ? "To'langan" : "Kutilmoqda";
      if (pStatus !== statusFilter) return false;
    }

    // Date Filter
    if (startDate && new Date(payment.createdAt) < new Date(startDate)) return false;
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(payment.createdAt) > end) return false;
    }

    return true;
  });

  // Pagination Logic
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM, yyyy HH:mm", { locale: uz });
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-10">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
            To'lovlarim
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Barcha amalga oshirilgan to'lovlar va ularning holati
          </p>
        </div>

        {/* Total Summary Badge */}
        <div className="bg-white/60 dark:bg-[#121621]/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Umumiy to'langan</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              {formatMoney(payments.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Filters (Glassmorphic Bar) */}
      <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center gap-4 relative z-20">
        
        {/* Status Dropdown */}
        <div className="w-full md:w-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Filter size={16} />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full md:w-48 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1A2035] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all appearance-none cursor-pointer"
          >
            <option value="Barchasi">Barchasi</option>
            <option value="To'langan">To'langan</option>
            <option value="Kutilmoqda">Kutilmoqda</option>
          </select>
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-white/10 mx-2"></div>

        {/* Start Date */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Boshlanish vaqti</label>
            <div className="relative">
              <input 
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-44 px-3 py-2 bg-slate-50 dark:bg-[#1A2035] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tugash vaqti</label>
            <div className="relative">
              <input 
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-44 px-3 py-2 bg-slate-50 dark:bg-[#1A2035] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Data Table */}
      <div className="bg-white/70 dark:bg-[#121621]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-lg overflow-hidden relative z-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Miqdori</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Holati</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To'lov turi</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vaqti</th>
              </tr>
            </thead>
            <tbody>
              {currentPayments.length > 0 ? (
                currentPayments.map((payment, index) => (
                  <tr 
                    key={payment.id} 
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          <CheckCircle2 size={12} />
                          To'langan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
                          <Clock size={12} />
                          Kutilmoqda
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {formatDate(payment.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <CreditCard size={48} className="mb-4 opacity-20" />
                      <p className="text-lg font-bold text-slate-600 dark:text-slate-400">Ma'lumot topilmadi</p>
                      <p className="text-sm mt-1">Ushbu filtr bo'yicha to'lovlar mavjud emas.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#1A2035] flex items-center justify-between">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalItems)} gacha, {totalItems} tadan
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
