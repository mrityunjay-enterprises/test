"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { orders as initialOrders } from "@/lib/demo-data";
import { Order } from "@/lib/types";
import { getStoredOrders, updateOrderStatus, WORKFLOW_EVENT } from "@/lib/workflow-service";
import {
  Scissors, Plus, Search, CheckCircle2, X, ArrowLeft, Layers,
  ChevronDown, ChevronRight, QrCode, AlertTriangle, TrendingUp, Package
} from "lucide-react";

interface LayEntry {
  layNo: number;
  plies: number;
  qtyCut: number;
  status: "pending" | "in-progress" | "completed";
}

interface CuttingOrder {
  id: string;
  cuttingNo: string;
  orderId: string;
  orderNumber: string;
  styleName: string;
  fabric: string;
  tableNo: string;
  plannedQty: number;
  cutQty: number;
  markerEff: number;
  wastage: number;
  lays: LayEntry[];
  bundlesGenerated: number;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;
}

const STORAGE_KEY = "garmentflow_cutting_orders";

const initialCuttingOrders: CuttingOrder[] = [
  {
    id: "co1", cuttingNo: "CUT-2025-0045", orderId: "o1", orderNumber: "ORD-2025-0001",
    styleName: "Classic Oxford Button-Down Shirt", fabric: "Oxford Cotton - White",
    tableNo: "Table 1", plannedQty: 6000, cutQty: 5200, markerEff: 86.4, wastage: 3.2,
    lays: [
      { layNo: 1, plies: 80, qtyCut: 1600, status: "completed" },
      { layNo: 2, plies: 80, qtyCut: 1600, status: "completed" },
      { layNo: 3, plies: 80, qtyCut: 1200, status: "completed" },
      { layNo: 4, plies: 40, qtyCut: 800, status: "in-progress" },
    ],
    bundlesGenerated: 42, status: "in-progress", createdAt: "2025-07-10"
  },
  {
    id: "co2", cuttingNo: "CUT-2025-0046", orderId: "o1", orderNumber: "ORD-2025-0001",
    styleName: "Classic Oxford Button-Down Shirt", fabric: "Oxford Cotton - Light Blue",
    tableNo: "Table 2", plannedQty: 6000, cutQty: 6200, markerEff: 87.8, wastage: 2.8,
    lays: [
      { layNo: 1, plies: 100, qtyCut: 2000, status: "completed" },
      { layNo: 2, plies: 100, qtyCut: 2000, status: "completed" },
      { layNo: 3, plies: 100, qtyCut: 2200, status: "completed" },
    ],
    bundlesGenerated: 62, status: "completed", createdAt: "2025-07-08"
  },
  {
    id: "co3", cuttingNo: "CUT-2025-0047", orderId: "o2", orderNumber: "ORD-2025-0002",
    styleName: "Floral Print Maxi Dress", fabric: "Georgette - Navy Floral",
    tableNo: "Table 1", plannedQty: 4000, cutQty: 2100, markerEff: 84.2, wastage: 4.1,
    lays: [
      { layNo: 1, plies: 60, qtyCut: 1200, status: "completed" },
      { layNo: 2, plies: 45, qtyCut: 900, status: "in-progress" },
    ],
    bundlesGenerated: 18, status: "in-progress", createdAt: "2025-07-15"
  },
  {
    id: "co4", cuttingNo: "CUT-2025-0048", orderId: "o5", orderNumber: "ORD-2025-0005",
    styleName: "Kids Printed Polo T-Shirt", fabric: "Cotton Pique - White",
    tableNo: "Table 2", plannedQty: 10000, cutQty: 0, markerEff: 0, wastage: 0,
    lays: [],
    bundlesGenerated: 0, status: "pending", createdAt: "2025-07-20"
  },
];

