"use client";

import React, { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { samples } from "@/lib/demo-data";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export function SamplingApprovalsView({ basePath }: { basePath?: string }) {
  const pendingApprovals = samples.filter(s => s.status === "buyer-comments" || s.status === "internal-review");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sample Approval Queue & Buyer Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">Track samples sent to buyers, approval status, fit comments & revision history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingApprovals.length}</p>
          <p className="text-xs text-slate-500 mt-1">Awaiting Buyer Decision</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-emerald-600">{samples.filter(s => s.status === "approved").length}</p>
          <p className="text-xs text-slate-500 mt-1">Approved Samples</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-red-600">{samples.filter(s => s.status === "rejected" || s.status === "revision-required").length}</p>
          <p className="text-xs text-slate-500 mt-1">Rejected / Revision Required</p>
        </div>
      </div>

      <div className="space-y-4">
        {samples.map(s => (
          <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-indigo-600">{s.sampleNumber}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 capitalize">{s.type.replace(/-/g, " ")}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{s.styleName}</h3>
                <p className="text-xs text-slate-500">Buyer: {s.buyerName} • Tailor: {s.tailorName || "Master Tailor"}</p>
              </div>
              <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize", s.status === "approved" ? "bg-emerald-100 text-emerald-700" : s.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                {s.status.replace(/-/g, " ")}
              </span>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
              <span>Requested: {formatDate(s.requestedDate)}</span>
              <span>Required: {formatDate(s.requiredDate)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
