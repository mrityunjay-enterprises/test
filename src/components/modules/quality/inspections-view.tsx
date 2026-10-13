"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatDate, getStatusColor } from "@/lib/utils";
import { qualityInspections as demoInspections } from "@/lib/demo-data";
import { QualityInspection } from "@/lib/types";
import { getStoredInspections, WORKFLOW_EVENT } from "@/lib/workflow-service";
import { Search, Plus, Download } from "lucide-react";

export function InspectionsView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/factory");

  const [inspectionsList, setInspectionsList] = useState<QualityInspection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");

  const loadData = () => {
    setInspectionsList(getStoredInspections());
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const stages = ["All", "inline-stitching", "end-line", "finishing", "pre-shipment"];

  const filtered = inspectionsList.filter(qi => {
    const matchesSearch = qi.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qi.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qi.styleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qi.inspectorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "All" || qi.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stats = {
    total: inspectionsList.length,
    passed: inspectionsList.filter(q => q.decision === "pass" || q.decision === "conditional-pass").length,
    rework: inspectionsList.filter(q => q.decision === "rework").length,
    rejected: inspectionsList.filter(q => q.decision === "reject").length,
    avgPassRate: (inspectionsList.reduce((sum, q) => sum + (q.inspectedQty > 0 ? (q.passQty / q.inspectedQty) * 100 : 0), 0) / (inspectionsList.length || 1)).toFixed(1),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quality Inspection History</h1>
          <p className="text-sm text-slate-500 mt-1">Complete audit trail of inline, end-line, finishing & AQL inspections</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export
          </button>
          <Link href={`${prefix}/quality/inspections/new`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> New Inspection
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Inspections", value: stats.total, color: "text-slate-800 dark:text-white" },
          { label: "Passed", value: stats.passed, color: "text-emerald-600" },
          { label: "Rework", value: stats.rework, color: "text-amber-600" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600" },
          { label: "Avg Pass Rate", value: `${stats.avgPassRate}%`, color: "text-indigo-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search inspection #, order, style, inspector..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {stages.map(st => (
            <button key={st} onClick={() => setStageFilter(st)} className={cn("px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all capitalize", stageFilter === st ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700")}>
              {st.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspection #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Style</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspector</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Passed</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rejected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(qi => {
                const passRate = qi.inspectedQty > 0 ? Math.round((qi.passQty / qi.inspectedQty) * 100) : 0;
                return (
                  <tr key={qi.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{qi.inspectionNumber}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{qi.orderNumber}</p>
                      <p className="text-xs text-slate-500">{qi.styleName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">{qi.stage.replace(/-/g, " ")}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{qi.inspectorName}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{qi.inspectedQty}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-emerald-600">{qi.passQty}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-red-600">{qi.rejectedQty}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", passRate >= 95 ? "bg-emerald-500" : passRate >= 90 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${passRate}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{passRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(qi.date)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize", getStatusColor(qi.decision))}>
                        {qi.decision.replace(/-/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
