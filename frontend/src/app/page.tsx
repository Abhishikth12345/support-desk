"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getSessionUser();
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="py-12 md:py-24 text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6">
        <span>Production Ready</span>
        <span className="text-indigo-400">|</span>
        <span>Version 1.0</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight md:leading-tight">
        Reliable Customer Support & Ticket Resolution
      </h1>

      <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
        A centralized helpdesk system designed for tracking issues, assigning tasks to agents, and resolving support requests with full accountability.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/register"
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow transition"
        >
          Create Support Account
        </Link>
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
        >
          Sign In to Portal
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base">Direct Issue Tracking</h3>
          <p className="mt-2 text-sm text-slate-600">
            Submit tickets with categorisation, urgency levels, and clear descriptions.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base">Role-Based Access</h3>
          <p className="mt-2 text-sm text-slate-600">
            Dedicated dashboards for Customers, Agents, and Administrators.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <h3 className="font-semibold text-slate-900 text-base">Live State Workflow</h3>
          <p className="mt-2 text-sm text-slate-600">
            Progress issues from Open to In-Progress, Resolved, and Closed.
          </p>
        </div>
      </div>
    </div>
  );
}
