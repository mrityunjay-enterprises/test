"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { styles } from "@/lib/demo-data";
import { ListOrdered, Plus, Download, Clock } from "lucide-react";

const operationBulletin = [
  { seq: 1, section: "Front", operation: "Fuse Placket & Collar Stay", machine: "Fusing Machine", attachment: "Flat Bed", smv: 0.45, grade: "C", targetHr: 133 },
  { seq: 2, section: "Front", operation: "Make Left Front Placket", machine: "Single Needle Lockstitch (SNLS)", attachment: "Placket Folder", smv: 0.85, grade: "B", targetHr: 70 },
  { seq: 3, section: "Front", operation: "Attach Front Pocket", machine: "SNLS", attachment: "Gauge 1/4", smv: 1.20, grade: "A", targetHr: 50 },
  { seq: 4, section: "Back", operation: "Attach Back Yoke to Back Panel", machine: "Double Needle (DNLS)", attachment: "Lap Seam Folder", smv: 0.90, grade: "B", targetHr: 66 },
  { seq: 5, section: "Collar", operation: "Make Collar & Collar Band", machine: "SNLS", attachment: "Collar Jig", smv: 2.10, grade: "A*", targetHr: 28 },
  { seq: 6, section: "Collar", operation: "Attach Collar to Neckline", machine: "SNLS", attachment: "Standard Foot", smv: 1.80, grade: "A*", targetHr: 33 },
  { seq: 7, section: "Sleeve", operation: "Make Sleeve Placket / Bound", machine: "SNLS", attachment: "Binder", smv: 1.10, grade: "B", targetHr: 54 },
  { seq: 8, section: "Assembly", operation: "Attach Shoulder Seam", machine: "4-Thread Overlock", attachment: "Taping Folder", smv: 0.75, grade: "B", targetHr: 80 },
  { seq: 9, section: "Assembly", operation: "Attach Sleeve to Armhole", machine: "SNLS", attachment: "Armhole Guide", smv: 1.65, grade: "A", targetHr: 36 },
  { seq: 10, section: "Assembly", operation: "Close Side Seam & Underarm", machine: "4-Thread Overlock", attachment: "Side Seam Guide", smv: 1.40, grade: "B", targetHr: 42 },
  { seq: 11, section: "Cuff", operation: "Attach Cuff to Sleeve", machine: "SNLS", attachment: "Gauge 1/4", smv: 1.30, grade: "A", targetHr: 46 },
  { seq: 12, section: "Hem", operation: "Bottom Hemming", machine: "SNLS", attachment: "Hemmer Folder 1/4", smv: 0.95, grade: "B", targetHr: 63 },
  { seq: 13, section: "Finishing", operation: "Make Buttonholes (Placket, Collar, Cuffs)", machine: "Buttonhole Machine", attachment: "Auto Index", smv: 1.15, grade: "B", targetHr: 52 },
  { seq: 14, section: "Finishing", operation: "Attach Buttons (Placket, Collar, Cuffs)", machine: "Button Attaching", attachment: "Hopper Feed", smv: 0.90, grade: "C", targetHr: 66 },
];

export function StyleOperationsView({ basePath }: { basePath?: string }) {
  const [selectedStyle, setSelectedStyle] = useState(styles[0]?.id || "");
  const totalSMV = operationBulletin.reduce((s, o) => s + o.smv, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Operation Bulletin & SMV Breakdown</h1>
          <p className="text-sm text-slate-500 mt-1">Sequence of operations, machine allocation, attachment requirements & Standard Minute Value (SMV)</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export Bulletin
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} /> Add Operation
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <label className="text-xs font-bold text-slate-500 uppercase">Style:</label>
        <select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)} className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold">
          {styles.map(s => <option key={s.id} value={s.id}>{s.styleNumber} — {s.styleName}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500">Total Ops: <span className="text-slate-800 dark:text-white">{operationBulletin.length}</span></span>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl">
            Total Garment SMV: {totalSMV.toFixed(2)} mins
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Seq #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Section</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Operation Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Machine Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Folder / Attachment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">SMV (Min)</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Operator Skill Grade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Target/Hr (100%)</th>
            </tr>
          </thead>
          <tbody>
            {operationBulletin.map(o => (
              <tr key={o.seq} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-mono font-bold text-slate-400">#{o.seq}</td>
                <td className="px-4 py-3.5"><span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">{o.section}</span></td>
                <td className="px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-white">{o.operation}</td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{o.machine}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{o.attachment}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-indigo-600">{o.smv}</td>
                <td className="px-4 py-3.5"><span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", o.grade.includes("A") ? "bg-emerald-100 text-emerald-700" : o.grade === "B" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600")}>{o.grade}</span></td>
                <td className="px-4 py-3.5 text-sm font-bold text-slate-800 dark:text-white">{o.targetHr} pcs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
