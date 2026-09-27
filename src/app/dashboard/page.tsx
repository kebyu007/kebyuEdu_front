"use client";

import StatCard from "@/components/StatCard";
import AccordionCard from "@/components/AccordionCard";
import DashboardChart from "@/components/DashboardChart";
import ProfitChart from "@/components/ProfitChart";
import { GraduationCap, Users, CreditCard, AlertTriangle, Snowflake, Archive, Activity, FileCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

export default function DashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Foydalanuvchi");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("user_role");
      if (role === "TEACHER" || role === "O'qituvchi") {
        router.replace("/dashboard/groups");
        return;
      }
      setUserName(localStorage.getItem("user_name") || "Foydalanuvchi");
    }
    
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        setData(res);
      } catch (err) {
        console.error("Dashboard yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const { financial, statistics, debtors, todaySchedule, performance } = data || {
    financial: { totalRevenue: 0, monthlyRevenueChart: [], annualProfitChart: [], recentPayments: [] },
    statistics: { totalStudents: 0, frozenStudents: 0, archivedStudents: 0, activeGroups: 0 },
    debtors: [],
    todaySchedule: [],
    performance: { averageAttendance: 0, totalHomeworksSubmitted: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2 transition-all">
          {t("dash.hello")}, {userName}!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
          {t("dash.welcome")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard 
          title={t("stat.active_students")} 
          value={statistics?.totalStudents || "0"} 
          icon={GraduationCap} 
          iconColorClass="text-blue-500 dark:text-blue-400"
        />
        <StatCard 
          title={t("stat.groups")} 
          value={statistics?.activeGroups || "0"} 
          icon={Users} 
          iconColorClass="text-indigo-500 dark:text-indigo-400"
        />
        <StatCard 
          title={t("stat.monthly_payments")} 
          value={financial?.totalRevenue ? financial.totalRevenue.toLocaleString() : "0"} 
          icon={CreditCard} 
          iconColorClass="text-emerald-500 dark:text-emerald-400"
        />
        <StatCard 
          title={t("stat.debtors")} 
          value={debtors?.length || "0"} 
          icon={AlertTriangle} 
          iconColorClass="text-orange-500 dark:text-orange-400"
        />
        <StatCard 
          title={t("stat.frozen")} 
          value={statistics?.frozenStudents || "0"} 
          icon={Snowflake} 
          iconColorClass="text-cyan-500 dark:text-cyan-400"
        />
        <StatCard 
          title={t("stat.archive")} 
          value={statistics?.archivedStudents || "0"} 
          icon={Archive} 
          iconColorClass="text-purple-500 dark:text-purple-400"
        />
      </div>

      {/* Extra Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <StatCard 
          title="O'rtacha davomat (Oylik)" 
          value={`${performance?.averageAttendance || "0"}%`} 
          icon={Activity} 
          iconColorClass="text-emerald-500 dark:text-emerald-400"
        />
        <StatCard 
          title="Topshirilgan vazifalar" 
          value={performance?.totalHomeworksSubmitted || "0"} 
          icon={FileCheck} 
          iconColorClass="text-indigo-500 dark:text-indigo-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <DashboardChart data={financial?.monthlyRevenueChart || []} />
        <ProfitChart data={financial?.annualProfitChart || []} />
      </div>

      {/* Accordions Section */}
      <div className="space-y-4 pt-4">
        <AccordionCard title={t("acc.payments")}>
          {financial?.recentPayments?.length > 0 ? (
            <div className="space-y-3">
              {financial.recentPayments.map((payment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                      {payment.student?.first_name?.charAt(0) || "O'"}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {payment.student?.first_name} {payment.student?.last_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{parseFloat(payment.amount).toLocaleString()} so'm
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("acc.payments.desc")} (Hozircha to'lovlar yo'q)</p>
          )}
        </AccordionCard>
        
        <AccordionCard title={t("acc.schedule")}>
          {todaySchedule?.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((group: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{group.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {group.course?.name} • {group.room?.name}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                    {group.start_time}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Bugun uchun rejalashtirilgan darslar yo'q.</p>
          )}
        </AccordionCard>
      </div>
    </div>
  );
}
