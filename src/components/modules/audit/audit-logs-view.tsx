"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Activity, Shield, Search, User, Calendar, Clock, Terminal } from "lucide-react";

const auditLogsData = [
  { id: "al1", user: "Vikram Rathore", role: "Managing Director", module: "Orders", action: "UPDATE", record: "ORD-2025-0001", details: "Approved priority change from Medium to High", ip: "192.168.1.42", time: "2025-07-25 10:14 AM" },
  { id: "al2", user: "Kavita Sharma", role: "Quality Manager", module: "Quality", action: "CREATE", record: "QC-2025-0456", details: "Submitted inline stitching inspection results (Pass rate: 93.6%)", ip: "192.168.1.88", time: "2025-07-25 09:45 AM" },
  { id: "al3", user: "Rajendra Singh", role: "Cutting Manager", module: "Inventory", action: "ISSUE", record: "MI-2025-0567", details: "Issued 1200m Oxford Cotton White to Cutting Table 2", ip: "192.168.1.102", time: "2025-07-25 09:12 AM" },
  { id: "al4", user: "Priyanka Tiwari", role: "Accounts Manager", module: "Payroll", action: "APPROVE", record: "PAY-2025-06", details: "Approved June 2025 payroll run for 50 employees", ip: "192.168.1.55", time: "2025-07-24 05:30 PM" },
  { id: "al5", user: "Deepak Agarwal", role: "HR Manager", module: "HRMS", action: "UPDATE", record: "GF-016 (Rekha Devi)", details: "Updated leave status to Approved for 28-29 Jul", ip: "192.168.1.60", time: "2025-07-24 03:15 PM" },
  { id: "al6", user: "Sneha Kapoor", role: "Merchandiser", module: "Sampling", action: "DISPATCH", record: "SMP-2025-0128", details: "Dispatched Fit sample via DHL to Marks & Spencer London", ip: "192.168.1.75", time: "2025-07-23 02:20 PM" },
];

export function AuditLogsView({ basePath = "/owner" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = auditLogsData.filter(l =>
    l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.record.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Activity & Audit Trail</h1>
          <p className="text-sm text-slate-500 mt-1">Immutable security log of all user actions, approvals, edits & financial access</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search user, action, module, record..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Module</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Record Ref</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{log.time}</td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{log.user}</p>
                  <p className="text-xs text-slate-400">{log.role}</p>
                </td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300">{log.module}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded font-mono",
                    log.action === "CREATE" ? "bg-emerald-100 text-emerald-700" :
                    log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                    log.action === "APPROVE" ? "bg-purple-100 text-purple-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm font-mono text-indigo-600">{log.record}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{log.details}</td>
                <td className="px-4 py-3.5 text-xs font-mono text-slate-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogsView;
