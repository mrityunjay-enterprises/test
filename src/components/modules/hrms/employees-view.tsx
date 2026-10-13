"use client";

import React, { useState, useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { employees } from "@/lib/demo-data";
import { Search, Plus, Download } from "lucide-react";

const departmentFilters = ["All", "Management", "Merchandising", "Cutting", "Stitching", "Quality Control", "Finishing", "Store / Warehouse", "HR & Admin", "Accounts"];
const typeFilters = ["All", "Permanent", "Contract", "Daily Wage", "Piece Rate", "Trainee"];

export function EmployeesView({ basePath = "/owner" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = useMemo(() => {
    let result = [...employees];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.fullName.toLowerCase().includes(q) || e.employeeCode.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q));
    }
    if (deptFilter !== "All") result = result.filter(e => e.department === deptFilter);
    if (typeFilter !== "All") result = result.filter(e => e.employmentType === typeFilter.toLowerCase().replace(/ /g, "-"));
    return result;
  }, [searchQuery, deptFilter, typeFilter]);

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "active").length,
    permanent: employees.filter(e => e.employmentType === "permanent").length,
    production: employees.filter(e => ["Cutting", "Stitching", "Finishing"].includes(e.department)).length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">{stats.total} employees • {stats.active} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 transition-colors"><Download size={16} /> Export</button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"><Plus size={16} /> Add Employee</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: stats.total, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Active", value: stats.active, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
          { label: "Permanent Staff", value: stats.permanent, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/40" },
          { label: "Production Workers", value: stats.production, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/40" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, code, designation..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {departmentFilters.slice(0, 6).map(dept => (
            <button key={dept} onClick={() => setDeptFilter(dept)} className={cn("px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all", deptFilter === dept ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50")}>
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Factory</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map((emp) => (
                <tr key={emp.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {emp.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{emp.fullName}</span>
                        <p className="text-xs text-slate-500">{emp.employeeCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{emp.department}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{emp.designation}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{emp.factory || "Mrityunjay Enterprises"}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      emp.employmentType === "permanent" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        emp.employmentType === "daily-wage" ? "bg-amber-100 text-amber-700" :
                          emp.employmentType === "piece-rate" ? "bg-purple-100 text-purple-700" :
                            "bg-slate-100 text-slate-600"
                    )}>
                      {emp.employmentType.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-400">{emp.shift}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(emp.grossSalary)}</td>
                  <td className="px-4 py-3.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5" />
                    <span className="text-xs text-emerald-600 font-medium">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500">Showing {Math.min(filtered.length, 30)} of {filtered.length} employees</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white">1</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:bg-slate-100">2</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeesView;
