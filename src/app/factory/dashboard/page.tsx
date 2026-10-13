"use client";

import { DashboardView } from "@/components/modules/dashboard/dashboard-view";

export default function FactoryDashboardPage() {
  return <DashboardView basePath="/factory" initialTab="production" />;
}
