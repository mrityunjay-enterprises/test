"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { styles } from "@/lib/demo-data";
import { Ruler, Plus, Download } from "lucide-react";

const measurementChart = [
  { pom: "Chest (1/2)", code: "POM-01", tol: "+/- 0.5", s: 50.0, m: 52.5, l: 55.0, xl: 58.0, xxl: 61.5 },
  { pom: "Waist (1/2)", code: "POM-02", tol: "+/- 0.5", s: 47.0, m: 49.5, l: 52.0, xl: 55.0, xxl: 58.5 },
  { pom: "Garment Length (Center Back)", code: "POM-03", tol: "+/- 1.0", s: 73.0, m: 75.0, l: 77.0, xl: 79.0, xxl: 81.0 },
  { pom: "Shoulder Width", code: "POM-04", tol: "+/- 0.5", s: 44.0, m: 45.5, l: 47.0, xl: 48.5, xxl: 50.0 },
  { pom: "Sleeve Length", code: "POM-05", tol: "+/- 0.5", s: 63.0, m: 64.5, l: 66.0, xl: 67.5, xxl: 69.0 },
  { pom: "Collar Circumference", code: "POM-06", tol: "+/- 0.3", s: 38.0, m: 39.5, l: 41.0, xl: 42.5, xxl: 44.0 },
  { pom: "Cuff Width", code: "POM-07", tol: "+/- 0.3", s: 22.0, m: 23.0, l: 24.0, xl: 25.0, xxl: 26.0 },
  { pom: "Armhole Curved", code: "POM-08", tol: "+/- 0.5", s: 24.0, m: 25.0, l: 26.0, xl: 27.5, xxl: 29.0 },
];

export function StyleMeasurementsView({ basePath }: { basePath?: string }) {
  const [selectedStyle, setSelectedStyle] = useState(styles[0]?.id || "");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Measurement Spec & Size Grading</h1>
          <p className="text-sm text-slate-500 mt-1">Point of Measurement (POM) table, tolerance limits & size grade rules</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export Spec Sheet
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> Add POM
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-500 uppercase">Style:</label>
        <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold">
          {styles.map(s => <option key={s.id} value={s.id}>{s.styleNumber} — {s.styleName} (Size L)</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">POM Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Point of Measurement (POM)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tol (cm)</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">S</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">M</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 uppercase">L (Base)</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">XL</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">XXL</th>
            </tr>
          </thead>
          <tbody>
            {measurementChart.map(m => (
              <tr key={m.code} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-mono font-semibold text-indigo-600">{m.code}</td>
                <td className="px-4 py-3.5 text-sm font-medium text-slate-800 dark:text-white">{m.pom}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">{m.tol}</td>
                <td className="px-4 py-3.5 text-center text-sm text-slate-600">{m.s}</td>
                <td className="px-4 py-3.5 text-center text-sm text-slate-600">{m.m}</td>
                <td className="px-4 py-3.5 text-center text-sm font-bold text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10">{m.l}</td>
                <td className="px-4 py-3.5 text-center text-sm text-slate-600">{m.xl}</td>
                <td className="px-4 py-3.5 text-center text-sm text-slate-600">{m.xxl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
