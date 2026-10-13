"use client";

import { DashboardView } from "@/components/modules/dashboard/dashboard-view";

export default function OwnerDashboardPage() {
  return <DashboardView basePath="/owner" initialTab="overview" />;
}
