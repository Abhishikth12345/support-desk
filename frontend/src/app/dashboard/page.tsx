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
import StatCard from "@/components/StatCard";
import { StatusBadge, PriorityBadge } from "@/components/Badge";
import {
  Search,
  Plus,
  RotateCcw,
  Inbox,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

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
    <div className="space-y-6 w-full">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isStaff ? "Support Triage Queue" : "My Support Tickets"}
          </h1>
          {/* <p className="text-xs text-slate-400 mt-1">
            Real-time database records &bull; Sequential atomic indexing
          </p> */}
        </div>

        <div>
          <Link
            href="/dashboard/tickets/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Full-Width Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <StatCard
          label="Total Tickets"
          value={stats.total}
          icon={Ticket}
          subtext="Total logged records"
        />
        <StatCard
          label="Open"
          value={stats.open}
          icon={AlertCircle}
          subtext="Awaiting response"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={Clock}
          subtext="Active investigation"
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          subtext="Completed tickets"
        />
      </div>

      {/* Balanced Full-Width Search & Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl border border-[#1f293d] bg-[#111622] w-full">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          {/* Expanded Search Input that fills available space */}
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket #, title, or keywords..."
              className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-[#1f293d] bg-[#0c101a] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-[#1f293d] bg-[#0c101a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="px-3 py-2 rounded-xl border border-[#1f293d] bg-[#0c101a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="px-3 py-2 rounded-xl border border-[#1f293d] bg-[#0c101a] text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="px-3 py-2 text-slate-400 hover:text-white flex items-center gap-1.5 transition rounded-xl hover:bg-[#161c2c]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Responsive Full-Width Ticket Table */}
      <div className="border border-[#1f293d] rounded-2xl bg-[#111622] overflow-hidden w-full shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">
            Loading tickets from database...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0c101a] text-slate-500 flex items-center justify-center mx-auto mb-3 border border-[#1f293d]">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">No tickets found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "all" || priorityFilter !== "all" || categoryFilter !== "all"
                ? "No tickets match your filter criteria. Try resetting filters."
                : "Your queue is currently clear. Click New Ticket to submit an issue."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1420] border-b border-[#1f293d] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Ticket ID</th>
                  <th className="py-3.5 px-5">Summary</th>
                  {isStaff && <th className="py-3.5 px-5">Customer</th>}
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2233]">
                {tickets.map((t) => (
                  <tr
                    key={t._id}
                    className="hover:bg-[#161c2c] transition group"
                  >
                    <td className="py-4 px-5 font-mono font-bold whitespace-nowrap">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="text-indigo-400 hover:underline"
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-200">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="hover:text-indigo-400 transition line-clamp-1 max-w-md"
                      >
                        {t.title}
                      </Link>
                    </td>
                    {isStaff && (
                      <td className="py-4 px-5 text-slate-300 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {t.createdBy?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-500">{t.createdBy?.email}</div>
                      </td>
                    )}
                    <td className="py-4 px-5 capitalize text-slate-300">
                      {t.category}
                    </td>
                    <td className="py-4 px-5">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-5 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/tickets/${t._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Responsive Pagination Bar */}
        <div className="p-4 border-t border-[#1f293d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing{" "}
            <span className="font-semibold text-white">
              {total === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-white">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-semibold text-white">{total}</span> tickets
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1f293d] disabled:opacity-40 hover:bg-[#161c2c] transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <span className="px-2 text-slate-400">
              Page {page} of {pages}
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1f293d] disabled:opacity-40 hover:bg-[#161c2c] transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
