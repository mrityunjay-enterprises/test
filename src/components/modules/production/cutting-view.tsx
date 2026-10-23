"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { orders as initialOrders } from "@/lib/demo-data";
import { Order } from "@/lib/types";
import { getStoredOrders, updateOrderStatus, WORKFLOW_EVENT } from "@/lib/workflow-service";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import {
  Scissors, Plus, Search, CheckCircle2, X, ArrowLeft, Layers,
  ChevronDown, ChevronRight, QrCode, AlertTriangle, TrendingUp, Package,
  Printer, FileText, Tag, Check, Lock, Unlock, KeyRound, ShieldAlert, Clock
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
  buyerName?: string;
  buyerPO?: string;
  styleName: string;
  styleNumber?: string;
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
  unlockStatus?: "none" | "requested" | "unlocked";
  unlockReason?: string;
}

const STORAGE_KEY = "garmentflow_cutting_orders";

const initialCuttingOrders: CuttingOrder[] = [
  {
    id: "co1", cuttingNo: "CUT-2025-0045", orderId: "o1", orderNumber: "ORD-2025-0001",
    buyerName: "Nordstrom", buyerPO: "NORD-PO-78234",
    styleName: "Classic Oxford Button-Down Shirt", styleNumber: "STY-2024-001", fabric: "Oxford Cotton - White",
    tableNo: "Table 1", plannedQty: 6000, cutQty: 5200, markerEff: 86.4, wastage: 3.2,
    lays: [
      { layNo: 1, plies: 80, qtyCut: 1600, status: "completed" },
      { layNo: 2, plies: 80, qtyCut: 1600, status: "completed" },
      { layNo: 3, plies: 80, qtyCut: 1200, status: "completed" },
      { layNo: 4, plies: 40, qtyCut: 800, status: "in-progress" },
    ],
    bundlesGenerated: 42, status: "in-progress", createdAt: "2025-07-10",
    unlockStatus: "none"
  },
  {
    id: "co2", cuttingNo: "CUT-2025-0046", orderId: "o1", orderNumber: "ORD-2025-0001",
    buyerName: "Nordstrom", buyerPO: "NORD-PO-78234",
    styleName: "Classic Oxford Button-Down Shirt", styleNumber: "STY-2024-001", fabric: "Oxford Cotton - Light Blue",
    tableNo: "Table 2", plannedQty: 6000, cutQty: 6200, markerEff: 87.8, wastage: 2.8,
    lays: [
      { layNo: 1, plies: 100, qtyCut: 2000, status: "completed" },
      { layNo: 2, plies: 100, qtyCut: 2000, status: "completed" },
      { layNo: 3, plies: 100, qtyCut: 2200, status: "completed" },
    ],
    bundlesGenerated: 62, status: "completed", createdAt: "2025-07-08",
    unlockStatus: "requested",
    unlockReason: "Supervisor typo on Lay #3 plies (recorded 100 instead of 110)."
  },
  {
    id: "co3", cuttingNo: "CUT-2025-0047", orderId: "o2", orderNumber: "ORD-2025-0002",
    buyerName: "Marks & Spencer", buyerPO: "MS-PO-45678",
    styleName: "Floral Print Maxi Dress", styleNumber: "STY-2024-002", fabric: "Georgette - Navy Floral",
    tableNo: "Table 1", plannedQty: 4000, cutQty: 2100, markerEff: 84.2, wastage: 4.1,
    lays: [
      { layNo: 1, plies: 60, qtyCut: 1200, status: "completed" },
      { layNo: 2, plies: 45, qtyCut: 900, status: "in-progress" },
    ],
    bundlesGenerated: 18, status: "in-progress", createdAt: "2025-07-15",
    unlockStatus: "none"
  },
  {
    id: "co4", cuttingNo: "CUT-2025-0048", orderId: "o5", orderNumber: "ORD-2025-0005",
    buyerName: "Target Stores", buyerPO: "TGT-PO-12456",
    styleName: "Kids Printed Polo T-Shirt", styleNumber: "STY-2024-005", fabric: "Cotton Pique - White",
    tableNo: "Table 2", plannedQty: 10000, cutQty: 0, markerEff: 0, wastage: 0,
    lays: [],
    bundlesGenerated: 0, status: "pending", createdAt: new Date().toISOString().split("T")[0],
    unlockStatus: "none"
  },
];

