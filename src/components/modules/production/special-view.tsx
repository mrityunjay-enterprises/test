"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Paintbrush, Plus, X, CheckCircle2, Edit3, Save, TrendingUp,
  Clock, Package, IndianRupee
} from "lucide-react";

interface SpecialProcess {
  id: string;
  process: string;
  vendor: string;
  order: string;
  style: string;
  issuedQty: number;
  completedQty: number;
  pendingQty: number;
  rate: number;
  expectedDate: string;
  notes: string;
  status: "pending" | "in-progress" | "completed";
}

const STORAGE_KEY = "garmentflow_special_processes";

const initialProcesses: SpecialProcess[] = [
  { id: "sp1", process: "Embroidery", vendor: "Ace Embroidery Works", order: "ORD-2025-0002", style: "Women's Maxi Dress", issuedQty: 3200, completedQty: 2800, pendingQty: 400, rate: 18, expectedDate: "2025-07-28", notes: "3-color thread work on front yoke", status: "in-progress" },
  { id: "sp2", process: "Screen Printing", vendor: "PrintCraft Industries", order: "ORD-2025-0005", style: "Kids' Graphic Tee", issuedQty: 8000, completedQty: 8000, pendingQty: 0, rate: 12, expectedDate: "2025-06-15", notes: "All-over dinosaur print - 4 colors", status: "completed" },
  { id: "sp3", process: "Washing (Enzyme)", vendor: "Clean Wash Pvt Ltd", order: "ORD-2025-0003", style: "Men's Slim Denim", issuedQty: 5000, completedQty: 3200, pendingQty: 1800, rate: 25, expectedDate: "2025-07-30", notes: "Enzyme wash + softener", status: "in-progress" },
  { id: "sp4", process: "Heat Transfer Print", vendor: "DigiPrint Solutions", order: "ORD-2025-0007", style: "Women's Active Legging", issuedQty: 4500, completedQty: 4500, pendingQty: 0, rate: 15, expectedDate: "2025-07-10", notes: "", status: "completed" },
  { id: "sp5", process: "Laser Distressing", vendor: "JeanTech Laundry", order: "ORD-2025-0003", style: "Men's Slim Denim", issuedQty: 5000, completedQty: 0, pendingQty: 5000, rate: 35, expectedDate: "2025-08-05", notes: "After enzyme wash", status: "pending" },
];

const processTypes = ["Embroidery", "Screen Printing", "Digital Printing", "Heat Transfer Print", "Washing (Enzyme)", "Washing (Stone)", "Washing (Bleach)", "Laser Distressing", "Laser Engraving", "Pleating", "Dyeing", "Sublimation"];
const vendors = ["Ace Embroidery Works", "PrintCraft Industries", "Clean Wash Pvt Ltd", "DigiPrint Solutions", "JeanTech Laundry", "Royal Textiles", "Aditya Print Works"];

