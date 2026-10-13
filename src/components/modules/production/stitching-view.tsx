"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { productionLines, orders as initialOrders } from "@/lib/demo-data";
import { Order } from "@/lib/types";
import { getStoredOrders, updateOrderStatus, WORKFLOW_EVENT } from "@/lib/workflow-service";
import {
  Shirt, Users, Gauge, TrendingUp, AlertTriangle, Plus, X, CheckCircle2,
  Save, Edit3, Trash2, Factory, Zap, Clock, ArrowRight, Settings2
} from "lucide-react";

interface Operator {
  id: string;
  name: string;
  operation: string;
  sam: number;
  targetPerHr: number;
  actualPerHr: number;
  efficiency: number;
  status: "active" | "break" | "idle";
}

interface LineAssignment {
  lineId: string;
  lineName: string;
  orderId: string;
  orderNumber: string;
  styleName: string;
  capacity: number;
  machineCount: number;
  operators: Operator[];
  todayOutput: number;
  todayTarget: number;
  wipBundles: number;
  status: "running" | "changeover" | "idle";
}

const STORAGE_KEY = "garmentflow_stitching";

const defaultOperators: Record<string, Operator[]> = {
  "l1": [
    { id: "op1", name: "Rani Devi", operation: "Side Seam", sam: 0.75, targetPerHr: 80, actualPerHr: 74, efficiency: 92.5, status: "active" },
    { id: "op2", name: "Sunita Kumari", operation: "Collar Attach", sam: 0.92, targetPerHr: 65, actualPerHr: 62, efficiency: 95.4, status: "active" },
    { id: "op3", name: "Meena Sharma", operation: "Sleeve Attach", sam: 0.86, targetPerHr: 70, actualPerHr: 58, efficiency: 82.9, status: "active" },
    { id: "op4", name: "Geeta Yadav", operation: "Bottom Hem", sam: 0.67, targetPerHr: 90, actualPerHr: 88, efficiency: 97.8, status: "active" },
    { id: "op5", name: "Parvati Devi", operation: "Pocket Attach", sam: 0.80, targetPerHr: 75, actualPerHr: 71, efficiency: 94.7, status: "active" },
    { id: "op6", name: "Kamla Bai", operation: "Buttonhole", sam: 0.60, targetPerHr: 100, actualPerHr: 96, efficiency: 96.0, status: "active" },
    { id: "op7", name: "Lata Kumari", operation: "Button Attach", sam: 0.60, targetPerHr: 100, actualPerHr: 92, efficiency: 92.0, status: "active" },
    { id: "op8", name: "Anita Devi", operation: "Label Stitch", sam: 0.50, targetPerHr: 120, actualPerHr: 118, efficiency: 98.3, status: "active" },
  ],
  "l2": [
    { id: "op9", name: "Rekha Meena", operation: "Topstitch Front", sam: 1.00, targetPerHr: 60, actualPerHr: 54, efficiency: 90.0, status: "active" },
    { id: "op10", name: "Savita Rani", operation: "Cuff Attach", sam: 0.86, targetPerHr: 70, actualPerHr: 65, efficiency: 92.9, status: "active" },
    { id: "op11", name: "Pushpa Devi", operation: "Collar Stitch", sam: 0.92, targetPerHr: 65, actualPerHr: 60, efficiency: 92.3, status: "active" },
    { id: "op12", name: "Kiran Kumari", operation: "Side Seam", sam: 0.75, targetPerHr: 80, actualPerHr: 72, efficiency: 90.0, status: "active" },
    { id: "op13", name: "Nirmala Devi", operation: "Hemming", sam: 0.67, targetPerHr: 90, actualPerHr: 84, efficiency: 93.3, status: "active" },
    { id: "op14", name: "Sushma Rani", operation: "Pocket Set", sam: 0.80, targetPerHr: 75, actualPerHr: 68, efficiency: 90.7, status: "active" },
  ],
  "l3": [
    { id: "op15", name: "Mamta Devi", operation: "Neckline Stitch", sam: 1.10, targetPerHr: 55, actualPerHr: 52, efficiency: 94.5, status: "active" },
    { id: "op16", name: "Pooja Kumari", operation: "Zip Insert", sam: 0.95, targetPerHr: 63, actualPerHr: 60, efficiency: 95.2, status: "active" },
    { id: "op17", name: "Renu Sharma", operation: "Waistband", sam: 0.80, targetPerHr: 75, actualPerHr: 73, efficiency: 97.3, status: "active" },
    { id: "op18", name: "Usha Devi", operation: "Side Seam", sam: 0.75, targetPerHr: 80, actualPerHr: 78, efficiency: 97.5, status: "active" },
    { id: "op19", name: "Saroj Rani", operation: "Topstitch", sam: 1.00, targetPerHr: 60, actualPerHr: 56, efficiency: 93.3, status: "active" },
  ],
};

