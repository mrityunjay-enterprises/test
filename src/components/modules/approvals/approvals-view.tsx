"use client";

import React, { useState } from "react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { approvalRequests as initialRequests } from "@/lib/demo-data";
import { ApprovalRequest } from "@/lib/types";
import { CheckSquare, CheckCircle2, XCircle, Clock, ArrowRight, User, AlertCircle, FileText, Filter, Shield, Sparkles } from "lucide-react";

export function ApprovalsView({ basePath }: { basePath?: string }) {
  const [requests, setRequests] = useState<ApprovalRequest[]>(initialRequests);
  const [filter, setFilter] = useState("pending");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filtered = requests.filter(a => filter === "all" ? true : a.status === filter);

  const handleAction = (id: string, newStatus: "approved" | "rejected") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    const target = requests.find(r => r.id === id);
    const actionText = newStatus === "approved" ? "Approved successfully" : "Rejected and sent back for revision";
    setToastMessage(`${target?.referenceNumber || "Request"} has been ${actionText}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckSquare className="text-emerald-400" size={18} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Approval Workflow Engine</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200">Live Decision Queue</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Multi-level authorization rules for High-value POs, Order Amendments, BOM Over-issues & Dispatches</p>
        </div>

        <div className="flex gap-1.5 p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
          {["pending", "approved", "rejected", "all"].map(st => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all", filter === st ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}
            >
              {st} ({st === "all" ? requests.length : requests.filter(r => r.status === st).length})
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Rule Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{requests.filter(r => r.status === "pending").length}</p>
            <p className="text-xs text-slate-500 font-medium">Pending Action</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">{requests.filter(r => r.status === "approved").length}</p>
            <p className="text-xs text-slate-500 font-medium">Approved & Signed Off</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center flex-shrink-0">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{requests.filter(r => r.status === "rejected").length}</p>
            <p className="text-xs text-slate-500 font-medium">Returned for Revision</p>
          </div>
        </div>
      </div>

      {/* Requests Queue List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-12 text-center text-slate-400">
            No approval requests found matching filter "{filter}".
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1", item.status === "approved" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : item.status === "rejected" ? "bg-red-50 text-red-600 dark:bg-red-900/30" : "bg-amber-50 text-amber-600 dark:bg-amber-900/30")}>
                  <CheckSquare size={22} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {item.type.replace(/-/g, " ")}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.referenceNumber}</span>
                    <span className="text-xs text-slate-400">• Requested: {formatDate(item.createdAt)}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{item.description}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Requested by: <span className="font-semibold text-slate-700 dark:text-slate-300">{item.requestedByName}</span> • Tier Level {item.currentLevel} of {item.totalLevels} Approval
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                {item.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleAction(item.id, "rejected")}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleAction(item.id, "approved")}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/25"
                    >
                      Authorize & Approve
                    </button>
                  </>
                ) : (
                  <span className={cn("text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider", item.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400")}>
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
