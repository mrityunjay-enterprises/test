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

export function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString("en-IN");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
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

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    confirmed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    approved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    pass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    dispatched: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    delivered: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",

    pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "in-progress": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "in-production": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "awaiting-approval": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    "under-development": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",
    partial: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25",

    draft: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    inactive: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    "on-hold": "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",
    cancelled: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/25",

    rejected: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    failed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    overdue: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    delayed: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",
    critical: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25",

    "in-cutting": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25",
    "in-stitching": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/25",
    "in-finishing": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/25",
    "in-packing": "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25",
    "ready-for-dispatch": "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/25",
  };
  return statusMap[status.toLowerCase()] || "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/25";
}

export function percentageChange(current: number, previous: number): { value: number; positive: boolean } {
  if (previous === 0) return { value: 0, positive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change), positive: change >= 0 };
}

export function getAppUrl(path: string): string {
  return path;
}
