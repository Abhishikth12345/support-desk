"use client";

export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

const STATUS_MAP: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  open: {
    label: "Open",
    dot: "bg-amber-500",
    badge:
      "bg-amber-50 text-amber-900 border-amber-300/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-600",
    badge:
      "bg-blue-50 text-blue-900 border-blue-300/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
  },
  pending: {
    label: "Pending",
    dot: "bg-purple-600",
    badge:
      "bg-purple-50 text-purple-900 border-purple-300/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-600",
    badge:
      "bg-emerald-50 text-emerald-900 border-emerald-300/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  closed: {
    label: "Closed",
    dot: "bg-slate-500",
    badge:
      "bg-slate-100 text-slate-800 border-slate-300/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
};

const PRIORITY_MAP: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700",
  medium:
    "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60 font-semibold",
  high: "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 font-semibold",
  urgent:
    "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60 font-bold tracking-wide",
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] || {
    label: status.replace("_", " "),
    dot: "bg-slate-500",
    badge:
      "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap shadow-xs ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{cfg.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls =
    PRIORITY_MAP[priority] ||
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

  return (
    <span
      className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded border whitespace-nowrap shadow-xs ${cls}`}
    >
      {priority}
    </span>
  );
}
