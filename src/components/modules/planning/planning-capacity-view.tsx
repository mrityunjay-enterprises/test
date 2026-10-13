"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { productionLines } from "@/lib/demo-data";

const capacityData = [
  { line: "Line A", capacity: 600, booked: 520, orders: ["ORD-2025-0001"], week1: 85, week2: 90, week3: 70, week4: 60, status: "near-full" },
  { line: "Line B", capacity: 550, booked: 550, orders: ["ORD-2025-0002"], week1: 100, week2: 100, week3: 80, week4: 0, status: "full" },
  { line: "Line C", capacity: 500, booked: 430, orders: ["ORD-2025-0004", "ORD-2025-0005"], week1: 95, week2: 85, week3: 75, week4: 65, status: "available" },
  { line: "Line D", capacity: 700, booked: 700, orders: ["ORD-2025-0003"], week1: 100, week2: 100, week3: 100, week4: 100, status: "full" },
  { line: "Line E", capacity: 650, booked: 380, orders: ["ORD-2025-0007"], week1: 60, week2: 55, week3: 50, week4: 0, status: "available" },
];

export function PlanningCapacityView({ basePath }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Capacity Planning</h1><p className="text-sm text-slate-500 mt-1">Line-wise capacity loading, weekly utilization forecast & bottleneck identification</p></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table"><thead><tr className="border-b border-slate-100 dark:border-slate-800">
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Line</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Capacity/Day</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Booked</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Orders</th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Week 1</th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Week 2</th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Week 3</th>
          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Week 4</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
        </tr></thead><tbody>
            {capacityData.map(c => (
              <tr key={c.line} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{c.line}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.capacity} pcs</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{c.booked} pcs</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{c.orders.join(", ")}</td>
                {[c.week1, c.week2, c.week3, c.week4].map((w, i) => (
                  <td key={i} className="px-4 py-3.5 text-center"><div className="w-12 h-5 mx-auto rounded-md flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: w >= 90 ? "#fef2f2" : w >= 70 ? "#fffbeb" : w > 0 ? "#f0fdf4" : "#f8fafc", color: w >= 90 ? "#dc2626" : w >= 70 ? "#d97706" : w > 0 ? "#16a34a" : "#94a3b8" }}>{w > 0 ? `${w}%` : "—"}</div></td>
                ))}
                <td className="px-4 py-3.5"><span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", c.status === "full" ? "bg-red-100 text-red-700" : c.status === "near-full" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>{c.status.toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody></table>
      </div>
    </div>
  );
}
