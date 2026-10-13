"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3, FileSpreadsheet, Download, Filter, Calendar, TrendingUp,
  DollarSign, Factory, Users, ShieldCheck, Package, Printer, ArrowUpRight, Eye
} from "lucide-react";

export function ReportsView({ basePath = "/owner" }: { basePath?: string }) {
  const reportCategories = [
    {
      title: "Sales & Buyer Analytics",
      icon: <DollarSign size={20} className="text-emerald-600" />,
      href: `${basePath}/orders`,
      reports: [
        { name: "Buyer-wise Order Book & Revenue", desc: "Active orders, currency breakdown, and total order value by buyer", href: `${basePath}/orders` },
        { name: "Order Status & Pipeline Distribution", desc: "Stage-wise breakdown from enquiry to ex-factory dispatch", href: `${basePath}/orders` },
        { name: "FOB Price & Cost Variance", desc: "Quoted FOB price vs actual production cost analysis", href: `${basePath}/orders` },
      ]
    },
    {
      title: "Production & Floor Efficiency",
      icon: <Factory size={20} className="text-indigo-600" />,
      href: `${basePath}/production`,
      reports: [
        { name: "Daily Line Efficiency Trend", desc: "Hourly target vs actual output and line efficiency percentage", href: `${basePath}/production` },
        { name: "Capacity Loading & Bottlenecks", desc: "Line-wise booked capacity vs available line hours", href: `${basePath}/production` },
        { name: "Cutting & Bundle Reconciliation", desc: "Fabric utilization yield, lay count, and cut panel waste", href: `${basePath}/cutting` },
      ]
    },
    {
      title: "Quality Control & Pareto",
      icon: <ShieldCheck size={20} className="text-purple-600" />,
      href: `${basePath}/quality`,
      reports: [
        { name: "Defect Pareto & Root Cause Analysis", desc: "Top 5 defect categories by frequency, severity, and location", href: `${basePath}/quality` },
        { name: "7-Day First-Pass Quality Trend", desc: "Pass, rework, and rejection percentages across lines", href: `${basePath}/quality` },
        { name: "CAPA Closure Rate", desc: "Corrective and preventive action plan verification status", href: `${basePath}/quality` },
      ]
    },
    {
      title: "Inventory & Stock Valuation",
      icon: <Package size={20} className="text-amber-600" />,
      href: `${basePath}/inventory`,
      reports: [
        { name: "Fabric & Trims Stock Ageing (0-90+ Days)", desc: "Valuation of fast-moving, slow-moving, and deadstock fabric", href: `${basePath}/inventory` },
        { name: "Fabric Roll Shade & Lot Summary", desc: "Shade grouping, accepted vs rejected meters per roll", href: `${basePath}/inventory` },
        { name: "Finished Goods Stock Register", desc: "Packed carton inventory by warehouse rack location", href: `${basePath}/packing` },
      ]
    },
    {
      title: "HRMS Attendance & Payroll",
      icon: <Users size={20} className="text-blue-600" />,
      href: `${basePath}/attendance`,
      reports: [
        { name: "Worker Attendance & Overtime Log", desc: "Daily present/absent count, late arrivals, and overtime hours", href: `${basePath}/attendance` },
        { name: "Departmental Payroll Expense", desc: "Monthly wage breakdown for operators, staff, and supervisors", href: `${basePath}/employees` },
        { name: "Operator Efficiency Rating", desc: "Skill grade rating vs monthly SMV produced", href: `${basePath}/stitching` },
      ]
    },
    {
      title: "Financial & P&L Variance",
      icon: <TrendingUp size={20} className="text-rose-600" />,
      href: `${basePath}/invoices`,
      reports: [
        { name: "Budgeted vs Actual Financial Variance", desc: "Material costs, labor wages, job-work expenses vs revenue", href: `${basePath}/invoices` },
        { name: "Order Profitability Ledger", desc: "Gross margin contribution per confirmed order", href: `${basePath}/orders` },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Report Center & Management MIS</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise executive reporting, live printable summaries & CSV exports</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Printer size={16} /> Print Overview
          </button>
        </div>
      </div>

      {/* Grid of Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCategories.map((cat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">{cat.icon}</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                </div>
                <Link href={cat.href} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5">
                  Open <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="space-y-3">
                {cat.reports.map((rep, j) => (
                  <div key={j} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{rep.name}</h4>
                      <Link href={rep.href} className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                        <Eye size={12} /> View
                      </Link>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{rep.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">3 Sub-reports</span>
              <Link href={cat.href} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Generate MIS →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReportsView;
