"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  apiFetch,
  getSessionUser,
  type UserSession,
  type TicketItem,
} from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-purple-50 text-purple-700 border-purple-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-50 text-slate-600 border-slate-200",
  medium: "bg-blue-50 text-blue-600 border-blue-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    const session = getSessionUser();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);
    loadTickets();
  }, [router]);

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    const res = await apiFetch<{ tickets: TicketItem[] }>("/api/tickets");
    setLoading(false);

    if (res.success && res.data) {
      setTickets(res.data.tickets || []);
    } else {
      setError(res.message || "Failed to load tickets");
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      const matchPriority = priorityFilter === "all" || t.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  }, [tickets, statusFilter, priorityFilter]);

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      inProgress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
    };
  }, [tickets]);

  if (!user) {
    return null;
  }

  const isStaff = user.role === "admin" || user.role === "agent" || user.role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {isStaff ? "Support Operations Dashboard" : "My Support Tickets"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Logged in as <span className="font-semibold text-slate-800">{user.name}</span> ({user.email})
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition text-sm"
          >
            <span>+</span>
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {isStaff && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</span>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open</span>
            <p className="text-2xl font-bold text-blue-900 mt-2">{stats.open}</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-sm">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">In Progress</span>
            <p className="text-2xl font-bold text-amber-900 mt-2">{stats.inProgress}</p>
          </div>
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-sm">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved</span>
            <p className="text-2xl font-bold text-emerald-900 mt-2">{stats.resolved}</p>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600 uppercase">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <button
          onClick={loadTickets}
          className="text-xs font-medium text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-50 transition"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-slate-800">No tickets found</p>
            <p className="text-sm text-slate-500 mt-1">
              {statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters."
                : "Submit a new ticket to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Title</th>
                  {isStaff && <th className="py-3.5 px-4">Customer</th>}
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    {isStaff && (
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{t.createdBy?.name || "Unknown"}</div>
                        <div className="text-xs text-slate-500">{t.createdBy?.email}</div>
                      </td>
                    )}
                    <td className="py-3 px-4 capitalize text-slate-600">{t.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs uppercase px-2 py-0.5 rounded border ${
                          PRIORITY_COLORS[t.priority] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs uppercase px-2 py-0.5 rounded border font-medium ${
                          STATUS_COLORS[t.status] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
