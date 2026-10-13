"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Scissors, Tag, CheckCircle2, Plus, X, Save, ArrowRight,
  Shirt, Layers, Package, TrendingUp, Clock
} from "lucide-react";

interface FinishingEntry {
  id: string;
  order: string;
  style: string;
  stage: string;
  completedQty: number;
  pendingQty: number;
  operator: string;
  remarks: string;
  status: "in-progress" | "completed";
  updatedAt: string;
}

const STORAGE_KEY = "garmentflow_finishing";

const stages = ["Thread Trimming", "Ironing / Pressing", "Tagging & Labeling", "Final QC", "Folding & Poly-bagging"];

const initialData: FinishingEntry[] = [
  { id: "fn1", order: "ORD-2025-0001", style: "Men's Oxford Shirt", stage: "Thread Trimming", completedQty: 4200, pendingQty: 800, operator: "Ramu Lal", remarks: "", status: "in-progress", updatedAt: "10:30 AM" },
  { id: "fn2", order: "ORD-2025-0001", style: "Men's Oxford Shirt", stage: "Ironing / Pressing", completedQty: 3800, pendingQty: 1200, operator: "Bhanu Prakash", remarks: "Using steam press", status: "in-progress", updatedAt: "10:15 AM" },
  { id: "fn3", order: "ORD-2025-0001", style: "Men's Oxford Shirt", stage: "Tagging & Labeling", completedQty: 3500, pendingQty: 1500, operator: "Sita Devi", remarks: "", status: "in-progress", updatedAt: "10:00 AM" },
  { id: "fn4", order: "ORD-2025-0002", style: "Women's Maxi Dress", stage: "Thread Trimming", completedQty: 6000, pendingQty: 0, operator: "Ramu Lal", remarks: "", status: "completed", updatedAt: "09:45 AM" },
  { id: "fn5", order: "ORD-2025-0002", style: "Women's Maxi Dress", stage: "Ironing / Pressing", completedQty: 5500, pendingQty: 500, operator: "Bhanu Prakash", remarks: "Low temp for georgette", status: "in-progress", updatedAt: "10:20 AM" },
  { id: "fn6", order: "ORD-2025-0005", style: "Kids' Graphic Tee", stage: "Folding & Poly-bagging", completedQty: 7200, pendingQty: 800, operator: "Packing Team", remarks: "Individual poly bags", status: "in-progress", updatedAt: "10:40 AM" },
  { id: "fn7", order: "ORD-2025-0001", style: "Men's Oxford Shirt", stage: "Final QC", completedQty: 3200, pendingQty: 1800, operator: "Kavita Sharma", remarks: "AQL 2.5 sampling", status: "in-progress", updatedAt: "09:50 AM" },
  { id: "fn8", order: "ORD-2025-0005", style: "Kids' Graphic Tee", stage: "Tagging & Labeling", completedQty: 8000, pendingQty: 0, operator: "Sita Devi", remarks: "", status: "completed", updatedAt: "09:00 AM" },
];

const operatorsList = ["Ramu Lal", "Bhanu Prakash", "Sita Devi", "Kavita Sharma", "Packing Team", "Hari Om", "Shyam Sunder"];

