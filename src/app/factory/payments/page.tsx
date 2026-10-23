"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, FileText, Crown, ArrowRight, Truck } from "lucide-react";

export default function FactoryPaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-6 shadow-sm animate-fade-in">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
        <ShieldAlert size={32} />
      </div>

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Contractor & Vendor Remittances are Restricted</h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Financial disbursements, bank ledger balances, and buyer payment reconciliations are managed strictly by Executive Accounts & Finance.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2">
        <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Truck size={15} className="text-indigo-600" /> Production Log Work:
        </p>
        <p className="text-slate-600 dark:text-slate-400">
          To log piece-rate operator bundles, shift output, or view material shipments, visit the respective production stations or Outbound Dispatch.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/factory/production"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <FileText size={15} /> Floor Production Tracking
        </Link>
        <Link
          href="/owner/payments"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Crown size={15} className="text-amber-500" /> Open in Owner Portal <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
