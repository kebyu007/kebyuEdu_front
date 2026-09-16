"use client";

import StatCard from "@/components/StatCard";
import AccordionCard from "@/components/AccordionCard";
import DashboardChart from "@/components/DashboardChart";
import { GraduationCap, Users, CreditCard, AlertTriangle, Snowflake, Archive } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Greeting Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 transition-colors">
          {t("dash.hello")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">
          {t("dash.welcome")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatCard 
          title={t("stat.active_students")} 
          value="52" 
          icon={GraduationCap} 
          iconColorClass="text-blue-500 dark:text-blue-400"
        />
        <StatCard 
          title={t("stat.groups")} 
          value="23" 
          icon={Users} 
          iconColorClass="text-indigo-500 dark:text-indigo-400"
        />
        <StatCard 
          title={t("stat.monthly_payments")} 
          value="0" 
          icon={CreditCard} 
          iconColorClass="text-emerald-500 dark:text-emerald-400"
        />
        <StatCard 
          title={t("stat.debtors")} 
          value="104" 
          icon={AlertTriangle} 
          iconColorClass="text-orange-500 dark:text-orange-400"
        />
        <StatCard 
          title={t("stat.frozen")} 
          value="0" 
          icon={Snowflake} 
          iconColorClass="text-cyan-500 dark:text-cyan-400"
        />
        <StatCard 
          title={t("stat.archive")} 
          value="23" 
          icon={Archive} 
          iconColorClass="text-purple-500 dark:text-purple-400"
        />
      </div>

      {/* Charts Section */}
      <div className="pt-2">
        <DashboardChart />
      </div>

      {/* Accordions Section */}
      <div className="space-y-4 pt-4">
        <AccordionCard title={t("acc.payments")}>
          <p>{t("acc.payments.desc")}</p>
        </AccordionCard>
        
        <AccordionCard title={t("acc.profit")}>
          <p>{t("acc.profit.desc")}</p>
        </AccordionCard>
        
        <AccordionCard title={t("acc.schedule")}>
          <p>{t("acc.schedule.desc")}</p>
        </AccordionCard>
      </div>
    </div>
  );
}
