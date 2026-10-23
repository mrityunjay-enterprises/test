"use client";

import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { generateAttendanceData, employees as initialEmployees } from "@/lib/demo-data";
import { AttendanceRecord, Employee } from "@/lib/types";
import {
  Search,
  Download,
  Plus,
  Clock,
  CheckCircle2,
  X,
  Calendar,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
  Building,
} from "lucide-react";

export function AttendanceView({ basePath = "/factory" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("2025-07-25");
  const [filterShift, setFilterShift] = useState("all");
  const [filterOT, setFilterOT] = useState(false);

  // LocalStorage-backed attendance records with SSR hydration safety
  const [records, setRecords] = useState<AttendanceRecord[]>(generateAttendanceData);
  const [isHydrated, setIsHydrated] = useState(false);

  // Modals & Notifications
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Overtime Form State
  const [otForm, setOtForm] = useState({
    employeeId: "e12",
    employeeName: "Mohan Lal Saini",
    employeeCode: "GF-012",
    department: "Stitching",
    date: new Date().toISOString().split("T")[0],
    hours: 2,
    multiplier: "1.5", // 1.5x standard, 2.0x holiday
    reason: "Urgent shipment dispatch packing for Order PO-2025-8849",
    approvedBy: "Meera Joshi (Production Manager)",
  });

  // Load from localStorage only after initial client mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_attendance");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load attendance from localStorage", e);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage only after client hydration is complete
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("garmentflow_attendance", JSON.stringify(records));
    } catch (e) {
      console.error("Failed to persist attendance", e);
    }
  }, [records, isHydrated]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Get employee list for dropdown (SSR safe)
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>(initialEmployees);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_employees");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployeeOptions(parsed);
        }
      }
    } catch (e) {}
  }, []);

  // Handle employee change in OT modal
  const handleEmployeeSelect = (empId: string) => {
    const emp = employeeOptions.find((e) => e.id === empId);
    if (emp) {
      setOtForm((prev) => ({
        ...prev,
        employeeId: emp.id,
        employeeName: emp.fullName,
        employeeCode: emp.employeeCode,
        department: emp.department,
      }));
    }
  };

  // Submit Overtime Log
  const handleLogOvertime = (e: React.FormEvent) => {
    e.preventDefault();

    const existingIdx = records.findIndex(
      (r) => r.employeeCode === otForm.employeeCode && r.date === otForm.date
    );

    if (existingIdx >= 0) {
      // Update existing record
      const updated = [...records];
      updated[existingIdx] = {
        ...updated[existingIdx],
        overtimeHours: Number(otForm.hours),
        remarks: `OT Logged: ${otForm.hours} hrs (${otForm.multiplier}x) — ${otForm.reason}`,
      };
      setRecords(updated);
    } else {
      // Add new record for this date
      const newRecord: AttendanceRecord = {
        id: "att_" + Date.now(),
        employeeId: otForm.employeeId,
        employeeName: otForm.employeeName,
        employeeCode: otForm.employeeCode,
        date: otForm.date,
        shift: "General",
        inTime: "09:00 AM",
        outTime: `${6 + Number(otForm.hours)}:00 PM`,
        workingHours: 8 + Number(otForm.hours),
        overtimeHours: Number(otForm.hours),
        status: "present",
        lateMinutes: 0,
        earlyExitMinutes: 0,
        remarks: `Approved OT: ${otForm.hours} hrs (${otForm.multiplier}x) for ${otForm.reason}`,
      };
      setRecords([newRecord, ...records]);
    }

    setIsOTModalOpen(false);
    showToast(
      `Overtime of ${otForm.hours} hrs approved & recorded for ${otForm.employeeName}!`
    );
  };

  // Simulate Biometric Device Sync
  const handleImportBiometric = () => {
    showToast("Connecting to factory biometric punch clock (Essl / ZKTeco)...");
    setTimeout(() => {
      // Boost 6 operators with 2 hours overtime from today's evening shift
      const updated = records.map((r, i) => {
        if (i < 8 && r.status === "present") {
          return {
            ...r,
            outTime: "08:15 PM",
            overtimeHours: 2,
            workingHours: 10,
            remarks: "Auto-detected via Biometric Punch Out (2.0 hrs OT)",
          };
        }
        return r;
      });
      setRecords(updated);
      showToast("Biometric logs imported! 8 operators clocked 2 hrs overtime.");
    }, 800);
  };

  // Filter records
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.shift.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesShift = filterShift === "all" || r.shift === filterShift;
      const matchesOT = !filterOT || r.overtimeHours > 0;
      return matchesSearch && matchesShift && matchesOT;
    });
  }, [records, searchQuery, filterShift, filterOT]);

  // Statistics
  const totalPresent = records.filter((r) => r.status === "present").length;
  const totalLate = records.filter((r) => r.status === "late").length;
  const totalOTRecords = records.filter((r) => r.overtimeHours > 0);
  const totalOTHours = totalOTRecords.reduce((sum, r) => sum + r.overtimeHours, 0);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 text-sm font-medium animate-slide-in">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Attendance & Overtime Management
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold uppercase tracking-wider">
              Shift & OT Tracking
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Biometric punch records, shift roster, supervisor overtime approvals & wage integration
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleImportBiometric}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={14} className="text-indigo-600 dark:text-indigo-400" />
            Sync Biometric Clocks
          </button>
          <button
            onClick={() => setIsOTModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25 active:scale-95"
          >
            <Clock size={15} />
            + Authorize Overtime (OT)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600" suppressHydrationWarning>{totalPresent}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Present on Shift</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-amber-600" suppressHydrationWarning>{totalLate}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Late Punch In</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600" suppressHydrationWarning>{totalOTHours} hrs</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Overtime Hours</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{totalOTRecords.length} staff</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Workers with Active OT</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by worker name, staff code (e.g. GF-012)..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Shifts</option>
            <option value="General">General Shift</option>
            <option value="A-Shift">A-Shift (Morning)</option>
            <option value="B-Shift">B-Shift (Evening)</option>
          </select>

          <button
            onClick={() => setFilterOT(!filterOT)}
            className={cn(
              "h-10 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
              filterOT
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            )}
          >
            <Clock size={14} />
            {filterOT ? "Showing OT Workers Only" : "Filter Overtime"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  In / Out Time
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Standard Work
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overtime (OT)
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Notes / Approval
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.slice(0, 40).map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-600 dark:text-slate-400">
                    {r.date}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {r.employeeName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{r.employeeCode}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 text-xs">
                    {r.shift}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{r.inTime || "—"}</span> →{" "}
                    <span className="font-semibold">{r.outTime || "—"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {r.workingHours} hrs
                  </td>
                  <td className="px-4 py-3.5">
                    {r.overtimeHours > 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-xs text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                        <Clock size={12} />
                        +{r.overtimeHours} hrs OT
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        r.status === "present"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : r.status === "late"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[220px] truncate">
                    {r.remarks || "Regular shift duty"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <p className="text-xs text-slate-500 font-medium">
            Showing {Math.min(filtered.length, 40)} of {filtered.length} shift logs
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* AUTHORIZE / LOG OVERTIME MODAL                           */}
      {/* ======================================================== */}
      {isOTModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Authorize Employee Overtime (OT)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Log overtime hours to be credited into monthly payroll
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOTModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogOvertime} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Employee / Operator <span className="text-red-500">*</span>
                </label>
                <select
                  value={otForm.employeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeCode}) — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Overtime
                  </label>
                  <input
                    type="date"
                    required
                    value={otForm.date}
                    onChange={(e) => setOtForm({ ...otForm, date: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Overtime Duration
                  </label>
                  <select
                    value={otForm.hours}
                    onChange={(e) => setOtForm({ ...otForm, hours: Number(e.target.value) })}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-indigo-600"
                  >
                    <option value={1}>1.0 Hour</option>
                    <option value={1.5}>1.5 Hours</option>
                    <option value={2}>2.0 Hours (Standard Line OT)</option>
                    <option value={2.5}>2.5 Hours</option>
                    <option value={3}>3.0 Hours (Rush Shipment)</option>
                    <option value={4}>4.0 Hours (Half Sunday Shift)</option>
                    <option value={8}>8.0 Hours (Full Sunday Shift)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rate Multiplier
                  </label>
                  <select
                    value={otForm.multiplier}
                    onChange={(e) => setOtForm({ ...otForm, multiplier: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="1.5">1.5x Hourly Rate (Weekday OT)</option>
                    <option value="2.0">2.0x Double Rate (Sunday / Holiday)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Authorizing Supervisor
                  </label>
                  <input
                    type="text"
                    value={otForm.approvedBy}
                    onChange={(e) => setOtForm({ ...otForm, approvedBy: e.target.value })}
                    className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Linked Buyer Order PO
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra sewing & buttoning for Zara UK order PO-8849"
                  value={otForm.reason}
                  onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Automatic Payroll Integration:</span> Approved OT hours
                are automatically computed at the designated rate and added as{" "}
                <em>Overtime Wages</em> in the monthly Salary Sheet.
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOTModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 active:scale-95"
                >
                  Confirm & Approve OT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceView;

