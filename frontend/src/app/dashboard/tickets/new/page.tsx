"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch, type TicketItem } from "@/lib/api";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

function NewTicketForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromAi, setFromAi] = useState(false);

  useEffect(() => {
    const qTitle = searchParams.get("title");
    const qCategory = searchParams.get("category");
    const qPriority = searchParams.get("priority");
    const qDescription = searchParams.get("description");

    if (qTitle) setTitle(qTitle);
    if (qCategory) setCategory(qCategory);
    if (qPriority) setPriority(qPriority);
    if (qDescription) setDescription(qDescription);

    if (qTitle || qDescription) {
      setFromAi(true);
    }
  }, [searchParams]);

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
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
          Create Support Ticket
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Provide complete issue context to route your request with strict SLA tracking
        </p>
      </div>

      {fromAi && (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Pre-filled from SupportDesk AI Assistant. Review the details below and submit when ready.</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#111622] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-[#1f293d] shadow-sm w-full">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
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
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-[#1f293d] bg-white dark:bg-[#0c101a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-[#1f293d] bg-white dark:bg-[#0c101a] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
              >
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-[#1f293d] bg-white dark:bg-[#0c101a] text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs"
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Standard issue</option>
                <option value="high">High - Feature blocked</option>
                <option value="urgent">Urgent - Outage / Critical fault</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              required
              rows={7}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem, including reproduction steps or error messages seen..."
              className="w-full px-4 py-3 text-xs rounded-xl border border-slate-300 dark:border-[#1f293d] bg-white dark:bg-[#0c101a] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 leading-relaxed font-sans shadow-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-[#1f293d] flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition"
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

export default function NewTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-500" />
          <span>Loading ticket workspace...</span>
        </div>
      }
    >
      <NewTicketForm />
    </Suspense>
  );
}

