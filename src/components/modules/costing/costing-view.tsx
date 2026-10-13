"use client";
import React from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { orders } from "@/lib/demo-data";
import { Calculator, DollarSign, TrendingUp } from "lucide-react";

const costingData = [
  { order: "ORD-2025-0001", style: "Men's Oxford Shirt", buyer: "Nordstrom", fob: 14.50, currency: "USD", fabric: 4.20, trims: 1.80, cmtLabor: 3.50, embellishment: 0.00, washing: 0.50, packing: 0.80, overhead: 1.20, totalCost: 12.00, margin: 2.50, marginPct: 17.2 },
  { order: "ORD-2025-0002", style: "Women's Maxi Dress", buyer: "M&S", fob: 22.00, currency: "GBP", fabric: 7.50, trims: 2.20, cmtLabor: 4.80, embellishment: 2.50, washing: 0.00, packing: 1.00, overhead: 1.50, totalCost: 19.50, margin: 2.50, marginPct: 11.4 },
  { order: "ORD-2025-0003", style: "Men's Slim Denim", buyer: "Zara", fob: 18.50, currency: "EUR", fabric: 5.80, trims: 1.50, cmtLabor: 4.20, embellishment: 0.00, washing: 2.00, packing: 0.90, overhead: 1.30, totalCost: 15.70, margin: 2.80, marginPct: 15.1 },
  { order: "ORD-2025-0004", style: "Men's Polo T-Shirt", buyer: "Reliance", fob: 285, currency: "INR", fabric: 85, trims: 25, cmtLabor: 65, embellishment: 15, washing: 0, packing: 20, overhead: 30, totalCost: 240, margin: 45, marginPct: 15.8 },
];

export function CostingView({ basePath = "/owner" }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Costing & Profitability</h1><p className="text-sm text-slate-500 mt-1">FOB breakdown, cost analysis, margin calculation & profitability tracking per order</p></div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full data-table"><thead><tr className="border-b border-slate-100 dark:border-slate-800">
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">FOB</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Fabric</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Trims</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">CMT</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Embell.</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Washing</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Packing</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">OH</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total Cost</th>
          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Margin</th>
        </tr></thead><tbody>
            {costingData.map(c => (
              <tr key={c.order} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5"><p className="text-sm font-semibold text-indigo-600">{c.order}</p><p className="text-xs text-slate-400">{c.style} ({c.buyer})</p></td>
                <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{c.currency} {c.fob}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.fabric}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.trims}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.cmtLabor}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.embellishment || "—"}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.washing || "—"}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.packing}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{c.overhead}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-red-600">{c.totalCost}</td>
                <td className="px-4 py-3.5"><span className={cn("text-sm font-bold", c.marginPct >= 15 ? "text-emerald-600" : "text-amber-600")}>{c.margin} ({c.marginPct}%)</span></td>
              </tr>
            ))}
          </tbody></table></div>
      </div>
    </div>
  );
}

export default CostingView;
