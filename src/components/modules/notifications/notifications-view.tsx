"use client";

import React from "react";
import { Bell, Check, Trash2, Filter } from "lucide-react";
import { notifications } from "@/lib/demo-data";

export function NotificationsView({ basePath }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Notifications & Alerts</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time production bottlenecks, material shortages & pending approvals</p>
        </div>
        <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Mark All as Read</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bell size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{n.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
              <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
