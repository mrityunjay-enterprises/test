"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Order, OrderStatus } from "@/lib/types";
import {
  getStoredOrders,
  advanceOrderWorkflow,
  WORKFLOW_EVENT,
  getNextStage
} from "@/lib/workflow-service";
import { CheckCircle2, ChevronRight } from "lucide-react";

interface PipelineColumn {
  id: string;
  stage: string;
  color: string;
  icon?: any;
  matchStatuses: OrderStatus[];
}

const STAGES: PipelineColumn[] = [
  { id: "draft", stage: "Enquiry & Costing", color: "bg-slate-500", matchStatuses: ["draft", "awaiting-approval"] },
  { id: "confirmed", stage: "Order Confirmed", color: "bg-blue-500", matchStatuses: ["confirmed"] },
  { id: "material", stage: "Material Sourcing", color: "bg-amber-500", matchStatuses: ["material-planning", "material-procurement"] },
  { id: "cutting", stage: "Cutting Room", color: "bg-cyan-500", matchStatuses: ["ready-for-production", "in-cutting"] },
  { id: "stitching", stage: "Stitching Floor", color: "bg-indigo-500", matchStatuses: ["in-stitching", "in-special-process"] },
  { id: "quality", stage: "Finishing & Quality", color: "bg-purple-500", matchStatuses: ["in-finishing", "in-quality"] },
  { id: "packing", stage: "Packing & FG", color: "bg-pink-500", matchStatuses: ["in-packing", "ready-for-dispatch"] },
  { id: "completed", stage: "Dispatched & Delivered", color: "bg-emerald-500", matchStatuses: ["dispatched", "partially-dispatched", "completed"] },
];

export function OrderPipelineView({ basePath }: { basePath?: string }) {
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setOrdersList(getStoredOrders());
  };

  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const handleAdvance = (orderId: string) => {
    const { nextStatus, orderName } = advanceOrderWorkflow(orderId);
    if (nextStatus) {
      setToastMsg(`Order ${orderName} advanced to: ${nextStatus.replace(/-/g, " ").toUpperCase()}`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const getStageOrders = (col: PipelineColumn) => {
    return ordersList.filter((o) => col.matchStatuses.includes(o.status));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Order Pipeline & Kanban View</h1>
        <p className="text-sm text-slate-500 mt-1">
          End-to-end synchronized workflow tracking garment manufacturing across all 8 production milestones
        </p>
      </div>

      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-3 overflow-x-auto pb-4">
        {STAGES.map((col) => {
          const items = getStageOrders(col);
          return (
            <div
              key={col.id}
              className="bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-2.5 min-w-[210px] flex flex-col h-full border border-slate-200/50 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", col.color)} />
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white truncate">{col.stage}</h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {items.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                    No orders
                  </div>
                ) : (
                  items.map((o) => {
                    const nextInfo = getNextStage(o.status);

                    return (
                      <div
                        key={o.id}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{o.orderNumber}</span>
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            {o.currency} {o.unitPrice}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{o.styleName}</h4>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{o.buyerName}</p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>
                            Qty: <strong className="text-slate-700 dark:text-slate-300 font-bold">{o.totalQuantity.toLocaleString()}</strong>
                          </span>
                          <span>
                            Due: <strong className="text-slate-700 dark:text-slate-300 font-bold">{o.deliveryDate}</strong>
                          </span>
                        </div>

                        {nextInfo.nextStatus && (
                          <button
                            type="button"
                            onClick={() => handleAdvance(o.id)}
                            className="w-full mt-2 py-1.5 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-[10px] flex items-center justify-center gap-1 transition-colors"
                          >
                            <span>Advance Stage</span>
                            <ChevronRight size={13} />
                          </button>
                        )}
                        {!nextInfo.nextStatus && (
                          <div className="w-full mt-2 py-1 px-2 text-center text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} /> Closed
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