const initialAssignments: LineAssignment[] = [
  { lineId: "l1", lineName: "Line A", orderId: "o1", orderNumber: "ORD-2025-0001", styleName: "Classic Oxford Button-Down Shirt", capacity: 600, machineCount: 35, operators: defaultOperators["l1"], todayOutput: 420, todayTarget: 520, wipBundles: 28, status: "running" },
  { lineId: "l2", lineName: "Line B", orderId: "o1", orderNumber: "ORD-2025-0001", styleName: "Classic Oxford Button-Down Shirt", capacity: 550, machineCount: 32, operators: defaultOperators["l2"], todayOutput: 340, todayTarget: 480, wipBundles: 22, status: "running" },
  { lineId: "l3", lineName: "Line C", orderId: "o2", orderNumber: "ORD-2025-0002", styleName: "Floral Print Maxi Dress", capacity: 500, machineCount: 30, operators: defaultOperators["l3"], todayOutput: 380, todayTarget: 440, wipBundles: 15, status: "running" },
];

export function StitchingView({ basePath = "/factory" }: { basePath?: string }) {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<LineAssignment[]>([]);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [showLogProduction, setShowLogProduction] = useState<string | null>(null);
  const [showAssignOrderModal, setShowAssignOrderModal] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState("");

  // ─── Form state ───
  const [opName, setOpName] = useState("");
  const [opOperation, setOpOperation] = useState("");
  const [opSam, setOpSam] = useState("");
  const [opTarget, setOpTarget] = useState("");

  // ─── Log production state ───
  const [logOperator, setLogOperator] = useState("");
  const [logActual, setLogActual] = useState("");

  const loadData = () => {
    setOrdersList(getStoredOrders());
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setAssignments(JSON.parse(saved)); return; }
    } catch { }
    setAssignments(initialAssignments);
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

  const save = (data: LineAssignment[]) => {
    setAssignments(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
  };

  const activeLine = assignments.find(a => a.lineId === selectedLine);

  const addOperator = () => {
    if (!selectedLine || !opName || !opOperation || !opTarget) return;
    save(assignments.map(a => {
      if (a.lineId !== selectedLine) return a;
      const newOp: Operator = {
        id: `op-${Date.now()}`, name: opName, operation: opOperation,
        sam: parseFloat(opSam) || 0.75, targetPerHr: parseInt(opTarget),
        actualPerHr: 0, efficiency: 0, status: "active"
      };
      return { ...a, operators: [...a.operators, newOp] };
    }));
    setShowAddOperator(false);
    setOpName(""); setOpOperation(""); setOpSam(""); setOpTarget("");
    setShowSuccess("Operator added!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const removeOperator = (lineId: string, opId: string) => {
    save(assignments.map(a => {
      if (a.lineId !== lineId) return a;
      return { ...a, operators: a.operators.filter(op => op.id !== opId) };
    }));
  };

  const logProduction = () => {
    if (!showLogProduction || !logOperator || !logActual) return;
    const actual = parseInt(logActual) || 0;

    save(assignments.map(a => {
      if (a.lineId !== showLogProduction) return a;
      const updatedOps = a.operators.map(op => {
        if (op.id !== logOperator) return op;
        return { ...op, actualPerHr: actual, efficiency: parseFloat(((actual / op.targetPerHr) * 100).toFixed(1)) };
      });
      const newOutput = updatedOps.reduce((s, op) => s + op.actualPerHr, 0);
      return { ...a, operators: updatedOps, todayOutput: newOutput };
    }));

    // Synchronize parent order stitching progress
    const targetLine = assignments.find(a => a.lineId === showLogProduction);
    if (targetLine && targetLine.orderId) {
      const orders = getStoredOrders();
      const parentOrder = orders.find(o => o.id === targetLine.orderId || o.orderNumber === targetLine.orderNumber);
      if (parentOrder) {
        updateOrderStatus(parentOrder.id, "in-stitching", {
          stitchingQty: Math.min(parentOrder.totalQuantity, (parentOrder.stitchingQty || 0) + actual)
        });
      }
    }

    setShowLogProduction(null);
    setLogOperator(""); setLogActual("");
    setShowSuccess(`Production logged: +${actual} pcs synced to Order progress!`);
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const handleAssignOrderToLine = (lineId: string, orderId: string) => {
    const active = ordersList.length > 0 ? ordersList : initialOrders;
    const ord = active.find(o => o.id === orderId);
    if (!ord) return;

    save(assignments.map(a => {
      if (a.lineId !== lineId) return a;
      return {
        ...a,
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        styleName: ord.styleName,
        todayTarget: Math.round(ord.totalQuantity / 12) || a.todayTarget
      };
    }));

    updateOrderStatus(ord.id, "in-stitching");
    setShowAssignOrderModal(null);
    setShowSuccess(`Line assigned to ${ord.orderNumber} (${ord.styleName})!`);
    setTimeout(() => setShowSuccess(""), 3000);
  };

  // KPIs
  const totalOutput = assignments.reduce((s, a) => s + a.todayOutput, 0);
  const totalTarget = assignments.reduce((s, a) => s + a.todayTarget, 0);
  const overallEff = totalTarget > 0 ? Math.round((totalOutput / totalTarget) * 100) : 0;
  const totalWIP = assignments.reduce((s, a) => s + a.wipBundles, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{showSuccess}</span>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Stitching Floor Management</h1>
        <p className="text-sm text-slate-500 mt-1">Operator-wise efficiency, operation balancing & real-time sewing line output</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Output", value: totalOutput.toLocaleString(), icon: <Factory size={18} className="text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/40" },
          { label: "Today's Target", value: totalTarget.toLocaleString(), icon: <Gauge size={18} className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Overall Efficiency", value: `${overallEff}%`, icon: <Zap size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40" },
          { label: "WIP Bundles", value: totalWIP.toLocaleString(), icon: <Clock size={18} className="text-purple-600" />, bg: "bg-purple-100 dark:bg-purple-900/40" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Line Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assignments.map(line => {
          const eff = line.todayTarget > 0 ? Math.round((line.todayOutput / line.todayTarget) * 100) : 0;
          const isSelected = selectedLine === line.lineId;
          return (
            <div key={line.lineId} onClick={() => setSelectedLine(isSelected ? null : line.lineId)}
              className={cn("bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all cursor-pointer",
                isSelected ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg" : "border-slate-200/60 dark:border-slate-800 hover:shadow-md")}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{line.lineName}</h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowAssignOrderModal(line.lineId); }}
                    title="Change Order assigned to this line"
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Settings2 size={13} />
                  </button>
                </div>
                <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full",
                  line.status === "running" ? "bg-emerald-100 text-emerald-700" :
                    line.status === "changeover" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                )}>{line.status.toUpperCase()}</span>
              </div>
              <p className="text-xs text-indigo-600 font-semibold mb-2">{line.orderNumber} — {line.styleName}</p>
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div><span className="text-slate-400 block">Output</span><span className="font-bold text-emerald-600">{line.todayOutput}</span></div>
                <div><span className="text-slate-400 block">Target</span><span className="font-bold text-slate-800 dark:text-white">{line.todayTarget}</span></div>
                <div><span className="text-slate-400 block">WIP</span><span className="font-bold text-purple-600">{line.wipBundles}</span></div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", eff >= 85 ? "bg-emerald-500" : eff >= 70 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${eff}%` }} />
                </div>
                <span className={cn("text-xs font-bold", eff >= 85 ? "text-emerald-600" : eff >= 70 ? "text-amber-600" : "text-red-600")}>{eff}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users size={12} /> {line.operators.length} operators • {line.machineCount} machines
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Line Detail — Operator Table */}
      {activeLine && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeLine.lineName} — Operator Efficiency (Today)</h3>
              <p className="text-xs text-slate-500 mt-0.5">{activeLine.orderNumber} • {activeLine.styleName}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLogProduction(activeLine.lineId)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors">
                <Save size={12} /> Log Production
              </button>
              <button onClick={() => setShowAddOperator(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors">
                <Plus size={12} /> Add Operator
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Operator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Operation</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SAM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Target/hr</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual/hr</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Efficiency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Performance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16"></th>
              </tr>
            </thead>
            <tbody>
              {activeLine.operators.map(op => (
                <tr key={op.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{op.name}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{op.operation}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{op.sam} min</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{op.targetPerHr}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{op.actualPerHr}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-sm font-bold", op.efficiency >= 95 ? "text-emerald-600" : op.efficiency >= 85 ? "text-amber-600" : "text-red-600")}>{op.efficiency}%</span>
                  </td>
                  <td className="px-4 py-3.5 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", op.efficiency >= 95 ? "bg-emerald-500" : op.efficiency >= 85 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${Math.min(100, op.efficiency)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => removeOperator(activeLine.lineId, op.id)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!activeLine && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-8 text-center">
          <Shirt size={36} className="mx-auto text-indigo-400 mb-3" />
          <h4 className="font-semibold text-slate-700 dark:text-white">Select a Production Line</h4>
          <p className="text-sm text-slate-500 mt-1">Click on any line card above to view operator details and log production</p>
        </div>
      )}

      {/* Add Operator Modal */}
      {showAddOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddOperator(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Operator to {activeLine?.lineName}</h3>
              <button onClick={() => setShowAddOperator(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Operator Name *</label>
                <input type="text" value={opName} onChange={e => setOpName(e.target.value)} placeholder="e.g. Rekha Sharma" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Operation *</label>
                <input type="text" value={opOperation} onChange={e => setOpOperation(e.target.value)} placeholder="e.g. Collar Attach" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">SAM (min)</label>
                  <input type="number" step="0.01" value={opSam} onChange={e => setOpSam(e.target.value)} placeholder="0.75" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Target/Hr *</label>
                  <input type="number" value={opTarget} onChange={e => setOpTarget(e.target.value)} placeholder="80" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowAddOperator(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={addOperator} disabled={!opName || !opOperation || !opTarget} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Add Operator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Production Modal */}
      {showLogProduction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowLogProduction(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Production</h3>
              <button onClick={() => setShowLogProduction(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Select Operator *</label>
                <select value={logOperator} onChange={e => setLogOperator(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">Choose operator...</option>
                  {assignments.find(a => a.lineId === showLogProduction)?.operators.map(op => (
                    <option key={op.id} value={op.id}>{op.name} — {op.operation}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Actual Pieces / Hr *</label>
                <input type="number" value={logActual} onChange={e => setLogActual(e.target.value)} placeholder="e.g. 72" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowLogProduction(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={logProduction} disabled={!logOperator || !logActual} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={14} className="inline mr-1.5" /> Save Production
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Order Modal */}
      {showAssignOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAssignOrderModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign Order to Line</h3>
              <button onClick={() => setShowAssignOrderModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-2">Select an order that is ready for stitching or currently in production:</p>
              {(ordersList.length > 0 ? ordersList : initialOrders)
                .filter(o => !["completed", "cancelled"].includes(o.status))
                .map(o => (
                  <div
                    key={o.id}
                    onClick={() => handleAssignOrderToLine(showAssignOrderModal, o.id)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{o.orderNumber}</span>
                      <p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{o.styleName}</p>
                      <p className="text-[11px] text-slate-400">{o.buyerName} • Qty: {o.totalQuantity.toLocaleString()}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {o.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StitchingView;
