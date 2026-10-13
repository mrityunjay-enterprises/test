"use client";

import React, { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { qualityInspections, dashboardData } from "@/lib/demo-data";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Shield, CheckCircle, XCircle, RefreshCw, Plus, ChevronRight } from "lucide-react";

const defectData = [
  { name: "Stitching", count: 24, color: "#4f46e5" },
  { name: "Fabric", count: 8, color: "#0ea5e9" },
  { name: "Print", count: 10, color: "#8b5cf6" },
  { name: "Washing", count: 20, color: "#d97706" },
  { name: "Measurement", count: 8, color: "#dc2626" },
  { name: "Finishing", count: 28, color: "#059669" },
];

const stageData = [
  { stage: "Inline", inspected: 500, passed: 468, failed: 32, passRate: 93.6 },
  { stage: "End-Line", inspected: 800, passed: 776, failed: 24, passRate: 97.0 },
  { stage: "Finishing", inspected: 1200, passed: 1152, failed: 48, passRate: 96.0 },
  { stage: "Final", inspected: 600, passed: 582, failed: 18, passRate: 97.0 },
  { stage: "Packing", inspected: 400, passed: 396, failed: 4, passRate: 99.0 },
];

export function QualityView({ basePath = "/factory" }: { basePath?: string }) {
  const [showModal, setShowModal] = useState(false);
  const totalInspected = stageData.reduce((sum, s) => sum + s.inspected, 0);
  const totalPassed = stageData.reduce((sum, s) => sum + s.passed, 0);
  const totalFailed = stageData.reduce((sum, s) => sum + s.failed, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quality Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-stage quality control monitoring & defect analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus size={16} /> New Inspection
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Inspected", value: formatNumber(totalInspected), icon: <Shield size={18} className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Pass Rate", value: `${((totalPassed / totalInspected) * 100).toFixed(1)}%`, icon: <CheckCircle size={18} className="text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/40" },
          { label: "Rework", value: `${dashboardData.kpis.reworkPercent}%`, icon: <RefreshCw size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40" },
          { label: "Rejection", value: `${dashboardData.kpis.rejectionPercent}%`, icon: <XCircle size={18} className="text-red-600" />, bg: "bg-red-100 dark:bg-red-900/40" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage-wise Quality */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Stage-wise Quality</h3>
          <div className="space-y-4">
            {stageData.map(stage => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{stage.stage}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">Inspected: {stage.inspected}</span>
                    <span className={cn("font-semibold", stage.passRate >= 97 ? "text-emerald-600" : stage.passRate >= 95 ? "text-amber-600" : "text-red-600")}>
                      {stage.passRate}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(stage.passed / stage.inspected) * 100}%` }} />
                  <div className="bg-red-400 h-full transition-all" style={{ width: `${(stage.failed / stage.inspected) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defect Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Defect Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={defectData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count" stroke="none">
                {defectData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {defectData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-slate-500">{d.name}</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-white ml-auto">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inspections */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Recent Inspections</h3>
          <a href={`${basePath}/quality`} className="text-xs text-indigo-600 font-medium flex items-center gap-1">View All <ChevronRight size={12} /></a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspection #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Style</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspector</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inspected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fail</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pass Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision</th>
              </tr>
            </thead>
            <tbody>
              {qualityInspections.map(qi => {
                const passRate = ((qi.passQty / qi.inspectedQty) * 100).toFixed(1);
                return (
                  <tr key={qi.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{qi.inspectionNumber}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{qi.orderNumber}</p>
                      <p className="text-xs text-slate-500">{qi.styleName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {qi.stage.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600">{qi.inspectorName}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{qi.inspectedQty}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-emerald-600">{qi.passQty}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-red-600">{qi.failQty}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-sm font-semibold", Number(passRate) >= 97 ? "text-emerald-600" : Number(passRate) >= 95 ? "text-amber-600" : "text-red-600")}>
                        {passRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full",
                        qi.decision === "pass" ? "bg-emerald-100 text-emerald-700" :
                          qi.decision === "conditional-pass" ? "bg-amber-100 text-amber-700" :
                            qi.decision === "rework" ? "bg-orange-100 text-orange-700" :
                              "bg-red-100 text-red-700"
                      )}>
                        {qi.decision.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
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

export default QualityView;
