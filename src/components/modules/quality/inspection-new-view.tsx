"use client";

import { usePathname } from "next/navigation";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { orders as initialOrders } from "@/lib/demo-data";
import { Order, QualityInspection } from "@/lib/types";
import { getStoredOrders, saveInspection, WORKFLOW_EVENT } from "@/lib/workflow-service";
import { Plus, Save, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

const defectTypes = ["Broken Stitch", "Skip Stitch", "Open Seam", "Puckering", "Shade Variation", "Stain", "Measurement Out", "Button Missing", "Label Error", "Hole / Tear"];
const stages = ["Inline Stitching", "End-Line Inspection", "Finishing", "Pre-Shipment AQL"];

export function InspectionNewView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/factory");
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [formData, setFormData] = useState({
    orderId: "",
    stage: stages[0],
    checkedQty: "",
    defects: [] as Array<{ type: string; count: number }>,
    remarks: "",
    inspectorName: ""
  });

  useEffect(() => {
    const list = getStoredOrders();
    setOrdersList(list);
    if (list.length > 0) {
      setFormData(prev => ({ ...prev, orderId: prev.orderId || list[0].id }));
    }
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalDefects = formData.defects.reduce((sum, d) => sum + d.count, 0);
  const checkedNum = parseInt(formData.checkedQty) || 0;
  const passedQty = Math.max(0, checkedNum - totalDefects);
  const passRate = checkedNum > 0 ? ((passedQty / checkedNum) * 100).toFixed(1) : "0";

  const getDecision = () => {
    const rate = parseFloat(passRate);
    if (rate >= 95) return { status: "ACCEPTED (PASS)", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (rate >= 85) return { status: "REWORK REQUIRED", color: "text-amber-600 bg-amber-50 border-amber-200" };
    return { status: "REJECTED (FAIL)", color: "text-red-600 bg-red-50 border-red-200" };
  };

  const decision = getDecision();

  const handleAddDefect = () => {
    setFormData(prev => ({ ...prev, defects: [...prev.defects, { type: defectTypes[0], count: 1 }] }));
  };

  const handleRemoveDefect = (index: number) => {
    setFormData(prev => ({ ...prev, defects: prev.defects.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || checkedNum <= 0) {
      alert("Please select an Order and enter a valid Checked Quantity.");
      return;
    }

    const matchedOrd = ordersList.find(o => o.id === formData.orderId);
    const newInspection: QualityInspection = {
      id: `qi-${Date.now()}`,
      inspectionNumber: `QI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: formData.orderId,
      orderNumber: matchedOrd?.orderNumber || "ORD-2026-NEW",
      styleId: matchedOrd?.styleId || "s1",
      styleName: matchedOrd?.styleName || "Garment Style",
      buyerName: matchedOrd?.buyerName || "Client Buyer",
      stage: formData.stage.toLowerCase().replace(/ /g, "-") as any,
      inspectorId: "ins-1",
      inspectorName: formData.inspectorName,
      date: new Date().toISOString().split("T")[0],
      inspectedQty: checkedNum,
      passQty: passedQty,
      failQty: totalDefects,
      reworkQty: Math.round(totalDefects * 0.7),
      rejectedQty: Math.round(totalDefects * 0.3),
      defects: formData.defects.map((d, i) => ({
        id: `def-${i}`,
        category: d.type,
        description: `${d.type} detected on inspection`,
        severity: "major" as const,
        location: "Seam / Panel",
        quantity: d.count
      })),
      decision: parseFloat(passRate) >= 95 ? "pass" : parseFloat(passRate) >= 85 ? "rework" : "reject",
      notes: formData.remarks,
      images: [],
      status: "completed",
      createdAt: new Date().toISOString().split("T")[0]
    };

    saveInspection(newInspection);

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = `${prefix}/quality/inspections`;
      }, 1500);
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`${prefix}/quality/inspections`} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">New Quality Inspection</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">Record inline, end-line, finishing or AQL inspection findings & defect counts</p>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-12 text-center space-y-4 shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inspection Submitted Successfully!</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Report logged for {checkedNum} pcs checked with {totalDefects} defects. Result: <span className="font-bold text-emerald-600">{decision.status}</span>.
          </p>
          <p className="text-xs text-slate-400">Redirecting to Quality Inspection History...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Order & Stage Setup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Production Order *</label>
              <select
                value={formData.orderId}
                onChange={e => setFormData(p => ({ ...p, orderId: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
                required
              >
                {(ordersList.length > 0 ? ordersList : initialOrders).map(o => (
                  <option key={o.id} value={o.id}>{o.orderNumber} - {o.styleName} ({o.buyerName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Inspection Stage *</label>
              <select
                value={formData.stage}
                onChange={e => setFormData(p => ({ ...p, stage: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Inspected Sample Quantity *</label>
              <input
                type="number"
                value={formData.checkedQty}
                onChange={e => setFormData(p => ({ ...p, checkedQty: e.target.value }))}
                placeholder="e.g. 250"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Inspector Name</label>
              <input
                type="text"
                value={formData.inspectorName}
                onChange={e => setFormData(p => ({ ...p, inspectorName: e.target.value }))}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              />
            </div>
          </div>

          {/* Live Calculation Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Inspected Qty</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{checkedNum} pcs</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Defects Found</p>
              <p className="text-xl font-bold text-red-600 mt-0.5">{totalDefects} pcs</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Pass Rate</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{passRate}%</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Quality Result</p>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 border", decision.color)}>
                {decision.status.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* Defect Entry List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Defects Breakdown</h3>
              <button
                type="button"
                onClick={handleAddDefect}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <Plus size={14} /> Add Defect Line
              </button>
            </div>

            {formData.defects.length === 0 ? (
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                Zero defects recorded. Click &quot;Add Defect Line&quot; if defects were identified.
              </div>
            ) : (
              <div className="space-y-2">
                {formData.defects.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                    <select
                      value={d.type}
                      onChange={e => {
                        const nd = [...formData.defects];
                        nd[i].type = e.target.value;
                        setFormData(p => ({ ...p, defects: nd }));
                      }}
                      className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                    >
                      {defectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      type="number"
                      value={d.count}
                      min={1}
                      onChange={e => {
                        const nd = [...formData.defects];
                        nd[i].count = parseInt(e.target.value) || 0;
                        setFormData(p => ({ ...p, defects: nd }));
                      }}
                      placeholder="Count"
                      className="w-24 h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDefect(i)}
                      className="text-red-500 hover:text-red-600 text-xs font-semibold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Remarks / Root Cause Notes</label>
            <textarea
              value={formData.remarks}
              onChange={e => setFormData(p => ({ ...p, remarks: e.target.value }))}
              rows={3}
              placeholder="Record observation notes, sewing line number, root cause, or corrective action instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} /> Submit Inspection Report
                </>
              )}
            </button>
            <Link
              href={`${prefix}/quality/inspections`}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
