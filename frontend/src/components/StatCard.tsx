"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  subtext?: string;
}

export default function StatCard({ label, value, icon: Icon, subtext }: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#111622] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {label}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
