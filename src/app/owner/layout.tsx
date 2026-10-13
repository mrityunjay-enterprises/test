"use client";

import React from "react";
import { OwnerSidebarProvider, OwnerSidebar, useOwnerSidebar } from "@/components/layout/owner/owner-sidebar";
import { OwnerHeader } from "@/components/layout/owner/owner-header";
import { OwnerBreadcrumbs } from "@/components/layout/owner/owner-breadcrumbs";
import { OwnerRouteGuard } from "@/components/layout/owner/owner-route-guard";
import { cn } from "@/lib/utils";

function OwnerMainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useOwnerSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <OwnerSidebar />
      <OwnerHeader />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[264px]"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <OwnerRouteGuard>
            <OwnerBreadcrumbs />
            {children}
          </OwnerRouteGuard>
        </div>
      </main>
    </div>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <OwnerSidebarProvider>
      <OwnerMainShell>{children}</OwnerMainShell>
    </OwnerSidebarProvider>
  );
}
