// ============================================================================
// GarmentFlow ERP — Factory & Department Operational Service Abstraction
// ============================================================================
// Isolates shop-floor workstation metrics, hourly line tracking, cutting logs,
// shift operations, and department data-entry workflows.
// Designed to run locally on factory servers or LAN in the future architecture.

import { productionLines, dashboardData } from "@/lib/demo-data";

export interface ShiftInfo {
  shiftCode: string;
  shiftName: string;
  timing: string;
  activePlant: string;
  floorSupervisor: string;
  activeOperators: number;
  activeHelpers: number;
  totalPresent: number;
}

export interface LineFloorMetric {
  id: string;
  name: string;
  type: string;
  assignedOrder: string;
  styleName: string;
  operatorCount: number;
  hourlyTarget: number;
  todayTarget: number;
  todayOutput: number;
  efficiency: number;
  downtimeMinutes: number;
  status: "running" | "changeover" | "idle" | "break";
}

export interface CuttingTableStatus {
  tableNumber: string;
  tableType: string;
  currentOrder: string;
  styleName: string;
  pliesCut: number;
  piecesCut: number;
  markerEfficiency: number;
  status: "Spreading" | "Cutting" | "Bundling" | "Idle";
}

export interface FloorQCAlert {
  id: string;
  line: string;
  defectType: string;
  count: number;
  severity: "critical" | "high" | "medium";
  actionRequired: string;
  reportedAt: string;
}

