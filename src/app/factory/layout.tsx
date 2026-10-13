"use client";

import React from "react";
import { FactorySidebarProvider, FactorySidebar, useFactorySidebar } from "@/components/layout/factory/factory-sidebar";
import { FactoryHeader } from "@/components/layout/factory/factory-header";
import { FactoryBreadcrumbs } from "@/components/layout/factory/factory-breadcrumbs";
import { FactoryRouteGuard } from "@/components/layout/factory/factory-route-guard";
import { cn } from "@/lib/utils";

function FactoryMainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useFactorySidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      <FactorySidebar />
      <FactoryHeader />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[264px]"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <FactoryRouteGuard>
            <FactoryBreadcrumbs />
            {children}
          </FactoryRouteGuard>
        </div>
      </main>
    </div>
  );
}

export default function FactoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <FactorySidebarProvider>
      <FactoryMainShell>{children}</FactoryMainShell>
    </FactorySidebarProvider>
  );
}
