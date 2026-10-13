"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { samples } from "@/lib/demo-data";
import { Palette, Plus, Search, Filter, Download, Clock, CheckCircle, RefreshCw, Eye } from "lucide-react";

export function SamplingView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = samples.filter(s =>
    s.sampleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.styleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sampling Management</h1>
          <p className="text-sm text-slate-500 mt-1">Proto, fit, size-set & pre-production sample development & approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`${prefix}/sampling/new`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> Request Sample
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search sample #, buyer, style..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sample #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer / Style</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Merchandiser</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Revision</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{s.sampleNumber}</td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{s.buyerName}</p>
                  <p className="text-xs text-slate-500">{s.styleName}</p>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                    {s.type.replace(/-/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{s.quantity} pcs</td>
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{s.merchandiserName}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{formatDate(s.requiredDate)}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-700">Rev {s.revision}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border", getStatusColor(s.status))}>
                    {s.status.replace(/-/g, " ").toUpperCase()}
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