export function CuttingView({ basePath = "/factory" }: { basePath?: string }) {
  const isOwner = basePath.startsWith("/owner");
  const todayDate = new Date().toISOString().split("T")[0];
  const isPastDate = (dateStr: string) => (dateStr || "") < todayDate;

  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [cuttingOrders, setCuttingOrders] = useState<CuttingOrder[]>([]);
  const cuttingOrdersRef = useRef<CuttingOrder[]>(cuttingOrders);
  cuttingOrdersRef.current = cuttingOrders;
  const lastSavedJsonRef = useRef<string>("");

  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedCutTicket, setSelectedCutTicket] = useState<CuttingOrder | null>(null);
  const [showSuccess, setShowSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // State for Request Unlock Access Modal
  const [requestModalCo, setRequestModalCo] = useState<CuttingOrder | null>(null);
  const [requestReason, setRequestReason] = useState("");

  useScrollLock(!!requestModalCo || !!selectedCutTicket || showNewModal);

  const loadData = () => {
    const stored = getStoredOrders();
    const active = stored.length > 0 ? stored : initialOrders;
    setOrdersList(active);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        lastSavedJsonRef.current = saved;
        const parsed: CuttingOrder[] = JSON.parse(saved);
        // Enrich any existing cutting orders with buyer details from active orders
        const enriched = parsed.map(co => {
          const match = active.find(o => o.id === co.orderId || o.orderNumber === co.orderNumber);
          return {
            ...co,
            buyerName: co.buyerName || match?.buyerName || "Nordstrom",
            buyerPO: co.buyerPO || match?.buyerPO || "PO-NORD-78234",
            styleNumber: co.styleNumber || match?.styleNumber || "",
            unlockStatus: co.unlockStatus || "none",
          };
        });
        setCuttingOrders(enriched);
        return;
      }
    } catch { }
    setCuttingOrders(initialCuttingOrders);
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    // Live polling for cross-window / background unlock approvals (Factory Item 3)
    const pollInterval = setInterval(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && saved !== lastSavedJsonRef.current) {
          lastSavedJsonRef.current = saved;
          const parsed: CuttingOrder[] = JSON.parse(saved);
          // Check for newly approved unlock requests
          parsed.forEach(p => {
            const prev = cuttingOrdersRef.current.find(c => c.id === p.id);
            if (prev && prev.unlockStatus === "requested" && p.unlockStatus === "unlocked") {
              setShowSuccess(`🎉 Admin APPROVED edit access for Cutting Order ${p.cuttingNo}! You can now edit past-date report values.`);
              setTimeout(() => setShowSuccess(""), 5000);
            }
          });
          setCuttingOrders(parsed);
        }
      } catch {}
    }, 2500);

    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
      clearInterval(pollInterval);
    };
  }, []);

  const save = (data: CuttingOrder[]) => {
    setCuttingOrders(data);
    try {
      const serialized = JSON.stringify(data);
      lastSavedJsonRef.current = serialized;
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch { }
  };

  // ─── Unlock & Approval Handlers ───
  const handleRequestUnlock = () => {
    if (!requestModalCo || !requestReason.trim()) return;
    const updated = cuttingOrders.map(co => {
      if (co.id === requestModalCo.id) {
        return {
          ...co,
          unlockStatus: "requested" as const,
          unlockReason: requestReason.trim(),
        };
      }
      return co;
    });
    save(updated);
    setRequestModalCo(null);
    setRequestReason("");
    setShowSuccess("Unlock request submitted to Admin/Owner for approval!");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const handleApproveUnlock = (coId: string) => {
    const updated = cuttingOrders.map(co => {
      if (co.id === coId) {
        return { ...co, unlockStatus: "unlocked" as const };
      }
      return co;
    });
    save(updated);
    setShowSuccess("Cutting order unlocked! Edit access granted.");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const handleRejectUnlock = (coId: string) => {
    const updated = cuttingOrders.map(co => {
      if (co.id === coId) {
        return { ...co, unlockStatus: "none" as const, unlockReason: undefined };
      }
      return co;
    });
    save(updated);
    setShowSuccess("Unlock request rejected.");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const handleRelock = (coId: string) => {
    const updated = cuttingOrders.map(co => {
      if (co.id === coId) {
        return { ...co, unlockStatus: "none" as const, unlockReason: undefined };
      }
      return co;
    });
    save(updated);
    setShowSuccess("Changes saved. Cutting record re-locked.");
    setTimeout(() => setShowSuccess(""), 3000);
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
      buyerName: ord.buyerName,
      buyerPO: ord.buyerPO,
      styleName: ord.styleName,
      styleNumber: ord.styleNumber,
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
    if (search) {
      const q = search.toLowerCase();
      const matchCut = co.cuttingNo.toLowerCase().includes(q);
      const matchOrd = co.orderNumber.toLowerCase().includes(q);
      const matchStyle = co.styleName.toLowerCase().includes(q);
      const matchBuyer = co.buyerName?.toLowerCase().includes(q);
      const matchPO = co.buyerPO?.toLowerCase().includes(q);
      if (!matchCut && !matchOrd && !matchStyle && !matchBuyer && !matchPO) return false;
    }
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

      {/* Owner Pending Edit Access Requests Banner */}
      {isOwner && cuttingOrders.some(co => co.unlockStatus === "requested") && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
            <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Cutting Record Edit Requests Pending Approval</h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Cutting operators have requested permission to modify past-date cutting records. Review their reason before unlocking.
              </p>
            </div>
          </div>
          <div className="divide-y divide-amber-200/60 dark:divide-amber-800/60 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/80 overflow-hidden">
            {cuttingOrders.filter(co => co.unlockStatus === "requested").map(co => (
              <div key={co.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{co.cuttingNo}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {co.orderNumber} ({co.buyerName || "Buyer"})
                    </span>
                    <span className="text-[11px] text-slate-500">Recorded on: {co.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/40">
                    <span className="font-semibold text-amber-800 dark:text-amber-400">Reason:</span> &ldquo;{co.unlockReason || "Supervisor requested edit access."}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveUnlock(co.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Unlock size={13} /> Approve Unlock
                  </button>
                  <button
                    onClick={() => handleRejectUnlock(co.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time Live Status for Factory Floor Supervisor (Factory Item 3) */}
      {!isOwner && (
        <div className="space-y-2">
          {cuttingOrders.filter(co => co.unlockStatus === "unlocked").map(co => (
            <div key={co.id} className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
                  <Unlock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      Edit Access Active (Admin Approved)
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{co.cuttingNo}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Past-date cutting report is unlocked. Click below to modify lay plies, marker efficiency, and output counts.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setExpandedRow(expandedRow === co.id ? null : co.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {expandedRow === co.id ? "Editing Now ↓" : "Edit Report"}
                </button>
                <button
                  onClick={() => handleRelock(co.id)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Done & Re-lock
                </button>
              </div>
            </div>
          ))}

          {cuttingOrders.filter(co => co.unlockStatus === "requested").map(co => (
            <div key={co.id} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                      Unlock Pending Admin Approval
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{co.cuttingNo}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Reason: &ldquo;{co.unlockReason}&rdquo; • This station will automatically unlock in real-time once Owner approves.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" /> Waiting for Owner
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Cut #, Order #, Buyer, PO, or Style..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order & Buyer Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fabric</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Table</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Planned</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cut</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Marker Eff.</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Wastage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bundles</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Access</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(co => {
              const isPast = isPastDate(co.createdAt);
              const isLocked = isPast && co.unlockStatus !== "unlocked" && !isOwner;

              return (
              <React.Fragment key={co.id}>
                <tr onClick={() => setExpandedRow(expandedRow === co.id ? null : co.id)} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3.5 text-slate-400">{expandedRow === co.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{co.cuttingNo}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{co.orderNumber}</span>
                      {co.buyerName && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                          {co.buyerName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium mt-0.5">
                      PO: {co.buyerPO || "—"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {co.styleName} {co.styleNumber ? `(${co.styleNumber})` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{co.fabric}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{co.tableNo}</td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{co.plannedQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">{co.cutQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">{co.markerEff > 0 ? `${co.markerEff}%` : "—"}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{co.wastage > 0 ? `${co.wastage}%` : "—"}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-purple-600">{co.bundlesGenerated}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full",
                        co.status === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                          co.status === "in-progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
                            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      )}>{co.status.replace(/-/g, " ").toUpperCase()}</span>
                      {isPast ? (
                        co.unlockStatus === "unlocked" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/60">
                            <Unlock size={10} /> UNLOCKED
                          </span>
                        ) : co.unlockStatus === "requested" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300/60">
                            <Clock size={10} /> REQUESTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300/60">
                            <Lock size={10} /> LOCKED
                          </span>
                        )
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Today</span>
                      )}
                    </div>
                  </td>
                </tr>
                {/* Expanded Lay Details */}
                {expandedRow === co.id && (
                  <tr>
                    <td colSpan={11} className="bg-slate-50/50 dark:bg-slate-800/20 px-6 py-4">
                      <div className="space-y-4">
                        {/* Access & Lock Status Banner for Past Dates */}
                        {isPast && (
                          <div className={cn(
                            "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border text-xs",
                            co.unlockStatus === "unlocked"
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                              : co.unlockStatus === "requested"
                                ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          )}>
                            <div className="flex items-center gap-2">
                              {co.unlockStatus === "unlocked" ? (
                                <>
                                  <Unlock size={16} className="text-emerald-600 shrink-0" />
                                  <div>
                                    <span className="font-bold">Record Unlocked by Admin.</span> Edit access is active for this past-date record ({co.createdAt}). You may modify plies & cut quantities.
                                  </div>
                                </>
                              ) : co.unlockStatus === "requested" ? (
                                <>
                                  <Clock size={16} className="text-amber-600 shrink-0" />
                                  <div>
                                    <span className="font-bold">Edit Request Pending.</span> Waiting for Admin/Owner approval. Reason: &ldquo;{co.unlockReason}&rdquo;
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Lock size={16} className="text-slate-500 shrink-0" />
                                  <div>
                                    <span className="font-bold">Past-Date Record Locked ({co.createdAt}).</span> Modifying previous days&apos; cutting figures requires Admin authorization to prevent stock discrepancy.
                                  </div>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {co.unlockStatus === "unlocked" && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleRelock(co.id); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer shadow-sm"
                                >
                                  <Lock size={12} /> Save & Re-lock
                                </button>
                              )}
                              {co.unlockStatus === "requested" && isOwner && (
                                <>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleApproveUnlock(co.id); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
                                  >
                                    <Unlock size={12} /> Approve
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRejectUnlock(co.id); }}
                                    className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {co.unlockStatus === "none" && !isOwner && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setRequestModalCo(co); setRequestReason(""); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer shadow-sm"
                                >
                                  <KeyRound size={12} /> Request Edit Access
                                </button>
                              )}
                              {co.unlockStatus === "none" && isOwner && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleApproveUnlock(co.id); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
                                >
                                  <Unlock size={12} /> Unlock Record
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                              Lay Progress — {co.cuttingNo}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Buyer: <strong className="text-slate-700 dark:text-slate-300">{co.buyerName}</strong> • PO: <strong className="text-indigo-600 dark:text-indigo-400">{co.buyerPO}</strong> • Order: {co.orderNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              disabled={isLocked}
                              onClick={(e) => { e.stopPropagation(); if (!isLocked) addLay(co.id); }}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                isLocked ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-700"
                              )}
                            >
                              <Plus size={12} /> Add Lay
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); generateBundles(co.id); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors">
                              <QrCode size={12} /> Generate Bundles
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedCutTicket(co); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer">
                              <Printer size={12} /> Cut Ticket & QR Bundle Tags
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
                                    {lay.status === "completed" || isLocked ? (
                                      <span className="text-sm text-slate-600 dark:text-slate-300">{lay.plies}</span>
                                    ) : (
                                      <input type="number" value={lay.plies || ""} onClick={e => e.stopPropagation()} onChange={e => updateLay(co.id, lay.layNo, "plies", parseInt(e.target.value) || 0)} className="w-20 h-8 px-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    {lay.status === "completed" || isLocked ? (
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
                                    {lay.status !== "completed" && lay.qtyCut > 0 && !isLocked && (
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
              );
            })}
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
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Select Production Order *
                </label>
                <select
                  value={formOrder}
                  onChange={e => {
                    const selId = e.target.value;
                    setFormOrder(selId);
                    const o = activeOrders.find(ord => ord.id === selId);
                    if (o) {
                      setFormFabric(o.styleName.includes("Oxford") ? "Oxford Cotton" : o.styleName.includes("Denim") ? "Stretch Denim" : o.styleName.includes("Floral") ? "Georgette Fabric" : "Cotton Fabric");
                      setFormPlannedQty(String(o.totalQuantity || ""));
                    }
                  }}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="">Choose an order...</option>
                  {activeOrders.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} | Buyer: {o.buyerName} (PO: {o.buyerPO}) — {o.styleName} [{o.totalQuantity?.toLocaleString() || 0} pcs]
                    </option>
                  ))}
                </select>
              </div>
              {selectedOrder && (
                <div className="p-3.5 bg-indigo-50/90 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-indigo-950 dark:text-indigo-200">{selectedOrder.buyerName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-mono font-medium text-[11px]">
                        PO: {selectedOrder.buyerPO}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {selectedOrder.styleName} {selectedOrder.styleNumber ? `(${selectedOrder.styleNumber})` : ""}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Order Total Qty: <strong className="text-indigo-600 dark:text-indigo-400">{selectedOrder.totalQuantity?.toLocaleString()} pcs</strong> • Status: {selectedOrder.status}
                    </p>
                  </div>
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

      {/* Cut Ticket & Bundle Tags Modal */}
      {selectedCutTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setSelectedCutTicket(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Scissors size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Cut Job Ticket & Floor Bundle QR Slips
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cutting Ref: <strong className="text-indigo-600 dark:text-indigo-400">{selectedCutTicket.cuttingNo}</strong> • Table: {selectedCutTicket.tableNo}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  <Printer size={14} /> Print Job Ticket & Slips
                </button>
                <button
                  onClick={() => setSelectedCutTicket(null)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Top Specification Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Manufacturing Client:</span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {selectedCutTicket.buyerName || "Generic Buyer"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Buyer PO Number:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300">
                      {selectedCutTicket.buyerPO || "PO-N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Order Number</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCutTicket.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Style / Model</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCutTicket.styleName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Fabric & Colorway</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCutTicket.fabric}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Planned vs Cut</span>
                    <span className="font-bold text-emerald-600">{selectedCutTicket.cutQty.toLocaleString()} / {selectedCutTicket.plannedQty.toLocaleString()} pcs</span>
                  </div>
                </div>
              </div>

              {/* Lay Progress Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-600" /> Lay Records & Cutting Efficiency
                </h4>
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 text-left">Lay #</th>
                        <th className="px-3 py-2 text-left">Plies</th>
                        <th className="px-3 py-2 text-left">Cut Qty</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedCutTicket.lays.length === 0 ? (
                        <tr><td colSpan={4} className="p-3 text-center text-slate-400">No lays logged yet</td></tr>
                      ) : (
                        selectedCutTicket.lays.map(l => (
                          <tr key={l.layNo}>
                            <td className="px-3 py-2 font-semibold">Lay {l.layNo}</td>
                            <td className="px-3 py-2">{l.plies} plies</td>
                            <td className="px-3 py-2 font-bold text-emerald-600">{l.qtyCut.toLocaleString()} pcs</td>
                            <td className="px-3 py-2 uppercase font-semibold text-[10px] text-slate-500">{l.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bundle QR Slips */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <QrCode size={14} className="text-purple-600" /> Floor Bundle QR Slips (25 pcs/bundle)
                  </h4>
                  <span className="text-xs font-medium text-slate-500">
                    Total Generated: <strong>{selectedCutTicket.bundlesGenerated || Math.max(1, Math.floor(selectedCutTicket.cutQty / 25))} bundles</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: Math.min(6, Math.max(2, selectedCutTicket.bundlesGenerated || Math.floor(selectedCutTicket.cutQty / 25))) }).map((_, idx) => (
                    <div key={idx} className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2 relative">
                      <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-700">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">GarmentFlow Floor Tag</span>
                          <p className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {selectedCutTicket.buyerName || "Buyer"} • PO: {selectedCutTicket.buyerPO}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 block">{selectedCutTicket.orderNumber}</span>
                          <span className="text-xs font-extrabold text-purple-600">BDL-{String(idx + 1).padStart(3, "0")}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-400 block text-[9px]">Style</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{selectedCutTicket.styleName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">Fabric / Cut #</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">{selectedCutTicket.cuttingNo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px]">Bundle Qty</span>
                          <span className="font-bold text-emerald-600">25 Pcs</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400">
                        <span>Cutter Sign: _______</span>
                        <span>Operator: _______</span>
                        <span>QC Stamp: [   ]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs text-slate-500">
                Printed tags accompany cut components directly to sewing line loading.
              </span>
              <button
                onClick={() => setSelectedCutTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Edit Access Modal for Factory Cutting Supervisor */}
      {requestModalCo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRequestModalCo(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800 p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <KeyRound size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Request Edit Access</h3>
              </div>
              <button onClick={() => setRequestModalCo(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Cutting Order:</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">{requestModalCo.cuttingNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order & Style:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{requestModalCo.orderNumber} • {requestModalCo.styleName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Recorded:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{requestModalCo.createdAt}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Reason for Modification *
              </label>
              <textarea
                rows={3}
                value={requestReason}
                onChange={e => setRequestReason(e.target.value)}
                placeholder="E.g. Typo in Lay #3 plies count (entered 100 instead of 110). Re-cutting damaged fabric panels."
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-slate-800 dark:text-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This request will be sent to the Admin/Owner for approval before values can be edited.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setRequestModalCo(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!requestReason.trim()}
                onClick={handleRequestUnlock}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Lock size={13} /> Submit Request to Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CuttingView;

