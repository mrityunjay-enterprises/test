"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock, Save, TrendingUp, AlertTriangle, CheckCircle2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const hours = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-01:00", "01:00-02:00", "02:00-03:00", "03:00-04:00", "04:00-05:00"];
const lineNames = ["Line A", "Line B", "Line C"];

type HourData = { target: number; actual: number; remarks: string };
type LineData = Record<string, HourData>;
type DayData = Record<string, LineData>;

const STORAGE_KEY = "garmentflow_hourly_production";

const generateDefaultData = (): DayData => ({
  "Line A": {
    "08:00-09:00": { target: 75, actual: 68, remarks: "" },
    "09:00-10:00": { target: 75, actual: 72, remarks: "" },
    "10:00-11:00": { target: 75, actual: 78, remarks: "" },
    "11:00-12:00": { target: 75, actual: 74, remarks: "" },
    "12:00-01:00": { target: 40, actual: 38, remarks: "Lunch break" },
    "01:00-02:00": { target: 75, actual: 70, remarks: "" },
    "02:00-03:00": { target: 75, actual: 0, remarks: "" },
    "03:00-04:00": { target: 75, actual: 0, remarks: "" },
    "04:00-05:00": { target: 75, actual: 0, remarks: "" },
  },
  "Line B": {
    "08:00-09:00": { target: 68, actual: 60, remarks: "" },
    "09:00-10:00": { target: 68, actual: 64, remarks: "" },
    "10:00-11:00": { target: 68, actual: 66, remarks: "" },
    "11:00-12:00": { target: 68, actual: 62, remarks: "" },
    "12:00-01:00": { target: 35, actual: 32, remarks: "Lunch break" },
    "01:00-02:00": { target: 68, actual: 58, remarks: "" },
    "02:00-03:00": { target: 68, actual: 0, remarks: "" },
    "03:00-04:00": { target: 68, actual: 0, remarks: "" },
    "04:00-05:00": { target: 68, actual: 0, remarks: "" },
  },
  "Line C": {
    "08:00-09:00": { target: 62, actual: 64, remarks: "" },
    "09:00-10:00": { target: 62, actual: 66, remarks: "" },
    "10:00-11:00": { target: 62, actual: 68, remarks: "" },
    "11:00-12:00": { target: 62, actual: 62, remarks: "" },
    "12:00-01:00": { target: 32, actual: 30, remarks: "Lunch break" },
    "01:00-02:00": { target: 62, actual: 60, remarks: "" },
    "02:00-03:00": { target: 62, actual: 0, remarks: "" },
    "03:00-04:00": { target: 62, actual: 0, remarks: "" },
    "04:00-05:00": { target: 62, actual: 0, remarks: "" },
  },
});

