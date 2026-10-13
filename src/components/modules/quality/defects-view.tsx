"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Search, AlertTriangle, Filter } from "lucide-react";

const defectsLibrary = [
  { id: 1, code: "DEF-001", name: "Broken Stitch", category: "Stitching", severity: "Major", frequency: 145, stage: "Inline", rootCause: "Needle damage / tension setting", correctiveAction: "Replace needle, re-calibrate tension" },
  { id: 2, code: "DEF-002", name: "Skip Stitch", category: "Stitching", severity: "Major", frequency: 98, stage: "Inline", rootCause: "Bent needle / incorrect presser foot", correctiveAction: "Change needle, adjust presser foot pressure" },
  { id: 3, code: "DEF-003", name: "Open Seam", category: "Stitching", severity: "Critical", frequency: 67, stage: "End-line", rootCause: "Operator error / poor workmanship", correctiveAction: "Operator re-training, daily skill audit" },
  { id: 4, code: "DEF-004", name: "Puckering", category: "Stitching", severity: "Major", frequency: 89, stage: "Inline", rootCause: "Thread tension mismatch / feed dog issue", correctiveAction: "Adjust thread tension, check feed mechanism" },
  { id: 5, code: "DEF-005", name: "Shade Variation", category: "Fabric", severity: "Critical", frequency: 34, stage: "Pre-cutting", rootCause: "Batch-to-batch dyeing variance", correctiveAction: "Shade grouping before cutting, 4-point inspection" },
  { id: 6, code: "DEF-006", name: "Stain / Oil Mark", category: "General", severity: "Minor", frequency: 112, stage: "Finishing", rootCause: "Machine oil leak / operator handling", correctiveAction: "Machine maintenance, handling gloves" },
  { id: 7, code: "DEF-007", name: "Measurement Out of Tolerance", category: "Measurement", severity: "Critical", frequency: 45, stage: "End-line", rootCause: "Pattern grading error / shrinkage", correctiveAction: "Re-check patterns, wash test before bulk" },
  { id: 8, code: "DEF-008", name: "Button / Snap Missing", category: "Accessories", severity: "Major", frequency: 56, stage: "Finishing", rootCause: "Attachment machine misalignment", correctiveAction: "Calibrate button attaching machine" },
  { id: 9, code: "DEF-009", name: "Label Error", category: "Accessories", severity: "Minor", frequency: 23, stage: "Finishing", rootCause: "Incorrect label allocation by store", correctiveAction: "Pre-production label verification checklist" },
  { id: 10, code: "DEF-010", name: "Hole / Tear in Fabric", category: "Fabric", severity: "Critical", frequency: 18, stage: "Cutting", rootCause: "Blade damage / fabric handling", correctiveAction: "Replace blade, careful spreading process" },
];

export function DefectsView({ basePath }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filtered = defectsLibrary.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase()) || d.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "All" || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Defect Library & Classification</h1>
        <p className="text-sm text-slate-500 mt-1">Standardized defect codes, severity ratings, root cause mapping & corrective actions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search defect code, name, category..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
        </div>
        <div className="flex gap-1">
          {["All", "Critical", "Major", "Minor"].map(sv => (
            <button key={sv} onClick={() => setSeverityFilter(sv)} className={cn("px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all", severityFilter === sv ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700")}>
              {sv}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Defect Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Occurrences</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detection Stage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Root Cause</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Corrective Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-mono font-semibold text-indigo-600">{d.code}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{d.name}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{d.category}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", d.severity === "Critical" ? "bg-red-100 text-red-700" : d.severity === "Major" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white">{d.frequency}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{d.stage}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[180px] truncate">{d.rootCause}</td>
                  <td className="px-4 py-3.5 text-xs text-emerald-600 font-medium max-w-[200px] truncate">{d.correctiveAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
