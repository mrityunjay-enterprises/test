"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { generateAttendanceData } from "@/lib/demo-data";
import { Search, Download } from "lucide-react";

export function AttendanceView({ basePath = "/factory" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const records = generateAttendanceData();

  const filtered = records.filter(r =>
    r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Attendance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Biometric import, daily shift logs, late entries & overtime tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Download size={16} /> Import Biometric Data
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search employee name or code..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Shift</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">In Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Out Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">OT Hours</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 35).map((r) => (
              <tr key={r.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{r.date}</td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{r.employeeName}</p>
                  <p className="text-xs text-slate-400">{r.employeeCode}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{r.shift}</td>
                <td className="px-4 py-3.5 text-sm font-mono text-slate-700">{r.inTime || "—"}</td>
                <td className="px-4 py-3.5 text-sm font-mono text-slate-700">{r.outTime || "—"}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{r.workingHours} hrs</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{r.overtimeHours > 0 ? `${r.overtimeHours} hrs` : "—"}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full",
                    r.status === "present" ? "bg-emerald-100 text-emerald-700" :
                      r.status === "late" ? "bg-amber-100 text-amber-700" :
                        r.status === "half-day" ? "bg-blue-100 text-blue-700" :
                          r.status === "weekly-off" ? "bg-slate-100 text-slate-600" :
                            "bg-red-100 text-red-700"
                  )}>
                    {r.status.toUpperCase()}
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

export default AttendanceView;
