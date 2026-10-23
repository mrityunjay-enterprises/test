"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn, formatCurrency, formatNumber, formatDate, getStatusColor } from "@/lib/utils";
import { useScrollLock } from "@/lib/hooks/use-scroll-lock";
import { Order, OrderStatus } from "@/lib/types";
import {
  getStoredOrders,
  saveOrders,
  updateOrderStatus,
  advanceOrderWorkflow,
  getNextStage,
  WORKFLOW_EVENT,
  WORKFLOW_STAGES_SEQUENCE
} from "@/lib/workflow-service";
import { OrderManufacturingWorkflowModal } from "./order-manufacturing-workflow-modal";
import {
  Search, Filter, Download, Plus, ChevronDown, MoreHorizontal,
  Eye, Edit, Copy, Trash2, ArrowUpDown, Package, Calendar,
  AlertTriangle, CheckCircle, Clock, SlidersHorizontal, Columns3,
  CheckCircle2, Receipt, ArrowRight, X, Sparkles, Building2, Truck, Scissors,
  Monitor, ShieldCheck, Layers, ExternalLink
} from "lucide-react";

const statusFilters = [
  "All", "Draft", "Awaiting Approval", "Confirmed", "Material Planning",
  "Material Procurement", "Ready for Production", "In Cutting", "In Stitching",
  "In Finishing", "In Quality", "In Packing", "Ready for Dispatch", "Dispatched", "Completed", "On Hold"
];

const priorityColors: Record<string, string> = {
  urgent: "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400",
  high: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400",
  medium: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400",
  low: "text-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-slate-400",
};

