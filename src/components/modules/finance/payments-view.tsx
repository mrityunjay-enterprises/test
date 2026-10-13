"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { paymentReceipts, invoices } from "@/lib/demo-data";
import { PaymentReceipt } from "@/lib/types";
import { CreditCard, Plus, ArrowLeft, Search, CheckCircle2, DollarSign, Receipt, FileText } from "lucide-react";

export function PaymentsView({ basePath = "/owner" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReceipts = paymentReceipts.filter(r =>
    r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCollected = paymentReceipts.reduce((sum, r) => sum + (r.currency === "INR" ? r.amount : r.amount * 83), 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`${basePath}/invoices`} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payment Receipts Log</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">Owner & Finance Manager payment settlement register — SWIFT wire, RTGS/NEFT & Letter of Credit (LC) remittances</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}/invoices`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Receipt size={16} /> All Invoices
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Settled Receipts</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹ {(totalCollected / 100000).toFixed(2)} L</p>
          <p className="text-xs text-slate-400 mt-1">{paymentReceipts.length} payment entries verified</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Wire / SWIFT Remittances</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">£ 30,000 / $ 116,000</p>
          <p className="text-xs text-slate-400 mt-1">Export bank accounts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domestic RTGS / NEFT</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹ 84.78 Lakhs</p>
          <p className="text-xs text-slate-400 mt-1">SBI Domestic Account</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search receipt #, invoice #, buyer or ref #..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        />
      </div>

      {/* Receipts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Receipt #</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer Name</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment Mode</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference / UTR #</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Settled</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-4 text-sm font-bold text-indigo-600">{r.receiptNumber}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{r.invoiceNumber}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">{r.buyerName}</td>
                <td className="px-4 py-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    {r.paymentMode.replace(/-/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs font-mono text-slate-500">{r.referenceNumber}</td>
                <td className="px-4 py-4 text-sm font-bold text-emerald-600">
                  {r.currency} {r.amount.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">{formatDate(r.paymentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PaymentsView;