export function FinishingView({ basePath = "/factory" }: { basePath?: string }) {
  const [entries, setEntries] = useState<FinishingEntry[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");

  // New entry form
  const [formOrder, setFormOrder] = useState("");
  const [formStyle, setFormStyle] = useState("");
  const [formStage, setFormStage] = useState("");
  const [formOperator, setFormOperator] = useState("");
  const [formQty, setFormQty] = useState("");

  // Update form
  const [updateCompleted, setUpdateCompleted] = useState("");
  const [updateRemarks, setUpdateRemarks] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setEntries(JSON.parse(saved)); return; }
    } catch { }
    setEntries(initialData);
  }, []);

  const save = (data: FinishingEntry[]) => {
    setEntries(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
  };

  const createEntry = () => {
    if (!formOrder || !formStage || !formOperator || !formQty) return;
    const newEntry: FinishingEntry = {
      id: `fn-${Date.now()}`, order: formOrder, style: formStyle, stage: formStage,
      completedQty: 0, pendingQty: parseInt(formQty), operator: formOperator,
      remarks: "", status: "in-progress",
      updatedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
    save([newEntry, ...entries]);
    setShowNewModal(false);
    setFormOrder(""); setFormStyle(""); setFormStage(""); setFormOperator(""); setFormQty("");
    setShowSuccess("Finishing entry created!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const openUpdate = (id: string) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    setUpdateCompleted(String(entry.completedQty));
    setUpdateRemarks(entry.remarks);
    setShowUpdateModal(id);
  };

  const saveUpdate = () => {
    if (!showUpdateModal) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    save(entries.map(e => {
      if (e.id !== showUpdateModal) return e;
      const completed = parseInt(updateCompleted) || 0;
      const pending = Math.max(0, (e.completedQty + e.pendingQty) - completed);
      return {
        ...e, completedQty: completed, pendingQty: pending, remarks: updateRemarks,
        status: pending === 0 ? "completed" as const : "in-progress" as const, updatedAt: now,
      };
    }));
    setShowUpdateModal(null);
    setShowSuccess("Progress updated!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const markComplete = (id: string) => {
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    save(entries.map(e => {
      if (e.id !== id) return e;
      return { ...e, completedQty: e.completedQty + e.pendingQty, pendingQty: 0, status: "completed" as const, updatedAt: now };
    }));
    setShowSuccess("Stage marked complete!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  // KPIs
  const totalInFinishing = entries.filter(e => e.status === "in-progress").reduce((s, e) => s + e.pendingQty, 0);
  const completedToday = entries.reduce((s, e) => s + e.completedQty, 0);
  const totalPending = entries.filter(e => e.status === "in-progress").length;
  const completedCount = entries.filter(e => e.status === "completed").length;

  const filtered = selectedStage === "all" ? entries : entries.filter(e => e.stage === selectedStage);

  // Group by stage for pipeline view
  const stageGroups = stages.map(stage => ({
    stage,
    entries: entries.filter(e => e.stage === stage),
    completed: entries.filter(e => e.stage === stage && e.status === "completed").length,
    total: entries.filter(e => e.stage === stage).length,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{showSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Finishing Department</h1>
          <p className="text-sm text-slate-500 mt-1">Thread trimming, ironing, tagging, labeling & final inspection before packing</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> New Finishing Entry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Qty", value: totalInFinishing.toLocaleString(), icon: <Clock size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40" },
          { label: "Total Completed", value: completedToday.toLocaleString(), icon: <CheckCircle2 size={18} className="text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/40" },
          { label: "Active Stages", value: String(totalPending), icon: <Layers size={18} className="text-blue-600" />, bg: "bg-blue-100 dark:bg-blue-900/40" },
          { label: "Completed Stages", value: String(completedCount), icon: <Package size={18} className="text-purple-600" />, bg: "bg-purple-100 dark:bg-purple-900/40" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Stage Pipeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Finishing Pipeline</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stageGroups.map((sg, i) => (
            <React.Fragment key={sg.stage}>
              <button onClick={() => setSelectedStage(selectedStage === sg.stage ? "all" : sg.stage)}
                className={cn("flex-shrink-0 rounded-xl px-4 py-3 border transition-all text-left min-w-[140px]",
                  selectedStage === sg.stage ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-900/20" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50")}>
                <p className="text-xs font-semibold text-slate-700 dark:text-white whitespace-nowrap">{sg.stage}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-lg font-bold text-indigo-600">{sg.total}</span>
                  <span className="text-[10px] text-slate-400">{sg.completed}/{sg.total} done</span>
                </div>
              </button>
              {i < stageGroups.length - 1 && <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stage Filter Info */}
      {selectedStage !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Showing:</span>
          <span className="text-sm font-semibold text-indigo-600">{selectedStage}</span>
          <button onClick={() => setSelectedStage("all")} className="text-xs text-slate-400 hover:text-red-500 underline ml-2">Clear filter</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Style</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Finishing Stage</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Operator</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => {
              const total = f.completedQty + f.pendingQty;
              const pct = total > 0 ? Math.round((f.completedQty / total) * 100) : 0;
              return (
                <tr key={f.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5"><p className="text-sm font-medium text-slate-800 dark:text-white">{f.order}</p><p className="text-xs text-slate-500">{f.style}</p></td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{f.stage}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">{f.completedQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-amber-600">{f.pendingQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">{f.operator}</td>
                  <td className="px-4 py-3.5 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", f.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700")}>{f.status.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {f.status !== "completed" && (
                        <>
                          <button onClick={() => openUpdate(f.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors" title="Log Progress"><Save size={14} /></button>
                          <button onClick={() => markComplete(f.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors" title="Mark Complete"><CheckCircle2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No finishing entries for this stage.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Entry Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Finishing Entry</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Order No. *</label>
                  <input type="text" value={formOrder} onChange={e => setFormOrder(e.target.value)} placeholder="ORD-2025-0001" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Style</label>
                  <input type="text" value={formStyle} onChange={e => setFormStyle(e.target.value)} placeholder="Style name" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Finishing Stage *</label>
                <select value={formStage} onChange={e => setFormStage(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                  <option value="">Select stage...</option>
                  {stages.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Operator *</label>
                  <select value={formOperator} onChange={e => setFormOperator(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                    <option value="">Select operator...</option>
                    {operatorsList.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Total Qty *</label>
                  <input type="number" value={formQty} onChange={e => setFormQty(e.target.value)} placeholder="5000" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={createEntry} disabled={!formOrder || !formStage || !formOperator || !formQty} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Create Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowUpdateModal(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Log Progress</h3>
              <button onClick={() => setShowUpdateModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Completed Qty</label>
                <input type="number" value={updateCompleted} onChange={e => setUpdateCompleted(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remarks</label>
                <input type="text" value={updateRemarks} onChange={e => setUpdateRemarks(e.target.value)} placeholder="Any notes..." className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowUpdateModal(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={saveUpdate} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                <Save size={14} className="inline mr-1.5" /> Save Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FinishingView;
