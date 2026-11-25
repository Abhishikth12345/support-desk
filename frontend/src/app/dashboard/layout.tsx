"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSessionUser, type UserSession } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Menu, Loader2, ShieldCheck } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = getSessionUser();
    if (!session) {
      router.replace("/login");
      return;
    }
    setUser(session);
  }, [router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e17] text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Loading workspace session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#f3f4f6] flex flex-col">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Header with Breadcrumbs & Role Indicator */}
        <header className="h-16 border-b border-[#1f293d] bg-[#0c101a]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#151c2c] transition"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">Role:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
              <ShieldCheck className="w-3 h-3" />
              <span>{user.role}</span>
            </span>
          </div>
        </header>

        {/* Full-Width Fluid Main Workspace */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
