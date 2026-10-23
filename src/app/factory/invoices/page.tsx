"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, FileText, Crown, ArrowRight } from "lucide-react";

export default function FactoryInvoicesPage() {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-sm animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
        <ShieldAlert size={32} />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Commercial Invoices are Restricted</h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Buyer FOB pricing, GST tax invoices, and commercial receivables are managed centrally by the Accounts & Executive Office.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FileText size={15} className="text-indigo-600" /> Factory Floor Movement:
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          For factory material dispatch, transporter memos, gate passes, and delivery challans (DC), please use the Outbound Dispatch Station.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/factory/dispatch"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FileText size={15} /> Open Delivery Challans & Gate Passes
        </Link>
        <Link
          href="/owner/invoices"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Crown size={15} className="text-amber-500" /> Open in Owner Portal <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
