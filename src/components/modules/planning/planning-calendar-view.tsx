"use client";
import React from "react";
import { Calendar as CalIcon, ChevronLeft, ChevronRight } from "lucide-react";

const calendarEvents = [
  { date: 25, events: [{ title: "ORD-0001 Cutting Start", color: "bg-blue-500" }, { title: "ORD-0005 Dispatch", color: "bg-emerald-500" }] },
  { date: 26, events: [{ title: "Fabric Delivery - Arvind", color: "bg-amber-500" }] },
  { date: 27, events: [{ title: "ORD-0005 Ex-Factory", color: "bg-red-500" }, { title: "M&S Sample Submit", color: "bg-indigo-500" }] },
  { date: 28, events: [{ title: "ORD-0002 Finishing QC", color: "bg-violet-500" }] },
  { date: 30, events: [{ title: "ORD-0003 Denim Delivery (Delayed)", color: "bg-red-500" }] },
  { date: 31, events: [{ title: "Payroll Processing", color: "bg-slate-500" }] },
];

export function PlanningCalendarView({ basePath }: { basePath?: string }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const startOffset = 1; // July 2025 starts on Tuesday

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Production Calendar</h1><p className="text-sm text-slate-500 mt-1">Visual timeline for cutting, stitching, dispatch & delivery milestones</p></div>
        <div className="flex items-center gap-2"><button className="p-2 rounded-lg hover:bg-slate-100"><ChevronLeft size={16} /></button><span className="text-sm font-bold text-slate-900 dark:text-white px-3">July 2025</span><button className="p-2 rounded-lg hover:bg-slate-100"><ChevronRight size={16} /></button></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 overflow-hidden">
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(d => <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">{d}</div>)}
          {Array.from({ length: startOffset }, (_, i) => <div key={`e-${i}`} />)}
          {days.map(day => {
            const ev = calendarEvents.find(e => e.date === day);
            const isToday = day === 25;
            return (
              <div key={day} className={`min-h-[80px] p-1.5 rounded-lg border ${isToday ? "border-indigo-300 bg-indigo-50/30 dark:bg-indigo-900/20" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30"} transition-colors`}>
                <span className={`text-xs font-semibold ${isToday ? "text-indigo-600" : "text-slate-500"}`}>{day}</span>
                {ev && <div className="mt-1 space-y-0.5">{ev.events.map((e, i) => (
                  <div key={i} className={`text-[9px] text-white px-1 py-0.5 rounded ${e.color} truncate`}>{e.title}</div>
                ))}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
