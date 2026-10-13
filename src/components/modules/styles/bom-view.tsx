"use client";

import React, { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { styles } from "@/lib/demo-data";
import { Search, Plus, Layers, FileText } from "lucide-react";

const bomItems = [
  { id: 1, style: "STL-2025-001 (Men's Oxford Shirt)", item: "Oxford Cotton 80s 2-ply", category: "Fabric", cons: 1.35, unit: "meters", rate: 185, total: 249.75, supplier: "Arvind Mills", status: "Approved" },
  { id: 2, style: "STL-2025-001 (Men's Oxford Shirt)", item: "Woven Collar Interlining 75GSM", category: "Fabric", cons: 0.25, unit: "meters", rate: 45, total: 11.25, supplier: "Freudenberg", status: "Approved" },
  { id: 3, style: "STL-2025-001 (Men's Oxford Shirt)", item: "Mother of Pearl Buttons 18L", category: "Trims", cons: 14, unit: "pcs", rate: 2.20, total: 30.80, supplier: "YKK India", status: "Approved" },
  { id: 4, style: "STL-2025-001 (Men's Oxford Shirt)", item: "Coats Epic #120 Thread - White", category: "Thread", cons: 120, unit: "meters", rate: 0.15, total: 18.00, supplier: "Coats India", status: "Approved" },
  { id: 5, style: "STL-2025-001 (Men's Oxford Shirt)", item: "Woven Main Brand Label - Nordstrom", category: "Label", cons: 1, unit: "pcs", rate: 4.50, total: 4.50, supplier: "SML Labels", status: "Approved" },
  { id: 6, style: "STL-2025-001 (Men's Oxford Shirt)", item: "Recycled Poly-bag 14x18", category: "Packaging", cons: 1, unit: "pcs", rate: 3.20, total: 3.20, supplier: "PackPro", status: "Approved" },
];

export function StyleBomView({ basePath }: { basePath?: string }) {
  const [selectedStyle, setSelectedStyle] = useState(styles[0]?.id || "");

  const totalBomCost = bomItems.reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bill of Materials (BOM) Master</h1>
          <p className="text-sm text-slate-500 mt-1">Multi-level BOM specification, consumption rates, yields & costings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> Add Material Line
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-500 uppercase">Select Style:</label>
        <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold">
          {styles.map(s => <option key={s.id} value={s.id}>{s.styleNumber} — {s.styleName} ({s.category})</option>)}
        </select>
        <div className="ml-auto text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl">
          Total BOM Cost: ₹{totalBomCost.toFixed(2)} / pc
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Item Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Consumption / Pc</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Unit</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Unit Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total Cost / Pc</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nominated Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {bomItems.map(b => (
              <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{b.item}</td>
                <td className="px-4 py-3.5"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">{b.category}</span></td>
                <td className="px-4 py-3.5 text-sm font-bold text-indigo-600">{b.cons}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{b.unit}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">₹{b.rate}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">₹{b.total.toFixed(2)}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{b.supplier}</td>
                <td className="px-4 py-3.5"><span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
