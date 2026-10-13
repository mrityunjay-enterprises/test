"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Factory } from "lucide-react";

export function FactoryBreadcrumbs() {
  const pathname = usePathname() || "/factory/dashboard";
  const clean = pathname.replace(/^\/mrityunjayenterprises/, "");
  const segments = clean.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
      <Link
        href="/factory/dashboard"
        className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <Factory size={14} className="text-emerald-600" />
        <span>Factory Station</span>
      </Link>
      {segments.slice(1).map((seg, idx) => {
        const url = "/" + segments.slice(0, idx + 2).join("/");
        const isLast = idx === segments.length - 2;
        const formatted = seg.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        return (
          <React.Fragment key={url}>
            <ChevronRight size={14} className="mx-2 text-slate-400" />
            {isLast ? (
              <span className="text-slate-900 dark:text-white font-semibold">{formatted}</span>
            ) : (
              <Link href={url} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
