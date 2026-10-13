"use client";

import React, { useState, useEffect } from "react";
import { cn, formatNumber } from "@/lib/utils";
import { orders } from "@/lib/demo-data";
import {
  GanttChart, Calendar, Clock, Plus, Filter, Factory, CheckCircle2,
  AlertTriangle, Search, X, Save, Eye, Layers, TrendingUp, Edit3, Trash2
} from "lucide-react";

export interface ProductionPlanItem {
  id: string;
  planNumber: string;
  orderId: string;
  orderNumber: string;
  buyerName: string;
  styleName: string;
  lineName: string;
  factoryName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  plannedQty: number;
  completedQty: number;
  dailyTarget: number;
  targetEfficiency: number;
  status: "scheduled" | "in-progress" | "completed" | "delayed";
  createdAt: string;
}

const initialPlans: ProductionPlanItem[] = [
  {
    id: "pp-1",
    planNumber: "PPC-2026-001",
    orderId: "ord-1",
    orderNumber: "PO-252000868",
    buyerName: "Nordstrom Inc.",
    styleName: "Classic Oxford Button-Down Shirt",
    lineName: "Line 1 - Formal Shirts",
    factoryName: "Mrityunjay Enterprises",
    plannedStartDate: "2026-07-20",
    plannedEndDate: "2026-08-05",
    plannedQty: 5000,
    completedQty: 2850,
    dailyTarget: 400,
    targetEfficiency: 85,
    status: "in-progress",
    createdAt: "2026-07-15",
  },
  {
    id: "pp-2",
    planNumber: "PPC-2026-002",
    orderId: "ord-2",
    orderNumber: "PO-99120485",
    buyerName: "Marks & Spencer",
    styleName: "Floral Print Maxi Dress",
    lineName: "Line 2 - Ladies Dresses",
    factoryName: "Mrityunjay Enterprises",
    plannedStartDate: "2026-07-25",
    plannedEndDate: "2026-08-12",
    plannedQty: 3200,
    completedQty: 1100,
    dailyTarget: 300,
    targetEfficiency: 80,
    status: "in-progress",
    createdAt: "2026-07-18",
  },
  {
    id: "pp-3",
    planNumber: "PPC-2026-003",
    orderId: "ord-3",
    orderNumber: "PO-44810293",
    buyerName: "Reliance Trends",
    styleName: "Slim Fit Stretch Denim Jeans",
    lineName: "Line 3 - Bottom Wear",
    factoryName: "Mrityunjay Enterprises",
    plannedStartDate: "2026-08-01",
    plannedEndDate: "2026-08-20",
    plannedQty: 8000,
    completedQty: 0,
    dailyTarget: 450,
    targetEfficiency: 88,
    status: "scheduled",
    createdAt: "2026-07-22",
  },
];

const productionLines = [
  "Line 1 - Formal Shirts",
  "Line 2 - Ladies Dresses",
  "Line 3 - Bottom Wear / Denim",
  "Line 4 - T-Shirts & Polos",
  "Line 5 - Outerwear & Jackets",
  "Line 6 - Finishing & Assembly",
];

