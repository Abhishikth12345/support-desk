"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<UserSession | null>(null);
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadTicket = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await apiFetch<{ ticket: TicketItem }>(`/api/tickets/${id}`);
    setLoading(false);

    if (res.success && res.data) {
      setTicket(res.data.ticket);
    } else {
      setError(res.message || "Failed to load ticket details");
    }
  }, [id]);

  useEffect(() => {
    const session = getSessionUser();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);
    loadTicket();
  }, [router, loadTicket]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    setUpdating(true);
    setSuccessMsg("");
    setError("");

    const res = await apiFetch<{ ticket: TicketItem }>(`/api/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    setUpdating(false);

    if (res.success && res.data) {
      setTicket(res.data.ticket);
      setSuccessMsg(`Status updated to ${newStatus.replace("_", " ")}`);
    } else {
      setError(res.message || "Failed to update status");
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-500">Loading ticket #{id}...</div>;
  }

  if (error && !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm mb-4">
          {error}
        </div>
        <Link href="/dashboard" className="text-sm font-semibold text-indigo-600 hover:underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const isStaff = user?.role === "admin" || user?.role === "agent" || user?.role === "manager";

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm px-2.5 py-1 bg-slate-200 text-slate-800 font-bold rounded">
                {ticket.ticketNumber}
              </span>
              <span
                className={`text-xs uppercase px-2.5 py-1 rounded border font-semibold ${
                  STATUS_COLORS[ticket.status] || "bg-slate-100"
                }`}
              >
                {ticket.status.replace("_", " ")}
              </span>
              <span
                className={`text-xs uppercase px-2.5 py-1 rounded border font-semibold ${
                  PRIORITY_COLORS[ticket.priority] || "bg-slate-100"
                }`}
              >
                {ticket.priority} priority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">{ticket.title}</h1>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Issue Description
            </h3>
            <div className="prose prose-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {isStaff && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Change Ticket Status
              </h3>
              <div className="flex flex-wrap gap-2">
                {(["open", "in_progress", "pending", "resolved", "closed"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      disabled={updating || ticket.status === s}
                      onClick={() => handleStatusChange(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                        ticket.status === s
                          ? "bg-slate-900 text-white border-slate-900 cursor-default"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      } disabled:opacity-50`}
                    >
                      Mark {s.replace("_", " ")}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-sm">
            <h4 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Ticket Details
            </h4>

            <div>
              <span className="text-xs text-slate-500 block">Category</span>
              <span className="font-medium capitalize text-slate-800">{ticket.category}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Created By</span>
              <span className="font-medium text-slate-800">{ticket.createdBy?.name || "Customer"}</span>
              <span className="text-xs text-slate-500 block">{ticket.createdBy?.email}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Assigned Agent</span>
              <span className="font-medium text-slate-800">
                {ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