export default function SpecialPage() {
  const [processes, setProcesses] = useState<SpecialProcess[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState("");

  // New form state
  const [formProcess, setFormProcess] = useState("");
  const [formVendor, setFormVendor] = useState("");
  const [formOrder, setFormOrder] = useState("");
  const [formStyle, setFormStyle] = useState("");
  const [formIssuedQty, setFormIssuedQty] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formExpectedDate, setFormExpectedDate] = useState("");
  const [formNotes, setFormNotes] = useState("");

  // Update form state
  const [updateCompletedQty, setUpdateCompletedQty] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { setProcesses(JSON.parse(saved)); return; }
    } catch {}
    setProcesses(initialProcesses);
  }, []);

  const save = (data: SpecialProcess[]) => {
    setProcesses(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  };

  const createProcess = () => {
    if (!formProcess || !formVendor || !formOrder || !formIssuedQty || !formRate) return;
    const qty = parseInt(formIssuedQty);
    const newSP: SpecialProcess = {
      id: `sp-${Date.now()}`, process: formProcess, vendor: formVendor,
      order: formOrder, style: formStyle, issuedQty: qty,
      completedQty: 0, pendingQty: qty, rate: parseFloat(formRate),
      expectedDate: formExpectedDate, notes: formNotes, status: "pending",
    };
    save([newSP, ...processes]);
    setShowNewModal(false);
    setFormProcess(""); setFormVendor(""); setFormOrder(""); setFormStyle("");
    setFormIssuedQty(""); setFormRate(""); setFormExpectedDate(""); setFormNotes("");
    setShowSuccess("Process order created!");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const openUpdate = (id: string) => {
    const sp = processes.find(p => p.id === id);
    if (!sp) return;
    setUpdateCompletedQty(String(sp.completedQty));
    setUpdateNotes(sp.notes);
    setShowUpdateModal(id);
  };

  const saveUpdate = () => {
    if (!showUpdateModal) return;
    save(processes.map(sp => {
      if (sp.id !== showUpdateModal) return sp;
      const completed = parseInt(updateCompletedQty) || 0;
      const pending = Math.max(0, sp.issuedQty - completed);
      const isComplete = pending === 0;
      return { ...sp, completedQty: completed, pendingQty: pending, notes: updateNotes, status: isComplete ? "completed" as const : "in-progress" as const };
    }));
    setShowUpdateModal(null);
    setShowSuccess("Progress updated!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  const markComplete = (id: string) => {
    save(processes.map(sp => {
      if (sp.id !== id) return sp;
      return { ...sp, completedQty: sp.issuedQty, pendingQty: 0, status: "completed" as const };
    }));
    setShowSuccess("Process marked complete!");
    setTimeout(() => setShowSuccess(""), 2500);
  };

  // KPIs
  const totalIssued = processes.reduce((s, p) => s + p.issuedQty, 0);
  const totalCompleted = processes.reduce((s, p) => s + p.completedQty, 0);
  const inProgress = processes.filter(p => p.status === "in-progress").length;
  const totalValue = processes.reduce((s, p) => s + (p.issuedQty * p.rate), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{showSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Special Processes</h1>
          <p className="text-sm text-slate-500 mt-1">Embroidery, screen printing, washing, heat transfer & laser processing status</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Plus size={16} /> New Process Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Issued", value: totalIssued.toLocaleString(), icon: <Package size={18} className="text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/40" },
          { label: "Total Completed", value: totalCompleted.toLocaleString(), icon: <CheckCircle2 size={18} className="text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/40" },
          { label: "In Progress", value: String(inProgress), icon: <Clock size={18} className="text-blue-600" />, bg: "bg-blue-100 dark:bg-blue-900/40" },
          { label: "Total Value", value: `₹${(totalValue / 100000).toFixed(1)}L`, icon: <IndianRupee size={18} className="text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/40" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", kpi.bg)}>{kpi.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Process</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order / Style</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Issued</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {processes.map(sp => {
              const pct = sp.issuedQty > 0 ? Math.round((sp.completedQty / sp.issuedQty) * 100) : 0;
              return (
                <tr key={sp.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-semibold text-indigo-600">{sp.process}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-700 dark:text-slate-300">{sp.vendor}</td>
                  <td className="px-4 py-3.5"><p className="text-sm font-medium text-slate-800 dark:text-white">{sp.order}</p><p className="text-xs text-slate-500">{sp.style}</p></td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-700">{sp.issuedQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-emerald-600">{sp.completedQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-amber-600">{sp.pendingQty.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-600">₹{sp.rate}/pc</td>
                  <td className="px-4 py-3.5 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", sp.status === "completed" ? "bg-emerald-100 text-emerald-700" : sp.status === "in-progress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>{sp.status.toUpperCase()}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      {sp.status !== "completed" && (
                        <>
                          <button onClick={() => openUpdate(sp.id)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors" title="Update Progress"><Edit3 size={14} /></button>
                          <button onClick={() => markComplete(sp.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors" title="Mark Complete"><CheckCircle2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Process Order Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Process Order</h3>
              <button onClick={() => setShowNewModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Process Type *</label>
                  <select value={formProcess} onChange={e => setFormProcess(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                    <option value="">Select process...</option>
                    {processTypes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vendor *</label>
                  <select value={formVendor} onChange={e => setFormVendor(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
                    <option value="">Select vendor...</option>
                    {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Issued Qty *</label>
                  <input type="number" value={formIssuedQty} onChange={e => setFormIssuedQty(e.target.value)} placeholder="5000" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rate (₹/pc) *</label>
                  <input type="number" value={formRate} onChange={e => setFormRate(e.target.value)} placeholder="25" className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Date</label>
                  <input type="date" value={formExpectedDate} onChange={e => setFormExpectedDate(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                <input type="text" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Special instructions..." className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
              <button onClick={createProcess} disabled={!formProcess || !formVendor || !formOrder || !formIssuedQty || !formRate} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                Create Process Order
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
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Update Progress</h3>
              <button onClick={() => setShowUpdateModal(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} className="text-slate-500" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Completed Qty</label>
                <input type="number" value={updateCompletedQty} onChange={e => setUpdateCompletedQty(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                <input type="text" value={updateNotes} onChange={e => setUpdateNotes(e.target.value)} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
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
