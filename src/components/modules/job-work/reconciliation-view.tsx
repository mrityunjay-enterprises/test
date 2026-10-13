"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { jobWorkOrders } from "@/lib/demo-data";
import { Calculator, CheckCircle, AlertTriangle } from "lucide-react";

const reconciliationItems = [
  { vendor: "Ace Embroidery Works", process: "Embroidery", order: "ORD-2025-0002", issued: 3200, receivedGood: 2800, rejected: 12, wastageAllowed: 32, netShortage: 0, status: "reconciled" },
  { vendor: "Clean Wash Pvt Ltd", process: "Enzyme Wash", order: "ORD-2025-0003", issued: 5000, receivedGood: 3200, rejected: 45, wastageAllowed: 50, netShortage: 0, status: "in-progress" },
  { vendor: "PrintCraft Industries", process: "Screen Printing", order: "ORD-2025-0005", issued: 8000, receivedGood: 7950, rejected: 30, wastageAllowed: 80, netShortage: 0, status: "reconciled" },
  { vendor: "JeanTech Laundry", process: "Laser Distressing", order: "ORD-2025-0003", issued: 5000, receivedGood: 0, rejected: 0, wastageAllowed: 50, netShortage: 5000, status: "pending" },
];

export function ReconciliationView({ basePath = "/owner" }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Vendor Material Reconciliation</h1>
        <p className="text-sm text-slate-500 mt-1">Reconcile issued fabric/cut components vs good received, rejects & allowable process loss</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Process</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Issued</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Good Recd</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rejects</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Process Loss Limit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {reconciliationItems.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{r.vendor}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{r.process}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{r.order}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700">{r.issued.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">{r.receivedGood.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-red-600">{r.rejected}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{r.wastageAllowed} pcs</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", r.status === "reconciled" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReconciliationView;
