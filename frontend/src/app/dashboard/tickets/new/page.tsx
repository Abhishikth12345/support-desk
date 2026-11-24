"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type TicketItem } from "@/lib/api";

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
        title,
        description,
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
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Submit Support Ticket</h1>
        <p className="text-sm text-slate-600">Provide complete details to help us assist you</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Issue Summary / Title
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cannot process credit card payment"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="general">General</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Urgency / Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
              >
                <option value="low">Low (General question)</option>
                <option value="medium">Medium (Standard request)</option>
                <option value="high">High (Service impaired)</option>
                <option value="urgent">Urgent (Critical blocker)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Detailed Description
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the issue in detail, including steps to reproduce and any error messages seen..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
