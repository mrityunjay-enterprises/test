"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn, formatCurrency, formatNumber, getStatusColor } from "@/lib/utils";
import { buyers as initialBuyers } from "@/lib/demo-data";
import { Buyer } from "@/lib/types";
import Link from "next/link";
import { Search, Plus, Download, MoreHorizontal, Star, Eye, Edit, Phone, Mail, Globe, Filter, ArrowUpDown, MapPin } from "lucide-react";

export function BuyersView({ basePath = "/owner" }: { basePath?: string }) {
  const [buyerList, setBuyerList] = useState<Buyer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_buyers");
      if (saved) {
        setBuyerList(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    setBuyerList(initialBuyers);
  }, []);

  const filtered = useMemo(() => {
    let result = [...buyerList];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.contactPerson.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") {
      result = result.filter(b => b.category === categoryFilter.toLowerCase());
    }
    return result;
  }, [buyerList, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Buyers</h1>
          <p className="text-sm text-slate-500 mt-1">{buyerList.length} registered buyers • {buyerList.filter(b => b.status === "active").length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
            <button onClick={() => setViewMode("grid")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-500")}>Grid</button>
            <button onClick={() => setViewMode("table")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", viewMode === "table" ? "bg-indigo-600 text-white" : "text-slate-500")}>Table</button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export
          </button>
          <Link href={`${basePath}/customers/new`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> Add Buyer
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search buyers..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
        </div>
        <div className="flex gap-2">
          {["All", "Export", "Domestic", "Both"].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all", categoryFilter === cat ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 stagger-children">
          {filtered.map(buyer => (
            <div key={buyer.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                    {buyer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{buyer.name}</h3>
                    <p className="text-xs text-slate-500">{buyer.code}</p>
                  </div>
                </div>
                <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border", getStatusColor(buyer.status))}>
                  {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">{buyer.city}, {buyer.country}</span>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded ml-auto", buyer.category === "export" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400")}>
                  {buyer.category.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-4 text-xs text-slate-500">
                <Mail size={12} />
                <span className="truncate">{buyer.email}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{buyer.totalOrders}</p>
                  <p className="text-[11px] text-slate-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formatNumber(buyer.totalOrderValue)}</p>
                  <p className="text-[11px] text-slate-500">Total Value</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{buyer.rating}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Rating</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link href={`${basePath}/customers/${buyer.id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">
                  View Profile
                </Link>
                <button className="flex-1 text-center py-2 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors">
                  Orders
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Orders</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Value</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(buyer => (
                <tr key={buyer.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">{buyer.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{buyer.name}</p>
                        <p className="text-xs text-slate-500">{buyer.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{buyer.contactPerson}</p>
                    <p className="text-xs text-slate-500">{buyer.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{buyer.city}, {buyer.country}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full", buyer.category === "export" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700")}>{buyer.category}</span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{buyer.totalOrders}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(buyer.totalOrderValue, buyer.currency)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-sm font-semibold">{buyer.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border", getStatusColor(buyer.status))}>
                      {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BuyersView;