export function CuttingView({ basePath = "/factory" }: { basePath?: string }) {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = () => {
    setOrdersList(getStoredOrders());
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setCuttingOrders(JSON.parse(saved)); return; }
    } catch { }
    setCuttingOrders(initialCuttingOrders);
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

  const save = (data: CuttingOrder[]) => {
    setCuttingOrders(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
  };

  // ─── New Cutting Order Form State ───
  const [formOrder, setFormOrder] = useState("");
  const [formTable, setFormTable] = useState("Table 1");
  const [formPlannedQty, setFormPlannedQty] = useState("");
  const [formFabric, setFormFabric] = useState("");

  const activeOrders = ordersList.length > 0 ? ordersList : initialOrders;
  const selectedOrder = activeOrders.find(o => o.id === formOrder);

  const handleCreateCuttingOrder = () => {
    if (!formOrder || !formPlannedQty || !formFabric) return;
    const ord = activeOrders.find(o => o.id === formOrder);
    if (!ord) return;
    const newCO: CuttingOrder = {
      id: `co-${Date.now()}`,
      cuttingNo: `CUT-2025-${String(Math.floor(Math.random() * 9000 + 1000))}`,
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      styleName: ord.styleName,
      fabric: formFabric,
      tableNo: formTable,
      plannedQty: parseInt(formPlannedQty),
      cutQty: 0,
      markerEff: 0,
      wastage: 0,
      lays: [],
      bundlesGenerated: 0,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    save([newCO, ...cuttingOrders]);

    // Synchronize parent order status to in-cutting
    updateOrderStatus(ord.id, "in-cutting", {
      cuttingQty: Math.max(ord.cuttingQty || 0, parseInt(formPlannedQty))
    });

    setShowNewModal(false);
    setFormOrder(""); setFormTable("Table 1"); setFormPlannedQty(""); setFormFabric("");
    setShowSuccess("Cutting order created & Order moved to IN CUTTING!");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  // ─── Add Lay ───
  const addLay = (coId: string) => {
    save(cuttingOrders.map(co => {
      if (co.id !== coId) return co;
      const newLayNo = co.lays.length + 1;
      return {
        ...co,
        status: "in-progress" as const,
        lays: [...co.lays, { layNo: newLayNo, plies: 0, qtyCut: 0, status: "pending" as const }],
      };
    }));
  };

  // ─── Update Lay ───
  const updateLay = (coId: string, layNo: number, field: "plies" | "qtyCut", value: number) => {
    save(cuttingOrders.map(co => {
      if (co.id !== coId) return co;
      const updatedLays = co.lays.map(l => l.layNo === layNo ? { ...l, [field]: value } : l);
      const totalCut = updatedLays.reduce((s, l) => s + l.qtyCut, 0);
      return { ...co, lays: updatedLays, cutQty: totalCut };
    }));
  };

  // ─── Complete Lay ───
  const completeLay = (coId: string, layNo: number) => {
    save(cuttingOrders.map(co => {
      if (co.id !== coId) return co;
      const updatedLays = co.lays.map(l => l.layNo === layNo ? { ...l, status: "completed" as const } : l);
      const allDone = updatedLays.every(l => l.status === "completed");
      const totalCut = updatedLays.reduce((s, l) => s + l.qtyCut, 0);
      return {
        ...co, lays: updatedLays, cutQty: totalCut,
        status: allDone && totalCut >= co.plannedQty ? "completed" as const : "in-progress" as const,
        markerEff: co.markerEff === 0 ? parseFloat((82 + Math.random() * 8).toFixed(1)) : co.markerEff,
        wastage: co.wastage === 0 ? parseFloat((2 + Math.random() * 3).toFixed(1)) : co.wastage,
      };
    }));
    setShowSuccess(`Lay #${layNo} marked complete`);
    setTimeout(() => setShowSuccess(""), 2500);
  };

  // ─── Generate Bundles ───
  const generateBundles = (coId: string) => {
    save(cuttingOrders.map(co => {
      if (co.id !== coId) return co;
      const completedQty = co.lays.filter(l => l.status === "completed").reduce((s, l) => s + l.qtyCut, 0);
      const newBundles = Math.floor(completedQty / 25);
      return { ...co, bundlesGenerated: newBundles };
    }));
    setShowSuccess("Bundles generated successfully!");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  // ─── Filters ───
  const filtered = cuttingOrders.filter(co => {
    if (statusFilter !== "all" && co.status !== statusFilter) return false;
    if (search && !co.cuttingNo.toLowerCase().includes(search.toLowerCase()) &&
      !co.orderNumber.toLowerCase().includes(search.toLowerCase()) &&
      !co.styleName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // KPIs
  const totalPlanned = cuttingOrders.reduce((s, c) => s + c.plannedQty, 0);
  const totalCut = cuttingOrders.reduce((s, c) => s + c.cutQty, 0);
  const totalBundles = cuttingOrders.reduce((s, c) => s + c.bundlesGenerated, 0);
  const avgMarkerEff = cuttingOrders.filter(c => c.markerEff > 0).length > 0
    ? (cuttingOrders.filter(c => c.markerEff > 0).reduce((s, c) => s + c.markerEff, 0) / cuttingOrders.filter(c => c.markerEff > 0).length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{showSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Cutting & Bundling Department</h1>
          <p className="text-sm text-slate-500 mt-1">Lay planning, marker efficiency, cutting orders & bundle QR generation</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> New Cutting Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Planned Qty", value: totalPlanned.toLocaleString(), icon: <Layers size={18} className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Cut Qty", value: totalCut.toLocaleString(), icon: <Scissors size={18} className="text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/40" },
          { label: "Avg Marker Eff.", value: `${avgMarkerEff}%`, icon: <TrendingUp size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40" },
          { label: "Bundles Generated", value: totalBundles.toLocaleString(), icon: <QrCode size={18} className="text-purple-600" />, bg: "bg-purple-100 dark:bg-purple-900/40" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cutting orders..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Cutting Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cutting #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Style</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fabric</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Table</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Planned</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cut</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marker Eff.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Wastage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bundles</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(co => (
              <React.Fragment key={co.id}>
                <tr onClick={() => setExpandedRow(expandedRow === co.id ? null : co.id)} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5 text-slate-400">{expandedRow === co.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{co.cuttingNo}</td>
                  <td className="px-4 py-3.5"><p className="text-sm font-medium text-slate-800 dark:text-white">{co.orderNumber}</p><p className="text-xs text-slate-500">{co.styleName}</p></td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{co.fabric}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{co.tableNo}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{co.plannedQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">{co.cutQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{co.markerEff > 0 ? `${co.markerEff}%` : "—"}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{co.wastage > 0 ? `${co.wastage}%` : "—"}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-purple-600">{co.bundlesGenerated}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full",
                      co.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        co.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-600"
                    )}>{co.status.replace(/-/g, " ").toUpperCase()}</span>
                  </td>
                </tr>
                {/* Expanded Lay Details */}
                {expandedRow === co.id && (
                  <tr>
                    <td colSpan={11} className="bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Lay Progress — {co.cuttingNo}</h4>
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); addLay(co.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">
                              <Plus size={12} /> Add Lay
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); generateBundles(co.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors">
                              <QrCode size={12} /> Generate Bundles
                            </button>
                          </div>
                        </div>
                        {co.lays.length === 0 ? (
                          <div className="p-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            <p className="text-sm text-slate-500">No lays added yet. Click &quot;Add Lay&quot; to start cutting.</p>
                          </div>
                        ) : (
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Lay #</th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Plies</th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Qty Cut</th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {co.lays.map(lay => (
                                <tr key={lay.layNo} className="border-b border-slate-100 dark:border-slate-800/50">
                                  <td className="px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white">Lay {lay.layNo}</td>
                                  <td className="px-3 py-2">
                                    {lay.status === "completed" ? (
                                      <span className="text-sm text-slate-600">{lay.plies}</span>
                                    ) : (
                                      <input type="number" value={lay.plies || ""} onClick={e => e.stopPropagation()} onChange={e => updateLay(co.id, lay.layNo, "plies", parseInt(e.target.value) || 0)} className="w-20 h-8 px-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {lay.status === "completed" ? (
                                      <span className="text-sm font-bold text-emerald-600">{lay.qtyCut.toLocaleString()}</span>
                                    ) : (
                                      <input type="number" value={lay.qtyCut || ""} onClick={e => e.stopPropagation()} onChange={e => updateLay(co.id, lay.layNo, "qtyCut", parseInt(e.target.value) || 0)} className="w-24 h-8 px-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full",
                                      lay.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                        lay.status === "in-progress" ? "bg-blue-100 text-blue-700" :
                                          "bg-slate-100 text-slate-600"
                                    )}>{lay.status.toUpperCase()}</span>
                                  </td>
                                  <td className="px-3 py-2">
                                    {lay.status !== "completed" && lay.qtyCut > 0 && (
                                      <button onClick={(e) => { e.stopPropagation(); completeLay(co.id, lay.layNo); }} className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline">
                                        Mark Complete
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {/* Progress Bar */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, co.plannedQty > 0 ? (co.cutQty / co.plannedQty) * 100 : 0)}%` }} />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{co.plannedQty > 0 ? Math.round((co.cutQty / co.plannedQty) * 100) : 0}%</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-4 py-12 text-center text-sm text-slate-400">No cutting orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Cutting Order Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Cutting Order</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Order *</label>
                <select value={formOrder} onChange={e => { setFormOrder(e.target.value); const o = activeOrders.find(o => o.id === e.target.value); if (o) setFormFabric(o.styleName.includes("Oxford") ? "Oxford Cotton" : o.styleName.includes("Denim") ? "Stretch Denim" : o.styleName.includes("Floral") ? "Georgette Fabric" : "Cotton Fabric"); }} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">Choose an order...</option>
                  {activeOrders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} — {o.styleName} ({o.status})</option>)}
                </select>
              </div>
              {selectedOrder && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-xs space-y-1">
                  <p className="text-indigo-700 font-semibold">{selectedOrder.styleName}</p>
                  <p className="text-indigo-600">Buyer: {selectedOrder.buyerName} • Total Qty: {selectedOrder.totalQuantity.toLocaleString()}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Cutting Table *</label>
                  <select value={formTable} onChange={e => setFormTable(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                    <option value="Table 1">Table 1</option>
                    <option value="Table 2">Table 2</option>
                    <option value="Table 3">Table 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Planned Qty *</label>
                  <input type="number" value={formPlannedQty} onChange={e => setFormPlannedQty(e.target.value)} placeholder="e.g. 5000" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  </input>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Fabric *</label>
                <input type="text" value={formFabric} onChange={e => setFormFabric(e.target.value)} placeholder="e.g. Oxford Cotton - White" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleCreateCuttingOrder} disabled={!formOrder || !formPlannedQty || !formFabric} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                <Scissors size={14} className="inline mr-1.5" /> Create Cutting Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CuttingView;
