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

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

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
    loadTicket();

    if (session.role === "admin" || session.role === "manager") {
      loadAgents();
    }
  }, [router, loadTicket, loadAgents]);

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

  if (loading) {
    return <div className="py-16 text-center text-xs text-slate-500">Loading ticket #{id}...</div>;
  }

  if (error && !ticket) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-lg text-xs mb-4">
          {error}
        </div>
        <Link href="/dashboard" className="text-xs font-medium text-indigo-600 hover:underline">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const isManagerOrAdmin = user?.role === "admin" || user?.role === "manager";
  const isStaff = isManagerOrAdmin || user?.role === "agent";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          &larr; Back to Dashboard
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold rounded">
              {ticket.ticketNumber}
            </span>
            <span
              className={`text-[11px] uppercase px-2 py-0.5 rounded border font-medium ${
                STATUS_BADGES[ticket.status] || "bg-slate-100"
              }`}
            >
              {ticket.status.replace("_", " ")}
            </span>
            <span
              className={`text-[11px] uppercase px-2 py-0.5 rounded border font-medium ${
                PRIORITY_BADGES[ticket.priority] || "border-slate-200"
              }`}
            >
              {ticket.priority} priority
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
          {ticket.title}
        </h1>
      </div>

      {successMsg && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs rounded-md">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Issue Description
            </h3>
            <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {isStaff && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Update Status
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(["open", "in_progress", "pending", "resolved", "closed"] as const).map((s) => (
                  <button
                    key={s}
                    disabled={updatingStatus || ticket.status === s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition ${
                      ticket.status === s
                        ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                    } disabled:opacity-50`}
                  >
                    Mark {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isManagerOrAdmin && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Assign Ticket to Agent (Admin/Manager)
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name} ({agent.role} - {agent.email})
                    </option>
                  ))}
                </select>

                <button
                  disabled={assigning}
                  onClick={handleAssignAgent}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium shadow-sm transition disabled:opacity-50"
                >
                  {assigning ? "Updating..." : "Save Assignee"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 text-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Metadata
            </h4>

            <div>
              <span className="text-[11px] text-slate-400 block">Category</span>
              <span className="font-medium capitalize text-slate-800 dark:text-slate-200">
                {ticket.category}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Reported By</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {ticket.createdBy?.name || "Customer"}
              </span>
              <span className="text-[11px] text-slate-400 block">{ticket.createdBy?.email}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Assigned Agent</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
              </span>
              {ticket.assignedTo?.email && (
                <span className="text-[11px] text-slate-400 block">{ticket.assignedTo.email}</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(ticket.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
