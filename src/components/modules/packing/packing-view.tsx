"use client";

import React, { useState, useEffect } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { orders as initialOrders } from "@/lib/demo-data";
import { Order } from "@/lib/types";
import { getStoredOrders, updateOrderStatus, WORKFLOW_EVENT } from "@/lib/workflow-service";
import Link from "next/link";
import { Archive, Plus, Search, CheckCircle2, Package, Layers, X, Sparkles, Box, FileText, Printer, Download, Eye, FileSpreadsheet, Trash2, Edit3, Settings, Truck } from "lucide-react";

export interface CartonRowInput {
  id: string;
  ctnNos: string;
  articleNo: string;
  colour: string;
  sizeQuantities: Record<string, number>;
}

export function PackingView({ basePath = "/factory" }: { basePath?: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [packingList, setPackingList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showASNPreview, setShowASNPreview] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    const stored = getStoredOrders();
    setOrdersList(stored);
    setPackingList(stored.filter(o => o.packedQty > 0 || o.status === "in-packing" || o.status === "ready-for-dispatch" || o.status === "in-quality"));
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Form Header State (Clean empty defaults)
  const [poNumber, setPoNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [artNoSummary, setArtNoSummary] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-IN"));
  const [shippedToName, setShippedToName] = useState("");
  const [shippedToAddress, setShippedToAddress] = useState("");
  const [shippedByName, setShippedByName] = useState("Mrityunjay Enterprises Pvt. Ltd.");
  const [shippedByAddress, setShippedByAddress] = useState("Palri, Bhilwara, State- Rajasthan");
  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Adjustable Sizes State
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [newSizeInput, setNewSizeInput] = useState("");

  // Dynamic Carton Rows State (Clean initial single row)
  const [cartonRows, setCartonRows] = useState<CartonRowInput[]>([
    { id: "1", ctnNos: "1", articleNo: "", colour: "", sizeQuantities: { "S": 0, "M": 0, "L": 0, "XL": 0 } },
  ]);

  // Handle Size Add/Remove
  const handleAddSize = () => {
    if (!newSizeInput.trim()) return;
    const sz = newSizeInput.trim().toUpperCase();
    if (!sizes.includes(sz)) {
      setSizes(prev => [...prev, sz]);
      setCartonRows(prev => prev.map(row => ({
        ...row,
        sizeQuantities: { ...row.sizeQuantities, [sz]: 0 }
      })));
    }
    setNewSizeInput("");
  };

  const handleRemoveSize = (sz: string) => {
    if (sizes.length <= 1) return;
    setSizes(prev => prev.filter(s => s !== sz));
    setCartonRows(prev => prev.map(row => {
      const copy = { ...row.sizeQuantities };
      delete copy[sz];
      return { ...row, sizeQuantities: copy };
    }));
  };

  // Handle Carton Row Operations
  const handleAddRow = () => {
    const nextCtnNum = (cartonRows.length + 1).toString();
    const lastRow = cartonRows[cartonRows.length - 1];
    const initialSq: Record<string, number> = {};
    sizes.forEach(s => { initialSq[s] = 0; });

    setCartonRows(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        ctnNos: nextCtnNum,
        articleNo: lastRow ? lastRow.articleNo : "T2824E",
        colour: lastRow ? lastRow.colour : "BROWN",
        sizeQuantities: initialSq
      }
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (cartonRows.length <= 1) return;
    setCartonRows(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = (id: string, field: keyof CartonRowInput, val: any) => {
    setCartonRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const handleQtyChange = (rowId: string, size: string, qty: number) => {
    setCartonRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      return {
        ...r,
        sizeQuantities: {
          ...r.sizeQuantities,
          [size]: Math.max(0, qty)
        }
      };
    }));
  };

  // Calculate Row Total
  const getRowTotal = (row: CartonRowInput) => {
    return sizes.reduce((sum, sz) => sum + (row.sizeQuantities[sz] || 0), 0);
  };

  // Grouping Cartons by Color for Subtotals & Rendering
  const colorGroups = React.useMemo(() => {
    const groupsMap: Record<string, { article: string; colour: string; cartons: CartonRowInput[] }> = {};

    cartonRows.forEach(row => {
      const key = `${row.articleNo}_${row.colour}`;
      if (!groupsMap[key]) {
        groupsMap[key] = { article: row.articleNo, colour: row.colour, cartons: [] };
      }
      groupsMap[key].cartons.push(row);
    });

    return Object.values(groupsMap).map(g => {
      const sizeTotals: Record<string, number> = {};
      sizes.forEach(sz => { sizeTotals[sz] = 0; });
      let groupGrandTotal = 0;

      g.cartons.forEach(row => {
        sizes.forEach(sz => {
          sizeTotals[sz] += (row.sizeQuantities[sz] || 0);
        });
        groupGrandTotal += getRowTotal(row);
      });

      return {
        ...g,
        sizeTotals,
        groupGrandTotal
      };
    });
  }, [cartonRows, sizes]);

  const totalPackingPcs = cartonRows.reduce((sum, r) => sum + getRowTotal(r), 0);

  const filteredOrders = packingList.filter(o =>
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.styleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Export ASN to Excel CSV format with exact column ordering:
  // PO NUMBER -> BRAND -> ARTICLE NO. -> COLOUR -> SIZES
  const exportASNExcel = () => {
    let csvRows: string[] = [];

    // Header Metadata
    csvRows.push(`"ADVANCE SHIPMENT NOTICE / PACKING LIST"`);
    csvRows.push(`"ART NO - ${artNoSummary}"`);
    csvRows.push(`"DESCRIPTION - ${description}"`);
    csvRows.push(`"PO NO - ${poNumber}","DATE - ${date}"`);
    csvRows.push(`"SHIPPED TO - ${shippedToName} (${shippedToAddress})"`);
    csvRows.push(`"SHIPPED BY - ${shippedByName} (${shippedByAddress})"`);
    csvRows.push(``);

    // Exact Column Headers
    const headers = ["CTN NOS", "PO NUMBER", "BRAND", "ARTICLE NO.", "COLOUR", ...sizes, "TOTAL PCS"];
    csvRows.push(headers.join(","));

    let grandTotalPcs = 0;

    colorGroups.forEach(g => {
      g.cartons.forEach(r => {
        const rowTotal = getRowTotal(r);
        const sizeVals = sizes.map(sz => r.sizeQuantities[sz] || "");
        const row = [
          r.ctnNos,
          `"${poNumber}"`,
          `"${brand}"`,
          `"${r.articleNo}"`,
          `"${r.colour}"`,
          ...sizeVals,
          rowTotal
        ];
        csvRows.push(row.join(","));
      });

      // Subtotal Row
      const subtotalVals = sizes.map(sz => g.sizeTotals[sz] || 0);
      const subtotalRow = [
        `"TOTAL (${g.colour})"`,
        `"${poNumber}"`,
        `"${brand}"`,
        `"${g.article}"`,
        `"${g.colour}"`,
        ...subtotalVals,
        g.groupGrandTotal
      ];
      csvRows.push(subtotalRow.join(","));
      csvRows.push(``);
      grandTotalPcs += g.groupGrandTotal;
    });

    const blankPads = new Array(sizes.length).fill("").join(",");
    csvRows.push(`"GRAND TOTAL PCS",,,,,${blankPads},"${grandTotalPcs}"`);

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ASN_Packing_List_PO_${poNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Advance Shipment Notice Excel (.csv) exported successfully!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedOrd = ordersList.find(o => o.id === selectedOrderId);
    const newEntry = {
      ...(selectedOrd || initialOrders[0] || {}),
      id: `pkl-${Date.now()}`,
      orderNumber: poNumber ? `PO-${poNumber}` : selectedOrd?.orderNumber || `PO-2026-001`,
      buyerPO: poNumber || selectedOrd?.buyerPO || "PO-2026-001",
      buyerName: brand || selectedOrd?.buyerName || "Client Buyer",
      brand: brand || selectedOrd?.brand || "Brand",
      styleName: description || selectedOrd?.styleName || "Garment Style",
      totalQuantity: totalPackingPcs > 0 ? totalPackingPcs : (selectedOrd?.totalQuantity || 1000),
      packedQty: totalPackingPcs > 0 ? totalPackingPcs : (selectedOrd?.totalQuantity || 1000),
      status: "ready-for-dispatch" as const
    };

    // Synchronize parent order status
    if (selectedOrderId) {
      updateOrderStatus(selectedOrderId, "ready-for-dispatch", {
        packedQty: totalPackingPcs > 0 ? totalPackingPcs : selectedOrd?.totalQuantity
      });
    }

    setPackingList(prev => [newEntry, ...prev]);
    setShowModal(false);
    setShowASNPreview(true);
    setToastMessage(`Packing List & ASN generated! Order moved to READY FOR DISPATCH.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectPackingOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) return;
    const ord = ordersList.find(o => o.id === orderId) || initialOrders.find(o => o.id === orderId);
    if (!ord) return;

    setPoNumber(ord.buyerPO);
    setBrand(ord.buyerName);
    setDescription(ord.styleName);
    setArtNoSummary(`${ord.styleNumber} (${ord.brand})`);
    setShippedToName(ord.buyerName);
    setShippedToAddress(`${ord.buyerName} Central Distribution Center`);

    const orderSizes: string[] = (ord as any).sizes || ["S", "M", "L", "XL"];
    setSizes(orderSizes);

    const initialSq: Record<string, number> = {};
    orderSizes.forEach((s: string) => { initialSq[s] = 0; });

    setCartonRows([
      { id: "1", ctnNos: "1", articleNo: ord.styleNumber, colour: "NAVY", sizeQuantities: { ...initialSq } },
    ]);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="space-y-6 print:hidden">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce">
            <Package className="text-emerald-400" size={18} />
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Packing List & ASN Management</h1>
            <p className="text-sm text-slate-500 mt-1">Export Advance Shipment Notice (ASN), adjustable size ratio loading & PDF/Excel generator</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`${basePath}/dispatch`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25"
            >
              <Truck size={16} /> Proceed to Dispatch Note
            </Link>
            <button
              onClick={() => setShowASNPreview(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-sm shadow-emerald-500/25"
            >
              <Eye size={16} /> View & Export ASN (PDF/Excel)
            </button>
            <button
              onClick={() => {
                setSelectedOrderId("");
                setPoNumber("");
                setBrand("");
                setDescription("");
                setArtNoSummary("");
                setShippedToName("");
                setShippedToAddress("");
                setSizes(["S", "M", "L", "XL"]);
                setCartonRows([{ id: "1", ctnNos: "1", articleNo: "", colour: "", sizeQuantities: { "S": 0, "M": 0, "L": 0, "XL": 0 } }]);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm shadow-indigo-500/25"
            >
              <Plus size={16} /> New Packing List
            </button>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Packing Lists</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{packingList.length} Orders</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">Garment polybagging & ratio packing</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Packed Volume</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {formatNumber(packingList.reduce((sum, o) => sum + o.packedQty, 0))} Pcs
            </p>
            <p className="text-xs text-slate-400 mt-1">Ready for warehouse handover</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estimated Cartons Sealed</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {cartonRows.length} Cartons Logged
            </p>
            <p className="text-xs text-slate-400 mt-1">Solid ratio & adjustable size cartons</p>
          </div>
        </div>

        {/* Search Filter */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search order #, buyer, style..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order #</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer / Garment Style</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Qty</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Packed Qty</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sealed Cartons</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Packing Progress</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Export ASN</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-400">
                    No packing lists found. Click &quot;New Packing List&quot; above to create one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(o => {
                  const pct = Math.min(100, Math.round((o.packedQty / o.totalQuantity) * 100));
                  const cartons = Math.ceil(o.packedQty / 24);
                  return (
                    <tr key={o.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-400">{o.orderNumber}</td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{o.buyerName}</p>
                        <p className="text-xs text-slate-500">{o.styleName}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{formatNumber(o.totalQuantity)} pcs</td>
                      <td className="px-4 py-4 text-sm font-bold text-emerald-600">{formatNumber(o.packedQty)} pcs</td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300 font-medium">{cartons} cartons</td>
                      <td className="px-4 py-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", pct >= 100 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300")}>
                          {pct >= 100 ? "FULLY PACKED" : "IN PACKING"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setShowASNPreview(true)}
                          title="View / Print Advance Shipment Notice"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        >
                          <FileText size={16} /> ASN PDF
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* NEW PACKING LIST FORM MODAL — STYLED EXACTLY ACCORDING TO PDF & WITH ADJUSTABLE SIZES */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in">
              {/* Form Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Settings size={14} /> Advance Shipment Notice (ASN) Form
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">New Packing List & Size Matrix Creator</h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Auto-Fill from Order:</label>
                    <select
                      value={selectedOrderId}
                      onChange={(e) => handleSelectPackingOrder(e.target.value)}
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="">Choose an order (Optional)...</option>
                      {(ordersList.length > 0 ? ordersList : initialOrders).map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} — {o.buyerName} ({o.styleName}) [{o.status}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-6">
                {/* SECTION 1: HEADER METADATA (MATCHING PDF LETTERHEAD BOXES) */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Shipment Header & Consignee Info (PDF Header)</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">PO Number *</label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={e => setPoNumber(e.target.value)}
                        placeholder="e.g. 252000868"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Brand Name *</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        placeholder="e.g. DUKE"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Packing Date</label>
                      <input
                        type="text"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        placeholder="e.g. 12.7.2026"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Garment Description / Style Name</label>
                      <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="e.g. FLEXI WAIST FORMAL TROUSER"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Article No Summary</label>
                      <input
                        type="text"
                        value={artNoSummary}
                        onChange={e => setArtNoSummary(e.target.value)}
                        placeholder="e.g. T2824E(BROWN, COFFEE), T2826E(PISTA)"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Shipped To (Buyer Name & Address)</label>
                      <input
                        type="text"
                        value={shippedToName}
                        onChange={e => setShippedToName(e.target.value)}
                        placeholder="Consignee Company Name"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold mb-2"
                      />
                      <input
                        type="text"
                        value={shippedToAddress}
                        onChange={e => setShippedToAddress(e.target.value)}
                        placeholder="Delivery Address & Postal Code"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Shipped By (Supplier / Factory Info)</label>
                      <input
                        type="text"
                        value={shippedByName}
                        onChange={e => setShippedByName(e.target.value)}
                        placeholder="Exporter Factory Name"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold mb-2"
                      />
                      <input
                        type="text"
                        value={shippedByAddress}
                        onChange={e => setShippedByAddress(e.target.value)}
                        placeholder="Factory Address & GSTIN"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ADJUSTABLE SIZE COLUMNS CONFIGURATOR */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">2. Adjustable Size Columns Configurator</h3>
                      <p className="text-[11px] text-slate-500">Add or remove size columns to match your buyer order specification</p>
                    </div>

                    {/* Add Size Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSizeInput}
                        onChange={e => setNewSizeInput(e.target.value)}
                        placeholder="e.g. 40 or XL"
                        className="w-28 h-9 px-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <Plus size={14} /> Add Size
                      </button>
                    </div>
                  </div>

                  {/* Size Tags List */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {sizes.map((sz) => (
                      <span key={sz} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-700 text-xs font-bold text-indigo-700 dark:text-indigo-300 shadow-sm">
                        Size: {sz}
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(sz)}
                          title={`Remove Size ${sz}`}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: DYNAMIC CARTON & COLOR LINES MATRIX (MATCHING PDF TABLE) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Carton Breakdown & Size Quantities Grid</h3>
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800"
                    >
                      <Plus size={14} /> Add Carton Entry Line
                    </button>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-sm">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 uppercase font-bold">
                          <th className="p-2.5 w-16">CTN NOS</th>
                          <th className="p-2.5 w-24">PO NUMBER</th>
                          <th className="p-2.5 w-24">BRAND</th>
                          <th className="p-2.5 w-28">ARTICLE NO.</th>
                          <th className="p-2.5 w-28">COLOUR</th>
                          {sizes.map(sz => (
                            <th key={sz} className="p-2.5 min-w-[60px] bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">Size {sz}</th>
                          ))}
                          <th className="p-2.5 w-20 font-extrabold text-emerald-600">TOTAL</th>
                          <th className="p-2.5 w-12">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {cartonRows.map((row) => {
                          const rowTotal = getRowTotal(row);
                          return (
                            <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.ctnNos}
                                  onChange={e => handleRowChange(row.id, "ctnNos", e.target.value)}
                                  className="w-14 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                                />
                              </td>
                              <td className="p-2 font-semibold text-slate-500">{poNumber}</td>
                              <td className="p-2 font-semibold text-slate-500">{brand}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.articleNo}
                                  onChange={e => handleRowChange(row.id, "articleNo", e.target.value)}
                                  className="w-24 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={row.colour}
                                  onChange={e => handleRowChange(row.id, "colour", e.target.value)}
                                  className="w-24 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold uppercase text-indigo-600"
                                />
                              </td>

                              {sizes.map(sz => (
                                <td key={sz} className="p-1.5">
                                  <input
                                    type="number"
                                    min={0}
                                    value={row.sizeQuantities[sz] || 0}
                                    onChange={e => handleQtyChange(row.id, sz, parseInt(e.target.value) || 0)}
                                    className="w-14 h-8 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                                  />
                                </td>
                              ))}

                              <td className="p-2 font-extrabold text-emerald-600 text-sm">{rowTotal}</td>
                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(row.id)}
                                  className="text-slate-400 hover:text-red-500 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Grand Total Summary Card */}
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Packing List Calculated Summary</p>
                    <p className="text-slate-500">{cartonRows.length} Carton Entries Across {colorGroups.length} Color Variants</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-slate-400 uppercase font-semibold text-[10px] block">Grand Total Pcs</span>
                      <span className="text-xl font-extrabold text-emerald-600">{totalPackingPcs.toLocaleString()} Pcs</span>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/25"
                  >
                    <Archive size={16} /> Save & Preview ASN Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* ADVANCE SHIPMENT NOTICE (ASN) PRINTABLE / EXPORT DRAWER */}
      {showASNPreview && (
        <div className="packing-modal-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
          <style>{`
            @media print {
              @page {
                size: A4 landscape;
                margin: 5mm 8mm;
              }
              html, body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                height: auto !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              /* HIDE NAVIGATION, SIDEBAR, HEADER AND NON-PRINTABLE PAGE ELEMENTS */
              header, sidebar, nav, aside, .print\\:hidden {
                display: none !important;
              }
              main {
                padding: 0 !important;
                margin: 0 !important;
                background: #ffffff !important;
                display: block !important;
              }
              /* UNSET MODAL FIXED POSITIONING FOR CLEAN PRINT FLOW */
              .packing-modal-overlay {
                position: static !important;
                background: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
                display: block !important;
                overflow: visible !important;
              }
              .packing-modal-content {
                max-width: 100% !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                border: none !important;
                background: #ffffff !important;
                display: block !important;
              }
              .packing-bill-document {
                display: block !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 10px !important;
                border: 2px solid #000000 !important;
                box-shadow: none !important;
                background: #ffffff !important;
                color: #000000 !important;
                page-break-inside: avoid !important;
              }
            }
          `}</style>

          <div className="packing-modal-content bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-scale-in text-black">
            {/* Modal Top Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Advance Shipment Notice & Packing Sheet</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">PO #{poNumber} — ASN Document</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportASNExcel}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <FileSpreadsheet size={15} /> Export Excel (.csv)
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Printer size={15} /> Print / Save PDF (Document Only)
                </button>
                <button
                  onClick={() => setShowASNPreview(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Exact Replica of Attached PDF Advance Shipment Notice Document (Isolated Printable Area) */}
            <div className="packing-bill-document p-6 bg-white text-black font-sans border-2 border-black rounded-xl space-y-4 text-xs">
              <div className="text-center font-extrabold text-sm border-b-2 border-black pb-2 uppercase tracking-wide">
                ADVANCE SHIPMENT NOTICE / PACKING LIST
              </div>

              {/* Document Header Double Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-black divide-y md:divide-y-0 md:divide-x-2 divide-black">
                {/* Left Header Box */}
                <div className="p-3 space-y-2">
                  <p className="font-bold">ART NO - {artNoSummary}</p>
                  <p className="font-bold uppercase text-slate-800">{description}</p>
                  <p className="font-extrabold">PO NO = {poNumber}</p>
                  <p className="font-bold">DATE ={date}</p>
                </div>

                {/* Right Header Box */}
                <div className="p-3 space-y-2">
                  <p className="font-bold uppercase">SHIPPED TO - {shippedToName}</p>
                  <p className="font-semibold text-slate-700">{shippedToAddress}</p>
                  <p className="font-bold uppercase mt-2">SHIPPED BY - {shippedByName}</p>
                  <p className="font-semibold text-slate-700">{shippedByAddress}</p>
                </div>
              </div>

              {/* Itemized Table in exact requested column order: */}
              {/* CTN NOS | PO NUMBER | BRAND | ARTICLE NO. | COLOUR | SIZES... | TOTAL */}
              <div className="border-2 border-black overflow-x-auto">
                <table className="w-full text-center border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-100 border-b-2 border-black text-black uppercase font-bold">
                      <th className="p-2 border-r border-black">CTN NOS</th>
                      <th className="p-2 border-r border-black">PO NUMBER</th>
                      <th className="p-2 border-r border-black">BRAND</th>
                      <th className="p-2 border-r border-black">ARTICLE NO.</th>
                      <th className="p-2 border-r border-black">COLOUR</th>
                      {sizes.map(sz => (
                        <th key={sz} className="p-2 border-r border-black">{sz}</th>
                      ))}
                      <th className="p-2">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colorGroups.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {group.cartons.map((r, cIdx) => (
                          <tr key={cIdx} className="border-b border-slate-300">
                            <td className="p-1.5 font-bold border-r border-black">{r.ctnNos}</td>
                            {cIdx === 0 && (
                              <td rowSpan={group.cartons.length} className="p-2 font-extrabold border-r border-black align-middle bg-slate-50">
                                {poNumber}
                              </td>
                            )}
                            <td className="p-1.5 font-bold border-r border-black">{brand}</td>
                            <td className="p-1.5 font-bold border-r border-black">{r.articleNo}</td>
                            <td className="p-1.5 font-bold border-r border-black uppercase">{r.colour}</td>
                            {sizes.map(sz => (
                              <td key={sz} className="p-1.5 border-r border-black font-semibold">
                                {r.sizeQuantities[sz] || ""}
                              </td>
                            ))}
                            <td className="p-1.5 font-extrabold">{getRowTotal(r)}</td>
                          </tr>
                        ))}
                        {/* Subtotal Row */}
                        <tr className="bg-slate-200/80 border-b-2 border-black font-extrabold text-black">
                          <td colSpan={5} className="p-2 text-right border-r border-black uppercase tracking-wider">
                            TOTAL ({group.colour})
                          </td>
                          {sizes.map(sz => (
                            <td key={sz} className="p-2 border-r border-black">{group.sizeTotals[sz] || 0}</td>
                          ))}
                          <td className="p-2 text-indigo-900 bg-indigo-50">{group.groupGrandTotal}</td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackingView;
