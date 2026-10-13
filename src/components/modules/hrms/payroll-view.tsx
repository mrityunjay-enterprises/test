"use client";

import React, { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { payrollEntries } from "@/lib/demo-data";
import { Download, Search } from "lucide-react";

export function PayrollView({ basePath = "/owner" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = payrollEntries.filter(p =>
    p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGross = payrollEntries.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNet = payrollEntries.reduce((sum, p) => sum + p.netPay, 0);
  const totalPF = payrollEntries.reduce((sum, p) => sum + p.pfDeduction, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payroll Processing</h1>
          <p className="text-sm text-slate-500 mt-1">Salary Sheet • Attendance-based & statutory calculations</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Download size={16} /> Bank Transfer File
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalGross)}</p>
          <p className="text-sm text-slate-500 mt-1">Total Gross Payroll</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalNet)}</p>
          <p className="text-sm text-slate-500 mt-1">Total Net Disbursement</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(totalPF)}</p>
          <p className="text-sm text-slate-500 mt-1">Total Statutory PF / ESI</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search employee code, name, department..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Present / Working</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Pay</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PF / Deductions</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Pay</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3.5">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.employeeName}</p>
                  <p className="text-xs text-slate-400">{p.employeeCode}</p>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{p.department}</td>
                <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{p.presentDays} / {p.workingDays} days</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{formatCurrency(p.basicSalary)}</td>
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(p.grossPay)}</td>
                <td className="px-4 py-3.5 text-sm text-red-600">-{formatCurrency(p.totalDeductions)}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">{formatCurrency(p.netPay)}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full",
                    p.status === "locked" ? "bg-slate-100 text-slate-700" :
                      p.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                  )}>
                    {p.status.toUpperCase()}
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

export default PayrollView;
