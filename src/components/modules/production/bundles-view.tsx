"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Search, QrCode, ArrowRight, CheckCircle, CheckCircle2, Clock, Plus, X,
  Filter, Eye, Package, ChevronRight, Printer
} from "lucide-react";
import { getStoredOrders } from "@/lib/workflow-service";
import { orders as fallbackOrders } from "@/lib/demo-data";

interface BundleHistoryEntry {
  operation: string;
  operator: string;
  line: string;
  time: string;
}

interface Bundle {
  id: string;
  order: string;
  buyerName?: string;
  buyerPO?: string;
  style: string;
  size: string;
  color: string;
  qty: number;
  currentOp: string;
  line: string;
  operator: string;
  status: "in-process" | "completed" | "waiting";
  scannedAt: string;
  history: BundleHistoryEntry[];
}

const STORAGE_KEY = "garmentflow_bundles";

const initialBundles: Bundle[] = [
  { id: "BDL-001", order: "ORD-2025-0001", buyerName: "Nordstrom", buyerPO: "NORD-PO-78234", style: "Men's Oxford Shirt", size: "M", color: "White", qty: 25, currentOp: "Collar Attach", line: "Line A", operator: "Sunita Kumari", status: "in-process", scannedAt: "10:42 AM", history: [
    { operation: "Cutting", operator: "Cutting Table 1", line: "—", time: "08:15 AM" },
    { operation: "Side Seam", operator: "Rani Devi", line: "Line A", time: "09:00 AM" },
    { operation: "Collar Attach", operator: "Sunita Kumari", line: "Line A", time: "10:42 AM" },
  ]},
  { id: "BDL-002", order: "ORD-2025-0001", buyerName: "Nordstrom", buyerPO: "NORD-PO-78234", style: "Men's Oxford Shirt", size: "L", color: "White", qty: 25, currentOp: "Side Seam", line: "Line A", operator: "Rani Devi", status: "in-process", scannedAt: "10:38 AM", history: [
    { operation: "Cutting", operator: "Cutting Table 1", line: "—", time: "08:20 AM" },
    { operation: "Side Seam", operator: "Rani Devi", line: "Line A", time: "10:38 AM" },
  ]},
  { id: "BDL-003", order: "ORD-2025-0001", buyerName: "Nordstrom", buyerPO: "NORD-PO-78234", style: "Men's Oxford Shirt", size: "XL", color: "Blue", qty: 20, currentOp: "Button Attach", line: "Line A", operator: "Lata Kumari", status: "in-process", scannedAt: "10:25 AM", history: [
    { operation: "Cutting", operator: "Cutting Table 2", line: "—", time: "08:00 AM" },
    { operation: "Sleeve Attach", operator: "Meena Sharma", line: "Line A", time: "09:15 AM" },
    { operation: "Side Seam", operator: "Rani Devi", line: "Line A", time: "09:50 AM" },
    { operation: "Button Attach", operator: "Lata Kumari", line: "Line A", time: "10:25 AM" },
  ]},
  { id: "BDL-004", order: "ORD-2025-0002", buyerName: "Marks & Spencer", buyerPO: "MS-PO-45678", style: "Women's Maxi Dress", size: "S", color: "Floral Navy", qty: 30, currentOp: "Bottom Hem", line: "Line B", operator: "Geeta Yadav", status: "in-process", scannedAt: "10:50 AM", history: [
    { operation: "Cutting", operator: "Cutting Table 1", line: "—", time: "09:00 AM" },
    { operation: "Bottom Hem", operator: "Geeta Yadav", line: "Line B", time: "10:50 AM" },
  ]},
  { id: "BDL-005", order: "ORD-2025-0002", buyerName: "Marks & Spencer", buyerPO: "MS-PO-45678", style: "Women's Maxi Dress", size: "M", color: "Floral Navy", qty: 30, currentOp: "Completed", line: "Line B", operator: "—", status: "completed", scannedAt: "09:55 AM", history: [
    { operation: "Cutting", operator: "Cutting Table 1", line: "—", time: "08:00 AM" },
    { operation: "Side Seam", operator: "Rekha Meena", line: "Line B", time: "08:45 AM" },
    { operation: "Completed", operator: "QC Pass", line: "Line B", time: "09:55 AM" },
  ]},
  { id: "BDL-006", order: "ORD-2025-0004", buyerName: "Zara UK", buyerPO: "ZARA-PO-33210", style: "Men's Polo T-Shirt", size: "L", color: "Navy", qty: 40, currentOp: "Sleeve Attach", line: "Line C", operator: "Meena Sharma", status: "in-process", scannedAt: "10:30 AM", history: [
    { operation: "Cutting", operator: "Cutting Table 2", line: "—", time: "09:30 AM" },
    { operation: "Sleeve Attach", operator: "Meena Sharma", line: "Line C", time: "10:30 AM" },
  ]},
  { id: "BDL-007", order: "ORD-2025-0004", buyerName: "Zara UK", buyerPO: "ZARA-PO-33210", style: "Men's Polo T-Shirt", size: "M", color: "White", qty: 40, currentOp: "Waiting", line: "Line C", operator: "—", status: "waiting", scannedAt: "—", history: [
    { operation: "Cutting", operator: "Cutting Table 2", line: "—", time: "10:00 AM" },
  ]},
];

