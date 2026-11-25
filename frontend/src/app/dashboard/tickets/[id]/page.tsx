"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  apiFetch,
  getSessionUser,
  type UserSession,
  type TicketItem,
  type AgentUser,
} from "@/lib/api";
import { StatusBadge, PriorityBadge } from "@/components/Badge";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Check,
  UserCheck,
} from "lucide-react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";

  const [user, setUser] = useState<UserSession | null>(null);
  const [ticket, setTicket] = useState<TicketItem | null>(null);
  const [agents, setAgents] = useState<AgentUser[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadTicket = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    const res = await apiFetch<{ ticket: TicketItem }>(`/api/tickets/${id}`);
    setLoading(false);

    if (res.success && res.data) {
      setTicket(res.data.ticket);
      setSelectedAgentId(res.data.ticket.assignedTo?._id || "");
    } else {
      setError(res.message || "Failed to load ticket details");
    }
  }, [id]);

  const loadAgents = useCallback(async () => {
    const res = await apiFetch<{ agents: AgentUser[] }>("/api/admin/agents");
    if (res.success && res.data?.agents) {
      setAgents(res.data.agents);
    }
  }, []);

  useEffect(() => {
    const session = getSessionUser();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);

    if (id) {
      loadTicket();
    }

    if (session.role === "admin" || session.role === "manager") {
      loadAgents();
    }
  }, [router, id, loadTicket, loadAgents]);

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    setSuccessMsg("");
    setError("");

    const res = await apiFetch<{ ticket: TicketItem }>(`/api/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });

    setUpdatingStatus(false);

    if (res.success && res.data) {
      setTicket(res.data.ticket);
      setSuccessMsg(`Status updated to ${newStatus.replace("_", " ")}`);
    } else {
      setError(res.message || "Failed to update status");
    }
  };

  const handleAssignAgent = async () => {
    if (!ticket) return;
    setAssigning(true);
    setSuccessMsg("");
    setError("");

    const targetId = selectedAgentId === "" ? null : selectedAgentId;

    const res = await apiFetch<{ ticket: TicketItem }>(`/api/tickets/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ agentId: targetId }),
    });

    setAssigning(false);

    if (res.success && res.data) {
      setTicket(res.data.ticket);
      setSuccessMsg(
        targetId ? "Ticket successfully assigned." : "Ticket unassigned."
      );
    } else {
      setError(res.message || "Failed to update assignment");
    }
  };

  const handleClaimTicket = async () => {
    if (!ticket) return;
    setAssigning(true);
    setSuccessMsg("");
    setError("");

    const res = await apiFetch<{ ticket: TicketItem }>(`/api/tickets/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ agentId: "me" }),
    });

    setAssigning(false);

    if (res.success && res.data) {
      setTicket(res.data.ticket);
      setSelectedAgentId(res.data.ticket.assignedTo?._id || "");
      setSuccessMsg("Ticket claimed and assigned to you. Status moved to In Progress.");
    } else {
      setError(res.message || "Failed to claim ticket");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
        <span>Loading ticket details...</span>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="p-4 bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-2xl text-xs mb-4">
          {error}
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to All Tickets</span>
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";
  const isStaff = isManagerOrAdmin || user?.role === "agent";

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs px-2.5 py-1 bg-slate-100 dark:bg-[#111622] text-slate-800 dark:text-white font-bold rounded-lg border border-slate-300 dark:border-[#1f293d]">
              {ticket.ticketNumber}
            </span>
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Created on {new Date(ticket.createdAt).toLocaleDateString()}
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">
          {ticket.title}
        </h1>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Main Content (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#111622] p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-[#1f293d] shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Issue Context &amp; Description
            </h3>
            <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {ticket.description}
            </div>
          </div>

          {/* Status Update (Staff only) */}
          {isStaff && (
            <div className="bg-white dark:bg-[#111622] p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d] shadow-sm space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Update Status Lifecycle
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(["open", "in_progress", "pending", "resolved", "closed"] as const).map((s) => {
                  const isCurrent = ticket.status === s;
                  return (
                    <button
                      key={s}
                      disabled={updatingStatus || isCurrent}
                      onClick={() => handleStatusChange(s)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                        isCurrent
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 dark:bg-[#0c101a] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#1f293d] hover:bg-slate-100 dark:hover:bg-[#161c2c]"
                      } disabled:opacity-50`}
                    >
                      {s.replace("_", " ").toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assignment Section (Staff: Admin, Manager, Agent) */}
          {isStaff && (
            <div className="bg-white dark:bg-[#111622] p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d] shadow-sm space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Ticket Assignment &amp; Ownership</span>
                </h3>
                {ticket.assignedTo?._id !== user?.id && (
                  <button
                    disabled={assigning}
                    onClick={handleClaimTicket}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-600/20 dark:hover:bg-indigo-600 dark:border-indigo-500/40 dark:text-indigo-300 dark:hover:text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-xs"
                  >
                    <span>⚡ Claim Ticket (Assign to Me)</span>
                  </button>
                )}
              </div>

              {isManagerOrAdmin && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-[#1f293d] bg-white dark:bg-[#0c101a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="">-- Unassigned --</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.role} - {agent.email})
                      </option>
                    ))}
                  </select>

                  <button
                    disabled={assigning}
                    onClick={handleAssignAgent}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 whitespace-nowrap shadow-sm shadow-indigo-600/20"
                  >
                    {assigning ? "Saving..." : "Save Assignee"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Metadata (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#111622] p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d] shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#1f293d] pb-3">
              Ticket Information
            </h4>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                Category
              </span>
              <span className="font-medium capitalize text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded bg-slate-100 dark:bg-[#0c101a] border border-slate-300 dark:border-[#1f293d] inline-block">
                {ticket.category}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                Reported By
              </span>
              <div className="font-semibold text-slate-900 dark:text-white">
                {ticket.createdBy?.name || "Customer"}
              </div>
              <div className="text-[11px] text-slate-500">{ticket.createdBy?.email}</div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                Assigned Specialist
              </span>
              {ticket.assignedTo ? (
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {ticket.assignedTo.name}
                  </div>
                  <div className="text-[11px] text-slate-500">{ticket.assignedTo.email}</div>
                </div>
              ) : (
                <span className="text-slate-500 italic">Unassigned</span>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#1f293d] text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(ticket.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Updated:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