export function PlanningView({ basePath }: { basePath?: string }) {
  const [plans, setPlans] = useState<ProductionPlanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Modal Form State
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [planNumber, setPlanNumber] = useState(`PPC-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [orderNumber, setOrderNumber] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [styleName, setStyleName] = useState("");
  const [lineName, setLineName] = useState(productionLines[0]);
  const [factoryName, setFactoryName] = useState("Mrityunjay Enterprises");
  const [plannedStartDate, setPlannedStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [plannedQty, setPlannedQty] = useState("");
  const [dailyTarget, setDailyTarget] = useState("350");
  const [targetEfficiency, setTargetEfficiency] = useState("85");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_production_plans");
      if (saved) {
        setPlans(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    setPlans(initialPlans);
  }, []);

  const savePlans = (updated: ProductionPlanItem[]) => {
    setPlans(updated);
    try {
      localStorage.setItem("garmentflow_production_plans", JSON.stringify(updated));
    } catch {
      // fallback
    }
  };

  // Order Auto-Fill
  const handleSelectOrder = (ordId: string) => {
    setSelectedOrderId(ordId);
    if (!ordId) return;
    const ord = orders.find(o => o.id === ordId);
    if (!ord) return;

    setOrderNumber(ord.orderNumber || ord.buyerPO);
    setBuyerName(ord.buyerName);
    setStyleName(ord.styleName);
    setPlannedQty(String(ord.totalQuantity || 3000));
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber || !styleName || !plannedQty) {
      alert("Please fill in Order Number, Style Name, and Planned Quantity.");
      return;
    }

    const newPlan: ProductionPlanItem = {
      id: `pp-${Date.now()}`,
      planNumber,
      orderId: selectedOrderId || `ord-${Date.now()}`,
      orderNumber,
      buyerName: buyerName || "Client Account",
      styleName,
      lineName,
      factoryName,
      plannedStartDate,
      plannedEndDate: plannedEndDate || plannedStartDate,
      plannedQty: parseInt(plannedQty) || 1000,
      completedQty: 0,
      dailyTarget: parseInt(dailyTarget) || 300,
      targetEfficiency: parseInt(targetEfficiency) || 85,
      status: "scheduled",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newPlan, ...plans];
    savePlans(updated);
    setShowModal(false);
    setToastMsg(`Production Plan ${newPlan.planNumber} created & scheduled!`);
    setTimeout(() => setToastMsg(""), 3500);

    // Reset Form
    setPlanNumber(`PPC-2026-${Math.floor(100 + Math.random() * 900)}`);
    setSelectedOrderId("");
    setOrderNumber("");
    setBuyerName("");
    setStyleName("");
    setPlannedQty("");
  };

  const handleUpdateStatus = (id: string, newStatus: "scheduled" | "in-progress" | "completed" | "delayed") => {
    const updated = plans.map(p => p.id === id ? { ...p, status: newStatus } : p);
    savePlans(updated);
    setToastMsg(`Plan status updated to ${newStatus.toUpperCase()}`);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const filtered = plans.filter(p => {
    const matchesQuery = p.planNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.styleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lineName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" ? true : p.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalPlannedPcs = plans.reduce((s, p) => s + p.plannedQty, 0);
  const totalCompletedPcs = plans.reduce((s, p) => s + p.completedQty, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Production Planning & Control (PPC)</h1>
          <p className="text-sm text-slate-500 mt-1">Line allocation, capacity planning, daily targets & schedule forecasting</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus size={16} /> New Production Plan
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active PPC Plans</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{plans.length} Schedules</p>
          <p className="text-xs text-indigo-600 font-medium mt-1">{plans.filter(p => p.status === "in-progress").length} currently running</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Planned Target Qty</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatNumber(totalPlannedPcs)} Pcs</p>
          <p className="text-xs text-slate-400 mt-1">Across all lines</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Output</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatNumber(totalCompletedPcs)} Pcs</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {totalPlannedPcs > 0 ? ((totalCompletedPcs / totalPlannedPcs) * 100).toFixed(1) : 0}% target achieved
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Line Capacity Active</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{productionLines.length} Sewing Lines</p>
          <p className="text-xs text-slate-400 mt-1">Target efficiency: ~85%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plan #, order, buyer, style..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["all", "scheduled", "in-progress", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all whitespace-nowrap",
                statusFilter === st
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Table & Gantt View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GanttChart size={18} className="text-indigo-600" /> Master Line Allocation Schedule
          </h3>
          <span className="text-xs text-slate-500 font-medium">{filtered.length} plans listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full data-table text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3 text-left">Plan #</th>
                <th className="px-4 py-3 text-left">Order & Buyer</th>
                <th className="px-4 py-3 text-left">Garment Style</th>
                <th className="px-4 py-3 text-left">Allocated Line</th>
                <th className="px-4 py-3 text-left">Timeline Dates</th>
                <th className="px-4 py-3 text-left">Target / Output</th>
                <th className="px-4 py-3 text-left">Progress</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((plan) => {
                const pct = plan.plannedQty > 0 ? Math.min(100, Math.round((plan.completedQty / plan.plannedQty) * 100)) : 0;
                return (
                  <tr key={plan.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-4 font-bold text-indigo-600 font-mono">{plan.planNumber}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-800 dark:text-white">{plan.orderNumber}</p>
                      <p className="text-[11px] text-slate-500">{plan.buyerName}</p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800 dark:text-white">{plan.styleName}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {plan.lineName}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{plan.plannedStartDate} → {plan.plannedEndDate || "TBD"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-800 dark:text-white">{plan.completedQty.toLocaleString()} / {plan.plannedQty.toLocaleString()} pcs</p>
                      <p className="text-[10px] text-slate-400">Target: {plan.dailyTarget} pcs/day ({plan.targetEfficiency}%)</p>
                    </td>
                    <td className="px-4 py-4 w-36">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border",
                        plan.status === "completed" ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30" :
                          plan.status === "in-progress" ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30" :
                            plan.status === "delayed" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30" :
                              "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <select
                        value={plan.status}
                        onChange={(e) => handleUpdateStatus(plan.id, e.target.value as any)}
                        className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">No production plans found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW PRODUCTION PLAN MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Production Plan & Line Allocation</h3>
                <p className="text-xs text-indigo-600 font-mono font-bold mt-0.5">{planNumber}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              {/* Order Auto-fill */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                <label className="font-bold text-indigo-900 dark:text-indigo-200 whitespace-nowrap">Auto-Fill from Order:</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                >
                  <option value="">Select an order (Optional)...</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.buyerName} ({o.styleName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Order / PO Number *</label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={e => setOrderNumber(e.target.value)}
                    placeholder="e.g. PO-252000868"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Buyer Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    placeholder="e.g. Nordstrom Inc."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Garment Style Name *</label>
                <input
                  type="text"
                  required
                  value={styleName}
                  onChange={e => setStyleName(e.target.value)}
                  placeholder="e.g. Classic Oxford Button-Down Shirt"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Allocated Sewing Line *</label>
                  <select
                    value={lineName}
                    onChange={e => setLineName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    {productionLines.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Factory Facility</label>
                  <select
                    value={factoryName}
                    onChange={e => setFactoryName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Mrityunjay Enterprises">Mrityunjay Enterprises (Palri, Bhilwara)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Planned Start Date *</label>
                  <input
                    type="date"
                    required
                    value={plannedStartDate}
                    onChange={e => setPlannedStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Planned End Date</label>
                  <input
                    type="date"
                    value={plannedEndDate}
                    onChange={e => setPlannedEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Planned Qty (Pcs) *</label>
                  <input
                    type="number"
                    required
                    value={plannedQty}
                    onChange={e => setPlannedQty(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Daily Target Output</label>
                  <input
                    type="number"
                    value={dailyTarget}
                    onChange={e => setDailyTarget(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Efficiency (%)</label>
                  <input
                    type="number"
                    value={targetEfficiency}
                    onChange={e => setTargetEfficiency(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25"
                >
                  <Save size={16} /> Schedule Production Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
