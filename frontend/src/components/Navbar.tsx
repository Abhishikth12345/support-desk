"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSessionUser, clearSession, type UserSession } from "@/lib/api";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setUser(getSessionUser());
  }, []);

  const handleLogout = () => {
    clearSession();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">SupportDesk</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link
                href="/dashboard"
                className="text-slate-600 hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              {user.role === "customer" && (
                <Link
                  href="/dashboard/tickets/new"
                  className="text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Create Ticket
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                <span className="inline-block text-xs uppercase px-2 py-0.5 rounded font-bold tracking-wide bg-slate-100 text-slate-600">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-700 hover:text-indigo-600 transition px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 shadow-sm transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
