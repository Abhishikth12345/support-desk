"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type TicketItem } from "@/lib/api";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    setLoading(true);

    const res = await apiFetch<{
      ticket: TicketItem;
    }>("/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      }),
    });

    setLoading(false);

    if (!res.success || !res.data) {
      setError(res.message || "Failed to create ticket");
      return;
    }

    router.push(`/dashboard/tickets/${res.data.ticket._id}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-white mt-2">
          Create Support Ticket
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Provide complete issue context to route your request with strict SLA tracking
        </p>
      </div>

      <div className="bg-[#111622] p-6 sm:p-8 rounded-2xl border border-[#1f293d] shadow-sm w-full">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Title / Summary
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cannot process credit card payment"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#1f293d] bg-[#0c101a] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#1f293d] bg-[#0c101a] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#1f293d] bg-[#0c101a] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Standard issue</option>
                <option value="high">High - Feature blocked</option>
                <option value="urgent">Urgent - Outage / Critical fault</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              required
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, including reproduction steps or error messages seen..."
              className="w-full px-4 py-3 text-xs rounded-xl border border-[#1f293d] bg-[#0c101a] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-4 border-t border-[#1f293d] flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
