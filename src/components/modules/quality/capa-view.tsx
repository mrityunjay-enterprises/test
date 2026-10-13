"use client";

import React from "react";
import { cn, formatDate } from "@/lib/utils";
import { ShieldAlert, Plus, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const capaRecords = [
  { id: "CAPA-001", type: "Corrective", relatedDefect: "DEF-003 (Open Seam)", order: "ORD-2025-0001", rootCause: "Operator fatigue and lack of skill on heavy fabric. Feed dog not adjusted for canvas weight.", action: "Re-training 8 operators on canvas seaming. Implemented 10-min rest every 2 hours.", responsible: "Kavita Sharma", dueDate: "2025-07-28", status: "in-progress", effectiveness: "Pending verification" },
  { id: "CAPA-002", type: "Preventive", relatedDefect: "DEF-005 (Shade Variation)", order: "ORD-2025-0003", rootCause: "Fabric rolls from different dye lots mixed during spreading.", action: "Mandatory shade band matching before lay planning. QR-coded roll tracking system.", responsible: "Rajendra Singh", dueDate: "2025-07-30", status: "in-progress", effectiveness: "Pending verification" },
  { id: "CAPA-003", type: "Corrective", relatedDefect: "DEF-001 (Broken Stitch)", order: "ORD-2025-0004", rootCause: "Needle size DB×1 #14 incorrect for 280 GSM fleece. Needle breaking after 800 pcs.", action: "Changed to DB×1 #16 needles. Added needle change log every 500 pcs.", responsible: "Suresh Yadav", dueDate: "2025-07-25", status: "completed", effectiveness: "Broken stitch reduced from 12 to 2 per 100 pcs" },
  { id: "CAPA-004", type: "Preventive", relatedDefect: "DEF-006 (Oil Stains)", order: "All Lines", rootCause: "Overhead machine oil drip from faulty seals on Line B machines #14, #18.", action: "Replaced seals on 6 machines. Weekly seal inspection added to maintenance schedule.", responsible: "Maintenance Dept", dueDate: "2025-07-26", status: "completed", effectiveness: "Zero oil stain complaints for 5 consecutive days" },
];

export function CapaView({ basePath }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">CAPA - Corrective & Preventive Actions</h1>
          <p className="text-sm text-slate-500 mt-1">Root cause analysis, corrective measures & effectiveness verification</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> Raise CAPA
        </button>
      </div>

      <div className="space-y-4">
        {capaRecords.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", c.type === "Corrective" ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-amber-100 dark:bg-amber-900/30 text-amber-600")}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{c.id}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", c.type === "Corrective" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>{c.type}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", c.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{c.status.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Related: {c.relatedDefect} • Order: {c.order}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Due: {formatDate(c.dueDate)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Root Cause Analysis</p>
                <p className="text-slate-600 dark:text-slate-400">{c.rootCause}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                <p className="font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Action Taken</p>
                <p className="text-slate-600 dark:text-slate-400">{c.action}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span>Responsible: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.responsible}</span></span>
              <span>Effectiveness: <span className={cn("font-semibold", c.effectiveness.includes("Pending") ? "text-amber-600" : "text-emerald-600")}>{c.effectiveness}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
