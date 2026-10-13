"use client";

import React from "react";
import { Plus } from "lucide-react";
import { leaveRequests } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export function LeaveView({ basePath = "/factory" }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-1">Leave applications, accruals, team calendar & approvals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Days</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Approver</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map(lr => (
              <tr key={lr.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{lr.employeeName}</p>
                  <p className="text-xs text-slate-400">{lr.employeeCode} • {lr.department}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{lr.leaveType}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(lr.startDate)} - {formatDate(lr.endDate)}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">{lr.days} days</td>
                <td className="px-4 py-3.5 text-xs text-slate-500 max-w-xs truncate">{lr.reason}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{lr.approverName}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase">
                    {lr.status}
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

export default LeaveView;
