"use client";

import React, { useState, useMemo, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { employees as initialEmployees } from "@/lib/demo-data";
import { Employee } from "@/lib/types";
import {
  Search,
  Plus,
  Download,
  X,
  User,
  Phone,
  Mail,
  Building,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  Check,
  MapPin,
  Clock,
  ShieldCheck,
} from "lucide-react";

const departmentFilters = [
  "All",
  "Management",
  "Merchandising",
  "Cutting",
  "Stitching",
  "Quality Control",
  "Finishing",
  "Store / Warehouse",
  "HR & Admin",
  "Accounts",
];

const typeFilters = [
  "All",
  "Permanent",
  "Contract",
  "Daily Wage",
  "Piece Rate",
  "Trainee",
];

export function EmployeesView({ basePath = "/owner" }: { basePath?: string }) {
  // 1. LocalStorage-backed employee state with SSR hydration safety
  const [employeeList, setEmployeeList] = useState<Employee[]>(initialEmployees);
  const [isHydrated, setIsHydrated] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    fullName: "",
    employeeCode: "",
    department: "Stitching",
    designation: "Machine Operator",
    factory: "Mrityunjay Enterprises Unit 1",
    employmentType: "permanent" as Employee["employmentType"],
    wageType: "monthly-salary" as "piece-rate" | "hourly" | "daily-wage" | "monthly-salary",
    hourlyRate: 95,
    pieceRateDefault: 4.5,
    shift: "General",
    basicSalary: 22000,
    grossSalary: 32000,
    phone: "",
    email: "",
    gender: "male" as "male" | "female" | "other",
    joiningDate: new Date().toISOString().split("T")[0],
    bankName: "State Bank of India",
    bankAccount: "",
    ifscCode: "SBIN0001234",
    panNumber: "",
    aadharNumber: "",
  });

  // Load from localStorage only after initial client mount to eliminate SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_employees");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployeeList(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load employees from localStorage", err);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage only after client hydration is complete
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("garmentflow_employees", JSON.stringify(employeeList));
      window.dispatchEvent(
        new CustomEvent("garmentflow_event", {
          detail: { type: "EMPLOYEE_UPDATED", count: employeeList.length },
        })
      );
    } catch (err) {
      console.error("Failed to persist employees", err);
    }
  }, [employeeList, isHydrated]);

  // Auto-generate next employee code when opening modal
  const openAddModal = () => {
    const nextNum = employeeList.length + 1;
    const autoCode = `GF-${String(nextNum).padStart(3, "0")}`;
    setFormData((prev) => ({
      ...prev,
      employeeCode: autoCode,
      phone: "+91-98" + Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8),
      email: "",
      fullName: "",
    }));
    setIsAddModalOpen(true);
  };

  const handleSalaryChange = (gross: number) => {
    const basic = Math.round(gross * 0.65);
    setFormData((prev) => ({
      ...prev,
      grossSalary: gross,
      basicSalary: basic,
    }));
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      alert("Please enter the Employee Full Name.");
      return;
    }

    const newEmp: Employee = {
      id: "emp_" + Date.now(),
      employeeCode: formData.employeeCode || `GF-${String(employeeList.length + 1).padStart(3, "0")}`,
      fullName: formData.fullName.trim(),
      dateOfBirth: "1994-01-01",
      gender: formData.gender,
      phone: formData.phone || "+91-98290-00000",
      email:
        formData.email ||
        `${formData.fullName.toLowerCase().replace(/\s+/g, ".")}@mrityunjayenterprises.com`,
      address: "Industrial Area, Jaipur, Rajasthan",
      emergencyContact: "+91-98290-99999",
      joiningDate: formData.joiningDate,
      departmentId: "d_" + formData.department.toLowerCase().replace(/\s+/g, "_"),
      department: formData.department,
      designation: formData.designation,
      factoryId: "f1",
      factory: formData.factory,
      employmentType: formData.employmentType,
      wageType: formData.wageType,
      hourlyRate: Number(formData.hourlyRate) || 95,
      pieceRateDefault: Number(formData.pieceRateDefault) || 4.5,
      shift: formData.shift,
      grade: "O1",
      skillCategory: "Production",
      machineSkills: ["SNLS", "Overlock"],
      basicSalary: Number(formData.basicSalary) || 20000,
      grossSalary: Number(formData.grossSalary) || 30000,
      bankName: formData.bankName || "State Bank of India",
      bankAccount: formData.bankAccount || "38200" + Math.floor(100000000 + Math.random() * 900000000),
      ifscCode: formData.ifscCode || "SBIN0001234",
      panNumber: formData.panNumber || "ABCDE1234F",
      aadharNumber: formData.aadharNumber || "1234-5678-9012",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setEmployeeList((prev) => [newEmp, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Employee "${newEmp.fullName}" (${newEmp.employeeCode}) added successfully!`);
  };

  // CSV Export Functionality
  const handleExportCSV = () => {
    if (employeeList.length === 0) {
      alert("No employee records to export.");
      return;
    }

    const headers = [
      "Employee Code",
      "Full Name",
      "Department",
      "Designation",
      "Factory Unit",
      "Employment Type",
      "Shift",
      "Gross Salary (INR)",
      "Basic Salary (INR)",
      "Phone",
      "Email",
      "Status",
      "Joining Date",
      "Bank Name",
      "Account Number",
      "IFSC Code",
    ];

    const rows = filtered.map((emp) => [
      `"${emp.employeeCode}"`,
      `"${emp.fullName.replace(/"/g, '""')}"`,
      `"${emp.department}"`,
      `"${emp.designation.replace(/"/g, '""')}"`,
      `"${emp.factory || "Mrityunjay Enterprises"}"`,
      `"${emp.employmentType}"`,
      `"${emp.shift}"`,
      emp.grossSalary,
      emp.basicSalary,
      `"${emp.phone}"`,
      `"${emp.email}"`,
      `"${emp.status}"`,
      `"${emp.joiningDate}"`,
      `"${emp.bankName || ""}"`,
      `"${emp.bankAccount || ""}"`,
      `"${emp.ifscCode || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.setAttribute("download", `GarmentFlow_Employees_Register_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filtered.length} employee records to CSV!`);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = useMemo(() => {
    let result = [...employeeList];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q)
      );
    }
    if (deptFilter !== "All") result = result.filter((e) => e.department === deptFilter);
    if (typeFilter !== "All")
      result = result.filter((e) => e.employmentType === typeFilter.toLowerCase().replace(/ /g, "-"));
    return result;
  }, [employeeList, searchQuery, deptFilter, typeFilter]);

  const stats = {
    total: employeeList.length,
    active: employeeList.filter((e) => e.status === "active").length,
    permanent: employeeList.filter((e) => e.employmentType === "permanent").length,
    production: employeeList.filter((e) =>
      ["Cutting", "Stitching", "Finishing"].includes(e.department)
    ).length,
  };

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Employees & Factory Staff
          </h1>
          <p className="text-sm text-slate-500 mt-1" suppressHydrationWarning>
            {stats.total} total staff • {stats.active} active • {stats.production} on shop floor
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Download size={16} className="text-indigo-600 dark:text-indigo-400" />
            Export Staff Data (CSV)
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25 active:scale-95"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Headcount", value: stats.total, color: "text-indigo-600", bg: "bg-indigo-500/10" },
          { label: "Active On Roll", value: stats.active, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "Permanent Staff", value: stats.permanent, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Floor Workers", value: stats.production, color: "text-amber-600", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm"
          >
            <p className="text-2xl font-bold text-slate-900 dark:text-white" suppressHydrationWarning>{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, code (e.g. GF-005), designation..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {departmentFilters.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                deptFilter === dept
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              )}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Unit / Factory
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gross Pay
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.slice(0, 50).map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                        {emp.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {emp.fullName}
                        </span>
                        <p className="text-xs text-slate-500 font-mono">{emp.employeeCode}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                    {emp.department}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                    {emp.designation}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    {emp.factory || "Unit 1 (Jaipur)"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                        emp.wageType === "piece-rate" || emp.employmentType === "piece-rate"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-300 dark:border-purple-800"
                          : emp.wageType === "hourly" || emp.employmentType === "daily-wage"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      )}
                    >
                      {emp.wageType === "piece-rate" || emp.employmentType === "piece-rate"
                        ? "🪙 Piece-Rate"
                        : emp.wageType === "hourly"
                        ? "⏱️ Hourly Wage"
                        : emp.employmentType === "daily-wage"
                        ? "🗓️ Daily Wage"
                        : "💼 Salaried"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{emp.shift}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                    {emp.wageType === "piece-rate" || emp.employmentType === "piece-rate" ? (
                      <div>
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                          ₹{emp.pieceRateDefault || 4.5}/pc
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">Passed units</span>
                      </div>
                    ) : emp.wageType === "hourly" ? (
                      <div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          ₹{emp.hourlyRate || 95}/hr
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">+ 1.5x Overtime</span>
                      </div>
                    ) : (
                      formatCurrency(emp.grossSalary)
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(emp);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <p className="text-xs text-slate-500 font-medium" suppressHydrationWarning>
            Showing {Math.min(filtered.length, 50)} of {filtered.length} employees
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD EMPLOYEE MODAL                                       */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Register New Employee
                  </h3>
                  <p className="text-xs text-slate-500">
                    Add factory worker or office staff into the HRMS database
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateEmployee} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Section 1: Core Details */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <User size={14} /> 1. Basic Staff Identity
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Chandra Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employee Code <span className="text-slate-400 font-normal">(Auto-suggested)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.employeeCode}
                      onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+91-98290-XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Department & Role */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <Briefcase size={14} /> 2. Department & Factory Assignment
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {departmentFilters.filter((d) => d !== "All").map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Line Supervisor, Quality Checker, Tailor"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) =>
                        setFormData({ ...formData, employmentType: e.target.value as any })
                      }
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="permanent">Permanent (Full-time)</option>
                      <option value="contract">Contract</option>
                      <option value="daily-wage">Daily Wage</option>
                      <option value="piece-rate">Piece Rate</option>
                      <option value="trainee">Trainee / Apprentice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Shift
                    </label>
                    <select
                      value={formData.shift}
                      onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General Shift (9:00 AM - 6:00 PM)</option>
                      <option value="A-Shift">A-Shift (6:00 AM - 2:00 PM)</option>
                      <option value="B-Shift">B-Shift (2:00 PM - 10:00 PM)</option>
                      <option value="Night">Night Shift (10:00 PM - 6:00 AM)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Compensation Model & Bank Details */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                  <DollarSign size={14} /> 3. Wage Compensation Model & Bank Account
                </p>

                {/* Compensation Model Selector */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Worker Wage Structure
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "piece-rate", label: "🪙 Piece-Rate", desc: "Paid per passed garment/operation" },
                      { id: "hourly", label: "⏱️ Hourly Wage", desc: "Clock hours + 1.5x overtime" },
                      { id: "monthly-salary", label: "💼 Monthly Salaried", desc: "Fixed monthly payroll" },
                      { id: "daily-wage", label: "🗓️ Daily Wage", desc: "Fixed rate per working day" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            wageType: mode.id as any,
                            employmentType: mode.id === "piece-rate" ? "piece-rate" : mode.id === "daily-wage" ? "daily-wage" : "permanent",
                          })
                        }
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between",
                          formData.wageType === mode.id
                            ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 dark:border-indigo-500 font-bold text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        <span className="font-semibold text-xs">{mode.label}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{mode.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.wageType === "piece-rate" ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Default Piece-Rate (₹ / Piece Passed)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            min={0.5}
                            value={formData.pieceRateDefault}
                            onChange={(e) => setFormData({ ...formData, pieceRateDefault: Number(e.target.value) })}
                            className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                          * Credited strictly for QC-passed pieces only; damaged/alterations excluded.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Monthly Guarantee Floor (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.grossSalary}
                          onChange={(e) => handleSalaryChange(Number(e.target.value))}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </>
                  ) : formData.wageType === "hourly" ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Base Hourly Wage (₹ / Hour)
                        </label>
                        <input
                          type="number"
                          min={10}
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">
                          Overtime rate (1.5x): ₹{(formData.hourlyRate * 1.5).toFixed(2)}/hr
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Estimated Monthly Gross (₹)
                        </label>
                        <input
                          type="number"
                          value={formData.grossSalary}
                          onChange={(e) => handleSalaryChange(Number(e.target.value))}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Gross Monthly Salary (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={formData.grossSalary}
                          onChange={(e) => handleSalaryChange(Number(e.target.value))}
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Basic Salary (₹) <span className="text-slate-400 font-normal">(Auto 65%)</span>
                        </label>
                        <input
                          type="number"
                          value={formData.basicSalary}
                          onChange={(e) =>
                            setFormData({ ...formData, basicSalary: Number(e.target.value) })
                          }
                          className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. State Bank of India, HDFC"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="Account number for NEFT salary"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Check size={14} /> Register Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* EMPLOYEE DETAILS DRAWER / MODAL                          */}
      {/* ======================================================== */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white relative">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-base border border-white/20">
                  {selectedEmployee.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-snug">{selectedEmployee.fullName}</h3>
                  <p className="text-xs text-indigo-200 font-mono">
                    {selectedEmployee.employeeCode} • {selectedEmployee.designation}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-slate-400 font-medium">Department</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedEmployee.department}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Factory Unit</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedEmployee.factory || "Mrityunjay Enterprises Unit 1"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Employment Type</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 capitalize mt-0.5">
                    {selectedEmployee.employmentType.replace(/-/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Shift</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedEmployee.shift}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Salary & Banking
                </p>
                <div className="grid grid-cols-2 gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <div>
                    <span className="text-slate-400">Gross Salary:</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedEmployee.grossSalary)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Basic Salary:</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(selectedEmployee.basicSalary)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Bank:</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {selectedEmployee.bankName || "SBI Sitapura"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Account:</span>
                    <p className="font-mono text-slate-700 dark:text-slate-300">
                      {selectedEmployee.bankAccount || "50100123456789"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Contact & Identification
                </p>
                <div className="space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-indigo-600" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-indigo-600" />
                    <span>{selectedEmployee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-indigo-600" />
                    <span>Joined on: {selectedEmployee.joiningDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeesView;

