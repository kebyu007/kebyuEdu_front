"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ChartData {
  name: string;
  total: number;
}

export default function DashboardChart({ data = [] }: { data?: ChartData[] }) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  if (!mounted) return <div className="h-[350px] w-full animate-pulse bg-slate-200/50 dark:bg-white/5 rounded-2xl"></div>;

  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const formatCurrency = (value: number) => {
    return `${(value / 1000000).toFixed(0)}M so'm`;
  };

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{t("chart.revenue")}</h2>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12 }}
              tickFormatter={formatCurrency}
              width={80}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#0f1523' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderRadius: '12px',
                color: isDark ? '#fff' : '#000',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
              formatter={(value: any) => [`${(value || 0).toLocaleString()} so'm`, 'Tushum']}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#6366f1" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
