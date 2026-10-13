"use client";

import React, { useState, useMemo } from "react";
import { cn, formatCurrency, formatNumber, getStatusColor } from "@/lib/utils";
import { inventoryItems } from "@/lib/demo-data";
import { Search, Plus, Download, Package, Layers, AlertTriangle, Warehouse } from "lucide-react";

export function InventoryView({ basePath = "/factory" }: { basePath?: string }) {
  const [activeTab, setActiveTab] = useState<"items" | "fabric">("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredItems = useMemo(() => {
    let result = [...inventoryItems];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => i.itemName.toLowerCase().includes(q) || i.itemCode.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== "All") {
      result = result.filter(i => i.category === categoryFilter);
    }
    return result;
  }, [searchQuery, categoryFilter]);

  const categories = ["All", "Fabric", "Accessories", "Packing"];

  const stats = {
    totalValue: inventoryItems.reduce((acc, i) => acc + i.stockValue, 0),
    lowStock: inventoryItems.filter(i => i.status === "low-stock").length,
    outOfStock: inventoryItems.filter(i => i.status === "out-of-stock").length,
    totalItems: inventoryItems.length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Inventory & Warehouse</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time stock management, fabric rolls & warehouse tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> Material Issue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        {[
          { label: "Total Valuation", value: formatCurrency(stats.totalValue), icon: <Package size={18} className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Total SKUs", value: stats.totalItems, icon: <Layers size={18} className="text-blue-600" />, bg: "bg-blue-100 dark:bg-blue-900/40" },
          { label: "Low Stock Items", value: stats.lowStock, icon: <AlertTriangle size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40" },
          { label: "Out of Stock", value: stats.outOfStock, icon: <AlertTriangle size={18} className="text-red-600" />, bg: "bg-red-100 dark:bg-red-900/40" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", stat.bg)}>{stat.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
          <button onClick={() => setActiveTab("items")} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "items" ? "bg-indigo-600 text-white" : "text-slate-500")}>Item Master Stock</button>
          <button onClick={() => setActiveTab("fabric")} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", activeTab === "fabric" ? "bg-indigo-600 text-white" : "text-slate-500")}>Fabric Rolls</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search inventory..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>
          {activeTab === "items" && (
            <div className="flex gap-1 overflow-x-auto">
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn("px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all", categoryFilter === cat ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700")}>
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "items" ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Item Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Warehouse</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reserved</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valuation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{item.itemCode}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{item.itemName}</p>
                      <p className="text-xs text-slate-400">{item.unit}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{item.category}</td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{item.warehouseName}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{formatNumber(item.currentStock)} {item.unit}</td>
                    <td className="px-4 py-3.5 text-sm text-amber-600 font-medium">{formatNumber(item.reservedStock)}</td>
                    <td className="px-4 py-3.5 text-sm text-emerald-600 font-semibold">{formatNumber(item.availableStock)}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(item.stockValue)}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border", getStatusColor(item.status))}>
                        {item.status.replace(/-/g, " ").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Fabric Roll Tracking & Shade Grouping</h3>
          <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Warehouse size={36} className="mx-auto text-indigo-500 mb-3" />
            <h4 className="font-semibold text-slate-800 dark:text-white">Fabric Roll Inspection & Allocation</h4>
            <p className="text-sm max-w-md mx-auto mt-1">Roll-wise shade grouping, 4-Point inspection scoring, and relaxation status tracking before cutting issue.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryView;
