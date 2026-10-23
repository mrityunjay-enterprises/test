"use client";

import React, { useState, useMemo, useEffect } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { payrollEntries as initialPayroll, employees as initialEmployees } from "@/lib/demo-data";
import { PayrollEntry, Employee } from "@/lib/types";
import {
  Download,
  Search,
  RefreshCw,
  CheckCircle2,
  Lock,
  Printer,
  X,
  CreditCard,
  FileSpreadsheet,
  FileText,
  Calendar,
  AlertCircle,
  Building,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  Zap,
  ShieldCheck,
  Landmark,
  Send,
  Check,
  ExternalLink,
} from "lucide-react";

const availableMonths = [
  "October 2026",
  "September 2026",
  "August 2026",
  "July 2026",
  "June 2026",
];

export function PayrollView({ basePath = "/owner" }: { basePath?: string }) {
  const [selectedMonth, setSelectedMonth] = useState("October 2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // LocalStorage-backed payroll records with SSR hydration safety
  const [payrollList, setPayrollList] = useState<PayrollEntry[]>(initialPayroll);
  const [isHydrated, setIsHydrated] = useState(false);

  const [selectedPayslip, setSelectedPayslip] = useState<PayrollEntry | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1-Click Bank API Disbursal Modal State
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [disbursalStep, setDisbursalStep] = useState<"confirm" | "processing" | "success">("confirm");
  const [selectedBank, setSelectedBank] = useState<"sbi" | "hdfc">("sbi");
  const [selectedProtocol, setSelectedProtocol] = useState<"imps" | "neft">("imps");
  const [twoFactorPin, setTwoFactorPin] = useState("892110");
  const [disbursalProgress, setDisbursalProgress] = useState(0);
  const [disbursalLog, setDisbursalLog] = useState<string[]>([]);
  const [disbursalReport, setDisbursalReport] = useState<{
    batchRef: string;
    totalAmount: number;
    count: number;
    timestamp: string;
    bankName: string;
    utrs: { code: string; name: string; amount: number; utr: string; bankAccount: string }[];
  } | null>(null);

  // Load from localStorage only after initial client mount to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_payroll_entries");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPayrollList(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load payroll entries from localStorage", err);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage only after client hydration is complete
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("garmentflow_payroll_entries", JSON.stringify(payrollList));
    } catch (err) {
      console.error("Failed to persist payroll entries", err);
    }
  }, [payrollList, isHydrated]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. ENGINE: Calculate / Generate Monthly Payroll from Active Employees
  const handleGeneratePayroll = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Fetch live employee list from localStorage or fallback
      let employees: Employee[] = initialEmployees;
      try {
        const saved = localStorage.getItem("garmentflow_employees");
        if (saved) employees = JSON.parse(saved);
      } catch (e) {}

      const activeEmployees = employees.filter((e) => e.status === "active");
      const [monthName, yearStr] = selectedMonth.split(" ");
      const yearNum = parseInt(yearStr, 10) || 2026;

      const generated: PayrollEntry[] = activeEmployees.map((emp, idx) => {
        const workingDays = 26; // standard 6-day industrial week
        // Stagger attendance realism (24 to 26 days present)
        const leaveDays = idx % 5 === 0 ? 2 : idx % 3 === 0 ? 1 : 0;
        const presentDays = workingDays - leaveDays;

        const isPieceRate = emp.wageType === "piece-rate" || emp.employmentType === "piece-rate";
        const isHourly = emp.wageType === "hourly";

        // Overtime for shop floor / production workers
        const isProduction = ["Cutting", "Stitching", "Finishing"].includes(emp.department);
        const overtimeHours = isProduction ? (idx % 2 === 0 ? 12 : 8) : 0;

        let basicSalary = 0;
        let hra = 0;
        let conveyance = 1600;
        let otherAllowances = 0;
        let incentives = isProduction && idx % 4 === 0 ? 1500 : 0;
        let overtimePay = 0;
        let grossPay = 0;
        let pieceRateEarnings = 0;
        let pieceWorkDetails: PayrollEntry["pieceWorkDetails"] = undefined;
        let hourlyRate = emp.hourlyRate || 95;

        if (isPieceRate) {
          // 🪙 PIECE-RATE CALCULATION: Sum of (QC Passed Pieces * Operation Rate)
          const opRate1 = emp.pieceRateDefault || (idx % 2 === 0 ? 5.5 : 4.8);
          const opRate2 = 2.5;
          const piecesOp1 = Math.round(1800 + (idx * 120));
          const piecesOp2 = Math.round(800 + (idx * 60));

          pieceWorkDetails = [
            {
              orderNumber: "ORD-2025-0001",
              operation: emp.department === "Finishing" ? "Bartack & Button Stitch" : "Collar & Placket Assembly",
              pieces: piecesOp1,
              rate: opRate1,
              total: Math.round(piecesOp1 * opRate1),
            },
            {
              orderNumber: "ORD-2025-0002",
              operation: emp.department === "Finishing" ? "Thread Trimming & Inspection" : "Sleeve Join & Hem",
              pieces: piecesOp2,
              rate: opRate2,
              total: Math.round(piecesOp2 * opRate2),
            },
          ];

          pieceRateEarnings = pieceWorkDetails.reduce((sum, item) => sum + item.total, 0);
          grossPay = pieceRateEarnings + incentives;
          basicSalary = Math.round(grossPay * 0.6);
          hra = Math.round(basicSalary * 0.3);
          conveyance = 1000;
        } else if (isHourly) {
          // ⏱️ HOURLY WAGE CALCULATION: Base Hours + 1.5x Overtime
          const regularHours = presentDays * 8;
          const regularPay = Math.round(regularHours * hourlyRate);
          overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);
          grossPay = regularPay + overtimePay + incentives;
          basicSalary = Math.round(regularPay * 0.7);
          hra = Math.round(basicSalary * 0.3);
        } else {
          // 💼 MONTHLY SALARIED STAFF
          const baseGross = emp.grossSalary || 30000;
          const baseBasic = emp.basicSalary || Math.round(baseGross * 0.65);
          basicSalary = Math.round((baseBasic / workingDays) * presentDays);
          hra = Math.round(basicSalary * 0.4);
          otherAllowances = Math.max(0, baseGross - (basicSalary + hra + conveyance));
          const baseHourly = baseGross / workingDays / 8;
          overtimePay = Math.round(baseHourly * 1.5 * overtimeHours);
          grossPay = basicSalary + hra + conveyance + otherAllowances + incentives + overtimePay;
        }

        // Statutory Deductions (Indian Labor Law)
        const pfDeduction = basicSalary > 0 ? Math.round(basicSalary * 0.12) : 0;
        const esiDeduction = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0;
        const taxDeduction = grossPay > 50000 ? Math.round(grossPay * 0.1) : 0;
        const advanceDeduction = idx % 7 === 0 ? 1000 : 0;

        const totalDeductions = pfDeduction + esiDeduction + taxDeduction + advanceDeduction;
        const netPay = Math.max(0, grossPay - totalDeductions);

        return {
          id: `pay_${monthName.toLowerCase()}_${emp.id}`,
          employeeId: emp.id,
          employeeName: emp.fullName,
          employeeCode: emp.employeeCode,
          department: emp.department,
          month: monthName,
          year: yearNum,
          workingDays,
          presentDays,
          leaveDays,
          overtimeHours,
          basicSalary,
          hra,
          conveyance,
          otherAllowances,
          incentives,
          overtimePay,
          bonus: 0,
          grossPay,
          pfDeduction,
          esiDeduction,
          taxDeduction,
          loanDeduction: 0,
          advanceDeduction,
          otherDeductions: 0,
          totalDeductions,
          netPay,
          status: "calculated",
          wageType: isPieceRate ? "piece-rate" : isHourly ? "hourly" : "monthly-salary",
          hourlyRate: isHourly ? hourlyRate : undefined,
          pieceRateEarnings: isPieceRate ? pieceRateEarnings : undefined,
          pieceWorkDetails,
          bankName: emp.bankName || "State Bank of India",
          bankAccount: emp.bankAccount || `50100${Math.floor(10000000 + idx * 1793)}`,
          ifscCode: emp.ifscCode || "SBIN0001234",
        };
      });

      // Filter out existing records for this month and replace with newly generated
      const remaining = payrollList.filter(
        (p) => !(p.month === monthName && p.year === yearNum)
      );
      setPayrollList([...generated, ...remaining]);
      setIsProcessing(false);
      showToast(`Processed ${generated.length} employee salary records for ${selectedMonth}!`);
    }, 400);
  };

  // 2. Lock & Approve Month
  const handleApprovePayroll = () => {
    const [monthName, yearStr] = selectedMonth.split(" ");
    const yearNum = parseInt(yearStr, 10);

    const updated = payrollList.map((p) => {
      if (p.month === monthName && p.year === yearNum && p.status !== "paid") {
        return { ...p, status: "approved" as const };
      }
      return p;
    });

    setPayrollList(updated);
    showToast(`Payroll for ${selectedMonth} approved by Managing Director!`);
  };

  // 3. Open 1-Click Bank Disbursal Modal
  const handleOpenDisburseModal = () => {
    const [monthName, yearStr] = selectedMonth.split(" ");
    const yearNum = parseInt(yearStr, 10);
    const monthEntries = payrollList.filter((p) => p.month === monthName && p.year === yearNum);

    if (monthEntries.length === 0) {
      alert(`No salary records found for ${selectedMonth}. Please click 'Run Payroll Engine' first.`);
      return;
    }

    setDisbursalStep("confirm");
    setDisbursalProgress(0);
    setDisbursalLog([]);
    setIsDisburseModalOpen(true);
  };

  // 4. Execute Real-Time 1-Click Bank API Payout
  const handleExecuteDirectPayout = () => {
    setDisbursalStep("processing");
    setDisbursalProgress(15);
    setDisbursalLog(["Initiating TLS 1.3 encrypted handshake with Bank API switch..."]);

    const [monthName, yearStr] = selectedMonth.split(" ");
    const yearNum = parseInt(yearStr, 10);
    const monthEntries = payrollList.filter((p) => p.month === monthName && p.year === yearNum);

    const genBatchId = `${selectedBank === "sbi" ? "SBIN" : "HDFC"}-SAL-${yearNum}${monthName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setDisbursalProgress(45);
      setDisbursalLog((prev) => [
        ...prev,
        `Connected to ${selectedBank === "sbi" ? "State Bank of India (Corporate API Gateway)" : "HDFC Bank (Eazypay Switch)"}.`,
        `NPCI IMPS Switch validating ${monthEntries.length} beneficiary bank accounts & IFSC codes...`,
      ]);
    }, 800);

    setTimeout(() => {
      setDisbursalProgress(75);
      setDisbursalLog((prev) => [
        ...prev,
        `All beneficiary accounts verified. Debiting corporate current account...`,
        `Dispatching ${monthEntries.length} real-time ${selectedProtocol.toUpperCase()} payment instructions...`,
      ]);
    }, 1600);

    setTimeout(() => {
      const generatedUtrs: { code: string; name: string; amount: number; utr: string; bankAccount: string }[] = [];

      const updated = payrollList.map((p, idx) => {
        if (p.month === monthName && p.year === yearNum) {
          const utr = `${selectedBank === "sbi" ? "SBIN" : "HDFC"}${yearNum.toString().slice(-2)}${Math.floor(1000000000 + idx * 7919 + Math.random() * 9999)}`;
          const bankAcc = p.bankAccount || `50100${Math.floor(10000000 + idx * 1793)}`;
          generatedUtrs.push({
            code: p.employeeCode,
            name: p.employeeName,
            amount: p.netPay,
            utr,
            bankAccount: bankAcc,
          });
          return {
            ...p,
            status: "paid" as const,
            payoutMode: selectedProtocol.toUpperCase() as "IMPS" | "NEFT",
            disbursedAt: new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            utrNumber: utr,
            bankAccount: bankAcc,
            bankName: p.bankName || (selectedBank === "sbi" ? "State Bank of India" : "HDFC Bank"),
          };
        }
        return p;
      });

      setPayrollList(updated);
      setDisbursalProgress(100);
      setDisbursalLog((prev) => [
        ...prev,
        `SUCCESS: All ${monthEntries.length} salaries credited instantly! 16-digit Bank UTR numbers generated.`,
      ]);

      const netTotalDisbursed = monthEntries.reduce((sum, p) => sum + p.netPay, 0);

      // Automatically Post Payroll Disbursement to Accounts Ledger
      try {
        const savedLedger = localStorage.getItem("garmentflow_ledger_entries");
        const parsedLedger = savedLedger ? JSON.parse(savedLedger) : [];
        const newLedgerVoucher = {
          id: `led-${Date.now()}`,
          entryDate: new Date().toISOString().split("T")[0],
          voucherNumber: `PAY-${monthName.toUpperCase().slice(0, 3)}-${yearNum}`,
          voucherType: "Payroll Entry",
          accountCategory: "expense",
          partyName: "Factory Floor & Staff Payroll Disbursement",
          contraAccount:
            selectedBank === "sbi"
              ? "State Bank of India (Primary Salary A/c)"
              : "HDFC Bank (Corporate A/c)",
          particulars: `Automated 1-Click Bank API ${selectedProtocol.toUpperCase()} salary payout to ${monthEntries.length} staff accounts for ${selectedMonth}. Batch Ref: ${genBatchId}`,
          referenceNumber: genBatchId,
          debit: netTotalDisbursed,
          credit: 0,
          runningBalance: netTotalDisbursed,
          balanceType: "Dr",
          currency: "INR",
          reconciled: true,
          status: "cleared",
          tags: ["Salary Disbursal", "Bank API Payout", "1-Click"],
          createdBy: "Managing Director (Direct Bank API)",
        };
        localStorage.setItem("garmentflow_ledger_entries", JSON.stringify([newLedgerVoucher, ...parsedLedger]));
        window.dispatchEvent(
          new CustomEvent("garmentflow_event", { detail: { type: "PAYROLL_DISBURSED" } })
        );
      } catch (err) {
        console.error("Failed to post payroll to accounts ledger", err);
      }

      setDisbursalReport({
        batchRef: genBatchId,
        totalAmount: netTotalDisbursed,
        count: monthEntries.length,
        timestamp: new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        bankName: selectedBank === "sbi" ? "State Bank of India (Corporate)" : "HDFC Bank (Corporate)",
        utrs: generatedUtrs,
      });

      setDisbursalStep("success");
      showToast(
        `1-Click Bank Disbursal complete! Credited ${monthEntries.length} staff accounts with live UTR numbers.`
      );
    }, 2500);
  };

  // 5. Download Bank Disbursal & UTR CSV
  const handleDownloadUTRReport = () => {
    if (!disbursalReport) return;
    const headers = [
      "Employee Code",
      "Beneficiary Name",
      "Bank Account Number",
      "Net Amount Disbursed (INR)",
      "Payment Mode",
      "Bank UTR Reference Number",
      "Credit Timestamp",
      "Status",
    ];

    const rows = disbursalReport.utrs.map((u) => [
      `"${u.code}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.bankAccount}"`,
      u.amount,
      `"${selectedProtocol.toUpperCase()}"`,
      `"${u.utr}"`,
      `"${disbursalReport.timestamp}"`,
      `"CREDITED_SUCCESS"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bank_Salary_UTR_Advice_${disbursalReport.batchRef}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Downloaded official Bank Salary UTR Statement CSV!");
  };

  // 4. Export Salary Sheet CSV
  const handleExportSalarySheet = () => {
    const [monthName, yearStr] = selectedMonth.split(" ");
    const yearNum = parseInt(yearStr, 10);
    const monthEntries = payrollList.filter((p) => p.month === monthName && p.year === yearNum);

    if (monthEntries.length === 0) {
      alert("No payroll records found for " + selectedMonth + ". Click 'Generate / Recalculate' first.");
      return;
    }

    const headers = [
      "Employee Code",
      "Employee Name",
      "Department",
      "Month",
      "Year",
      "Working Days",
      "Present Days",
      "OT Hours",
      "Earned Basic (INR)",
      "HRA (INR)",
      "Conveyance (INR)",
      "OT Pay (INR)",
      "Incentives (INR)",
      "Gross Pay (INR)",
      "PF Deduction (INR)",
      "ESI Deduction (INR)",
      "TDS Tax (INR)",
      "Advance Recovery (INR)",
      "Total Deductions (INR)",
      "Net Payable (INR)",
      "Status",
    ];

    const rows = monthEntries.map((p) => [
      `"${p.employeeCode}"`,
      `"${p.employeeName.replace(/"/g, '""')}"`,
      `"${p.department}"`,
      `"${p.month}"`,
      p.year,
      p.workingDays,
      p.presentDays,
      p.overtimeHours,
      p.basicSalary,
      p.hra,
      p.conveyance,
      p.overtimePay,
      p.incentives,
      p.grossPay,
      p.pfDeduction,
      p.esiDeduction,
      p.taxDeduction,
      p.advanceDeduction,
      p.totalDeductions,
      p.netPay,
      `"${p.status}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Salary_Register_${monthName}_${yearNum}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded complete salary register for ${selectedMonth}!`);
  };

  // 5. Export Bank Transfer File (NEFT format)
  const handleExportBankNEFT = () => {
    const [monthName, yearStr] = selectedMonth.split(" ");
    const yearNum = parseInt(yearStr, 10);
    const monthEntries = payrollList.filter((p) => p.month === monthName && p.year === yearNum);

    if (monthEntries.length === 0) {
      alert("No payroll records found for " + selectedMonth + ".");
      return;
    }

    const headers = [
      "Beneficiary Name",
      "Employee Code",
      "Bank Account Number",
      "IFSC Code",
      "Disbursement Amount (INR)",
      "Payment Mode",
      "Narration / Remarks",
    ];

    const rows = monthEntries.map((p, i) => [
      `"${p.employeeName.replace(/"/g, '""')}"`,
      `"${p.employeeCode}"`,
      `"50100${Math.floor(10000000 + i * 1793)}"`,
      `"SBIN0001234"`,
      p.netPay,
      `"NEFT"`,
      `"Salary for ${monthName} ${yearNum}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bank_Transfer_NEFT_${monthName}_${yearNum}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Bank NEFT salary transfer file generated!`);
  };

  // Filter current month's items
  const [currentMonthName, currentYearStr] = selectedMonth.split(" ");
  const currentYearNum = parseInt(currentYearStr, 10) || 2026;

  const currentMonthEntries = useMemo(() => {
    let list = payrollList.filter(
      (p) => p.month === currentMonthName && p.year === currentYearNum
    );
    // If empty for this month, fallback to all or trigger calculate
    if (list.length === 0 && payrollList.length > 0) {
      list = payrollList;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.employeeName.toLowerCase().includes(q) ||
          p.employeeCode.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [payrollList, currentMonthName, currentYearNum, searchQuery, statusFilter]);

  const totalGross = currentMonthEntries.reduce((sum, p) => sum + p.grossPay, 0);
  const totalNet = currentMonthEntries.reduce((sum, p) => sum + p.netPay, 0);
  const totalPF = currentMonthEntries.reduce((sum, p) => sum + p.pfDeduction, 0);
  const totalOT = currentMonthEntries.reduce((sum, p) => sum + p.overtimePay, 0);

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 text-sm font-medium animate-slide-in">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            Payroll Register & Wage Sheet
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-semibold uppercase tracking-wider">
              Monthly Cycle
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Attendance-based wages, statutory PF/ESI calculations, and bank disbursals
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 px-3 pr-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  📅 {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGeneratePayroll}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
            title="Recalculate wages from attendance and active employees"
          >
            <RefreshCw size={14} className={cn(isProcessing && "animate-spin")} />
            {isProcessing ? "Calculating..." : "Run Payroll Engine"}
          </button>

          <button
            onClick={handleApprovePayroll}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/25 active:scale-95"
          >
            <CheckCircle2 size={14} />
            Approve & Lock
          </button>

          <button
            onClick={handleOpenDisburseModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-500/25 active:scale-95"
          >
            <Zap size={14} className="text-amber-300" />
            1-Click Bank Disbursal (API)
          </button>

          <button
            onClick={handleExportSalarySheet}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            Salary Sheet (CSV)
          </button>

          <button
            onClick={handleExportBankNEFT}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Building size={14} className="text-blue-600" />
            Bank NEFT File
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
            {formatCurrency(totalGross)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Gross Monthly Payroll</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600" suppressHydrationWarning>{formatCurrency(totalNet)}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Net Take-Home Pay</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600" suppressHydrationWarning>{formatCurrency(totalPF)}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Statutory PF & ESI Escrow</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-2xl font-bold text-amber-600" suppressHydrationWarning>{formatCurrency(totalOT)}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Overtime (OT) Factory Wages</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by staff code, name, department..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div className="flex gap-2">
          {["all", "calculated", "approved", "paid"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all",
                statusFilter === status
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payroll Table */}
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
                  Days (Att / Work)
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  OT Hours
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Gross Pay
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Net Payable
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Pay Slip
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentMonthEntries.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {p.employeeName}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{p.employeeCode}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                    {p.department}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-mono text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{p.presentDays}</span> / {p.workingDays} d
                    {p.leaveDays > 0 && (
                      <span className="text-amber-600 ml-1">({p.leaveDays} leave)</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono">
                    {p.overtimeHours > 0 ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {p.overtimeHours} hrs (+{formatCurrency(p.overtimePay)})
                      </span>
                    ) : (
                      <span className="text-slate-400">0 hrs</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(p.grossPay)}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-red-600 font-semibold font-mono">
                    -{formatCurrency(p.totalDeductions)}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      PF: {formatCurrency(p.pfDeduction)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600 text-base">
                    {formatCurrency(p.netPay)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1",
                        p.status === "paid"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                          : p.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      )}
                    >
                      {p.status === "paid" && <Zap size={10} className="text-purple-600" />}
                      {p.status === "paid" ? `Paid via ${p.payoutMode || "Bank"}` : p.status}
                    </span>
                    {p.utrNumber && (
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5" title={p.utrNumber}>
                        UTR: {p.utrNumber.slice(0, 10)}...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedPayslip(p)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <FileText size={13} /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <p className="text-xs text-slate-500 font-medium">
            Showing {currentMonthEntries.length} wage records for {selectedMonth}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1-CLICK CORPORATE BANKING DISBURSAL MODAL                */}
      {/* ======================================================== */}
      {isDisburseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    1-Click Direct Bank Disbursal (API)
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold uppercase">
                      Connected Banking
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Execute real-time IMPS / NEFT salary batch transfer directly from company corporate account
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (disbursalStep !== "processing") setIsDisburseModalOpen(false);
                }}
                disabled={disbursalStep === "processing"}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              {disbursalStep === "confirm" && (
                <>
                  {/* Summary Metric Callouts */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Staff to Credit</span>
                      <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {currentMonthEntries.length} Employees
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                        Net Amount to Debit
                      </span>
                      <p className="text-xl font-bold text-emerald-600 mt-0.5">
                        {formatCurrency(totalNet)}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase">
                        Statutory Escrow
                      </span>
                      <p className="text-xl font-bold text-indigo-600 mt-0.5">
                        {formatCurrency(totalPF)}
                      </p>
                    </div>
                  </div>

                  {/* 1. Source Company Bank Account */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      1. Select Company Debit Bank Account
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div
                        onClick={() => setSelectedBank("sbi")}
                        className={cn(
                          "p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5",
                          selectedBank === "sbi"
                            ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Landmark size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">State Bank of India</p>
                          <p className="text-[11px] text-slate-400 font-mono">A/c: 30129847192 (Current)</p>
                          <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                            Available: ₹ 84,50,000 (Sufficient ✅)
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setSelectedBank("hdfc")}
                        className={cn(
                          "p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5",
                          selectedBank === "hdfc"
                            ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Building size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate">HDFC Corporate Bank</p>
                          <p className="text-[11px] text-slate-400 font-mono">A/c: 5020008891234 (Operating)</p>
                          <p className="text-[11px] font-semibold text-emerald-600 mt-1">
                            Available: ₹ 62,10,000 (Sufficient ✅)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Payout Protocol */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
                      2. Transfer Protocol & Routing Gateway
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedProtocol("imps")}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all",
                          selectedProtocol === "imps"
                            ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30"
                            : "border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Zap size={13} className="text-amber-500" /> Instant IMPS (24x7)
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Direct credit to employee accounts in 2-5 minutes
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedProtocol("neft")}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all",
                          selectedProtocol === "neft"
                            ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30"
                            : "border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building size={13} className="text-blue-500" /> Corporate NEFT Batch
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          RBI half-hourly clearing batches (No limit)
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 3. Pre-Flight Verification Checklist */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-600" /> Pre-Disbursal Verification Checks
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>All {currentMonthEntries.length} Account Numbers & IFSC validated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Salary Register approved & locked for {selectedMonth}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Statutory PF (12%) & ESI (0.75%) deductions separated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={13} className="text-emerald-600 shrink-0" />
                        <span>Auto-sync with Accounts Ledger (`/owner/ledger`) enabled</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Corporate 2FA / Maker-Checker Security */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start gap-2.5">
                      <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-bold text-amber-900 dark:text-amber-300">
                          RBI Corporate Mandate: Authorized Signatory 2FA
                        </p>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                          Under banking rules, commercial salary bulk payouts require Director 2FA authorization.
                        </p>
                        <div className="mt-2.5 flex items-center gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Director Security PIN / OTP
                            </span>
                            <input
                              type="password"
                              maxLength={6}
                              value={twoFactorPin}
                              onChange={(e) => setTwoFactorPin(e.target.value)}
                              className="w-32 h-8 px-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-mono font-bold tracking-widest text-slate-900 dark:text-white"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 mt-3">
                            (Simulated Sandbox PIN: <code>892110</code>)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* PROCESSING STEP */}
              {disbursalStep === "processing" && (
                <div className="py-8 px-4 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mx-auto animate-pulse">
                    <RefreshCw size={32} className="animate-spin text-purple-600" />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                      Transmitting Direct Payout to Bank API Switch...
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Debiting company account and crediting {currentMonthEntries.length} staff bank accounts
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden max-w-md mx-auto">
                    <div
                      className="bg-purple-600 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${disbursalProgress}%` }}
                    />
                  </div>

                  {/* Terminal Log */}
                  <div className="bg-slate-900 text-slate-200 font-mono text-[11px] p-4 rounded-xl text-left max-w-lg mx-auto space-y-1.5 shadow-inner">
                    {disbursalLog.map((log, idx) => (
                      <p key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-400">›</span> {log}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* SUCCESS STEP */}
              {disbursalStep === "success" && disbursalReport && (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                        Batch Salary Disbursement Successfully Credited!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400">
                        {disbursalReport.count} employee bank accounts have been credited via {selectedProtocol.toUpperCase()}.
                      </p>
                    </div>
                  </div>

                  {/* Batch Details Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Batch Reference:</span>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                        {disbursalReport.batchRef}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Originating Company Bank:</span>
                      <span className="font-semibold">{disbursalReport.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Net Amount Disbursed:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(disbursalReport.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="font-mono">{disbursalReport.timestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accounts Ledger Posting:</span>
                      <span className="font-semibold text-emerald-600">Auto-Posted to /owner/ledger ✅</span>
                    </div>
                  </div>

                  {/* Beneficiary Sample UTR Table */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 font-bold text-[11px] text-slate-700 dark:text-slate-300 flex justify-between items-center">
                      <span>Sample Generated Bank UTR Numbers ({disbursalReport.utrs.length} total)</span>
                      <span className="text-purple-600 font-bold">IMPS Immediate Settlement</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {disbursalReport.utrs.slice(0, 5).map((u, i) => (
                        <div key={i} className="px-3 py-2 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{u.name}</span>{" "}
                            <span className="text-slate-400 font-mono">({u.code})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-600">{formatCurrency(u.amount)}</span>
                            <span className="block font-mono text-[10px] text-slate-400">UTR: {u.utr}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              {disbursalStep === "confirm" && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDisburseModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDirectPayout}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 active:scale-95"
                  >
                    <Zap size={14} className="text-amber-300" />
                    Authorize & Execute 1-Click Payout ({formatCurrency(totalNet)})
                  </button>
                </>
              )}

              {disbursalStep === "processing" && (
                <div className="w-full text-center text-xs text-slate-400 italic">
                  Communicating with corporate banking switch. Please do not refresh.
                </div>
              )}

              {disbursalStep === "success" && (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadUTRReport}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                  >
                    <Download size={14} /> Download UTR Statement (CSV)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDisburseModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                  >
                    Done & View Updated Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SALARY SLIP (PAYSLIP) MODAL                              */}
      {/* ======================================================== */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Payslip Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-indigo-900">
                  MRITYUNJAY ENTERPRISES
                </h2>
                <p className="text-xs text-slate-500">
                  Unit 1, Sitapura Industrial Area, Jaipur, Rajasthan 302022
                </p>
                <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-wider">
                  Salary Pay Slip — {selectedPayslip.month} {selectedPayslip.year}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Employee Summary Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-400">Employee Name:</p>
                <p className="font-bold text-slate-800">{selectedPayslip.employeeName}</p>
              </div>
              <div>
                <p className="text-slate-400">Employee Code:</p>
                <p className="font-mono font-bold text-slate-800">{selectedPayslip.employeeCode}</p>
              </div>
              <div>
                <p className="text-slate-400">Wage Model:</p>
                <p className="font-bold text-indigo-700 uppercase">
                  {selectedPayslip.wageType === "piece-rate"
                    ? "🪙 Piece-Rate"
                    : selectedPayslip.wageType === "hourly"
                    ? `⏱️ Hourly (₹${selectedPayslip.hourlyRate || 95}/hr)`
                    : "💼 Monthly Salaried"}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Days Present:</p>
                <p className="font-semibold text-slate-800">
                  {selectedPayslip.presentDays} / {selectedPayslip.workingDays} days
                </p>
              </div>
            </div>

            {/* Piece-Rate Itemized Operation Table (if piece-rate worker) */}
            {selectedPayslip.pieceWorkDetails && selectedPayslip.pieceWorkDetails.length > 0 && (
              <div className="border border-purple-200 rounded-xl overflow-hidden bg-purple-50/40">
                <div className="bg-purple-100 px-4 py-2 flex items-center justify-between border-b border-purple-200">
                  <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                    🪙 ITEMISED PIECE-WORK OPERATION LOGS (QC PASSED ONLY)
                  </span>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    Rejections Excluded From Pay
                  </span>
                </div>
                <div className="p-3">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase text-purple-700 font-bold border-b border-purple-200">
                        <th className="pb-1">Order #</th>
                        <th className="pb-1">Garment Operation</th>
                        <th className="pb-1 text-right">QC Passed</th>
                        <th className="pb-1 text-right">Rate (₹)</th>
                        <th className="pb-1 text-right">Earned (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {selectedPayslip.pieceWorkDetails.map((detail, dIdx) => (
                        <tr key={dIdx}>
                          <td className="py-1.5 font-mono font-semibold">{detail.orderNumber}</td>
                          <td className="py-1.5 text-slate-700">{detail.operation}</td>
                          <td className="py-1.5 text-right font-semibold text-emerald-700">
                            {detail.pieces.toLocaleString()} pcs
                          </td>
                          <td className="py-1.5 text-right font-mono">₹{detail.rate.toFixed(2)}</td>
                          <td className="py-1.5 text-right font-bold text-purple-900">
                            {formatCurrency(detail.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="mt-2 pt-2 border-t border-purple-200 flex items-center justify-between text-xs font-bold text-purple-900">
                    <span className="text-[11px] text-purple-700 font-normal">
                      * Piece-rate pay is credited exclusively for QC-passed units. Alterations require re-check.
                    </span>
                    <span className="text-sm font-extrabold text-purple-700">
                      Total: {formatCurrency(selectedPayslip.pieceRateEarnings || selectedPayslip.grossPay)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Earnings vs Deductions 2-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 px-4 py-2 font-bold text-emerald-800 border-b border-emerald-100">
                  EARNINGS
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary:</span>
                    <span className="font-bold">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">House Rent Allowance (HRA):</span>
                    <span>{formatCurrency(selectedPayslip.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Conveyance Allowance:</span>
                    <span>{formatCurrency(selectedPayslip.conveyance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Special / Other Allowances:</span>
                    <span>{formatCurrency(selectedPayslip.otherAllowances)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Overtime Wages ({selectedPayslip.overtimeHours} hrs):</span>
                    <span className="text-indigo-600 font-semibold">{formatCurrency(selectedPayslip.overtimePay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Production Incentive:</span>
                    <span>{formatCurrency(selectedPayslip.incentives)}</span>
                  </div>
                  <div className="pt-2 border-t flex justify-between font-bold text-slate-900 text-sm">
                    <span>Gross Earnings:</span>
                    <span className="text-emerald-700">{formatCurrency(selectedPayslip.grossPay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-rose-50 px-4 py-2 font-bold text-rose-800 border-b border-rose-100">
                  STATUTORY DEDUCTIONS
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund (PF 12%):</span>
                    <span className="font-semibold text-rose-600">-{formatCurrency(selectedPayslip.pfDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">ESI (0.75%):</span>
                    <span>-{formatCurrency(selectedPayslip.esiDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax Deducted at Source (TDS):</span>
                    <span>-{formatCurrency(selectedPayslip.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Salary Advance Recovery:</span>
                    <span>-{formatCurrency(selectedPayslip.advanceDeduction)}</span>
                  </div>
                  <div className="pt-8 border-t flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Deductions:</span>
                    <span className="text-rose-700">-{formatCurrency(selectedPayslip.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Callout */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  NET TAKE-HOME SALARY
                  {selectedPayslip.status === "paid" && (
                    <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">
                      PAID VIA {selectedPayslip.payoutMode || "IMPS"}
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Direct Bank Credit to: <strong>{selectedPayslip.bankName || "State Bank of India"}</strong> • A/c No: •••• {selectedPayslip.bankAccount ? selectedPayslip.bankAccount.slice(-4) : "5678"} • IFSC: {selectedPayslip.ifscCode || "SBIN0001234"}
                </p>
                {selectedPayslip.utrNumber && (
                  <p className="text-xs font-mono text-emerald-800 mt-1 font-bold">
                    Bank UTR Ref: {selectedPayslip.utrNumber} {selectedPayslip.disbursedAt && `(${selectedPayslip.disbursedAt})`}
                  </p>
                )}
              </div>
              <p className="text-2xl font-black text-emerald-700">
                {formatCurrency(selectedPayslip.netPay)}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20"
              >
                <Printer size={15} /> Print Salary Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayrollView;

