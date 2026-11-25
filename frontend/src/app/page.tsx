"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSessionUser } from "@/lib/api";
import {
  Headphones,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Inbox,
  Filter,
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
    <div className="min-h-screen flex flex-col bg-[#0a0e17] text-[#f3f4f6]">
      {/* Header */}
      <header className="border-b border-[#1f293d] bg-[#0e131f]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-600/30">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              SupportDesk
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3.5 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#161c2c] transition"
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

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 sm:px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-900/60 bg-indigo-950/40 text-xs font-medium text-indigo-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Support Operations Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Support operations,{" "}
            <span className="text-indigo-400">simplified.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A focused issue management workspace for customer support teams. Track tickets, assign specialists, and resolve requests through a structured workflow.
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
              className="px-5 py-2.5 rounded-xl border border-[#1f293d] bg-[#111622] hover:bg-[#161c2c] text-slate-200 font-semibold text-sm transition"
            >
              Sign In to Portal
            </Link>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto border-t border-[#1f293d]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#1f293d] bg-[#111622]">
              <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-900/50">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Structured Triage</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Log tickets with priority levels, categories, and atomic sequential IDs for clear traceability.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#1f293d] bg-[#111622]">
              <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-900/50">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Role-Based Access</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Enforce explicit boundaries between Customers, Support Agents, and Administrators.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#1f293d] bg-[#111622]">
              <div className="w-9 h-9 rounded-xl bg-indigo-950/80 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-900/50">
                <Filter className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Real-Time Queue</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Filter by status, priority, or category with server-side pagination directly from MongoDB.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f293d] py-6 bg-[#0e131f] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SupportDesk</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-white transition">
              Register
            </Link>
            <Link href="/forgot-password" className="hover:text-white transition">
              Password Recovery
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
