"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Headphones,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Inbox,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getSessionUser();
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0e17] text-slate-900 dark:text-[#f3f4f6]">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-[#1f293d] bg-white/80 dark:bg-[#0c101a]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-600/30">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              SupportDesk
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#161c2c] transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Customer Support &amp; Issue Resolution Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Customer support,{" "}
            <span className="text-indigo-600 dark:text-indigo-400">engineered for clarity.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A fast, focused workspace built for submitting issues, collaborating with dedicated agents, and tracking every request through to verified resolution.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#111622] hover:bg-slate-50 dark:hover:bg-[#161c2c] text-slate-800 dark:text-slate-200 font-semibold text-sm transition shadow-xs"
            >
              Sign In to Portal
            </Link>
          </div>
        </section>

        {/* User-Centric Value Pillars */}
        <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-200 dark:border-[#1f293d]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#111622] shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-900/50">
                <Inbox className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fast Issue Submission</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Submit support requests with clear priority levels and categories, ensuring your issue routes to the right specialist without delays.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#111622] shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-900/50">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role-Based Access</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dedicated workspaces for customers to track their tickets, and specialized tools for support agents and team managers to triage issues.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-[#1f293d] bg-white dark:bg-[#111622] shadow-xs hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 border border-indigo-200 dark:border-indigo-900/50">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Resolution Tracking</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Follow ticket status in real time as specialists investigate, provide updates, and resolve requests with full accountability.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1f293d] py-6 bg-white dark:bg-[#0c101a] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-300">SupportDesk</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition">
              Sign In
            </Link>
            <Link href="/register" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition">
              Register
            </Link>
            <Link href="/forgot-password" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition">
              Password Recovery
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
