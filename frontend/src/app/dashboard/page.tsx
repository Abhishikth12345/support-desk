"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  apiFetch,
  getSessionUser,
  type UserSession,
  type TicketItem,
  type TicketStats,
  type PaginatedTicketsResponse,
} from "@/lib/api";

const STATUS_BADGES: Record<string, string> = {
  open: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  pending: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  closed: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

const PRIORITY_BADGES: Record<string, string> = {
  low: "text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  medium: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  high: "text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900",
  urgent: "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 font-semibold",
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    pending: 0,
    resolved: 0,
    closed: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const session = getSessionUser();
    setUser(session);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const loadStats = useCallback(async () => {
    const res = await apiFetch<{ stats: TicketStats }>("/api/tickets/stats");
    if (res.success && res.data?.stats) {
      setStats(res.data.stats);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);

    const res = await apiFetch<PaginatedTicketsResponse>(`/api/tickets?${params.toString()}`);
    setLoading(false);

    if (res.success && res.data) {
      setTickets(res.data.tickets || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } else {
      setError(res.message || "Failed to load tickets");
    }
  }, [page, debouncedSearch, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const isStaff = user?.role === "admin" || user?.role === "agent" || user?.role === "manager";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isStaff ? "Ticket Management Queue" : "My Support Tickets"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time database records &bull; Sequential atomic indexing
          </p>
        </div>

        <div>
          <Link
            href="/dashboard/tickets/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-xs shadow-sm transition"
          >
            <span>+</span>
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Tickets
          </span>
          <p className="text-2xl font-semibold text-slate-950 dark:text-white mt-1">
            {stats.total}
          </p>
        </div>

        <div className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Open
          </span>
          <p className="text-2xl font-semibold text-blue-950 dark:text-blue-100 mt-1">
            {stats.open}
          </p>
        </div>

        <div className="p-4 rounded-lg border border-amber-100 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
            In Progress
          </span>
          <p className="text-2xl font-semibold text-amber-950 dark:text-amber-100 mt-1">
            {stats.inProgress}
          </p>
        </div>

        <div className="p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
          <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Resolved
          </span>
          <p className="text-2xl font-semibold text-emerald-950 dark:text-emerald-100 mt-1">
            {stats.resolved}
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, title, or keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="general">General</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
                setPage(1);
              }}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-md">
          {error}
        </div>
      )}

      <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No tickets found</p>
            <p className="text-xs text-slate-500 mt-1">
              {search || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
                ? "Try clearing filters or search term."
                : "Submit a ticket to start tracking issues."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Summary</th>
                  {isStaff && <th className="py-3 px-4">Customer</th>}
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="py-3 px-4 font-mono font-medium whitespace-nowrap">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {t.title}
                    </td>
                    {isStaff && (
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {t.createdBy?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-400">{t.createdBy?.email}</div>
                      </td>
                    )}
                    <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-300">
                      {t.category}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[11px] uppercase px-2 py-0.5 rounded border ${
                          PRIORITY_BADGES[t.priority] || "text-slate-500"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[11px] uppercase px-2 py-0.5 rounded border font-medium ${
                          STATUS_BADGES[t.status] || "bg-slate-100"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
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

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {total === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-medium text-slate-700 dark:text-slate-300">{total}</span> tickets
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Prev
            </button>
            <span className="px-2 text-slate-600 dark:text-slate-400">
              Page {page} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
