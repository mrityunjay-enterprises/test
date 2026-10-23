import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return "0";
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-IN");
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateId(prefix: string = ""): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = prefix;
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export function getStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25";
  const s = status.toLowerCase().trim();
  const statusMap: Record<string, string> = {
    // 1. Success / Completed / Positive
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    closed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    pass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    passed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    dispatched: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    "pod-received": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    "in-stock": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    present: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    unlocked: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",

    // 2. In Production / Active Operations (Blue / Indigo / Violet)
    "in-production": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    "in-progress": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    "in-cutting": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    "in-stitching": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/25",
    "in-finishing": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25",
    "in-packing": "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25",
    "in-transit": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/25",
    "ready-for-dispatch": "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/25",

    // 3. Pending / Awaiting Action / Warning (Amber)
    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "awaiting-approval": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    requested: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "under-development": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "low-stock": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "half-day": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "on-leave": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    altered: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    planned: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/25",

    // 4. Draft / Idle / Neutral (Slate)
    draft: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    inactive: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    "on-hold": "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    cancelled: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    none: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",

    // 5. Critical / Failure / Danger (Red / Rose)
    rejected: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    failed: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    overdue: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    delayed: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    critical: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    absent: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    damaged: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    "out-of-stock": "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
    unpaid: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/25",
  };
  return statusMap[s] || "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25";
}

export function percentageChange(current: number, previous: number): { value: number; positive: boolean } {
  if (previous === 0) return { value: 0, positive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change), positive: change >= 0 };
}

export function getAppUrl(path: string): string {
  return path;
}
