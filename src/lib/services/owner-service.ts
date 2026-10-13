// ============================================================================
// GarmentFlow ERP — Owner & Executive Management Service Abstraction
// ============================================================================
// Isolates business-level analytics, company-wide rollups, financials,
// and executive monitoring from shop-floor operations.
// Ready for cloud backend API integration in the future architecture.

import { dashboardData, orders, invoices, employees, inventoryItems } from "@/lib/demo-data";
import { getStoredOrders } from "@/lib/workflow-service";

export interface OwnerKPIs {
  totalOrders: number;
  activeOrders: number;
  todayProduction: number;
  pendingProduction: number;
  totalEmployees: number;
  attendancePercent: number;
  lowStockItemsCount: number;
  totalSales: number;
  totalExpenses: number;
  receivables: number;
  payables: number;
  productionEfficiency: number;
  onTimeDeliveryRate: number;
  grossMarginPercent: number;
}

export interface DepartmentScorecard {
  name: string;
  lead: string;
  headcount: number;
  performanceScore: number;
  status: "optimal" | "warning" | "critical";
  metric: string;
  metricValue: string;
}

export interface MultiUnitSummary {
  unitId: string;
  unitName: string;
  location: string;
  focus: string;
  activeLines: number;
  dailyTarget: number;
  todayOutput: number;
  efficiency: number;
  workersPresent: number;
}

export const ownerService = {
  getOwnerDashboardMetrics(): OwnerKPIs {
    const liveOrders = getStoredOrders();
    const active = liveOrders.filter(o => !["completed", "cancelled", "delivered"].includes(o.status)).length;
    
    // Calculate financial rollups from mock data
    const totalSales = 48250000; // INR 4.82 Cr pipeline
    const totalExpenses = 36187500; // INR 3.61 Cr expenses
    const receivables = 7450000; // INR 74.5 L pending from buyers
    const payables = 4120000; // INR 41.2 L to suppliers & job workers

    return {
      totalOrders: liveOrders.length > 0 ? liveOrders.length : dashboardData.kpis.totalOrders,
      activeOrders: active > 0 ? active : dashboardData.kpis.ordersInProduction,
      todayProduction: dashboardData.kpis.actualProductionToday,
      pendingProduction: 18450, // pcs scheduled across cutting/stitching
      totalEmployees: employees.length,
      attendancePercent: dashboardData.kpis.workerAttendance,
      lowStockItemsCount: 3,
      totalSales,
      totalExpenses,
      receivables,
      payables,
      productionEfficiency: dashboardData.kpis.productionEfficiency,
      onTimeDeliveryRate: 98.4,
      grossMarginPercent: dashboardData.kpis.estimatedMargin,
    };
  },

  getDepartmentPerformance(): DepartmentScorecard[] {
    return [
      {
        name: "Cutting & Pattern",
        lead: "Rajendra Singh",
        headcount: 24,
        performanceScore: 92,
        status: "optimal",
        metric: "Marker Efficiency",
        metricValue: "88.6%",
      },
      {
        name: "Stitching Lines",
        lead: "Suresh Yadav",
        headcount: 142,
        performanceScore: 84,
        status: "optimal",
        metric: "Line Output vs Target",
        metricValue: "3,420 / 4,100 pcs",
      },
      {
        name: "Finishing & Pressing",
        lead: "Ramu Lal",
        headcount: 32,
        performanceScore: 89,
        status: "optimal",
        metric: "Hourly Steam Rate",
        metricValue: "420 pcs/hr",
      },
      {
        name: "Quality Assurance (QC)",
        lead: "Kavita Sharma",
        headcount: 18,
        performanceScore: 96,
        status: "optimal",
        metric: "AQL Pass Rate",
        metricValue: "97.6%",
      },
      {
        name: "Packing & Cartons",
        lead: "Dinesh Meena",
        headcount: 22,
        performanceScore: 91,
        status: "optimal",
        metric: "Cartons Scanned",
        metricValue: "640 boxes",
      },
      {
        name: "Dispatch & Logistics",
        lead: "Vikram Rathore",
        headcount: 12,
        performanceScore: 98,
        status: "optimal",
        metric: "On-Time Shipments",
        metricValue: "100%",
      },
      {
        name: "Inventory & Stores",
        lead: "Rajendra Singh",
        headcount: 16,
        performanceScore: 78,
        status: "warning",
        metric: "Reorder Backlog",
        metricValue: "3 Critical Rolls",
      },
      {
        name: "Merchandising & Sourcing",
        lead: "Meera Joshi",
        headcount: 14,
        performanceScore: 94,
        status: "optimal",
        metric: "Sample Turnaround",
        metricValue: "4.2 Days",
      },
      {
        name: "Finance & Accounts",
        lead: "Priyanka Tiwari",
        headcount: 8,
        performanceScore: 95,
        status: "optimal",
        metric: "GST Compliance & ITC",
        metricValue: "100% Filed",
      },
      {
        name: "HR & Workforce",
        lead: "Sunita Verma",
        headcount: 6,
        performanceScore: 88,
        status: "optimal",
        metric: "Attendance Rate",
        metricValue: "94.2%",
      },
    ];
  },

  getMultiUnitOverview(): MultiUnitSummary[] {
    return [
      {
        unitId: "f1",
        unitName: "Mrityunjay Enterprises",
        location: "Palri, Bhilwara (RJ)",
        focus: "Apparel & Garment Manufacturing, Stitching, Finishing",
        activeLines: 6,
        dailyTarget: 4100,
        todayOutput: 3420,
        efficiency: 83.4,
        workersPresent: 294,
      },
    ];
  },

  getLowStockAlerts() {
    return [
      { id: "alt-1", item: "Oxford Cotton - White", severity: "Critical", currentStock: "400m", minRequired: "1,200m", action: "Reorder Placed" },
      { id: "alt-2", item: "Polyester Sewing Thread (40/2 Navy)", severity: "Low", currentStock: "15 cones", minRequired: "50 cones", action: "PO Drafted" },
      { id: "alt-3", item: "Brass Zippers #5 YKK", severity: "Low", currentStock: "280 pcs", minRequired: "1,000 pcs", action: "Under Review" },
    ];
  },

  getRecentInvoices() {
    return invoices.slice(0, 5);
  },

  getRecentActivity() {
    return dashboardData.recentActivity.map((a, idx) => ({
      id: `act-${idx}`,
      title: `${a.action}: ${a.detail}`,
      user: a.user,
      time: a.time,
      type: a.type,
    }));
  },
};
