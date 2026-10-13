"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { invoices as initialInvoices } from "@/lib/demo-data";
import { Invoice } from "@/lib/types";
import {
  Receipt, Plus, Search, Filter, Download, Eye, FileText,
  DollarSign, CheckCircle2, Clock, AlertTriangle, ArrowUpRight,
  Printer, Send, Building2, CreditCard, ShieldCheck, X, FileSpreadsheet
} from "lucide-react";

export function InvoicesView({ basePath = "/owner" }: { basePath?: string }) {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_invoices");
      if (saved) {
        setInvoiceList(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    setInvoiceList(initialInvoices);
  }, []);

  const filteredInvoices = invoiceList.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.orderNumber && inv.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.dispatchNumber && inv.dispatchNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesType = typeFilter === "all" || inv.invoiceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalInvoiced = invoiceList.reduce((sum, i) => sum + (i.currency === "INR" ? i.totalAmount : i.totalAmount * 83), 0);
  const totalPaid = invoiceList.reduce((sum, i) => sum + (i.currency === "INR" ? i.amountPaid : i.amountPaid * 83), 0);
  const totalOutstanding = invoiceList.reduce((sum, i) => sum + (i.currency === "INR" ? i.balanceDue : i.balanceDue * 83), 0);
  const totalTax = invoiceList.reduce((sum, i) => sum + (i.currency === "INR" ? i.totalTax : i.totalTax * 83), 0);

  const handlePrintInvoice = () => {
    const el = document.getElementById("printable-gst-invoice");
    if (!el) {
      window.print();
      return;
    }

    const printWin = window.open("", "_blank", "width=900,height=1100");
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GST Tax Invoice - ${selectedInvoice?.invoiceNumber || "GarmentFlow"}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 5mm 8mm;
            }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #ffffff;
              color: #000000;
              margin: 0;
              padding: 12px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
            .invoice-bill-document {
              width: 100%;
              border: 2px solid #000000;
              padding: 10px;
              font-size: 11px;
              line-height: 1.35;
              background: #ffffff;
              color: #000000;
            }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000000; padding: 4px 6px; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-xs { font-size: 11px; }
            .text-[10px] { font-size: 10px; }
            .text-[9px] { font-size: 9px; }
            .bg-slate-100 { background-color: #f1f5f9; }
            .uppercase { text-transform: uppercase; }
            .border-b-2 { border-bottom: 2px solid #000000; }
            .border-t-2 { border-top: 2px solid #000000; }
            .border-r { border-right: 1px solid #000000; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .divide-x-2 > * + * { border-left: 2px solid #000000; }
            .divide-y-2 > * + * { border-top: 2px solid #000000; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .p-1.5 { padding: 6px; }
            .p-2 { padding: 8px; }
            .p-4 { padding: 12px; }
          </style>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
        </head>
        <body>
          <div class="invoice-bill-document">
            ${el.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const getStatusBadge = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800">PAID</span>;
      case "partial":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">PARTIAL</span>;
      case "sent":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800">SENT</span>;
      case "overdue":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800">OVERDUE</span>;
      case "draft":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">DRAFT</span>;
      case "cancelled":
        return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">CANCELLED</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Invoice Management & Billing</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Owner & Finance Access</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Generate, manage, edit and track buyer tax invoices, commercial export bills & payment receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}/payments`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm"
          >
            <CreditCard size={16} /> Payment Receipts
          </Link>
          <Link
            href={`${basePath}/invoices/new`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus size={16} /> Create Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><Receipt size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹ {(totalInvoiced / 100000).toFixed(2)} L</p>
          <p className="text-xs text-slate-400 mt-1">{invoiceList.length} total active invoices</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected / Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center"><CheckCircle2 size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">₹ {(totalPaid / 100000).toFixed(2)} L</p>
          <p className="text-xs text-emerald-600/80 mt-1 font-medium">{invoiceList.filter(i => i.status === "paid").length} fully settled invoices</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center"><Clock size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-amber-600">₹ {(totalOutstanding / 100000).toFixed(2)} L</p>
          <p className="text-xs text-amber-600/80 mt-1 font-medium">Pending buyer payments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GST & Tax Total</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center"><ShieldCheck size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-purple-600">₹ {totalTax.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">CGST / SGST / IGST breakdown</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice #, Buyer, Order #..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent / Pending</option>
              <option value="partial">Partial Payment</option>
              <option value="paid">Paid / Settled</option>
              <option value="draft">Draft</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="tax-invoice">Domestic Tax Invoice</option>
              <option value="commercial-export">Commercial Export</option>
              <option value="proforma">Proforma Invoice</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer Name</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Balance Due</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{inv.orderNumber || "Direct"}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{inv.buyerName}</p>
                    <p className="text-xs text-slate-400">{inv.buyerGstin || "No GSTIN"}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300 capitalize">
                    {inv.invoiceType.replace(/-/g, " ")}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(inv.totalAmount, inv.currency)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold text-amber-600">
                    {formatCurrency(inv.balanceDue, inv.currency)}
                  </td>
                  <td className="px-4 py-3.5 text-center">{getStatusBadge(inv.status)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      title="View & Print Official GST Tax Invoice PDF"
                      className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                    >
                      <Eye size={16} /> Tax Invoice PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OFFICIAL GST TAX INVOICE PRINTABLE / PDF DRAWER */}
      {selectedInvoice && (
        <div className="invoice-modal-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <div className="invoice-modal-content bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-4 animate-scale-in text-black">
            {/* Modal Actions */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Official GST Tax Invoice</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{selectedInvoice.invoiceNumber}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Printer size={15} /> Print / Save PDF (Bill Only)
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Dynamic GST Tax Invoice Printable Layout */}
            <div id="printable-gst-invoice" className="invoice-bill-document p-4 bg-white text-black font-sans border-2 border-black space-y-0 text-[11px] leading-tight">
              {/* Document Title Header */}
              <div className="text-center font-extrabold text-xs border-b-2 border-black py-1 uppercase tracking-wide">
                Tax Invoice ({selectedInvoice.invoiceType === "commercial-export" ? "Commercial Export" : "Domestic Tax Invoice"})
              </div>

              {/* Top Double-Column Layout */}
              <div className="grid grid-cols-2 border-b-2 border-black divide-x-2 divide-black">
                {/* Left Column: Supplier, Consignee, Buyer Info */}
                <div className="divide-y-2 divide-black">
                  {/* Supplier */}
                  <div className="p-2 space-y-0.5">
                    <p className="font-extrabold text-xs">MRITYUNJAY ENTERPRISES PVT. LTD.</p>
                    <p className="font-semibold text-slate-800">PALRI, BHILWARA</p>
                    <p className="font-semibold text-slate-800">STATE- RAJASTHAN</p>
                    <p className="font-bold">GSTIN/UIN: 08AAACD1234F1Z9 • State: Rajasthan</p>
                  </div>

                  {/* Consignee */}
                  <div className="p-2 space-y-0.5">
                    <p className="font-bold uppercase text-[10px] text-slate-500">Consignee (Ship to)</p>
                    <p className="font-extrabold">{selectedInvoice.buyerName}</p>
                    <p className="font-semibold text-slate-800">
                      {selectedInvoice.buyerName} Logistics & Warehouse Facility
                    </p>
                    <p className="font-bold">GSTIN/UIN : {selectedInvoice.buyerGstin || "06ALAPR8724P1ZH"}</p>
                  </div>

                  {/* Buyer */}
                  <div className="p-2 space-y-0.5">
                    <p className="font-bold uppercase text-[10px] text-slate-500">Buyer (Bill to)</p>
                    <p className="font-extrabold">{selectedInvoice.buyerName}</p>
                    <p className="font-semibold text-slate-800">
                      {selectedInvoice.buyerName} Registered Corporate Office
                    </p>
                    <p className="font-bold">GSTIN/UIN : {selectedInvoice.buyerGstin || "06ALAPR8724P1ZH"}</p>
                  </div>
                </div>

                {/* Right Column: Invoice Metadata & Logistics Grid */}
                <div className="divide-y-2 divide-black text-[11px]">
                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Invoice No.</span>
                      <strong className="text-xs">{selectedInvoice.invoiceNumber}</strong>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Dated</span>
                      <strong className="text-xs">{selectedInvoice.invoiceDate}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Delivery Note</span>
                      <span>{selectedInvoice.dispatchNumber || "DN-" + selectedInvoice.invoiceNumber.slice(-4)}</span>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Mode/Terms of Payment</span>
                      <span>{selectedInvoice.paymentTerms || "30 Days"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Buyer PO / Order No.</span>
                      <strong>{selectedInvoice.orderNumber || "PO-DIRECT"}</strong>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Due Date</span>
                      <span>{selectedInvoice.dueDate}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Dispatched through</span>
                      <span>Road Transport</span>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Destination</span>
                      <strong>Jaipur Hub</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x-2 divide-black">
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Bill of Lading / LR No.</span>
                      <span>LR-{selectedInvoice.invoiceNumber.slice(-4)}</span>
                    </div>
                    <div className="p-1.5">
                      <span className="text-[9px] text-slate-500 font-bold block">Motor Vehicle No.</span>
                      <span>RJ-14-GA-5678</span>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <span className="text-[9px] text-slate-500 font-bold block">Terms of Delivery</span>
                    <span>FOB Factory Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Line Items Table */}
              <div className="border-b-2 border-black">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-slate-100 font-extrabold uppercase text-[10px]">
                      <th className="p-1.5 border-r border-black w-8 text-center">Sl.</th>
                      <th className="p-1.5 border-r border-black text-left">Description of Goods</th>
                      <th className="p-1.5 border-r border-black w-20 text-center">HSN/SAC</th>
                      <th className="p-1.5 border-r border-black w-20 text-right">Quantity</th>
                      <th className="p-1.5 border-r border-black w-24 text-right">Unit Rate</th>
                      <th className="p-1.5 border-r border-black w-12 text-center">per</th>
                      <th className="p-1.5 text-right w-28 font-black">Amount ({selectedInvoice.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-b-2 border-black">
                    {(selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items : [
                      { id: "1", description: `${selectedInvoice.buyerName} Garment Order Line`, hsnCode: selectedInvoice.hsnCode || "620349", quantity: 1000, unit: "PCS", unitPrice: selectedInvoice.subtotal ? (selectedInvoice.subtotal / 1000) : 500, discount: 0, taxableAmount: selectedInvoice.subtotal || 500000, taxRate: selectedInvoice.taxRate || 5, total: selectedInvoice.totalAmount || 525000 }
                    ]).map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-1.5 border-r border-black text-center font-bold">{idx + 1}</td>
                        <td className="p-1.5 border-r border-black">
                          <p className="font-extrabold">{item.description}</p>
                        </td>
                        <td className="p-1.5 border-r border-black text-center font-mono">{item.hsnCode || selectedInvoice.hsnCode || "620349"}</td>
                        <td className="p-1.5 border-r border-black text-right font-extrabold">{item.quantity} {item.unit || "PCS"}</td>
                        <td className="p-1.5 border-r border-black text-right">{item.unitPrice ? item.unitPrice.toFixed(2) : "0.00"}</td>
                        <td className="p-1.5 border-r border-black text-center font-bold">{item.unit || "PCS"}</td>
                        <td className="p-1.5 text-right font-black">
                          {(item.taxableAmount || item.total || (item.quantity * item.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}

                    {/* Tax Summary Rows */}
                    <tr className="font-extrabold text-[11px]">
                      <td colSpan={6} className="p-1.5 border-r border-black text-right">Subtotal Taxable Value</td>
                      <td className="p-1.5 text-right">{formatCurrency(selectedInvoice.subtotal || selectedInvoice.totalAmount, selectedInvoice.currency)}</td>
                    </tr>
                    <tr className="font-extrabold text-[11px]">
                      <td colSpan={6} className="p-1.5 border-r border-black text-right">GST / Tax Amount ({selectedInvoice.taxRate || 5}%)</td>
                      <td className="p-1.5 text-right">{formatCurrency(selectedInvoice.totalTax || 0, selectedInvoice.currency)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="font-black text-xs bg-slate-100">
                      <td colSpan={3} className="p-1.5 border-r border-black text-right uppercase">Total Amount Chargeable</td>
                      <td className="p-1.5 border-r border-black text-right">
                        {(selectedInvoice.items && selectedInvoice.items.reduce((s, i) => s + i.quantity, 0)) || 1000} PCS
                      </td>
                      <td colSpan={2} className="p-1.5 border-r border-black text-right"></td>
                      <td className="p-1.5 text-right text-indigo-950 font-black">
                        {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Declaration & Customizable Bank Details Footer */}
              <div className="grid grid-cols-2 divide-x-2 divide-black p-2 text-[10px] gap-2 border-b-2 border-black">
                <div>
                  <p className="font-bold underline mb-0.5">Declaration & Terms</p>
                  <ol className="list-decimal pl-3 space-y-0.5 text-[9px] text-slate-700">
                    <li>Payment within agreed payment terms ({selectedInvoice.paymentTerms || "30 days"}).</li>
                    <li>Interest @ 15% p.a. charged after due date ({selectedInvoice.dueDate}).</li>
                    <li>Goods once sold will not be exchanged or returned.</li>
                  </ol>
                </div>

                <div className="space-y-0.5 pl-2">
                  <p className="font-bold underline">Company&apos;s Bank Account Details</p>
                  <p>Bank Name : <strong>{selectedInvoice.bankName || "Mrityunjay Demo Bank"}</strong></p>
                  <p>A/c No. : <strong>{selectedInvoice.bankAccount || "123456789012"}</strong></p>
                  <p>Branch & IFS Code: <strong>{selectedInvoice.bankIfsc || "CDEV0001234"}</strong></p>
                </div>
              </div>

              {/* Computer Generated Invoice Sign-off */}
              <div className="flex items-center justify-between p-2 text-[10px] uppercase font-bold">
                <span>SUBJECT TO BHILWARA JURISDICTION</span>
                <span className="text-[9px] text-slate-600 normal-case">This is a Computer Generated Tax Invoice</span>
                <span>For MRITYUNJAY ENTERPRISES PVT. LTD.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sampleInvoiceItems = [
  { desc: "PANT", art: "T2824EOF", color: "COFFEE", hsn: "620349", qty: 433, rateIncl: 438.90, rateExcl: 418.00, amount: 180994.00 },
  { desc: "PANT", art: "T2824EOF", color: "BROWN", hsn: "620349", qty: 409, rateIncl: 438.90, rateExcl: 418.00, amount: 170962.00 },
  { desc: "PANT", art: "T2826EOF", color: "BEIGE", hsn: "620349", qty: 249, rateIncl: 514.50, rateExcl: 490.00, amount: 122010.00 },
  { desc: "PANT", art: "T2826EOF", color: "PISTA", hsn: "620349", qty: 255, rateIncl: 514.50, rateExcl: 490.00, amount: 124950.00 },
  { desc: "PANT", art: "T2827EOF", color: "CEMENT", hsn: "620349", qty: 399, rateIncl: 556.50, rateExcl: 530.00, amount: 211470.00 },
];

export default InvoicesView;
