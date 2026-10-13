"use client";
import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { orders, inventoryItems } from "@/lib/demo-data";
import { Calculator, AlertTriangle, CheckCircle } from "lucide-react";

const mrpData = [
  { order: "ORD-2025-0001", style: "Men's Oxford Shirt", item: "Oxford Cotton White", required: 6200, available: 1800, onOrder: 4000, shortfall: 400, unit: "meters", status: "shortage" },
  { order: "ORD-2025-0001", style: "Men's Oxford Shirt", item: "Shell Buttons 20mm - White", required: 35000, available: 40000, onOrder: 0, shortfall: 0, unit: "pcs", status: "sufficient" },
  { order: "ORD-2025-0001", style: "Men's Oxford Shirt", item: "Collar Fusing", required: 5200, available: 2000, onOrder: 5000, shortfall: 0, unit: "meters", status: "on-order" },
  { order: "ORD-2025-0003", style: "Men's Slim Denim", item: "Stretch Denim 10oz Dark Indigo", required: 18000, available: 400, onOrder: 0, shortfall: 17600, unit: "meters", status: "critical" },
  { order: "ORD-2025-0003", style: "Men's Slim Denim", item: "YKK Metal Zipper #5", required: 25000, available: 5000, onOrder: 15000, shortfall: 5000, unit: "pcs", status: "shortage" },
  { order: "ORD-2025-0005", style: "Kids' Graphic Tee", item: "Cotton Jersey 180GSM", required: 4500, available: 5000, onOrder: 0, shortfall: 0, unit: "meters", status: "sufficient" },
];

export function PlanningMrpView({ basePath }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Material Requirement Planning (MRP)</h1><p className="text-sm text-slate-500 mt-1">BOM explosion, stock matching, shortfall identification & procurement triggers</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Total Items", value: mrpData.length, color: "text-slate-800" }, { label: "Sufficient", value: mrpData.filter(m => m.status === "sufficient").length, color: "text-emerald-600" }, { label: "On Order", value: mrpData.filter(m => m.status === "on-order").length, color: "text-blue-600" }, { label: "Shortage / Critical", value: mrpData.filter(m => ["shortage", "critical"].includes(m.status)).length, color: "text-red-600" }].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center"><p className={cn("text-2xl font-bold", s.color)}>{s.value}</p><p className="text-xs text-slate-500 mt-1">{s.label}</p></div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table"><thead><tr className="border-b border-slate-100 dark:border-slate-800">
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order / Style</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Material</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Required</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Available</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">On Order</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Shortfall</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
        </tr></thead><tbody>
            {mrpData.map((m, i) => (
              <tr key={i} className={cn("border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors", m.status === "critical" && "bg-red-50/30 dark:bg-red-900/10")}>
                <td className="px-4 py-3.5"><p className="text-sm font-semibold text-indigo-600">{m.order}</p><p className="text-xs text-slate-400">{m.style}</p></td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-800 dark:text-white">{m.item}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700">{m.required.toLocaleString()} {m.unit}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-600">{m.available.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-sm text-blue-600">{m.onOrder.toLocaleString() || "—"}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-red-600">{m.shortfall > 0 ? m.shortfall.toLocaleString() : "—"}</td>
                <td className="px-4 py-3.5"><span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", m.status === "sufficient" ? "bg-emerald-100 text-emerald-700" : m.status === "on-order" ? "bg-blue-100 text-blue-700" : m.status === "critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{m.status.toUpperCase()}</span></td>
              </tr>
            ))}
          </tbody></table>
      </div>
    </div>
  );
}
