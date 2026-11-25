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
    <div className="p-5 rounded-2xl border border-[#1f293d] bg-[#111622] flex flex-col justify-between">
      <div className="flex items-center justify-between text-slate-400 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-[#0c101a] border border-[#1f293d] text-slate-400 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {subtext && (
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