const operations = ["Side Seam", "Collar Attach", "Sleeve Attach", "Bottom Hem", "Pocket Attach", "Buttonhole", "Button Attach", "Label Stitch", "Topstitch", "Cuff Attach", "Hemming", "QC Check", "Completed"];
const operators = ["Rani Devi", "Sunita Kumari", "Meena Sharma", "Geeta Yadav", "Parvati Devi", "Kamla Bai", "Lata Kumari", "Anita Devi", "Rekha Meena", "Savita Rani"];

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMoveModal, setShowMoveModal] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Move form state
  const [moveOp, setMoveOp] = useState("");
  const [moveOperator, setMoveOperator] = useState("");
  const [moveLine, setMoveLine] = useState("Line A");

  // Create form state
  const [newOrder, setNewOrder] = useState("ORD-2025-0001");
  const [newStyle, setNewStyle] = useState("Men's Oxford Shirt");
  const [newSize, setNewSize] = useState("M");
  const [newColor, setNewColor] = useState("");
  const [newQty, setNewQty] = useState("25");

  useEffect(() => {
    const orders = getStoredOrders();
    const active = orders.length > 0 ? orders : fallbackOrders;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: Bundle[] = JSON.parse(saved);
        const enriched = parsed.map(b => {
          const match = active.find(o => o.orderNumber === b.order || o.id === b.order);
          return {
            ...b,
            buyerName: b.buyerName || match?.buyerName || "Nordstrom",
            buyerPO: b.buyerPO || match?.buyerPO || "PO-NORD-78234",
          };
        });
        setBundles(enriched);
        return;
      }
    } catch {}
    setBundles(initialBundles);
  }, []);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const save = (data: Bundle[]) => {
    setBundles(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  const moveBundle = () => {
    if (!showMoveModal || !moveOp || !moveOperator) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    save(bundles.map(b => {
      if (b.id !== showMoveModal) return b;
      const isComplete = moveOp === "Completed";
      return {
        ...b,
        currentOp: moveOp,
        operator: isComplete ? "—" : moveOperator,
        line: moveLine,
        status: isComplete ? "completed" as const : "in-process" as const,
        scannedAt: now,
        history: [...b.history, { operation: moveOp, operator: isComplete ? "QC Pass" : moveOperator, line: moveLine, time: now }],
      };
    }));
    setShowMoveModal(null);
    setMoveOp(""); setMoveOperator(""); setMoveLine("Line A");
    setShowSuccess(moveOp === "Completed" ? "Bundle completed!" : "Bundle moved to next operation!");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const completeBundle = (id: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    save(bundles.map(b => {
      if (b.id !== id) return b;
      return {
        ...b, currentOp: "Completed", operator: "—", status: "completed" as const, scannedAt: now,
        history: [...b.history, { operation: "Completed", operator: "QC Pass", line: b.line, time: now }],
      };
    }));
    setShowSuccess("Bundle marked complete!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const createBundle = () => {
    if (!newOrder || !newColor || !newQty) return;
    const newBundle: Bundle = {
      id: `BDL-${String(bundles.length + 1).padStart(3, "0")}`,
      order: newOrder, style: newStyle, size: newSize, color: newColor,
      qty: parseInt(newQty), currentOp: "Waiting", line: "—", operator: "—",
      status: "waiting", scannedAt: "—",
      history: [{ operation: "Created", operator: "System", line: "—", time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) }],
    };
    save([newBundle, ...bundles]);
    setShowCreateModal(false);
    setNewColor("");
    setShowSuccess("Bundle created!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const filtered = bundles.filter(b => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = b.id.toLowerCase().includes(q);
      const matchOrder = b.order.toLowerCase().includes(q);
      const matchStyle = b.style.toLowerCase().includes(q);
      const matchBuyer = b.buyerName?.toLowerCase().includes(q);
      const matchPO = b.buyerPO?.toLowerCase().includes(q);
      const matchOp = b.operator?.toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchStyle && !matchBuyer && !matchPO && !matchOp) return false;
    }
    return true;
  });

  const inProcess = bundles.filter(b => b.status === "in-process").length;
  const completed = bundles.filter(b => b.status === "completed").length;
  const waiting = bundles.filter(b => b.status === "waiting").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{showSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Bundle Movement & Scanning</h1>
          <p className="text-sm text-slate-500 mt-1">QR-based bundle tracking through sewing operations in real time</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> Create Bundle
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-blue-600">{inProcess}</p>
          <p className="text-xs text-slate-500 mt-1">In Process</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completed}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-slate-500">{waiting}</p>
          <p className="text-xs text-slate-500 mt-1">Waiting</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input ref={searchRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Scan QR, search bundle ID, buyer, or PO..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
          <option value="all">All Status</option>
          <option value="in-process">In Process</option>
          <option value="completed">Completed</option>
          <option value="waiting">Waiting</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bundle ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order & Buyer</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size / Color</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Op</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Line / Operator</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Scan</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3.5 flex items-center gap-2 text-sm font-semibold text-indigo-600"><QrCode size={14} />{b.id}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{b.order}</span>
                    {b.buyerName && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                        {b.buyerName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {b.style} {b.buyerPO ? `• PO: ${b.buyerPO}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{b.size} / {b.color}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white">{b.qty}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{b.currentOp}</td>
                <td className="px-4 py-3.5"><p className="text-sm text-slate-600">{b.line}</p><p className="text-xs text-slate-400">{b.operator}</p></td>
                <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{b.scannedAt}</td>
                <td className="px-4 py-3.5">
                  <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", b.status === "completed" ? "bg-emerald-100 text-emerald-700" : b.status === "in-process" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>{b.status.toUpperCase()}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setShowTimeline(b.id)} className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-colors" title="View Timeline"><Eye size={14} /></button>
                    {b.status !== "completed" && (
                      <>
                        <button onClick={() => setShowMoveModal(b.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors" title="Move"><ArrowRight size={14} /></button>
                        <button onClick={() => completeBundle(b.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors" title="Complete"><CheckCircle size={14} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No bundles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Timeline Modal */}
      {showTimeline && (() => {
        const bundle = bundles.find(b => b.id === showTimeline);
        if (!bundle) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowTimeline(null)}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bundle.id} — Timeline</h3>
                  <p className="text-xs text-slate-500">{bundle.order} • {bundle.style} • {bundle.size}/{bundle.color}</p>
                </div>
                <button onClick={() => setShowTimeline(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-0">
                  {bundle.history.map((h, i) => (
                    <div key={i} className="flex gap-3 relative">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-3 h-3 rounded-full border-2 z-10", i === bundle.history.length - 1 ? "bg-indigo-500 border-indigo-500" : "bg-white dark:bg-slate-900 border-emerald-500")} />
                        {i < bundle.history.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 min-h-[24px]" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{h.operation}</p>
                        <p className="text-xs text-slate-500">{h.operator} • {h.line} • {h.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Move Bundle Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowMoveModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Move Bundle {showMoveModal}</h3>
              <button onClick={() => setShowMoveModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Next Operation *</label>
                <select value={moveOp} onChange={e => setMoveOp(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">Select operation...</option>
                  {operations.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Operator *</label>
                <select value={moveOperator} onChange={e => setMoveOperator(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">Select operator...</option>
                  {operators.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Production Line</label>
                <select value={moveLine} onChange={e => setMoveLine(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="Line A">Line A</option>
                  <option value="Line B">Line B</option>
                  <option value="Line C">Line C</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowMoveModal(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={moveBundle} disabled={!moveOp || !moveOperator} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <ArrowRight size={14} className="inline mr-1.5" /> Move Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Bundle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Bundle</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Order No. *</label>
                  <input type="text" value={newOrder} onChange={e => setNewOrder(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Style *</label>
                  <input type="text" value={newStyle} onChange={e => setNewStyle(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Size</label>
                  <input type="text" value={newSize} onChange={e => setNewSize(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color *</label>
                  <input type="text" value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="White" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Qty *</label>
                  <input type="number" value={newQty} onChange={e => setNewQty(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={createBundle} disabled={!newOrder || !newColor || !newQty} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Package size={14} className="inline mr-1.5" /> Create Bundle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