function getOrderNodeInfo(status: OrderStatus) {
  const item = WORKFLOW_STAGES_SEQUENCE.find(s => s.status === status);
  if (item) return item;
  return {
    status,
    label: status.replace(/-/g, " "),
    department: "Production",
    nodeNumber: "Node 01",
    nodeName: "Factory Workstation",
    panel: "Factory Station" as const,
    actionNote: ""
  };
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-full border whitespace-nowrap", getStatusColor(status))}>
      {status.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

function ProgressBar({ value, total, color = "indigo" }: { value: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  const colors: Record<string, string> = {
    indigo: "bg-indigo-500", emerald: "bg-emerald-500", amber: "bg-amber-500", red: "bg-red-500",
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", colors[color])} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

export function OrdersView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");

  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Read initial filter from URL if present
  const initialStatusFromUrl = searchParams?.get("status") || "All";
  const [statusFilter, setStatusFilter] = useState(initialStatusFromUrl);
  const [sortField, setSortField] = useState<string>("orderDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lifecycleModalOrder, setLifecycleModalOrder] = useState<Order | null>(null);

  // Cancellation Modal State (Item 5: Custom Confirmation Modal)
  const [cancelOrderTarget, setCancelOrderTarget] = useState<{ id: string; orderNo: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  useScrollLock(!!cancelOrderTarget || !!lifecycleModalOrder);

  // Handle Status Filter Change with URL Synchronization (Item 3)
  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newStatus === "All") {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  const loadData = () => {
    const data = getStoredOrders();
    setOrdersList(data);
  };

  useEffect(() => {
    loadData();

    // Listen to real-time sync across ERP tabs and components
    const handleSync = () => loadData();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredOrders = useMemo(() => {
    let filtered = [...ordersList];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q) ||
        o.styleName.toLowerCase().includes(q) ||
        o.buyerPO.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "All") {
      const statusKey = statusFilter.toLowerCase().replace(/ /g, "-");
      filtered = filtered.filter(o => o.status === statusKey);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return filtered;
  }, [ordersList, searchQuery, statusFilter, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // 1. Confirm Order Action
  const handleConfirmOrder = (orderId: string, orderNo: string) => {
    updateOrderStatus(orderId, "confirmed");
    setShowActionMenu(null);
    showToast(`Order ${orderNo} confirmed! Activated in Sourcing & Production schedule.`);
  };

  // 2. Advance Next Stage Action
  const handleAdvanceStage = (orderId: string) => {
    const { nextStatus, orderName } = advanceOrderWorkflow(orderId);
    setShowActionMenu(null);
    if (nextStatus) {
      showToast(`Order ${orderName} moved to: ${nextStatus.replace(/-/g, " ").toUpperCase()}`);
      if (lifecycleModalOrder && lifecycleModalOrder.id === orderId) {
        const fresh = getStoredOrders().find(o => o.id === orderId);
        if (fresh) setLifecycleModalOrder(fresh);
      }
    }
  };

  // 3. Cancel Order Action via Custom Modal
  const handleConfirmCancelOrder = () => {
    if (!cancelOrderTarget) return;
    updateOrderStatus(cancelOrderTarget.id, "cancelled");
    showToast(`Order ${cancelOrderTarget.orderNo} marked as CANCELLED.${cancelReason ? ` Reason: ${cancelReason}` : ""}`);
    setCancelOrderTarget(null);
    setCancelReason("");
  };

  // 4. Duplicate Order Action
  const handleDuplicateOrder = (order: Order) => {
    const duplicated: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerPO: `${order.buyerPO}-COPY`,
      status: "draft",
      cuttingQty: 0,
      stitchingQty: 0,
      finishingQty: 0,
      packedQty: 0,
      dispatchedQty: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updated = [duplicated, ...ordersList];
    saveOrders(updated);
    setShowActionMenu(null);
    showToast(`Order duplicated as ${duplicated.orderNumber}`);
  };

  const handleExportOrders = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const headers = [
      "Order Number",
      "Buyer Name",
      "Style Name",
      "Buyer PO",
      "Order Date",
      "Delivery Date",
      "Total Quantity",
      "Cutting Qty",
      "Stitching Qty",
      "Packed Qty",
      "Dispatched Qty",
      "Unit Price (INR)",
      "Total Value (INR)",
      "Status",
      "Priority"
    ];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      o.buyerName,
      o.styleName || o.styleId,
      o.buyerPO || "-",
      o.orderDate,
      o.deliveryDate,
      o.totalQuantity,
      o.cuttingQty || 0,
      o.stitchingQty || 0,
      o.packedQty || 0,
      o.dispatchedQty || 0,
      o.unitPrice,
      o.totalValue,
      o.status,
      o.priority
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map((cell: any) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `garmentflow_orders_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Orders Master</h1>
          <p className="text-sm text-slate-500 mt-1">{ordersList.length} total orders • {ordersList.filter(o => !["completed", "cancelled"].includes(o.status)).length} active in production</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportOrders}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Export orders to CSV"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <Link href={`${prefix}/orders/pipeline`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Columns3 size={16} />
            <span className="hidden sm:inline">Kanban Pipeline</span>
          </Link>
          <Link href={`${prefix}/orders/new`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Plus size={16} />
            New Order
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, buyer, style, or buyer PO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {statusFilters.map(sf => (
                <option key={sf} value={sf}>{sf} Status</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort("orderNumber")}>
                  <div className="flex items-center gap-1">Order # <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-4 py-3 text-left">Active Node</th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort("buyerName")}>
                  <div className="flex items-center gap-1">Buyer <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-4 py-3 text-left">Style</th>
                <th className="px-4 py-3 text-right cursor-pointer hover:text-slate-900" onClick={() => toggleSort("totalQuantity")}>
                  <div className="flex items-center justify-end gap-1">Qty <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-4 py-3 text-right">Value</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Floor Progress</th>
                <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-900" onClick={() => toggleSort("deliveryDate")}>
                  <div className="flex items-center gap-1">Delivery <ArrowUpDown size={12} /></div>
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const totalProgress = Math.round(
                  ((order.cuttingQty + order.stitchingQty + order.finishingQty + order.packedQty) / (order.totalQuantity * 4)) * 100
                );
                const nodeInfo = getOrderNodeInfo(order.status);

                return (
                  <tr key={order.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => {
                          setSelectedOrders(prev =>
                            prev.includes(order.id) ? prev.filter(id => id !== order.id) : [...prev, order.id]
                          );
                        }}
                        className="rounded border-slate-300"
                      />
                    </td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setLifecycleModalOrder(order)}>
                      <p className="font-semibold text-indigo-600 text-sm hover:underline">{order.orderNumber}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{order.buyerPO}</p>
                    </td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setLifecycleModalOrder(order)}>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-700 whitespace-nowrap">
                          {nodeInfo.nodeNumber}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]" title={nodeInfo.department}>
                          {nodeInfo.nodeName.split(" ")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setLifecycleModalOrder(order)}>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{order.buyerName}</p>
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5",
                        priorityColors[order.priority]
                      )}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setLifecycleModalOrder(order)}>
                      <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{order.styleName}</p>
                      <p className="text-xs text-slate-400 font-mono">{order.styleNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-sm text-slate-900 dark:text-white">
                      {formatNumber(order.totalQuantity)} pcs
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-sm text-slate-900 dark:text-white">
                      {formatCurrency((order as any).totalAmount ?? order.totalValue, order.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px] cursor-pointer" onClick={() => setLifecycleModalOrder(order)}>
                      <ProgressBar value={totalProgress} total={100} color={totalProgress > 75 ? "emerald" : "indigo"} />
                      <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                        <span>C: {order.cuttingQty}</span>
                        <span>S: {order.stitchingQty}</span>
                        <span>P: {order.packedQty}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {formatDate(order.deliveryDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === order.id ? null : order.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {showActionMenu === order.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowActionMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-scale-up">
                              {getNextStage(order.status).nextStatus && (
                                <button
                                  onClick={() => handleAdvanceStage(order.id)}
                                  className="flex items-center gap-2 px-3 py-2 w-full text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left"
                                >
                                  <ArrowRight size={14} /> Move to {getNextStage(order.status).label}
                                </button>
                              )}
                              {order.status !== "confirmed" && !["completed", "cancelled"].includes(order.status) && (
                                <button
                                  onClick={() => handleConfirmOrder(order.id, order.orderNumber)}
                                  className="flex items-center gap-2 px-3 py-2 w-full text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-left"
                                >
                                  <CheckCircle2 size={14} /> Confirm Order
                                </button>
                              )}
                              <button
                                onClick={() => { setShowActionMenu(null); setLifecycleModalOrder(order); }}
                                className="flex items-center gap-2 px-3 py-2 w-full text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                              >
                                <Eye size={14} /> View Order Dossier & Nodes
                              </button>
                              <Link
                                href={`${prefix}/invoices/new?orderId=${order.id}`}
                                className="flex items-center gap-2 px-3 py-2 w-full text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                              >
                                <Receipt size={14} /> Create GST Invoice
                              </Link>
                              <button
                                onClick={() => handleDuplicateOrder(order)}
                                className="flex items-center gap-2 px-3 py-2 w-full text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-left"
                              >
                                <Copy size={14} /> Duplicate Order
                              </button>
                              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                              {order.status !== "cancelled" && order.status !== "completed" && (
                                <button
                                  onClick={() => {
                                    setShowActionMenu(null);
                                    setCancelOrderTarget({ id: order.id, orderNo: order.orderNumber });
                                    setCancelReason("");
                                  }}
                                  className="flex items-center gap-2 px-3 py-2 w-full text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left font-medium"
                                >
                                  <Trash2 size={14} /> Cancel Order
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Manufacturing Workflow & Dual Labor Payment Hub Modal */}
      {lifecycleModalOrder && (
        <OrderManufacturingWorkflowModal
          order={lifecycleModalOrder}
          onClose={() => setLifecycleModalOrder(null)}
          onOrderUpdated={() => loadData()}
        />
      )}

      {/* Cancellation Confirmation Modal (Item 5) */}
      {cancelOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setCancelOrderTarget(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Cancel Production Order</h3>
                <p className="text-xs text-slate-500 font-mono">{cancelOrderTarget.orderNo}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to cancel order <strong className="text-slate-900 dark:text-white font-mono">{cancelOrderTarget.orderNo}</strong>? This action will freeze floor allocations, update the production pipeline, and log the event.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Cancellation Reason (Required for Audit Trail)
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Buyer changed delivery window, fabric defective, export license issue..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCancelOrderTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersView;
