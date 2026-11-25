"use client";

export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

const STATUS_MAP: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  open: {
    label: "Open",
    dot: "bg-amber-400",
    badge: "bg-amber-950/40 text-amber-300 border-amber-900/50",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-400",
    badge: "bg-blue-950/40 text-blue-300 border-blue-900/50",
  },
  pending: {
    label: "Pending",
    dot: "bg-purple-400",
    badge: "bg-purple-950/40 text-purple-300 border-purple-900/50",
  },
  resolved: {
    label: "Resolved",
    dot: "bg-emerald-400",
    badge: "bg-emerald-950/40 text-emerald-300 border-emerald-900/50",
  },
  closed: {
    label: "Closed",
    dot: "bg-slate-400",
    badge: "bg-slate-800 text-slate-300 border-slate-700",
  },
};

const PRIORITY_MAP: Record<string, string> = {
  low: "bg-slate-800 text-slate-400 border-slate-700",
  medium: "bg-sky-950/40 text-sky-300 border-sky-900/50",
  high: "bg-amber-950/40 text-amber-300 border-amber-900/50",
  urgent: "bg-rose-950/40 text-rose-300 border-rose-900/50 font-semibold",
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] || {
    label: status.replace("_", " "),
    dot: "bg-slate-400",
    badge: "bg-slate-800 text-slate-400 border-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full border whitespace-nowrap ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span>{cfg.label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_MAP[priority] || "bg-slate-800 text-slate-400 border-slate-700";

  return (
    <span
      className={`inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${cls}`}
    >
      {priority}
    </span>
  );
}
