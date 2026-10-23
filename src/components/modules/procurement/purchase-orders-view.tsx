"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { suppliers as initialSuppliers } from "@/lib/demo-data";
import {
  Search, Plus, Download, Truck, CheckCircle2, Clock, AlertCircle,
  FileText, X, Printer, Eye, Building2, Package, Layers, Calendar
} from "lucide-react";
import {
  getStoredPurchaseOrders,
  addPurchaseOrder,
  generateNextPoNumber,
  WORKFLOW_EVENT,
} from "@/lib/workflow-service";
import { PurchaseOrder, PurchaseOrderItem } from "@/lib/types";

// Reliable Blob CSV Exporter
function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const allRows = [headers, ...rows];
  const csvContent =
    "\uFEFF" +
    allRows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? "");
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function PurchaseOrdersView({ basePath = "/owner" }: { basePath?: string }) {
  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modals & Sliders
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [viewingPo, setViewingPo] = useState<PurchaseOrder | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    try {
      if (typeof getStoredPurchaseOrders === "function") {
        setPoList(getStoredPurchaseOrders());
      }
    } catch (err) {
      console.warn("Could not load stored POs:", err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(WORKFLOW_EVENT, loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    let result = [...poList];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.supplierName.toLowerCase().includes(q) ||
          po.deliveryLocation.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((po) => po.deliveryStatus === statusFilter.toLowerCase());
    }
    return result;
  }, [poList, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalSpend = poList.reduce((acc, p) => acc + (p.total || 0), 0);
    const pendingCount = poList.filter((p) => p.deliveryStatus === "pending").length;
    const partialCount = poList.filter((p) => p.deliveryStatus === "partial").length;
    const completeCount = poList.filter((p) => p.deliveryStatus === "complete").length;
    return { totalSpend, pendingCount, partialCount, completeCount, totalCount: poList.length };
  }, [poList]);

  // Working Export Function
  const handleExportPO = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const headers = [
      "PO Number",
      "Supplier Name",
      "Delivery Location",
      "Items Count",
      "Subtotal (INR)",
      "Tax (INR)",
      "Freight (INR)",
      "Total Amount (INR)",
      "Delivery Date",
      "Payment Terms",
      "Approval Status",
      "Delivery Status",
      "Created Date",
    ];
    const rows = filtered.map((po) => [
      po.poNumber,
      po.supplierName,
      po.deliveryLocation,
      po.items.length,
      po.subtotal,
      po.tax,
      po.freight,
      po.total,
      po.deliveryDate,
      po.paymentTerms,
      po.approvalStatus.toUpperCase(),
      po.deliveryStatus.toUpperCase(),
      po.createdAt,
    ]);

    downloadCsv(`garmentflow_purchase_orders_${timestamp}.csv`, headers, rows);
    showToast(`Exported ${rows.length} purchase orders to CSV successfully!`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATE PO FORM STATE & HANDLER
  // ─────────────────────────────────────────────────────────────────────────────
  const [newPoNumber, setNewPoNumber] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState(initialSuppliers[0]?.id || "s1");
  const [deliveryLocation, setDeliveryLocation] = useState("Main Factory Store - Bhilwara");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [freightAmount, setFreightAmount] = useState<number>(0);
  const [poRemarks, setPoRemarks] = useState("");

  const [poItems, setPoItems] = useState<
    { itemName: string; quantity: number; unit: string; rate: number; taxPct: number }[]
  >([
    {
      itemName: "Oxford Cotton 60s - White",
      quantity: 3000,
      unit: "Meters",
      rate: 185,
      taxPct: 5,
    },
  ]);

  const handleOpenCreatePo = () => {
    const nextPo = typeof generateNextPoNumber === "function" ? generateNextPoNumber() : `PO-${Date.now().toString().slice(-4)}`;
    setNewPoNumber(nextPo);
    setSelectedSupplierId(initialSuppliers[0]?.id || "s1");
    setDeliveryLocation("Main Factory Store - Bhilwara");

    // Default delivery date: 15 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 15);
    setDeliveryDate(d.toISOString().split("T")[0]);

    setPaymentTerms("Net 30");
    setFreightAmount(0);
    setPoRemarks("");
    setPoItems([
      {
        itemName: "Oxford Cotton 60s - White",
        quantity: 3000,
        unit: "Meters",
        rate: 185,
        taxPct: 5,
      },
    ]);
    setIsCreatePoOpen(true);
  };

  const handleAddPoItemRow = () => {
    setPoItems((prev) => [
      ...prev,
      {
        itemName: "",
        quantity: 100,
        unit: "Meters",
        rate: 100,
        taxPct: 5,
      },
    ]);
  };

  const handleRemovePoItemRow = (index: number) => {
    setPoItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePoItemRow = (
    index: number,
    field: "itemName" | "quantity" | "unit" | "rate" | "taxPct",
    value: any
  ) => {
    setPoItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Live Totals Calculation
  const subtotal = useMemo(() => {
    return poItems.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  }, [poItems]);

  const taxTotal = useMemo(() => {
    return poItems.reduce(
      (acc, item) => acc + (item.quantity * item.rate * (item.taxPct || 0)) / 100,
      0
    );
  }, [poItems]);

  const grandTotal = Math.round(subtotal + taxTotal + Number(freightAmount || 0));

  const handleSubmitCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert("Please add at least one line item to the PO.");
      return;
    }
    for (const item of poItems) {
      if (!item.itemName.trim()) {
        alert("Please enter a name for all line items.");
        return;
      }
      if (item.quantity <= 0 || item.rate <= 0) {
        alert("Item quantity and unit rate must be greater than zero.");
        return;
      }
    }

    const supplierObj = initialSuppliers.find((s) => s.id === selectedSupplierId) || {
      id: selectedSupplierId,
      name: "Preferred Mill Supplier",
    };

    const formattedItems: PurchaseOrderItem[] = poItems.map((item, idx) => {
      const lineTax = (item.quantity * item.rate * (item.taxPct || 0)) / 100;
      const amount = Math.round(item.quantity * item.rate + lineTax);
      return {
        id: `poi-${Date.now()}-${idx}`,
        itemId: `item-${Date.now()}-${idx}`,
        itemName: item.itemName,
        quantity: Number(item.quantity),
        receivedQty: 0,
        unit: item.unit,
        rate: Number(item.rate),
        discount: 0,
        tax: Number(item.taxPct),
        amount,
      };
    });

    const newPO = addPurchaseOrder({
      poNumber: newPoNumber || `PO-${Date.now().toString().slice(-4)}`,
      supplierId: supplierObj.id,
      supplierName: supplierObj.name,
      deliveryLocation,
      items: formattedItems,
      subtotal,
      tax: Math.round(taxTotal),
      freight: Number(freightAmount || 0),
      total: grandTotal,
      deliveryDate: deliveryDate || new Date().toISOString().split("T")[0],
      paymentTerms,
      approvalStatus: "approved",
      deliveryStatus: "pending",
      receivedQty: 0,
      createdAt: new Date().toISOString().split("T")[0],
    });

    setIsCreatePoOpen(false);
    loadData();
    showToast(`Purchase Order ${newPO.poNumber} created successfully!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Purchase Orders & Procurement
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Live Sourcing
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Fabric mills, yarn contracts, trims procurement, and supplier delivery tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Working Export CSV */}
          <button
            onClick={handleExportPO}
            id="export-po-csv-btn"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm"
            title="Export Purchase Orders to CSV"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Working Create PO Button */}
          <button
            onClick={handleOpenCreatePo}
            id="create-po-modal-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus size={16} />
            <span>Create PO</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter("All")}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-3">
            <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.totalSpend)}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Total Sourcing Spend ({stats.totalCount} Orders)
          </p>
        </div>

        <div
          onClick={() => setStatusFilter("pending")}
          className={cn(
            "bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm cursor-pointer transition-all",
            statusFilter === "pending"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-slate-200/60 dark:border-slate-800 hover:border-amber-300"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-3">
            <Clock size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingCount}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Pending Mill Inward</p>
        </div>

        <div
          onClick={() => setStatusFilter("partial")}
          className={cn(
            "bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm cursor-pointer transition-all",
            statusFilter === "partial"
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-slate-200/60 dark:border-slate-800 hover:border-blue-300"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
            <Truck size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.partialCount}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Partially Received</p>
        </div>

        <div
          onClick={() => setStatusFilter("complete")}
          className={cn(
            "bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm cursor-pointer transition-all",
            statusFilter === "complete"
              ? "border-emerald-500 ring-2 ring-emerald-500/20"
              : "border-slate-200/60 dark:border-slate-800 hover:border-emerald-300"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3">
            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completeCount}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Fulfilled Deliveries</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-fit overflow-x-auto">
          {["All", "Pending", "Partial", "Complete"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              )}
            >
              {st} {st === "All" ? `(${poList.length})` : ""}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO #, supplier, location..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">PO Number</th>
                <th className="px-4 py-3.5">Supplier / Mill</th>
                <th className="px-4 py-3.5">Delivery Location</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-4 py-3.5">Delivery Date</th>
                <th className="px-4 py-3.5 text-center">Approval</th>
                <th className="px-4 py-3.5 text-center">Delivery Status</th>
                <th className="px-4 py-3.5 text-center">Voucher Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((po) => (
                <tr
                  key={po.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => setViewingPo(po)}
                >
                  <td className="px-4 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    {po.poNumber}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800 dark:text-white">{po.supplierName}</p>
                    <p className="text-xs text-slate-400">{po.items.length} line items • {po.paymentTerms}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400 max-w-[180px] truncate">
                    {po.deliveryLocation}
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(po.total)}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                    {formatDate(po.deliveryDate)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border",
                        po.approvalStatus === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                      )}
                    >
                      {po.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase",
                        po.deliveryStatus === "complete"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : po.deliveryStatus === "partial"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      )}
                    >
                      {po.deliveryStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setViewingPo(po)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    >
                      <Eye size={13} /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: CREATE NEW PURCHASE ORDER
          ───────────────────────────────────────────────────────────────────────────── */}
      {isCreatePoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Create Purchase Order
                  </h3>
                  <p className="text-xs text-slate-500">
                    Issue commercial material requisition to mills & trim suppliers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatePoOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCreatePo} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PO Number
                  </label>
                  <input
                    type="text"
                    required
                    value={newPoNumber}
                    onChange={(e) => setNewPoNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier / Fabric Mill
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    {initialSuppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Delivery Store
                  </label>
                  <div className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Main Factory Store - Bhilwara
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="LC 60 Days">LC 60 Days</option>
                    <option value="LC 90 Days">LC 90 Days</option>
                    <option value="100% Advance">100% Advance</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Purchase Order Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoItemRow}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Item Row
                  </button>
                </div>

                <div className="space-y-3">
                  {poItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 grid grid-cols-12 gap-2.5 items-end"
                    >
                      <div className="col-span-12 sm:col-span-4">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Item Description
                        </label>
                        <input
                          type="text"
                          required
                          value={item.itemName}
                          onChange={(e) => handleUpdatePoItemRow(idx, "itemName", e.target.value)}
                          placeholder="Fabric / zipper / thread name"
                          className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleUpdatePoItemRow(idx, "quantity", Number(e.target.value))}
                          className="w-full h-9 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Unit
                        </label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleUpdatePoItemRow(idx, "unit", e.target.value)}
                          className="w-full h-9 px-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <option value="Meters">Meters</option>
                          <option value="Pcs">Pcs</option>
                          <option value="Cone">Cone</option>
                          <option value="Kg">Kg</option>
                          <option value="Gross">Gross</option>
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                          Rate (₹)
                        </label>
                        <input
                          type="number"
                          min={0.1}
                          step={0.1}
                          required
                          value={item.rate}
                          onChange={(e) => handleUpdatePoItemRow(idx, "rate", Number(e.target.value))}
                          className="w-full h-9 px-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        />
                      </div>

                      <div className="col-span-1 flex justify-center pb-1">
                        {poItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePoItemRow(idx)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST / Tax (5% approx):</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(Math.round(taxTotal))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Freight / Transport (₹):</span>
                  <input
                    type="number"
                    min={0}
                    value={freightAmount}
                    onChange={(e) => setFreightAmount(Number(e.target.value))}
                    className="w-28 h-7 px-2 text-right rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
                  />
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  <span>Grand Total (INR):</span>
                  <span className="font-mono text-base text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatePoOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/25"
                >
                  Approve & Issue PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL: VIEW & PRINT PURCHASE ORDER VOUCHER
          ───────────────────────────────────────────────────────────────────────────── */}
      {viewingPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Purchase Order — {viewingPo.poNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100"
                >
                  <Printer size={14} /> Print PO Slip
                </button>
                <button
                  onClick={() => setViewingPo(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Voucher Content */}
            <div className="p-6 mt-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Mrityunjay Enterprises Pvt. Ltd.
                  </h4>
                  <p className="text-xs text-slate-500">
                    Palri, Bhilwara, Rajasthan • GSTIN: 08AAACD1234F1Z9
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-indigo-600 text-sm">
                    {viewingPo.poNumber}
                  </p>
                  <p className="text-xs text-slate-500">Date: {formatDate(viewingPo.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-400">Supplier / Vendor:</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-sm">
                    {viewingPo.supplierName}
                  </p>
                  <p className="text-slate-500 mt-0.5">Payment Terms: {viewingPo.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-slate-400">Delivery Warehouse:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {viewingPo.deliveryLocation}
                  </p>
                  <p className="text-slate-500 mt-0.5">
                    Expected Date: {formatDate(viewingPo.deliveryDate)}
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="pt-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2">Item Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Unit Rate</th>
                      <th className="p-2 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {viewingPo.items.map((item) => (
                      <tr key={item.id}>
                        <td className="p-2 font-medium text-slate-800 dark:text-white">
                          {item.itemName}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600 dark:text-slate-400">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs flex justify-end">
                <div className="w-56 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-mono">{formatCurrency(viewingPo.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax (GST):</span>
                    <span className="font-mono">{formatCurrency(viewingPo.tax)}</span>
                  </div>
                  {viewingPo.freight > 0 && (
                    <div className="flex justify-between text-slate-500">
                      <span>Freight:</span>
                      <span className="font-mono">{formatCurrency(viewingPo.freight)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="font-mono text-indigo-600">{formatCurrency(viewingPo.total)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Merchandising / Procurement Officer
                  </p>
                  <p className="text-[10px]">Prepared By</p>
                </div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Managing Director / Finance Head
                  </p>
                  <p className="text-[10px]">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseOrdersView;
