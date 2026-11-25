"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";

const PREVIEW_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export default function Home() {
  const router = useRouter();
  const [activePreviewStatus, setActivePreviewStatus] = useState<string>("in_progress");

  useEffect(() => {
    const user = getSessionUser();
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              SD
            </div>
            <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-white">
              SupportDesk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-medium px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-medium px-3.5 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 mb-6 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Issue Tracking &amp; Resolution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
            Support operations, streamlined.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A focused issue management system built for customer support teams. Track tickets, maintain accountability, and resolve requests through a structured workflow.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm transition"
            >
              Sign In to Portal
            </Link>
          </div>

          <div className="mt-16 text-left border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
                  Interactive Preview (Illustrative Mockup)
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                  Sample Support Ticket Lifecycle
                </p>
              </div>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                SD-2026-00042
              </span>
            </div>

            <div className="py-4">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                Invoice generation returns HTTP 500 on export
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                When customer attempts to download PDF statement for billing period November 2026, the worker process times out after 30 seconds.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Preview state:</span>
                <div className="flex gap-1">
                  {PREVIEW_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => setActivePreviewStatus(status)}
                      className={`text-xs px-2.5 py-1 rounded border capitalize transition ${
                        activePreviewStatus === status
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white font-medium"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-xs text-slate-400">Illustrative preview only</span>
            </div>
          </div>
        </section>

        <section className="py-16 border-t border-slate-200 dark:border-slate-800 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Engineered for reliability and clarity
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every ticket is stored directly in MongoDB with strict validation and access control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900">
              <div className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase font-semibold">01 / Sequential IDs</div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mt-2">Atomic Numbering</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Tickets receive sequential, collision-free identifiers (SD-2026-XXXXX) backed by MongoDB atomic increment operations.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900">
              <div className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase font-semibold">02 / Segregation</div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mt-2">Role-Based Access</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Customers view only their own records, while support agents and administrators manage assignment and resolution across the queue.
              </p>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900">
              <div className="text-indigo-600 dark:text-indigo-400 font-mono text-xs uppercase font-semibold">03 / State Engine</div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mt-2">Controlled Lifecycle</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Tickets move reliably through open, in-progress, pending, resolved, and closed states with server-validated permissions.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">SupportDesk</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-800 dark:hover:text-slate-200">Sign In</Link>
            <Link href="/register" className="hover:text-slate-800 dark:hover:text-slate-200">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
