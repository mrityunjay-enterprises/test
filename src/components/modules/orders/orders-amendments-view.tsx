"use client";
import React from "react";
import { cn, formatDate } from "@/lib/utils";
import { Plus, FileEdit } from "lucide-react";

const amendments = [
  { id: "AMD-2025-001", order: "ORD-2025-0001", buyer: "Nordstrom", date: "2025-07-15", type: "Quantity Change", description: "Size XL qty increased from 800 to 1200 pcs. Total order revised to 5400 pcs.", impact: "Fabric +480m, delivery pushed by 3 days", status: "approved", approvedBy: "Arun Kapoor (MD)" },
  { id: "AMD-2025-002", order: "ORD-2025-0002", buyer: "M&S", date: "2025-07-18", type: "Color Change", description: "Color Burgundy replaced with Dusty Rose as per buyer's revised brief.", impact: "Re-sampling required, 5 day delay", status: "pending", approvedBy: "—" },
  { id: "AMD-2025-003", order: "ORD-2025-0005", buyer: "Target AU", date: "2025-07-20", type: "Delivery Date", description: "Ex-factory date moved from 30 Jul to 05 Aug per buyer logistics coordination.", impact: "No production impact, packing schedule adjusted", status: "approved", approvedBy: "Meera Joshi" },
];

export function OrdersAmendmentsView({ basePath }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Amendments</h1><p className="text-sm text-slate-500 mt-1">Track all changes to confirmed orders — qty, color, delivery, price revisions</p></div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"><Plus size={16} /> Log Amendment</button></div>
      <div className="space-y-4">{amendments.map(a => (
        <div key={a.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2"><FileEdit size={16} className="text-amber-500" /><span className="text-sm font-bold text-indigo-600">{a.id}</span><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{a.type}</span></div>
            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", a.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{a.status.toUpperCase()}</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300">{a.description}</p>
          <p className="text-xs text-red-600 mt-2 font-medium">Impact: {a.impact}</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
            <span>Order: <span className="font-semibold text-slate-600">{a.order}</span> ({a.buyer})</span><span>{formatDate(a.date)}</span><span>Approved by: {a.approvedBy}</span>
          </div>
        </div>
      ))}</div>
    </div>
  );
}
