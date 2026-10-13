"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isFactoryPathAllowed } from "@/lib/permissions";
import { getAppUrl } from "@/lib/utils";
import { Lock, ShieldAlert, ArrowLeft, RefreshCw, Factory } from "lucide-react";

export function FactoryRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>("Floor Supervisor");
  const [userName, setUserName] = useState<string>("Suresh Yadav");

  useEffect(() => {
    setMounted(true);
    const syncUser = () => {
      try {
        const saved = localStorage.getItem("garmentflow_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role) setUserRole(parsed.role);
          if (parsed.name) setUserName(parsed.name);
        }
      } catch (e) {
        console.error(e);
      }
    };

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("garmentflow_user_changed", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("garmentflow_user_changed", syncUser);
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  const cleanPath = (pathname?.replace(/^\/mrityunjayenterprises/, "") || "/factory/dashboard").replace(/\/$/, "");
  const allowed = isFactoryPathAllowed(userRole, cleanPath);

  if (!allowed) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-8 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 uppercase tracking-wider">
            Factory Station • Module Restricted
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white pt-2">
            Department Permission Required
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your active role <strong className="text-slate-800 dark:text-slate-200">{userName}</strong> (<strong>{userRole}</strong>)
            does not have permission to access <code className="text-xs font-mono text-emerald-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{pathname}</code>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 text-left space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert size={14} /> Department Segmentation Policy:
          </p>
          <p>
            Factory floor workstations segment access so that HR, Accounts, Quality, Store and Production teams only see their authorized operational workflows.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/factory/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Factory Dashboard
          </Link>
          <button
            onClick={() => {
              window.location.href = getAppUrl("/");
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={14} /> Switch User Role
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