const formatDate = (d: Date) => d.toISOString().split("T")[0];
const displayDate = (d: Date) => d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function HourlyPage() {
  const [allData, setAllData] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showSuccess, setShowSuccess] = useState("");
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [showRemarks, setShowRemarks] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed[formatDate(new Date())]) parsed[formatDate(new Date())] = generateDefaultData();
        setAllData(parsed);
        return;
      }
    } catch {}
    setAllData({ [formatDate(new Date())]: generateDefaultData() });
  }, []);

  const data = allData[selectedDate] || generateDefaultData();

  const save = (newDayData: DayData) => {
    const newAll = { ...allData, [selectedDate]: newDayData };
    setAllData(newAll);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newAll)); } catch {}
  };

  const updateActual = (line: string, hour: string, value: number) => {
    const newData = { ...data };
    newData[line] = { ...newData[line] };
    newData[line][hour] = { ...newData[line][hour], actual: value };
    save(newData);
  };

  const updateTarget = (line: string, hour: string, value: number) => {
    const newData = { ...data };
    newData[line] = { ...newData[line] };
    newData[line][hour] = { ...newData[line][hour], target: value };
    save(newData);
  };

  const updateRemarks = (line: string, hour: string, value: string) => {
    const newData = { ...data };
    newData[line] = { ...newData[line] };
    newData[line][hour] = { ...newData[line][hour], remarks: value };
    save(newData);
  };

  const handleSave = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(allData)); } catch {}
    setShowSuccess("All entries saved successfully!");
    setTimeout(() => setShowSuccess(""), 3000);
  };

  const changeDate = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    const key = formatDate(d);
    setSelectedDate(key);
    if (!allData[key]) {
      const newAll = { ...allData, [key]: generateDefaultData() };
      setAllData(newAll);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newAll)); } catch {}
    }
  };

  // Overall KPIs
  const grandTarget = lineNames.reduce((s, l) => s + Object.values(data[l] || {}).reduce((s2, h) => s2 + h.target, 0), 0);
  const grandActual = lineNames.reduce((s, l) => s + Object.values(data[l] || {}).reduce((s2, h) => s2 + h.actual, 0), 0);
  const grandEff = grandTarget > 0 ? Math.round((grandActual / grandTarget) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{showSuccess}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Hourly Production Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time hourly target vs actual output entry by production line</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-1 py-1">
            <button onClick={() => changeDate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><ChevronLeft size={16} className="text-slate-500" /></button>
            <div className="flex items-center gap-1.5 px-3 py-1">
              <Calendar size={14} className="text-indigo-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-white whitespace-nowrap">{displayDate(new Date(selectedDate))}</span>
            </div>
            <button onClick={() => changeDate(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><ChevronRight size={16} className="text-slate-500" /></button>
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Save size={16} /> Save Entries
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-indigo-600">{grandTarget}</p>
          <p className="text-xs text-slate-500 mt-1">Total Target</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className="text-2xl font-bold text-emerald-600">{grandActual}</p>
          <p className="text-xs text-slate-500 mt-1">Total Actual</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-800 text-center">
          <p className={cn("text-2xl font-bold", grandEff >= 85 ? "text-emerald-600" : grandEff >= 70 ? "text-amber-600" : "text-red-600")}>{grandEff}%</p>
          <p className="text-xs text-slate-500 mt-1">Overall Efficiency</p>
        </div>
      </div>

      {/* Per-Line Tables */}
      {lineNames.map(line => {
        const lineData = data[line] || {};
        const totalTarget = Object.values(lineData).reduce((s, h) => s + h.target, 0);
        const totalActual = Object.values(lineData).reduce((s, h) => s + h.actual, 0);
        const eff = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

        return (
          <div key={line} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{line}</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-500">Target: <span className="font-bold text-slate-800 dark:text-white">{totalTarget}</span></span>
                <span className="text-slate-500">Actual: <span className="font-bold text-emerald-600">{totalActual}</span></span>
                <span className={cn("font-bold", eff >= 85 ? "text-emerald-600" : eff >= 70 ? "text-amber-600" : "text-red-600")}>Eff: {eff}%</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase">Metric</th>
                    {hours.map(h => <th key={h} className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>)}
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-slate-500 uppercase">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Target Row */}
                  <tr className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-600">Target</td>
                    {hours.map(h => (
                      <td key={h} className="px-1 py-2 text-center">
                        <input
                          type="number"
                          value={lineData[h]?.target ?? 0}
                          onChange={e => updateTarget(line, h, parseInt(e.target.value) || 0)}
                          className="w-14 h-7 px-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                        />
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-center text-sm font-bold text-slate-800 dark:text-white">{totalTarget}</td>
                  </tr>
                  {/* Actual Row */}
                  <tr className="border-b border-slate-50 dark:border-slate-800/50">
                    <td className="px-4 py-2.5 text-xs font-semibold text-slate-600">Actual</td>
                    {hours.map(h => {
                      const val = lineData[h] || { target: 0, actual: 0, remarks: "" };
                      const pct = val.target > 0 && val.actual > 0 ? (val.actual / val.target) * 100 : 0;
                      const cellId = `${line}-${h}`;
                      return (
                        <td key={h} className="px-1 py-2 text-center">
                          <input
                            type="number"
                            value={val.actual || ""}
                            onChange={e => updateActual(line, h, parseInt(e.target.value) || 0)}
                            placeholder="—"
                            className={cn(
                              "w-14 h-7 px-1 rounded-lg border text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40",
                              val.actual === 0 ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300" :
                              pct >= 90 ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600" :
                              pct >= 75 ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600" :
                              "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600"
                            )}
                          />
                        </td>
                      );
                    })}
                    <td className="px-4 py-2.5 text-center text-sm font-bold text-emerald-600">{totalActual}</td>
                  </tr>
                  {/* Efficiency Row */}
                  <tr className="border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20">
                    <td className="px-4 py-2 text-xs font-semibold text-slate-600">Eff %</td>
                    {hours.map(h => {
                      const val = lineData[h] || { target: 0, actual: 0, remarks: "" };
                      const pct = val.target > 0 && val.actual > 0 ? Math.round((val.actual / val.target) * 100) : 0;
                      return (
                        <td key={h} className="px-1 py-2 text-center">
                          <span className={cn("text-xs font-bold",
                            pct === 0 ? "text-slate-300" :
                            pct >= 90 ? "text-emerald-600" :
                            pct >= 75 ? "text-amber-600" : "text-red-600"
                          )}>{pct > 0 ? `${pct}%` : "—"}</span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-2 text-center">
                      <span className={cn("text-xs font-bold", eff >= 85 ? "text-emerald-600" : eff >= 70 ? "text-amber-600" : "text-red-600")}>{eff}%</span>
                    </td>
                  </tr>
                  {/* Remarks Row */}
                  <tr>
                    <td className="px-4 py-2 text-xs font-semibold text-slate-600">Remarks</td>
                    {hours.map(h => {
                      const val = lineData[h] || { target: 0, actual: 0, remarks: "" };
                      return (
                        <td key={h} className="px-1 py-2 text-center">
                          <input
                            type="text"
                            value={val.remarks}
                            onChange={e => updateRemarks(line, h, e.target.value)}
                            placeholder="—"
                            className="w-14 h-6 px-1 rounded text-[10px] bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 focus:border-indigo-300"
                            title={val.remarks || "Add remark"}
                          />
                        </td>
                      );
                    })}
                    <td className="px-4 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
