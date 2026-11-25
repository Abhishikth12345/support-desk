"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, type UserSession } from "@/lib/api";
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Headphones,
  X,
  User,
} from "lucide-react";

interface SidebarProps {
  user: UserSession;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const navLinks = [
    {
      label: "All Tickets",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Create Ticket",
      href: "/dashboard/tickets/new",
      icon: PlusCircle,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0c101a] border-r border-[#1f293d] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#1f293d]">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              SupportDesk
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspace
          </div>
          {navLinks.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-[#161f30] text-white border border-[#23314d]"
                    : "text-slate-400 hover:bg-[#121824] hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-3 border-t border-[#1f293d]">
          <div className="p-3 rounded-xl bg-[#111622] border border-[#1f293d] mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-900/50">
                {user.role}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 truncate">
              {user.email}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
