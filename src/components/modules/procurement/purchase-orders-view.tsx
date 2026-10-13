"use client";

import React, { useState } from "react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { purchaseOrders } from "@/lib/demo-data";
import { Search, Plus, Download, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

import Link from "next/link";

export function PurchaseOrdersView({ basePath = "/owner" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = purchaseOrders.filter(po =>
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Purchase Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Material procurement, PO tracking & supplier delivery status</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export
          </button>
          <Link href={`${basePath}/purchase`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> Create PO
          </Link>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search PO number, supplier..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PO Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivery Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(po => (
              <tr key={po.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{po.poNumber}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-800 dark:text-white">{po.supplierName}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{po.deliveryLocation}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(po.total)}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{formatDate(po.deliveryDate)}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", po.approvalStatus === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {po.approvalStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full",
                    po.deliveryStatus === "complete" ? "bg-emerald-100 text-emerald-700" :
                      po.deliveryStatus === "partial" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                  )}>
                    {po.deliveryStatus.toUpperCase()}
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

export default PurchaseOrdersView;
