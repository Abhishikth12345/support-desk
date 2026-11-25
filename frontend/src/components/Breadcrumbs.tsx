"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
}

export default function Breadcrumbs({ customItems }: BreadcrumbsProps) {
  const pathname = usePathname();

  let items: BreadcrumbItem[] = [];

  if (customItems && customItems.length > 0) {
    items = customItems;
  } else {
    // Generate breadcrumbs from path
    const parts = pathname.split("/").filter(Boolean);
    items.push({ label: "Dashboard", href: "/dashboard" });

    if (parts.length > 1) {
      if (parts[1] === "tickets") {
        if (parts[2] === "new") {
          items.push({ label: "Tickets", href: "/dashboard" });
          items.push({ label: "Create Ticket" });
        } else if (parts[2]) {
          items.push({ label: "Tickets", href: "/dashboard" });
          items.push({ label: "Ticket Details" });
        }
      }
    } else {
      items.push({ label: "All Tickets" });
    }
  }

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-white transition flex items-center gap-1 text-slate-400"
              >
                {index === 0 && <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={isLast ? "text-white font-semibold" : "text-slate-400"}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
