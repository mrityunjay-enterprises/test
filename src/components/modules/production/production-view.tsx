"use client";

import React, { useState } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { productionPlans, dashboardData, productionLines as lines } from "@/lib/demo-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Factory, Zap, Target, Clock, TrendingUp, TrendingDown, ChevronRight, Timer } from "lucide-react";

const hourlyData = [
  { hour: "8 AM", target: 520, actual: 480, line: "Line A" },
  { hour: "9 AM", target: 520, actual: 510, line: "Line A" },
  { hour: "10 AM", target: 520, actual: 495, line: "Line A" },
  { hour: "11 AM", target: 520, actual: 530, line: "Line A" },
  { hour: "12 PM", target: 520, actual: 510, line: "Line A" },
  { hour: "1 PM", target: 0, actual: 0, line: "Line A" },
  { hour: "2 PM", target: 520, actual: 490, line: "Line A" },
  { hour: "3 PM", target: 520, actual: 460, line: "Line A" },
  { hour: "4 PM", target: 520, actual: 445, line: "Line A" },
];

export function ProductionView({ basePath = "/factory" }: { basePath?: string }) {
  const [selectedLine, setSelectedLine] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Production Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time production monitoring • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedLine} onChange={e => setSelectedLine(e.target.value)} className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
            <option value="all">All Lines</option>
            {lines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 stagger-children">
        {[
          { label: "Today's Target", value: "4,100", icon: <Target size={18} className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Actual Output", value: "3,420", icon: <Factory size={18} className="text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/40", change: "-16.6%", negative: true },
          { label: "Efficiency", value: "78.5%", icon: <Zap size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40", change: "-2.1%", negative: true },
          { label: "Active Lines", value: "5", icon: <Factory size={18} className="text-blue-600" />, bg: "bg-blue-100 dark:bg-blue-900/40" },
          { label: "WIP Bundles", value: "340", icon: <Clock size={18} className="text-purple-600" />, bg: "bg-purple-100 dark:bg-purple-900/40" },
          { label: "Downtime (min)", value: "45", icon: <Timer size={18} className="text-red-600" />, bg: "bg-red-100 dark:bg-red-900/40" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-500">{kpi.label}</p>
              {kpi.change && (
                <span className={cn("text-[11px] font-semibold", kpi.negative ? "text-red-600" : "text-emerald-600")}>
                  {kpi.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Line Performance + Hourly Production */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Status Cards */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Line Performance</h3>
          {dashboardData.lineEfficiency.map(line => {
            const isGood = line.efficiency >= line.target;
            const isWarning = !isGood && line.efficiency >= line.target - 10;
            return (
              <div key={line.name} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center",
                      isGood ? "bg-emerald-100 dark:bg-emerald-900/30" : isWarning ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30"
                    )}>
                      <Factory size={18} className={cn(isGood ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600")} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{line.name}</h4>
                      <p className="text-xs text-slate-500">{line.operators} operators • Target: {line.target}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-2xl font-bold", isGood ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600")}>
                      {line.efficiency}%
                    </p>
                    <p className="text-xs text-slate-400">efficiency</p>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700",
                    isGood ? "bg-gradient-to-r from-emerald-500 to-emerald-400" :
                      isWarning ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                        "bg-gradient-to-r from-red-500 to-red-400"
                  )} style={{ width: `${line.efficiency}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                  <span>Output: {formatNumber(line.output)} pcs</span>
                  <span className="flex items-center gap-1">
                    {isGood ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
                    {isGood ? "On target" : "Below target"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hourly Production Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Hourly Production</h3>
              <p className="text-sm text-slate-500 mt-0.5">Line A • Today&apos;s shift</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-500" /> Target</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500" /> Actual</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="target" fill="#c7d2fe" radius={[4, 4, 0, 0]} barSize={20} name="Target" />
              <Bar dataKey="actual" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Production Plans */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Active Production Plans</h3>
          <a href={`${basePath}/production`} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View All <ChevronRight size={12} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Style</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Line</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Planned Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timeline</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {productionPlans.map(plan => (
                <tr key={plan.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{plan.planNumber}</td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{plan.orderNumber}</p>
                    <p className="text-xs text-slate-500">{plan.styleName}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{plan.lineName}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{formatNumber(plan.plannedQty)}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{formatNumber(plan.actualQty)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full",
                          plan.efficiency >= 80 ? "bg-emerald-500" : plan.efficiency >= 70 ? "bg-amber-500" : "bg-red-500"
                        )} style={{ width: `${plan.efficiency}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{plan.efficiency}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {new Date(plan.plannedStartDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })} - {new Date(plan.plannedEndDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full",
                      plan.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        plan.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                          plan.status === "scheduled" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-600"
                    )}>
                      {plan.status.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProductionView;