export const factoryService = {
  getCurrentShift(): ShiftInfo {
    return {
      shiftCode: "SHIFT-A",
      shiftName: "Morning General Shift",
      timing: "08:00 AM – 04:30 PM",
      activePlant: "Mrityunjay Enterprises (Palri, Bhilwara)",
      floorSupervisor: "Suresh Yadav",
      activeOperators: 142,
      activeHelpers: 38,
      totalPresent: 180,
    };
  },

  getFactoryDashboardMetrics() {
    return {
      todayShiftTarget: 4100,
      actualOutputSoFar: 3420,
      completionRate: 83.4,
      productionEfficiency: 78.5,
      activeLinesCount: 5,
      totalLinesCount: 6,
      currentDowntimeMin: 45,
      defectRatePercent: 2.4,
      wipBundlesOnFloor: 340,
      workersPresentToday: 180,
      absenteeismRate: 5.8,
    };
  },

  getActiveLines(): LineFloorMetric[] {
    return [
      {
        id: "l1",
        name: "Line 1 (Woven Tops)",
        type: "Woven Shirts",
        assignedOrder: "ORD-2025-0001",
        styleName: "Classic Oxford Button-Down Shirt",
        operatorCount: 26,
        hourlyTarget: 95,
        todayTarget: 760,
        todayOutput: 690,
        efficiency: 90.8,
        downtimeMinutes: 10,
        status: "running",
      },
      {
        id: "l2",
        name: "Line 2 (Dresses & Bottoms)",
        type: "Lightweight Dresses",
        assignedOrder: "ORD-2025-0002",
        styleName: "Floral Print Maxi Dress",
        operatorCount: 30,
        hourlyTarget: 80,
        todayTarget: 640,
        todayOutput: 580,
        efficiency: 90.6,
        downtimeMinutes: 15,
        status: "running",
      },
      {
        id: "l3",
        name: "Line 3 (Pants & Trousers)",
        type: "Chinos & Trousers",
        assignedOrder: "ORD-2025-0003",
        styleName: "Slim Fit Chino Pants",
        operatorCount: 28,
        hourlyTarget: 75,
        todayTarget: 600,
        todayOutput: 510,
        efficiency: 85.0,
        downtimeMinutes: 20,
        status: "running",
      },
      {
        id: "l4",
        name: "Line 4 (Basic Tees & Polos)",
        type: "Circular Knits",
        assignedOrder: "ORD-2025-0004",
        styleName: "Cotton Crew Neck T-Shirt",
        operatorCount: 24,
        hourlyTarget: 130,
        todayTarget: 1040,
        todayOutput: 960,
        efficiency: 92.3,
        downtimeMinutes: 0,
        status: "running",
      },
      {
        id: "l5",
        name: "Line 5 (Kids Casuals)",
        type: "Printed Jersey",
        assignedOrder: "ORD-2025-0005",
        styleName: "Kids Graphic Tee & Shorts",
        operatorCount: 22,
        hourlyTarget: 110,
        todayTarget: 880,
        todayOutput: 680,
        efficiency: 77.2,
        downtimeMinutes: 0,
        status: "running",
      },
      {
        id: "l6",
        name: "Line 6 (Sampling & Short Runs)",
        type: "Pre-Production",
        assignedOrder: "ORD-2025-0006",
        styleName: "Linen Camp Collar Shirt",
        operatorCount: 12,
        hourlyTarget: 30,
        todayTarget: 180,
        todayOutput: 0,
        efficiency: 0,
        downtimeMinutes: 0,
        status: "changeover",
      },
    ];
  },

  getCuttingTables(): CuttingTableStatus[] {
    return [
      {
        tableNumber: "Table 1 (Manual 24m)",
        tableType: "End-to-End Spreading",
        currentOrder: "ORD-2025-0001",
        styleName: "Oxford Button-Down",
        pliesCut: 48,
        piecesCut: 2400,
        markerEfficiency: 88.6,
        status: "Cutting",
      },
      {
        tableNumber: "Table 2 (Auto Spreader)",
        tableType: "Automatic Tension-Free",
        currentOrder: "ORD-2025-0002",
        styleName: "Floral Maxi Dress",
        pliesCut: 32,
        piecesCut: 1200,
        markerEfficiency: 89.2,
        status: "Spreading",
      },
      {
        tableNumber: "Table 3 (Band Knife)",
        tableType: "Precision Bundling",
        currentOrder: "ORD-2025-0004",
        styleName: "Crew Neck T-Shirt",
        pliesCut: 60,
        piecesCut: 3000,
        markerEfficiency: 91.4,
        status: "Bundling",
      },
      {
        tableNumber: "Table 4 (Laser/Plotter)",
        tableType: "Pattern Plotting",
        currentOrder: "ORD-2025-0003",
        styleName: "Slim Fit Chinos",
        pliesCut: 40,
        piecesCut: 1800,
        markerEfficiency: 87.8,
        status: "Idle",
      },
    ];
  },

  getFloorQCAlerts(): FloorQCAlert[] {
    return [
      {
        id: "qc-1",
        line: "Line 3",
        defectType: "Uneven pocket stitch margin",
        count: 7,
        severity: "medium",
        actionRequired: "Operator needle guide adjustment",
        reportedAt: "11:15 AM",
      },
      {
        id: "qc-2",
        line: "Line 5",
        defectType: "Neck rib tension distortion",
        count: 14,
        severity: "high",
        actionRequired: "Overlock differential feed recalibration",
        reportedAt: "10:45 AM",
      },
      {
        id: "qc-3",
        line: "Line 2",
        defectType: "Shade variance in lot panel #3",
        count: 4,
        severity: "critical",
        actionRequired: "Check bundle numbered sequence from Cutting",
        reportedAt: "09:30 AM",
      },
    ];
  },

  getFloorHourlyTrend() {
    return [
      { hour: "08:00 - 09:00", target: 480, actual: 440 },
      { hour: "09:00 - 10:00", target: 510, actual: 505 },
      { hour: "10:00 - 11:00", target: 520, actual: 515 },
      { hour: "11:00 - 12:00", target: 520, actual: 490 },
      { hour: "12:00 - 01:00", target: 520, actual: 530 },
      { hour: "01:00 - 02:00", target: 120, actual: 110 }, // Lunch break buffer
      { hour: "02:00 - 03:00", target: 520, actual: 485 },
      { hour: "03:00 - 04:00", target: 510, actual: 345 }, // Current hour in progress
    ];
  },
};
