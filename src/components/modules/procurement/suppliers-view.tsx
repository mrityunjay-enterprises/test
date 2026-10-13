"use client";

import React, { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { suppliers } from "@/lib/demo-data";
import { Search, Plus, Star, MapPin, Phone } from "lucide-react";

export function SuppliersView({ basePath = "/owner" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.categories.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Supplier Directory & Ratings</h1>
          <p className="text-sm text-slate-500 mt-1">Fabric mills, accessories vendors, job-work partners & sub-contractors</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search supplier name, category..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-bold text-sm">{s.name.charAt(0)}</div>
              <div className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.rating}</span></div>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.name}</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-1 inline-block">{s.categories.join(", ")}</span>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
              <p className="flex items-center gap-1.5"><MapPin size={12} />{s.city}, {s.state}</p>
              <p className="flex items-center gap-1.5"><Phone size={12} />{s.phone}</p>
              <p>Contact: <span className="font-medium text-slate-700 dark:text-slate-300">{s.contactPerson}</span></p>
              <p>Payment: <span className="font-medium text-slate-700 dark:text-slate-300">{s.paymentTerms}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SuppliersView;
