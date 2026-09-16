import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColorClass?: string;
}

export default function StatCard({ title, value, icon: Icon, iconColorClass = "text-indigo-500 dark:text-indigo-400" }: StatCardProps) {
  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white/80 dark:hover:bg-white/[0.07] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:border-slate-300 dark:hover:border-white/20 group relative overflow-hidden">
      {/* Subtle background glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-100 group-hover:to-purple-100 dark:group-hover:from-indigo-500/10 dark:group-hover:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl -z-10" />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4 relative z-10">
        <div className={`p-3 bg-white dark:bg-white/5 shadow-sm dark:shadow-none rounded-xl group-hover:scale-110 transition-transform duration-300 ${iconColorClass}`}>
          <Icon size={28} />
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">{title}</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight transition-colors">{value}</p>
        </div>
      </div>
    </div>
  );
}
