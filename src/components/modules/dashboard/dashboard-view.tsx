"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatCurrency, formatNumber, getAppUrl } from "@/lib/utils";
import { isOwnerRole } from "@/lib/permissions";
import { dashboardData, orders as initialOrders, notifications as demoNotifications } from "@/lib/demo-data";
import { getStoredOrders, WORKFLOW_EVENT } from "@/lib/workflow-service";
import { Order } from "@/lib/types";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar
} from "recharts";
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Clock, Truck, Factory, Users, Shield, DollarSign, Target,
  ArrowUpRight, ArrowDownRight, Eye, ChevronRight, CalendarDays,
  Activity, Zap, BarChart3, Layers, Warehouse, CircleDot, Bell,
  Timer, BadgePercent, AlertCircle, PieChart as PieChartIcon,
  Scissors, Shirt, ShieldCheck, UserCheck, FileText, Check, X,
  ArrowRight, ExternalLink, RefreshCw, UserX, UserPlus, Award,
  CheckSquare, FileSpreadsheet, AlertOctagon, Plus, Boxes, Palette,
  CreditCard, Receipt, Calendar, Building2, Sparkles
} from "lucide-react";

const kd = dashboardData.kpis;

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changePositive?: boolean;
  icon: React.ReactNode;
  iconBg: string;
  suffix?: string;
  trend?: "up" | "down" | "neutral";
  onClick?: () => void;
}

function KPICard({ title, value, change, changePositive, icon, iconBg, suffix, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 cursor-pointer group",
        "hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            changePositive
              ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30"
              : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/30"
          )}>
            {changePositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {change.toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {value}{suffix && <span className="text-lg text-slate-400 ml-1">{suffix}</span>}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{title}</p>
    </div>
  );
}

