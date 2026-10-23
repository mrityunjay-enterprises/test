"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { ledgerEntries as initialLedger, companyDetails, buyers, suppliers } from "@/lib/demo-data";
import { LedgerEntry } from "@/lib/types";
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Building2,
  Calendar,
  CreditCard,
  Receipt,
  FileText,
  Eye,
  X,
  FileSpreadsheet,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
  Scale,
  DollarSign,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export function LedgerView({ basePath = "/owner" }: { basePath?: string }) {
  // 1. LocalStorage state with SSR hydration safety
  const [entries, setEntries] = useState<LedgerEntry[]>(initialLedger);
  const [isHydrated, setIsHydrated] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedParty, setSelectedParty] = useState<string>("all");
  const [selectedVoucherType, setSelectedVoucherType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  // Modals
  const [selectedVoucher, setSelectedVoucher] = useState<LedgerEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form state for New Journal / Voucher Entry
  const [formData, setFormData] = useState({
    voucherType: "Journal Voucher" as LedgerEntry["voucherType"],
    accountCategory: "expense" as LedgerEntry["accountCategory"],
    partyName: "",
    contraAccount: "State Bank of India (Current A/c)",
    particulars: "",
    referenceNumber: "",
    amount: 50000,
    entryType: "debit" as "debit" | "credit",
    entryDate: new Date().toISOString().split("T")[0],
    tags: "Adjustment, Office",
  });

  // Client Hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_ledger_entries");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load ledger from localStorage", e);
    }
    setIsHydrated(true);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem("garmentflow_ledger_entries", JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to persist ledger", e);
    }
  }, [entries, isHydrated]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Distinct parties list for dropdown
  const partyList = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.partyName) set.add(e.partyName);
    });
    return Array.from(set).sort();
  }, [entries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        searchQuery === "" ||
        e.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.referenceNumber && e.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.contraAccount && e.contraAccount.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === "all" || e.accountCategory === selectedCategory;

      const matchesParty =
        selectedParty === "all" || e.partyName === selectedParty;

      const matchesType =
        selectedVoucherType === "all" || e.voucherType === selectedVoucherType;

      return matchesSearch && matchesCat && matchesParty && matchesType;
    });
  }, [entries, searchQuery, selectedCategory, selectedParty, selectedVoucherType]);

  // Financial aggregates
  const totalDebits = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + (e.debit || 0), 0);
  }, [filteredEntries]);

  const totalCredits = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + (e.credit || 0), 0);
  }, [filteredEntries]);

  // Outstanding Debtors (Receivables from Buyers)
  const totalReceivables = useMemo(() => {
    return entries
      .filter((e) => e.accountCategory === "debtor")
      .reduce((sum, e) => sum + e.debit - e.credit, 0);
  }, [entries]);

  // Outstanding Creditors (Payables to Suppliers/Vendors)
  const totalPayables = useMemo(() => {
    return entries
      .filter((e) => e.accountCategory === "creditor" || e.accountCategory === "contractor")
      .reduce((sum, e) => sum + e.credit - e.debit, 0);
  }, [entries]);

  // Handle Create Journal Voucher
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partyName || !formData.particulars || formData.amount <= 0) {
      alert("Please fill in Party name, particulars narration and amount.");
      return;
    }

    const nextId = `led-${entries.length + 1}`;
    const nextNum = `JRN-2025-${String(entries.length + 15).padStart(4, "0")}`;

    const debitAmt = formData.entryType === "debit" ? formData.amount : 0;
    const creditAmt = formData.entryType === "credit" ? formData.amount : 0;

    const newEntry: LedgerEntry = {
      id: nextId,
      entryDate: formData.entryDate,
      voucherNumber: nextNum,
      voucherType: formData.voucherType,
      accountCategory: formData.accountCategory,
      partyName: formData.partyName,
      contraAccount: formData.contraAccount,
      particulars: formData.particulars,
      referenceNumber: formData.referenceNumber || undefined,
      debit: debitAmt,
      credit: creditAmt,
      runningBalance: Math.abs(debitAmt - creditAmt),
      balanceType: debitAmt >= creditAmt ? "Dr" : "Cr",
      currency: "INR",
      reconciled: true,
      status: "cleared",
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdBy: "Owner / Accounts Desk",
    };

    setEntries([newEntry, ...entries]);
    setIsAddModalOpen(false);
    showToast(`Journal voucher ${nextNum} posted successfully!`);

    // Reset
    setFormData({
      voucherType: "Journal Voucher",
      accountCategory: "expense",
      partyName: "",
      contraAccount: "State Bank of India (Current A/c)",
      particulars: "",
      referenceNumber: "",
      amount: 50000,
      entryType: "debit",
      entryDate: new Date().toISOString().split("T")[0],
      tags: "Adjustment, Office",
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Voucher Date",
      "Voucher Number",
      "Voucher Type",
      "Account Category",
      "Party / Account Name",
      "Contra Account",
      "Particulars / Narration",
      "Reference Number",
      "Debit (INR)",
      "Credit (INR)",
      "Audit Status",
    ];

    const rows = filteredEntries.map((e) => [
      `"${e.entryDate}"`,
      `"${e.voucherNumber}"`,
      `"${e.voucherType}"`,
      `"${e.accountCategory}"`,
      `"${e.partyName.replace(/"/g, '""')}"`,
      `"${(e.contraAccount || "").replace(/"/g, '""')}"`,
      `"${e.particulars.replace(/"/g, '""')}"`,
      `"${e.referenceNumber || ""}"`,
      e.debit,
      e.credit,
      `"${e.status}"`,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Accounts_Ledger_Statement_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Downloaded official Accounts Ledger statement CSV!");
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 text-sm font-medium animate-slide-in">
          <CheckCircle2 size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Accounts & Financial General Ledger
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
                  Double-Entry
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Financial journal & party ledgers for Buyers (Debtors), Fabric Mills (Creditors), Contractors & Bank Remittances
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Printer size={15} className="text-slate-500" />
            Print Statement
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <Download size={15} className="text-indigo-600 dark:text-indigo-400" />
            Export Ledger (CSV)
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25 active:scale-95"
          >
            <Plus size={15} />
            Post Journal / Adjustment
          </button>
        </div>
      </div>

      {/* Top Financial KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debits */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Debit Transactions
            </span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2" suppressHydrationWarning>
            {formatCurrency(totalDebits)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Sales invoices & payments made</p>
        </div>

        {/* Total Credits */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Credit Transactions
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <TrendingDown size={16} />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2" suppressHydrationWarning>
            {formatCurrency(totalCredits)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Receipts & purchase bills posted</p>
        </div>

        {/* Debtors Outstanding */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sundry Debtors (Receivables)
            </span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
              <Scale size={16} />
            </span>
          </div>
          <p className="text-2xl font-bold text-indigo-600 mt-2" suppressHydrationWarning>
            {formatCurrency(Math.max(0, totalReceivables))}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Net pending from Buyers & Brands</p>
        </div>

        {/* Creditors Outstanding */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Sundry Creditors (Payables)
            </span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <CreditCard size={16} />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2" suppressHydrationWarning>
            {formatCurrency(Math.max(0, totalPayables))}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Due to Mills, Trims & Job Workers</p>
        </div>
      </div>

      {/* Account Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "all", label: "All Ledgers", icon: <BookOpen size={14} /> },
          { id: "debtor", label: "Sundry Debtors (Buyers)", icon: <Building2 size={14} /> },
          { id: "creditor", label: "Sundry Creditors (Suppliers)", icon: <Scale size={14} /> },
          { id: "contractor", label: "Job-Work Contractors", icon: <BadgeCheck size={14} /> },
          { id: "expense", label: "Factory Expenses & Wages", icon: <CreditCard size={14} /> },
          { id: "tax", label: "GST & Tax Accounts", icon: <FileText size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setSelectedCategory(tab.id);
              setSelectedParty("all");
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
              selectedCategory === tab.id
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voucher #, party name, narration, or UTR/cheque reference..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Party Filter Dropdown */}
        <div className="w-full lg:w-64">
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="all">👤 All Parties & Accounts</option>
            {partyList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Voucher Type Dropdown */}
        <div className="w-full lg:w-48">
          <select
            value={selectedVoucherType}
            onChange={(e) => setSelectedVoucherType(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="all">📑 All Voucher Types</option>
            <option value="Sales Invoice">Sales Invoice</option>
            <option value="Payment Receipt">Payment Receipt</option>
            <option value="Purchase Bill">Purchase Bill</option>
            <option value="Vendor Payment">Vendor Payment</option>
            <option value="Job Work Bill">Job Work Bill</option>
            <option value="Payroll Entry">Payroll Entry</option>
            <option value="Journal Voucher">Journal Voucher</option>
          </select>
        </div>
      </div>

      {/* Party Specific Summary Banner (if a single party is chosen) */}
      {selectedParty !== "all" && (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Individual Party Ledger Statement
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{selectedParty}</h3>
            <p className="text-xs text-slate-500">
              {filteredEntries.length} transaction voucher(s) recorded in current financial ledger
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Debits</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">
                {formatCurrency(totalDebits)}
              </span>
            </div>
            <div className="h-7 w-px bg-indigo-200 dark:bg-indigo-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Total Credits</span>
              <span className="text-slate-900 dark:text-white font-bold text-sm">
                {formatCurrency(totalCredits)}
              </span>
            </div>
            <div className="h-7 w-px bg-indigo-200 dark:bg-indigo-800" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Closing Balance</span>
              <span
                className={cn(
                  "font-bold text-sm",
                  totalDebits >= totalCredits ? "text-indigo-600" : "text-amber-600"
                )}
              >
                {formatCurrency(Math.abs(totalDebits - totalCredits))}{" "}
                {totalDebits >= totalCredits ? "(Dr)" : "(Cr)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Voucher #</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Voucher Type</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Party / Account</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Particulars / Narration</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Ref #</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Debit (Dr)</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Credit (Cr)</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Audit</th>
                <th className="px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <BookOpen size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No ledger transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your category or party filters</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedVoucher(e)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                      {e.entryDate}
                    </td>

                    {/* Voucher Number */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                      {e.voucherNumber}
                    </td>

                    {/* Voucher Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          e.voucherType === "Sales Invoice" && "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
                          e.voucherType === "Payment Receipt" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                          e.voucherType === "Purchase Bill" && "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
                          e.voucherType === "Vendor Payment" && "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
                          e.voucherType === "Job Work Bill" && "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                          e.voucherType === "Payroll Entry" && "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
                          e.voucherType === "Journal Voucher" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        )}
                      >
                        {e.voucherType}
                      </span>
                    </td>

                    {/* Party */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-900 dark:text-white">
                      <div>
                        <p>{e.partyName}</p>
                        {e.contraAccount && (
                          <p className="text-[10px] font-normal text-slate-400">c/a: {e.contraAccount}</p>
                        )}
                      </div>
                    </td>

                    {/* Particulars */}
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-600 dark:text-slate-300" title={e.particulars}>
                      {e.particulars}
                    </td>

                    {/* Reference */}
                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                      {e.referenceNumber || "—"}
                    </td>

                    {/* Debit */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right font-bold font-mono text-slate-900 dark:text-white">
                      {e.debit > 0 ? formatCurrency(e.debit) : "—"}
                    </td>

                    {/* Credit */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {e.credit > 0 ? formatCurrency(e.credit) : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} />
                        {e.status}
                      </span>
                    </td>

                    {/* View */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setSelectedVoucher(e);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 font-bold text-xs">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right uppercase tracking-wider text-slate-500">
                  Total Ledger Summary ({filteredEntries.length} Vouchers):
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-900 dark:text-white" suppressHydrationWarning>
                  {formatCurrency(totalDebits)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400" suppressHydrationWarning>
                  {formatCurrency(totalCredits)}
                </td>
                <td colSpan={2} className="px-4 py-3 text-right text-indigo-600 font-mono" suppressHydrationWarning>
                  Diff: {formatCurrency(Math.abs(totalDebits - totalCredits))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VOUCHER DETAIL SLIP MODAL                                */}
      {/* ======================================================== */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Receipt size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Accounting Voucher Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedVoucher.voucherNumber} • {selectedVoucher.voucherType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Voucher Body (Official Layout) */}
            <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Company & Date Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{companyDetails.companyName}</p>
                  <p className="text-slate-400">{companyDetails.registeredAddress}</p>
                  <p className="text-slate-400 font-mono mt-0.5">GSTIN: {companyDetails.gstin}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold uppercase text-[10px]">
                    {selectedVoucher.voucherType}
                  </span>
                  <p className="font-mono mt-2 text-slate-500">Date: {selectedVoucher.entryDate}</p>
                </div>
              </div>

              {/* Accounts Entry Details */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Account / Party:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedVoucher.partyName}</span>
                </div>
                {selectedVoucher.contraAccount && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contra / Bank Account:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedVoucher.contraAccount}
                    </span>
                  </div>
                )}
                {selectedVoucher.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference / Order / UTR #:</span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {selectedVoucher.referenceNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Audit Status:</span>
                  <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedVoucher.status}
                  </span>
                </div>
              </div>

              {/* Particulars */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Narration / Particulars
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  {selectedVoucher.particulars}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center text-sm">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Voucher Value:</span>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedVoucher.debit > 0
                    ? `${formatCurrency(selectedVoucher.debit)} (Dr)`
                    : `${formatCurrency(selectedVoucher.credit)} (Cr)`}
                </span>
              </div>

              {/* Footer Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-700 text-center">
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Prepared By ({selectedVoucher.createdBy})
                  </p>
                </div>
                <div>
                  <div className="h-10 border-b border-slate-300 dark:border-slate-700 mb-1" />
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    Authorized Signatory / Finance Head
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Printer size={14} /> Print Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* POST NEW JOURNAL / ADJUSTMENT ENTRY MODAL                */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    Post Journal Voucher / Ledger Adjustment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Record debit/credit notes, bank adjustments, and petty expenses
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateVoucher} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Voucher Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Voucher Type *
                  </label>
                  <select
                    value={formData.voucherType}
                    onChange={(e) =>
                      setFormData({ ...formData, voucherType: e.target.value as LedgerEntry["voucherType"] })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    <option value="Journal Voucher">Journal Voucher (JV)</option>
                    <option value="Debit Note">Debit Note (DN)</option>
                    <option value="Credit Note">Credit Note (CN)</option>
                    <option value="Vendor Payment">Vendor Payment</option>
                    <option value="Payment Receipt">Payment Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Account Category *
                  </label>
                  <select
                    value={formData.accountCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountCategory: e.target.value as LedgerEntry["accountCategory"],
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="expense">Factory Expenses / Overheads</option>
                    <option value="debtor">Sundry Debtor (Buyer)</option>
                    <option value="creditor">Sundry Creditor (Supplier)</option>
                    <option value="contractor">Job Work Contractor</option>
                    <option value="bank">Bank / Cash Account</option>
                    <option value="tax">GST / Tax Authority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Debit / Credit Nature *
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, entryType: "debit" })}
                      className={cn(
                        "h-8 rounded-lg font-bold text-xs transition-colors",
                        formData.entryType === "debit"
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      Debit (Dr)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, entryType: "credit" })}
                      className={cn(
                        "h-8 rounded-lg font-bold text-xs transition-colors",
                        formData.entryType === "credit"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      Credit (Cr)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Party / Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arvind Mills, Rajasthan Power, Next Retail..."
                  value={formData.partyName}
                  onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Contra / Settling Account *
                  </label>
                  <select
                    value={formData.contraAccount}
                    onChange={(e) => setFormData({ ...formData, contraAccount: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="State Bank of India (Current A/c)">State Bank of India (Current A/c)</option>
                    <option value="HDFC Bank (Operative A/c)">HDFC Bank (Operative A/c)</option>
                    <option value="SBI Export EEFC A/c">SBI Export EEFC A/c</option>
                    <option value="Factory Petty Cash A/c">Factory Petty Cash A/c</option>
                    <option value="Fabric Purchase Account">Fabric Purchase Account</option>
                    <option value="Export Sales Account">Export Sales Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Amount (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Reference # (Order / PO / Cheque / UTR #)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UTR-99881122 or PO-2025-0234"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                  Narration / Accounting Particulars *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of reason for transaction, debit note adjustment, or bank charges..."
                  value={formData.particulars}
                  onChange={(e) => setFormData({ ...formData, particulars: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Submit */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
                >
                  Post to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRINT AUDIT LEDGER MODAL                                 */}
      {/* ======================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Printer size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Print Statement of Accounts / Audit Ledger
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="border border-slate-200 dark:border-slate-700 p-6 rounded-xl space-y-4 bg-white dark:bg-slate-950">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase">
                      {companyDetails.companyName}
                    </h2>
                    <p className="text-slate-500">{companyDetails.registeredAddress}</p>
                    <p className="text-slate-500 font-mono">GSTIN: {companyDetails.gstin}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase">
                      GENERAL ACCOUNTS LEDGER
                    </h3>
                    <p className="text-slate-400 font-mono">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-slate-400 font-mono">Filtered: {selectedParty}</p>
                  </div>
                </div>

                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 dark:bg-slate-900 font-bold">
                      <th className="py-2">Date</th>
                      <th className="py-2">Voucher #</th>
                      <th className="py-2">Party</th>
                      <th className="py-2">Particulars</th>
                      <th className="py-2 text-right">Debit (₹)</th>
                      <th className="py-2 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-mono">
                    {filteredEntries.slice(0, 15).map((e) => (
                      <tr key={e.id}>
                        <td className="py-1.5">{e.entryDate}</td>
                        <td className="py-1.5 text-indigo-600">{e.voucherNumber}</td>
                        <td className="py-1.5 font-sans font-semibold">{e.partyName}</td>
                        <td className="py-1.5 max-w-xs truncate font-sans">{e.particulars}</td>
                        <td className="py-1.5 text-right">{e.debit > 0 ? e.debit.toLocaleString() : "—"}</td>
                        <td className="py-1.5 text-right">{e.credit > 0 ? e.credit.toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 font-bold">
                    <tr>
                      <td colSpan={4} className="py-2 text-right uppercase">
                        Ledger Balance:
                      </td>
                      <td className="py-2 text-right">{totalDebits.toLocaleString()}</td>
                      <td className="py-2 text-right">{totalCredits.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-[10px] text-slate-400 uppercase">
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 h-6 mb-1" />
                    <span>Prepared by Accountant</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-300 dark:border-slate-700 h-6 mb-1" />
                    <span>Auditor / Managing Director</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
              >
                <Printer size={14} /> Send to Printer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