function CriticalAlertItem({ severity, message, module }: { severity: string; message: string; module: string }) {
  const colors = {
    critical: "border-red-400 bg-red-50 dark:bg-red-900/20",
    high: "border-amber-400 bg-amber-50 dark:bg-amber-900/20",
    medium: "border-blue-400 bg-blue-50 dark:bg-blue-900/20",
  };
  const iconColors = {
    critical: "text-red-500",
    high: "text-amber-500",
    medium: "text-blue-500",
  };

  return (
    <div className={cn("flex gap-3 p-3 rounded-xl border-l-4", colors[severity as keyof typeof colors] || colors.medium)}>
      <AlertTriangle size={16} className={cn("flex-shrink-0 mt-0.5", iconColors[severity as keyof typeof iconColors])} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
        <p className="text-xs text-slate-500 mt-1 font-medium uppercase">{module}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    "in-stitching": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    "in-cutting": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "in-packing": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "in-finishing": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "material-procurement": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "material-planning": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "ready-for-production": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "awaiting-approval": "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
  return (
    <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap", statusStyles[status] || "bg-slate-100 text-slate-600")}>
      {status.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Tab specific data definitions
const qualityDefects = [
  { defect: "Broken Stitch", count: 48, percentage: 34, color: "#ef4444" },
  { defect: "Oil & Dirt Stain", count: 31, percentage: 22, color: "#f59e0b" },
  { defect: "Fabric Shading", count: 25, percentage: 18, color: "#3b82f6" },
  { defect: "Loose Threads", count: 20, percentage: 14, color: "#8b5cf6" },
  { defect: "Skipped Stitch", count: 17, percentage: 12, color: "#ec4899" },
];

const qualityInspectionsList = [
  { id: "QC-2025-0456", orderNo: "ORD-2025-0001", style: "Men's Denim Jacket", stage: "Inline Sewing", inspectedQty: 250, passedQty: 242, defectQty: 8, passRate: 96.8, result: "PASSED", inspector: "Kavita Sharma", time: "10:15 AM" },
  { id: "QC-2025-0455", orderNo: "ORD-2025-0002", style: "Cotton Crew Neck T-Shirt", stage: "Endline Check", inspectedQty: 500, passedQty: 475, defectQty: 25, passRate: 95.0, result: "REWORK", inspector: "Rakesh Verma", time: "09:30 AM" },
  { id: "QC-2025-0454", orderNo: "ORD-2025-0004", style: "Women's Floral Dress", stage: "Fabric Roll Inspection", inspectedQty: 1200, passedQty: 1180, defectQty: 20, passRate: 98.3, result: "PASSED", inspector: "Sunil Kumar", time: "08:45 AM" },
  { id: "QC-2025-0453", orderNo: "ORD-2025-0003", style: "Slim Fit Chino Pants", stage: "Final AQL 2.5 Audit", inspectedQty: 315, passedQty: 302, defectQty: 13, passRate: 95.8, result: "HOLD", inspector: "Kavita Sharma", time: "Yesterday" },
];

const activeCapas = [
  { id: "CAPA-2025-008", issue: "High seam puckering on Oxford Shirts (Line B)", rootCause: "Incorrect needle tension & worn presser foot", action: "Replace needle gauge set & recalibrate tension", targetDate: "2025-08-02", status: "In Progress", owner: "Rakesh Verma" },
  { id: "CAPA-2025-007", issue: "Fabric shade variation lot #4 vs approved master", rootCause: "Dye bath temperature drift at supplier mill", action: "Isolate lot #4 rolls & notify Vardhman Mill", targetDate: "2025-08-01", status: "Under Review", owner: "Sunil Kumar" },
];

const departmentAttendance = [
  { dept: "Cutting", present: 28, total: 30, rate: 93.3 },
  { dept: "Stitching", present: 132, total: 150, rate: 88.0 },
  { dept: "Quality Control", present: 23, total: 24, rate: 95.8 },
  { dept: "Finishing", present: 20, total: 22, rate: 90.9 },
  { dept: "Store / Warehouse", present: 10, total: 11, rate: 90.9 },
  { dept: "Admin & HR", present: 5, total: 5, rate: 100.0 },
];

const pendingLeaveRequests = [
  { id: "LR-104", name: "Rekha Devi", code: "GF-048", dept: "Stitching", type: "Sick Leave", dates: "28 - 29 Jul (2 days)", reason: "High fever & doctor advised rest", status: "pending" },
  { id: "LR-105", name: "Meera Joshi", code: "GF-012", dept: "Quality Control", type: "Casual Leave", dates: "01 Aug (1 day)", reason: "Personal family function", status: "pending" },
  { id: "LR-106", name: "Suresh Kumar", code: "GF-089", dept: "Cutting", type: "Earned Leave", dates: "04 - 08 Aug (5 days)", reason: "Annual hometown visit", status: "pending" },
];

const shiftData = [
  { name: "General Shift", timing: "09:00 AM - 05:30 PM", headcount: 65, present: 62, supervisor: "Anita Desai", status: "Active" },
  { name: "Morning Shift (Line A-C)", timing: "06:00 AM - 02:30 PM", headcount: 120, present: 108, supervisor: "Ramesh Chand", status: "Active" },
  { name: "Evening Shift (Line D-E)", timing: "02:30 PM - 11:00 PM", headcount: 60, present: 48, supervisor: "Vikas Patel", status: "Upcoming" },
];

interface UserProfile {
  name: string;
  role: string;
  dept: string;
  email: string;
  badge?: string;
  badgeColor?: string;
  initials?: string;
}

const defaultUser: UserProfile = {
  name: "Arun Kapoor",
  role: "Managing Director (MD)",
  dept: "Executive Management",
  email: "arun.kapoor@garmentflow.com",
  badge: "Owner / Full Access",
  badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  initials: "AK",
};

function getDeptDashboardTitle(role: string): string {
  if (role.includes("Merchandis")) return "Merchandising & Order Lifecycle Dashboard";
  if (role.includes("Quality")) return "Quality Assurance & QC Inspection Dashboard";
  if (role.includes("Store") || role.includes("Inventory")) return "Store & Raw Material Inventory Dashboard";
  if (role.includes("Finance") || role.includes("Accounts")) return "Commercial Billing & Finance Dashboard";
  if (role.includes("Floor") || role.includes("Supervisor")) return "Production Floor & Stitching Lines Dashboard";
  return "Executive Management Dashboard";
}

function getDeptBadgeStyle(role: string): string {
  if (role.includes("Merchandis")) return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200";
  if (role.includes("Quality")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200";
  if (role.includes("Store") || role.includes("Inventory")) return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200";
  if (role.includes("Finance") || role.includes("Accounts")) return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200";
  if (role.includes("Floor") || role.includes("Supervisor")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200";
  return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200";
}

function getDefaultTab(role: string): string {
  if (role.includes("Merchandis")) return "merchandising";
  if (role.includes("Quality")) return "quality";
  if (role.includes("Store") || role.includes("Inventory")) return "stores";
  if (role.includes("Finance") || role.includes("Accounts")) return "finance";
  if (role.includes("Floor") || role.includes("Supervisor")) return "production";
  return "overview";
}

function getDeptTabs(role: string): { id: string; label: string; icon: React.ReactNode }[] {
  if (role.includes("Merchandis")) {
    return [
      { id: "merchandising", label: "Merchandising & Orders", icon: <Package size={15} /> },
      { id: "production", label: "Production Status", icon: <Factory size={15} /> },
      { id: "overview", label: "Executive MIS", icon: <BarChart3 size={15} /> },
    ];
  }
  if (role.includes("Quality")) {
    return [
      { id: "quality", label: "QC Inspections & CAPA", icon: <ShieldCheck size={15} /> },
      { id: "production", label: "Floor Quality", icon: <Factory size={15} /> },
      { id: "overview", label: "Executive MIS", icon: <BarChart3 size={15} /> },
    ];
  }
  if (role.includes("Store") || role.includes("Inventory")) {
    return [
      { id: "stores", label: "Store & Fabric Inventory", icon: <Package size={15} /> },
      { id: "overview", label: "Executive MIS", icon: <BarChart3 size={15} /> },
    ];
  }
  if (role.includes("Finance") || role.includes("Accounts")) {
    return [
      { id: "finance", label: "Billing & Finance", icon: <DollarSign size={15} /> },
      { id: "merchandising", label: "Order Costing", icon: <Package size={15} /> },
      { id: "overview", label: "Executive MIS", icon: <BarChart3 size={15} /> },
    ];
  }
  if (role.includes("Floor") || role.includes("Supervisor")) {
    return [
      { id: "production", label: "Stitching Lines & Floor", icon: <Factory size={15} /> },
      { id: "quality", label: "Inline Defects", icon: <ShieldCheck size={15} /> },
      { id: "overview", label: "Executive MIS", icon: <BarChart3 size={15} /> },
    ];
  }
  return [
    { id: "overview", label: "Executive MIS", icon: <BarChart3 size={15} /> },
    { id: "merchandising", label: "Merchandising", icon: <Package size={15} /> },
    { id: "production", label: "Production", icon: <Factory size={15} /> },
    { id: "quality", label: "Quality", icon: <ShieldCheck size={15} /> },
    { id: "stores", label: "Store & Cutting", icon: <Scissors size={15} /> },
    { id: "finance", label: "Finance & Billing", icon: <DollarSign size={15} /> },
    { id: "hr", label: "HR & Workforce", icon: <Users size={15} /> },
  ];
}

const merchandisingBuyerOrders = [
  { id: "o1", orderNo: "ORD-2025-0001", po: "PO-ND-8891", buyer: "Nordstrom Inc.", style: "Classic Oxford Button-Down Shirt", qty: 12000, price: 580, totalValue: 6960000, deliveryDate: "2025-08-15", daysLeft: 10, stage: "in-stitching", sampleStatus: "Approved (PP)", completionRate: 72 },
  { id: "o2", orderNo: "ORD-2025-0002", po: "PO-ZR-4412", buyer: "Zara (Inditex)", style: "Floral Print Maxi Dress", qty: 8000, price: 820, totalValue: 6560000, deliveryDate: "2025-08-25", daysLeft: 20, stage: "in-cutting", sampleStatus: "Approved (Fit)", completionRate: 35 },
  { id: "o3", orderNo: "ORD-2025-0003", po: "PO-HM-9901", buyer: "H&M Hennes", style: "Slim Fit Chino Pants", qty: 15000, price: 650, totalValue: 9750000, deliveryDate: "2025-09-05", daysLeft: 31, stage: "material-procurement", sampleStatus: "Under Review", completionRate: 15 },
  { id: "o4", orderNo: "ORD-2025-0004", po: "PO-MS-1234", buyer: "Marks & Spencer", style: "Cotton Crew Neck T-Shirt", qty: 25000, price: 320, totalValue: 8000000, deliveryDate: "2025-08-08", daysLeft: 3, stage: "in-packing", sampleStatus: "Approved (Shipment)", completionRate: 94 },
];

const merchandisingSamples = [
  { id: "SMP-001", style: "Men's Denim Jacket", buyer: "Zara", type: "Proto Sample", due: "08 Aug 2025", status: "Under Review", comments: "Fit comments awaited on collar length" },
  { id: "SMP-002", style: "Classic Oxford Shirt", buyer: "Nordstrom", type: "Fit Sample", due: "06 Aug 2025", status: "Approved", comments: "Approved for production grading" },
  { id: "SMP-003", style: "Floral Maxi Dress", buyer: "H&M", type: "Pre-Production (PP)", due: "12 Aug 2025", status: "Pending Lab Dip", comments: "Dye lot #4 shade matching in progress" },
  { id: "SMP-004", style: "Slim Fit Chino Pants", buyer: "Marks & Spencer", type: "Size Set Sample", due: "15 Aug 2025", status: "In Stitching", comments: "Sizes 30, 32, 34 on sample table" },
];

const storeFabricRolls = [
  { id: "FR-101", fabric: "100% Cotton Twill", shade: "Navy Blue", lot: "LOT-409", rolls: 120, meters: 14500, rack: "A-12", status: "Available" },
  { id: "FR-102", fabric: "Linen Slub Woven", shade: "Natural Ivory", lot: "LOT-412", rolls: 85, meters: 9200, rack: "B-04", status: "Allocated (80%)" },
  { id: "FR-103", fabric: "Denim 12oz Ring Spun", shade: "Indigo Dark", lot: "LOT-388", rolls: 140, meters: 16800, rack: "C-01", status: "Available" },
  { id: "FR-104", fabric: "Poplin 60s Compact", shade: "Optic White", lot: "LOT-415", rolls: 75, meters: 8400, rack: "A-08", status: "Inspection Pending" },
];

const cuttingTableSchedule = [
  { table: "Table 1 (Manual)", order: "ORD-2025-0001", style: "Classic Oxford Shirt", plies: 48, cutQty: "2,400 pcs", marker: "88.6%", status: "Cutting" },
  { table: "Table 2 (Auto Spreader)", order: "ORD-2025-0002", style: "Floral Maxi Dress", plies: 32, cutQty: "1,200 pcs", marker: "89.2%", status: "Spreading" },
  { table: "Table 3 (Band Knife)", order: "ORD-2025-0004", style: "Crew Neck T-Shirt", plies: 60, cutQty: "3,000 pcs", marker: "91.4%", status: "Bundling" },
  { table: "Table 4 (Laser)", order: "ORD-2025-0003", style: "Slim Fit Chinos", plies: 40, cutQty: "1,800 pcs", marker: "87.8%", status: "Plotting" },
];

const financeGSTInvoices = [
  { id: "INV-2025-0089", buyer: "Nordstrom Inc.", gstin: "08AABCN1234D1Z2", value: 1845000, tax: 92250, type: "GST (5%)", status: "Paid", due: "15 Jul 2025" },
  { id: "INV-2025-0090", buyer: "Zara Retail (Inditex)", gstin: "07AAACZ4567E1Z5", value: 2480000, tax: 124000, type: "GST (5%)", status: "Overdue", due: "01 Aug 2025" },
  { id: "INV-2025-0091", buyer: "H&M Hennes Export", gstin: "08AABCH9988F1Z8", value: 3120000, tax: 0, type: "Export LUT (0%)", status: "Pending", due: "18 Aug 2025" },
  { id: "INV-2025-0092", buyer: "Marks & Spencer India", gstin: "27AAACM3344K1Z3", value: 1560000, tax: 78000, type: "GST (5%)", status: "Paid", due: "20 Jul 2025" },
];

export interface DashboardViewProps {
  basePath?: string;
  initialTab?: string;
}

export function DashboardView({ basePath = "/dashboard", initialTab }: DashboardViewProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUser);
  const [activeTab, setActiveTab] = useState<string>(() => initialTab || getDefaultTab(defaultUser.role));
  const [ordersList, setOrdersList] = useState<Order[]>([]);

  const resolveLink = (target: string) => {
    const isFactory = (basePath && basePath.startsWith("/factory")) || (typeof window !== "undefined" && window.location.pathname.startsWith("/factory"));
    const p = isFactory ? "/factory" : "/owner";

    if (target.includes("/orders/new")) return `${p}/orders/new`;
    if (target.includes("/orders")) return `${p}/orders`;
    if (target.includes("/cutting")) return `${p}/cutting`;
    if (target.includes("/stitching")) return `${p}/stitching`;
    if (target.includes("/finishing")) return `${p}/finishing`;
    if (target.includes("/production")) return `${p}/production`;
    if (target.includes("/costing") || target.includes("/expenses")) return isFactory ? `${p}/production` : `${p}/expenses`;
    if (target.includes("/sampling")) return isFactory ? `${p}/production` : `${p}/sampling`;
    if (target.includes("/buyers")) return isFactory ? `${p}/orders` : `${p}/customers`;
    if (target.includes("/tna") || target.includes("/planning")) return `${p}/planning`;
    if (target.includes("/inventory")) return `${p}/inventory`;
    if (target.includes("/invoices")) return `${p}/invoices`;
    if (target.includes("/payments")) return `${p}/payments`;
    if (target.includes("/reports")) return `${p}/reports`;
    if (target.includes("/audit-logs")) return isFactory ? `${p}/dashboard` : `${p}/audit-logs`;
    if (target.includes("/quality")) return `${p}/quality`;
    return `${p}/dashboard`;
  };

  const loadData = () => {
    setOrdersList(getStoredOrders());
  };

  useEffect(() => {
    loadData();
    const handleSync = () => {
      loadData();
      try {
        const saved = localStorage.getItem("garmentflow_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserProfile(parsed);
          if (!initialTab) setActiveTab(getDefaultTab(parsed.role));
        }
      } catch { }
    };
    handleSync();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("garmentflow_user_changed", handleSync);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("garmentflow_user_changed", handleSync);
    };
  }, [initialTab]);

  const currentTabs = getDeptTabs(userProfile.role);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic Department Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider", getDeptBadgeStyle(userProfile.role))}>
              {userProfile.badge || userProfile.dept}
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Department Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getDeptDashboardTitle(userProfile.role)}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <strong className="text-slate-800 dark:text-slate-200 font-bold">{userProfile.name}</strong> • {userProfile.role} ({userProfile.dept}) • <span className="text-slate-400" suppressHydrationWarning>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 border border-slate-200/60 dark:border-slate-700">
            {currentTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* OVERVIEW TAB CONTENT */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 stagger-children">
            <KPICard title="Total Orders" value={kd.totalOrders} icon={<Package size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" change={12.5} changePositive />
            <KPICard title="In Production" value={kd.ordersInProduction} icon={<Factory size={20} className="text-blue-600" />} iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KPICard title="Awaiting Material" value={kd.ordersAwaitingMaterial} icon={<Clock size={20} className="text-amber-600" />} iconBg="bg-amber-100 dark:bg-amber-900/40" />
            <KPICard title="Today's Output" value={formatNumber(kd.actualProductionToday)} icon={<Target size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" change={-4.2} changePositive={false} />
            <KPICard title="Efficiency" value={`${kd.productionEfficiency}%`} icon={<Zap size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" change={-2.1} changePositive={false} />
            <KPICard title="Rejection" value={`${kd.rejectionPercent}%`} icon={<AlertTriangle size={20} className="text-red-600" />} iconBg="bg-red-100 dark:bg-red-900/40" change={0.3} changePositive={false} />
            <KPICard title="Attendance" value={`${kd.workerAttendance}%`} icon={<Users size={20} className="text-violet-600" />} iconBg="bg-violet-100 dark:bg-violet-900/40" change={1.2} changePositive />
            <KPICard title="Material Shortages" value={kd.materialShortages} icon={<AlertCircle size={20} className="text-orange-600" />} iconBg="bg-orange-100 dark:bg-orange-900/40" />
            <KPICard title="Pending Approvals" value={kd.pendingApprovals} icon={<CheckCircle size={20} className="text-pink-600" />} iconBg="bg-pink-100 dark:bg-pink-900/40" />
            <KPICard title="Ready to Dispatch" value={formatNumber(kd.finishedGoodsReady)} suffix="pcs" icon={<Truck size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
            <KPICard title="Est. Revenue" value={formatCurrency(kd.estimatedRevenue)} icon={<DollarSign size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
            <KPICard title="Gross Margin" value={`${kd.estimatedMargin}%`} icon={<BadgePercent size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" change={0.8} changePositive />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Production Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Daily Production Trend</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Planned vs Actual output (last 7 days)</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" /> Planned</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Actual</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dashboardData.dailyProduction} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="gradPlanned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="planned" stroke="#4f46e5" fill="url(#gradPlanned)" strokeWidth={2.5} dot={false} />
                  <Area type="monotone" dataKey="actual" stroke="#059669" fill="url(#gradActual)" strokeWidth={2.5} dot={{ r: 4, fill: "#059669", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Order Status</h3>
              <p className="text-sm text-slate-500 mb-4">Distribution across pipeline</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={dashboardData.orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardData.orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dashboardData.orderStatusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.name}</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-white ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Efficiency */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Production Line Efficiency</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Current shift performance</p>
                </div>
              </div>
              <div className="space-y-4">
                {dashboardData.lineEfficiency.map((line) => (
                  <div key={line.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{line.name}</span>
                        <span className="text-xs text-slate-400">{line.operators} operators</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{line.efficiency}%</span>
                        <span className="text-xs text-slate-400">/ {line.target}%</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          line.efficiency >= line.target
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : line.efficiency >= line.target - 10
                              ? "bg-gradient-to-r from-amber-500 to-amber-400"
                              : "bg-gradient-to-r from-red-500 to-red-400"
                        )}
                        style={{ width: `${Math.min(line.efficiency, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Output: {formatNumber(line.output)} pcs</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Trend */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Quality Trend</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Pass rate, rework & rejection (last 7 days)</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dashboardData.qualityTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} domain={[90, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="passRate" fill="#059669" radius={[6, 6, 0, 0]} name="Pass %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Row: Alerts + Orders + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Critical Alerts */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Critical Alerts
                </h3>
                <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                  {dashboardData.criticalAlerts.length}
                </span>
              </div>
              <div className="space-y-3">
                {dashboardData.criticalAlerts.map((alert, i) => (
                  <CriticalAlertItem key={i} {...alert} />
                ))}
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active Orders</h3>
                <Link href={resolveLink("/orders")} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-3">
                {(ordersList.length > 0 ? ordersList : initialOrders).filter(o => !["completed", "cancelled", "draft", "awaiting-approval"].includes(o.status)).slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{order.styleName} • {order.buyerName}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-slate-400">{formatNumber(order.totalQuantity)} pcs</span>
                        <span className="text-xs text-slate-400">Due: {new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</span>
                      </div>
                    </div>
                    {/* Mini progress */}
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-slate-700" />
                        <circle
                          cx="18" cy="18" r="16" fill="none" stroke="#4f46e5" strokeWidth="3"
                          strokeDasharray={`${(order.stitchingQty / order.totalQuantity) * 100} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {Math.round((order.stitchingQty / order.totalQuantity) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                <Link href={resolveLink("/audit-logs")} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-0">
                {dashboardData.recentActivity.map((activity, i) => (
                  <div key={i} className="flex gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      activity.type === "quality" ? "bg-amber-100 dark:bg-amber-900/30" :
                        activity.type === "inventory" ? "bg-blue-100 dark:bg-blue-900/30" :
                          activity.type === "hr" ? "bg-pink-100 dark:bg-pink-900/30" :
                            activity.type === "alert" ? "bg-red-100 dark:bg-red-900/30" :
                              activity.type === "order" ? "bg-indigo-100 dark:bg-indigo-900/30" :
                                activity.type === "sample" ? "bg-purple-100 dark:bg-purple-900/30" :
                                  "bg-slate-100 dark:bg-slate-800"
                    )}>
                      <Activity size={14} className={cn(
                        activity.type === "quality" ? "text-amber-600" :
                          activity.type === "inventory" ? "text-blue-600" :
                            activity.type === "hr" ? "text-pink-600" :
                              activity.type === "alert" ? "text-red-600" :
                                activity.type === "order" ? "text-indigo-600" :
                                  activity.type === "sample" ? "text-purple-600" :
                                    "text-slate-500"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{activity.user}</span>{" "}{activity.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{activity.detail}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buyer-wise & Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Buyer-wise Orders</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dashboardData.buyerWiseOrders} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis dataKey="buyer" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="orders" fill="#4f46e5" radius={[0, 6, 6, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Attendance Overview</h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dashboardData.attendanceTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="present" stroke="#059669" fill="#05966920" strokeWidth={2} name="Present %" />
                  <Area type="monotone" dataKey="absent" stroke="#dc2626" fill="#dc262620" strokeWidth={2} name="Absent %" />
                  <Area type="monotone" dataKey="leave" stroke="#d97706" fill="#d9770620" strokeWidth={2} name="Leave %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MERCHANDISING TAB CONTENT */}
      {activeTab === "merchandising" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Sub-navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Merchandising Suite:</span>
            <Link href={resolveLink("/orders")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Package size={13} /> Buyer Orders
            </Link>
            <Link href={resolveLink("/orders/new")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
              <Plus size={13} /> New Order Booking
            </Link>
            <Link href={resolveLink("/costing")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <DollarSign size={13} /> Pre-Order Costing
            </Link>
            <Link href={resolveLink("/sampling")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Palette size={13} /> Sampling & Approvals
            </Link>
            <Link href={resolveLink("/buyers")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Building2 size={13} /> Buyer Directory
            </Link>
            <Link href={resolveLink("/tna")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <CalendarDays size={13} /> Time & Action (T&A)
            </Link>
          </div>

          {/* Merchandising KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Total Order Book" value={formatCurrency(31270000)} change={12.4} changePositive suffix="INR" icon={<DollarSign size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
            <KPICard title="Active Buyer Orders" value={merchandisingBuyerOrders.length} suffix="orders" icon={<Package size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
            <KPICard title="Total Quantity Booked" value="60,000" suffix="pcs" icon={<Target size={20} className="text-blue-600" />} iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KPICard title="Samples In Review" value="4" suffix="styles" icon={<Palette size={20} className="text-purple-600" />} iconBg="bg-purple-100 dark:bg-purple-900/40" />
            <KPICard title="Avg Order Price" value="₹592" suffix="/ pc" icon={<BadgePercent size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
            <KPICard title="T&A On-Track Rate" value="94.2%" change={1.8} changePositive icon={<Activity size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" />
            <KPICard title="Upcoming Shipments" value="2" suffix="orders <7d" icon={<Truck size={20} className="text-amber-600" />} iconBg="bg-amber-100 dark:bg-amber-900/40" />
            <KPICard title="Fabric Approvals Pending" value="3" suffix="lots" icon={<Clock size={20} className="text-rose-600" />} iconBg="bg-rose-100 dark:bg-rose-900/40" />
          </div>

          {/* Active Orders Track Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active Buyer Order Portfolio</h3>
                <p className="text-sm text-slate-500 mt-0.5">Live execution stage, completion rate and delivery timeline</p>
              </div>
              <Link href={resolveLink("/orders")} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                View All Orders <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Order / PO</th>
                    <th className="py-3 px-3">Buyer & Style</th>
                    <th className="py-3 px-3 text-right">Order Qty</th>
                    <th className="py-3 px-3 text-right">Value (INR)</th>
                    <th className="py-3 px-3">Delivery Date</th>
                    <th className="py-3 px-3">Sample Status</th>
                    <th className="py-3 px-3">Production Stage</th>
                    <th className="py-3 px-3 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {merchandisingBuyerOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold">
                        <Link href="/dashboard/orders" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                          {o.orderNo}
                        </Link>
                        <p className="text-slate-400 text-[11px] font-normal">{o.po}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{o.buyer}</p>
                        <p className="text-slate-500 text-[11px]">{o.style}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatNumber(o.qty)} pcs
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(o.totalValue)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{o.deliveryDate}</span>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold",
                            o.daysLeft <= 5 ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" :
                              o.daysLeft <= 15 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          )}>
                            {o.daysLeft}d left
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          {o.sampleStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-semibold text-[11px] capitalize">
                          {o.stage.replace("-", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">{o.completionRate}%</span>
                          <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${o.completionRate}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sampling & Pre-production Approval Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Sample Development Pipeline</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Proto, Fit, and PP approvals under progress</p>
                </div>
                <Link href={resolveLink("/sampling")} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                  Sampling Room <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {merchandisingSamples.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{s.style}</span>
                        <span className="text-[11px] text-slate-400">({s.buyer})</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        s.status === "Approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          s.status === "Under Review" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                            "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      )}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Type: <strong className="text-slate-700 dark:text-slate-300">{s.type}</strong></span>
                      <span>Target: <strong className="text-slate-700 dark:text-slate-300">{s.due}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/50 dark:border-slate-800">
                      {s.comments}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer Delivery Breakdown Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Buyer Portfolio Allocation</h3>
              <p className="text-sm text-slate-500 mb-4">Total booked order value by retail client</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dashboardData.buyerWiseOrders} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="buyer" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} name="Orders" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* STORE & CUTTING TAB CONTENT */}
      {activeTab === "stores" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Sub-navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Store & Cutting Desk:</span>
            <Link href={resolveLink("/inventory")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Warehouse size={13} /> Raw Material Stock
            </Link>
            <Link href={resolveLink("/cutting")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Scissors size={13} /> Cutting Floor Schedule
            </Link>
            <Link href={resolveLink("/inventory")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Boxes size={13} /> Fabric Rolls & Lots
            </Link>
            <Link href={resolveLink("/production")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Layers size={13} /> Bundle Tickets
            </Link>
            <Link href={resolveLink("/inventory")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <FileText size={13} /> Inward GRN Logs
            </Link>
          </div>

          {/* Stores & Cutting KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Total Fabric in Store" value="48,900" suffix="meters" icon={<Warehouse size={20} className="text-amber-600" />} iconBg="bg-amber-100 dark:bg-amber-900/40" />
            <KPICard title="Active Fabric Rolls" value="420" suffix="rolls" icon={<Boxes size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
            <KPICard title="Today's Cutting Output" value="8,400" suffix="pcs" change={5.2} changePositive icon={<Scissors size={20} className="text-blue-600" />} iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KPICard title="Avg Marker Efficiency" value="89.3%" change={0.8} changePositive icon={<Target size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
            <KPICard title="Cutting Tables Active" value="4 / 4" suffix="tables" icon={<Activity size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
            <KPICard title="Fabric Wastage / End Bits" value="1.8%" change={-0.3} changePositive icon={<AlertTriangle size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" />
            <KPICard title="Pending GRN Inwards" value="2" suffix="consignments" icon={<Clock size={20} className="text-rose-600" />} iconBg="bg-rose-100 dark:bg-rose-900/40" />
            <KPICard title="Bundles Transferred to Lines" value="340" suffix="bundles" icon={<Layers size={20} className="text-purple-600" />} iconBg="bg-purple-100 dark:bg-purple-900/40" />
          </div>

          {/* Cutting Tables Status Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Cutting Floor Table Allocation</h3>
                <p className="text-sm text-slate-500 mt-0.5">Active spreads, plies, cut volume and marker efficiency</p>
              </div>
              <Link href={resolveLink("/cutting")} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                Cutting Manager <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Table Station</th>
                    <th className="py-3 px-3">Order #</th>
                    <th className="py-3 px-3">Garment Style</th>
                    <th className="py-3 px-3 text-right">Plies</th>
                    <th className="py-3 px-3 text-right">Planned Cut</th>
                    <th className="py-3 px-3 text-right">Marker Efficiency</th>
                    <th className="py-3 px-3">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {cuttingTableSchedule.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">{c.table}</td>
                      <td className="py-3 px-3 text-indigo-600 font-medium">{c.order}</td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{c.style}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400">{c.plies} plies</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{c.cutQty}</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600">{c.marker}</td>
                      <td className="py-3 px-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                          c.status === "Cutting" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                            c.status === "Spreading" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                              c.status === "Bundling" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
                                "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fabric Rolls & Warehouse Storage */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Fabric Inventory & Warehouse Rack Allocation</h3>
                <p className="text-sm text-slate-500 mt-0.5">Available shade lots, roll counts and physical rack coordinates</p>
              </div>
              <Link href={resolveLink("/inventory")} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                View All Inventory <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Roll ID</th>
                    <th className="py-3 px-3">Fabric Composition</th>
                    <th className="py-3 px-3">Shade / Color</th>
                    <th className="py-3 px-3">Lot #</th>
                    <th className="py-3 px-3 text-right">Rolls</th>
                    <th className="py-3 px-3 text-right">Total Meters</th>
                    <th className="py-3 px-3">Rack Bin</th>
                    <th className="py-3 px-3">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {storeFabricRolls.map((fr) => (
                    <tr key={fr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">{fr.id}</td>
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">{fr.fabric}</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{fr.shade}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{fr.lot}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">{fr.rolls} rolls</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{formatNumber(fr.meters)} m</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                          {fr.rack}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                          fr.status === "Available" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                            fr.status.includes("Allocated") ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                              "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                        )}>
                          {fr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE TAB CONTENT */}
      {activeTab === "finance" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Sub-navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Finance & Billing:</span>
            <Link href={resolveLink("/invoices")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Receipt size={13} /> GST Tax Invoices
            </Link>
            <Link href={resolveLink("/costing")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <DollarSign size={13} /> Order Cost Sheets
            </Link>
            <Link href={resolveLink("/payments")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <CreditCard size={13} /> Buyer Payment Receipts
            </Link>
            <Link href={resolveLink("/reports")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <FileSpreadsheet size={13} /> Financial MIS
            </Link>
            <Link href={resolveLink("/invoices")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Building2 size={13} /> GST Filing Ledger
            </Link>
          </div>

          {/* Finance KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Monthly Billing (Billed)" value={formatCurrency(9005000)} change={8.6} changePositive icon={<DollarSign size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" />
            <KPICard title="Outstanding Receivables" value={formatCurrency(4040000)} icon={<CreditCard size={20} className="text-amber-600" />} iconBg="bg-amber-100 dark:bg-amber-900/40" />
            <KPICard title="GST Output Liability" value={formatCurrency(294250)} icon={<Receipt size={20} className="text-blue-600" />} iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KPICard title="Average Order Margin" value="23.8%" change={1.4} changePositive icon={<TrendingUp size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
            <KPICard title="Export Duty Drawback" value={formatCurrency(185000)} icon={<Award size={20} className="text-purple-600" />} iconBg="bg-purple-100 dark:bg-purple-900/40" />
            <KPICard title="Raw Material Spend" value={formatCurrency(5420000)} icon={<Warehouse size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
            <KPICard title="Overdue Invoices" value="1" suffix="invoices" icon={<AlertCircle size={20} className="text-rose-600" />} iconBg="bg-rose-100 dark:bg-rose-900/40" />
            <KPICard title="Avg Collection Period" value="38" suffix="days" change={-4.0} changePositive icon={<Clock size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" />
          </div>

          {/* GST Invoicing Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Tax Invoices & GST Status</h3>
                <p className="text-sm text-slate-500 mt-0.5">Active buyer billing, applicable tax breakdown and realization status</p>
              </div>
              <Link href="/dashboard/finance/invoices" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                View All Invoices <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Invoice #</th>
                    <th className="py-3 px-3">Buyer / Client</th>
                    <th className="py-3 px-3">GSTIN</th>
                    <th className="py-3 px-3 text-right">Taxable Value</th>
                    <th className="py-3 px-3 text-right">Tax Amount</th>
                    <th className="py-3 px-3">Invoice Type</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {financeGSTInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">{inv.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{inv.buyer}</td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{inv.gstin}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(inv.value)}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400">{formatCurrency(inv.tax)}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {inv.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{inv.due}</td>
                      <td className="py-3 px-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                          inv.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                            inv.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" :
                              "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        )}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTION TAB CONTENT */}
      {activeTab === "production" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Sub-navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Quick Navigation:</span>
            <Link href={resolveLink("/production")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Factory size={13} /> Production Home
            </Link>
            <Link href={resolveLink("/cutting")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Scissors size={13} /> Cutting Section
            </Link>
            <Link href={resolveLink("/stitching")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Shirt size={13} /> Stitching Lines
            </Link>
            <Link href={resolveLink("/finishing")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <CheckCircle size={13} /> Finishing
            </Link>
            <Link href={resolveLink("/production")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Timer size={13} /> Hourly Tracking
            </Link>
            <Link href={resolveLink("/production")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Layers size={13} /> Bundle Tickets
            </Link>
          </div>

          {/* Production Specific KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="In Production Orders" value={kd.ordersInProduction} suffix="orders" icon={<Factory size={20} className="text-blue-600" />} iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KPICard title="Today's Output" value={formatNumber(kd.actualProductionToday)} suffix="pcs" icon={<Target size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" change={-4.2} changePositive={false} />
            <KPICard title="Daily Target" value={formatNumber(kd.plannedProductionToday)} suffix="pcs" icon={<FlagIcon size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
            <KPICard title="Avg Line Efficiency" value={`${kd.productionEfficiency}%`} icon={<Zap size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" change={-2.1} changePositive={false} />
            <KPICard title="Active Lines Running" value="5 / 5" suffix="lines" icon={<Activity size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
            <KPICard title="Finished Goods Ready" value={formatNumber(kd.finishedGoodsReady)} suffix="pcs" icon={<Truck size={20} className="text-purple-600" />} iconBg="bg-purple-100 dark:bg-purple-900/40" />
            <KPICard title="Material Shortages" value={kd.materialShortages} icon={<AlertCircle size={20} className="text-orange-600" />} iconBg="bg-orange-100 dark:bg-orange-900/40" />
            <KPICard title="Pending Job Work" value={kd.pendingJobWork} suffix="order" icon={<RefreshCw size={20} className="text-rose-600" />} iconBg="bg-rose-100 dark:bg-rose-900/40" />
          </div>

          {/* Main Charts & Floor Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Output Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Daily Production Output (Pcs)</h3>
                  <p className="text-sm text-slate-500 mt-0.5 font-normal">Target vs actual garms produced across all lines</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" /> Planned Target</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Actual Output</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dashboardData.dailyProduction} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="planned" fill="#6366f1" radius={[4, 4, 0, 0]} name="Target Output" />
                  <Bar dataKey="actual" fill="#10b981" radius={[4, 4, 0, 0]} name="Actual Output" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stage-wise Pipeline Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Production Stage Breakdown</h3>
              <p className="text-sm text-slate-500 mb-5">Order distribution by active floor stage</p>
              <div className="space-y-4">
                {[
                  { stage: "Fabric & Trims Issue", count: 3, qty: "32,500 pcs", color: "bg-amber-500" },
                  { stage: "Cutting Floor Lay", count: 2, qty: "18,000 pcs", color: "bg-blue-500" },
                  { stage: "Stitching Lines (Sewing)", count: 4, qty: "45,000 pcs", color: "bg-indigo-500" },
                  { stage: "Finishing & Ironing", count: 1, qty: "8,500 pcs", color: "bg-purple-500" },
                  { stage: "Packing & Tagging", count: 1, qty: "14,500 pcs", color: "bg-emerald-500" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className={cn("w-2.5 h-2.5 rounded-full", s.color)} />
                        {s.stage}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{s.count} Orders</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium pl-4">{s.qty} in progress</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line Performance Grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Floor Line Performance Status</h3>
                <p className="text-sm text-slate-500 mt-0.5">Real-time line efficiency, operators present & daily output</p>
              </div>
              <Link href={resolveLink("/stitching")} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                Open Stitching Floor <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {dashboardData.lineEfficiency.map((line, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{line.name}</span>
                    <span className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      line.efficiency >= line.target ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        line.efficiency >= line.target - 10 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {line.efficiency >= line.target ? "On Target" : "Below Target"}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Efficiency</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{line.efficiency}% / {line.target}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", line.efficiency >= line.target ? "bg-emerald-500" : line.efficiency >= line.target - 10 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${line.efficiency}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Today Output</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{formatNumber(line.output)} pcs</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Operators</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{line.operators} active</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUALITY TAB CONTENT */}
      {activeTab === "quality" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Quick Navigation:</span>
            <Link href={resolveLink("/quality")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <ShieldCheck size={13} /> Quality Control Home
            </Link>
            <Link href={resolveLink("/quality")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <CheckSquare size={13} /> Inspection Logs
            </Link>
            <Link href={resolveLink("/quality")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <AlertTriangle size={13} /> Defect Master
            </Link>
            <Link href={resolveLink("/quality")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <FileText size={13} /> CAPA Actions
            </Link>
            <Link href={resolveLink("/quality")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 ml-auto">
              <CheckCircle size={13} /> + New Inspection
            </Link>
          </div>

          {/* Quality KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Overall Pass Rate" value="96.2%" icon={<CheckCircle size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" change={0.8} changePositive />
            <KPICard title="Rejection Rate" value={`${kd.rejectionPercent}%`} icon={<AlertTriangle size={20} className="text-red-600" />} iconBg="bg-red-100 dark:bg-red-900/40" change={-0.3} changePositive />
            <KPICard title="Rework Rate" value={`${kd.reworkPercent}%`} icon={<RefreshCw size={20} className="text-amber-600" />} iconBg="bg-amber-100 dark:bg-amber-900/40" change={-0.5} changePositive />
            <KPICard title="Inspections Today" value="18" suffix="audits" icon={<ShieldCheck size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
            <KPICard title="Open Defect Tickets" value="5" suffix="defects" icon={<AlertOctagon size={20} className="text-rose-600" />} iconBg="bg-rose-100 dark:bg-rose-900/40" />
            <KPICard title="Active CAPA Actions" value="2" suffix="pending" icon={<FileText size={20} className="text-purple-600" />} iconBg="bg-purple-100 dark:bg-purple-900/40" />
            <KPICard title="First Pass Yield" value="92.4%" icon={<Award size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" />
            <KPICard title="AQL 2.5 Audit Pass" value="98.0%" icon={<CheckSquare size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
          </div>

          {/* Quality Charts & Defect Pareto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Quality Trend */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">7-Day Quality Pass Rate (%)</h3>
                  <p className="text-sm text-slate-500 mt-0.5 font-normal">Daily first-pass inspection success rate across floor lines</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={dashboardData.qualityTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} domain={[90, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="passRate" fill="#059669" radius={[6, 6, 0, 0]} name="Pass Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Defect Pareto Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Top Defect Categories</h3>
              <p className="text-sm text-slate-500 mb-4">Pareto distribution of logged defect types</p>
              <div className="space-y-3">
                {qualityDefects.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{item.defect}</span>
                      <span className="text-slate-500 font-semibold">{item.count} pcs ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Quality Inspections Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Quality Inspections</h3>
                <p className="text-sm text-slate-500 mt-0.5 font-normal">Latest inline, endline & AQL 2.5 audit results</p>
              </div>
              <Link href="/dashboard/quality/inspections" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                View All Inspections <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">Inspection ID</th>
                    <th className="py-3 px-3">Order & Style</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3 text-right">Inspected Qty</th>
                    <th className="py-3 px-3 text-right">Pass Rate %</th>
                    <th className="py-3 px-3">Result Status</th>
                    <th className="py-3 px-3">Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {qualityInspectionsList.map((qc) => (
                    <tr key={qc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">{qc.id}</td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{qc.orderNo}</p>
                        <p className="text-slate-400 text-[11px]">{qc.style}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">{qc.stage}</td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">{formatNumber(qc.inspectedQty)} pcs</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800 dark:text-slate-200">{qc.passRate}%</td>
                      <td className="py-3 px-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full font-semibold text-[11px]",
                          qc.result === "PASSED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            qc.result === "REWORK" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        )}>
                          {qc.result}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{qc.inspector}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* HR TAB CONTENT */}
      {activeTab === "hr" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Sub-navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Quick Navigation:</span>
            <Link href="/dashboard/hrms/employees" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Users size={13} /> Employee Directory
            </Link>
            <Link href="/dashboard/hrms/attendance" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <UserCheck size={13} /> Daily Attendance
            </Link>
            <Link href="/dashboard/hrms/leave" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <CalendarDays size={13} /> Leave Requests
            </Link>
            <Link href="/dashboard/hrms/payroll" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <DollarSign size={13} /> Payroll Division
            </Link>
            <Link href="/dashboard/hrms/shifts" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Clock size={13} /> Shift Rosters
            </Link>
          </div>

          {/* HR KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Total Workforce" value="245" suffix="staff" icon={<Users size={20} className="text-indigo-600" />} iconBg="bg-indigo-100 dark:bg-indigo-900/40" />
            <KPICard title="Today's Attendance" value={`${kd.workerAttendance}%`} icon={<UserCheck size={20} className="text-emerald-600" />} iconBg="bg-emerald-100 dark:bg-emerald-900/40" change={1.2} changePositive />
            <KPICard title="Present On Floor" value="218" suffix="workers" icon={<CheckCircle size={20} className="text-teal-600" />} iconBg="bg-teal-100 dark:bg-teal-900/40" />
            <KPICard title="On Approved Leave" value="12" suffix="staff" icon={<CalendarDays size={20} className="text-amber-600" />} iconBg="bg-amber-100 dark:bg-amber-900/40" />
            <KPICard title="Absent Unexcused" value="15" suffix="workers" icon={<UserX size={20} className="text-red-600" />} iconBg="bg-red-100 dark:bg-red-900/40" />
            <KPICard title="Overtime Logged" value="42" suffix="hrs today" icon={<Clock size={20} className="text-blue-600" />} iconBg="bg-blue-100 dark:bg-blue-900/40" />
            <KPICard title="Pending Leave Requests" value={pendingLeaveRequests.length} icon={<AlertCircle size={20} className="text-purple-600" />} iconBg="bg-purple-100 dark:bg-purple-900/40" />
            <KPICard title="Biometric Sync" value="100%" suffix="synced" icon={<Activity size={20} className="text-cyan-600" />} iconBg="bg-cyan-100 dark:bg-cyan-900/40" />
          </div>

          {/* HR Charts & Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Trend Chart */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Attendance History (%)</h3>
                  <p className="text-sm text-slate-500 mt-0.5 font-normal">Present vs Absent vs Leave percentage</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={dashboardData.attendanceTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="present" stroke="#059669" fill="#05966920" strokeWidth={2} name="Present %" />
                  <Area type="monotone" dataKey="absent" stroke="#dc2626" fill="#dc262620" strokeWidth={2} name="Absent %" />
                  <Area type="monotone" dataKey="leave" stroke="#d97706" fill="#d9770620" strokeWidth={2} name="Leave %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Department-wise Attendance */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Department Attendance</h3>
              <p className="text-sm text-slate-500 mb-4">Present headcount vs total strength by division</p>
              <div className="space-y-3.5">
                {departmentAttendance.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{d.dept}</span>
                      <span className="text-slate-500 font-semibold">{d.present} / {d.total} ({d.rate}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", d.rate >= 90 ? "bg-emerald-500" : "bg-amber-500")}
                        style={{ width: `${d.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Leave Requests & Shifts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Leave Approvals */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Pending Leave Requests</h3>
                  <p className="text-sm text-slate-500 mt-0.5 font-normal">Applications requiring supervisor approval</p>
                </div>
                <Link href="/dashboard/hrms/leave" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                  Manage Leaves <ChevronRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {pendingLeaveRequests.map((lr) => (
                  <div key={lr.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{lr.name}</span>
                        <span className="text-xs text-slate-400">({lr.code})</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{lr.dept}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">{lr.type} • {lr.dates}</p>
                      <p className="text-xs text-slate-400 mt-0.5 italic">"{lr.reason}"</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1">
                        <Check size={13} /> Approve
                      </button>
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1">
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Roster Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Shift Roster</h3>
              <p className="text-sm text-slate-500 mb-4">Active floor shift deployments</p>
              <div className="space-y-3">
                {shiftData.map((shift, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{shift.name}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        shift.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-200 text-slate-600"
                      )}>
                        {shift.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{shift.timing}</p>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
                      <span>Present: <strong>{shift.present} / {shift.headcount}</strong></span>
                      <span>Supervisor: {shift.supervisor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Auxiliary Flag icon helper
function FlagIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export default DashboardView;
