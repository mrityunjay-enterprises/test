// ============================================================================
// GarmentFlow ERP — Central Workflow & State Service
// ============================================================================
import { Order, OrderStatus, Dispatch, QualityInspection, ProductionPlan, PackingList } from "./types";
import { orders as initialOrders, dispatches as initialDispatches, qualityInspections as initialInspections, productionPlans as initialPlans } from "./demo-data";

export const STORAGE_KEYS = {
  ORDERS: "garmentflow_orders",
  DISPATCHES: "garmentflow_dispatches",
  INSPECTIONS: "garmentflow_inspections",
  PLANS: "garmentflow_production_plans",
  PACKING_LISTS: "garmentflow_packing_lists",
  INVOICES: "garmentflow_invoices",
};

// Custom broadcast event for real-time reactivity in client components
export const WORKFLOW_EVENT = "garmentflow:workflow_updated";

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WORKFLOW_EVENT));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────
export function getStoredOrders(): Order[] {
  if (typeof window === "undefined") return initialOrders;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // Seed initial orders into localStorage on first load
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
    return initialOrders;
  } catch (e) {
    console.error("Error reading stored orders:", e);
    return initialOrders;
  }
}

export function saveOrders(ordersList: Order[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ordersList));
    notifyUpdate();
  } catch (e) {
    console.error("Error saving orders:", e);
  }
}

export function addOrder(newOrder: Order) {
  const current = getStoredOrders();
  const updated = [newOrder, ...current.filter(o => o.id !== newOrder.id)];
  saveOrders(updated);
  return updated;
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus, extraFields: Partial<Order> = {}) {
  const current = getStoredOrders();
  const updated = current.map(o => {
    if (o.id === orderId) {
      return {
        ...o,
        status: newStatus,
        ...extraFields
      };
    }
    return o;
  });
  saveOrders(updated);
  return updated;
}

export const WORKFLOW_STAGES_SEQUENCE: { status: OrderStatus; label: string; department: string }[] = [
  { status: "draft", label: "Draft Enquiry", department: "Merchandising" },
  { status: "awaiting-approval", label: "Awaiting Approval", department: "Management" },
  { status: "confirmed", label: "Order Confirmed", department: "Merchandising" },
  { status: "material-procurement", label: "Material Sourcing & Testing", department: "Procurement / Store" },
  { status: "ready-for-production", label: "PPC Scheduled", department: "PPC" },
  { status: "in-cutting", label: "In Cutting Room", department: "Cutting" },
  { status: "in-stitching", label: "In Sewing Assembly", department: "Stitching Floor" },
  { status: "in-finishing", label: "In Finishing & Pressing", department: "Finishing" },
  { status: "in-quality", label: "Final Quality AQL Audit", department: "Quality Assurance" },
  { status: "in-packing", label: "In Packing & Cartoning", department: "Packing" },
  { status: "ready-for-dispatch", label: "Ready for Dispatch", department: "Finished Goods Store" },
  { status: "dispatched", label: "Dispatched & In-Transit", department: "Logistics" },
  { status: "completed", label: "Delivered & Completed", department: "Commercial" }
];

export function getNextStage(currentStatus: OrderStatus): { nextStatus: OrderStatus | null; label: string } {
  switch (currentStatus) {
    case "draft":
      return { nextStatus: "awaiting-approval", label: "Submit for Approval" };
    case "awaiting-approval":
      return { nextStatus: "confirmed", label: "Confirm Order" };
    case "confirmed":
      return { nextStatus: "material-procurement", label: "Start Material Procurement" };
    case "material-planning":
    case "material-procurement":
      return { nextStatus: "ready-for-production", label: "Complete Sourcing & Schedule PPC" };
    case "ready-for-production":
      return { nextStatus: "in-cutting", label: "Release to Cutting Room" };
    case "in-cutting":
      return { nextStatus: "in-stitching", label: "Issue Bundles to Sewing Lines" };
    case "in-stitching":
    case "in-special-process":
      return { nextStatus: "in-finishing", label: "Handover to Finishing" };
    case "in-finishing":
      return { nextStatus: "in-quality", label: "Submit for Final Quality Audit" };
    case "in-quality":
      return { nextStatus: "in-packing", label: "Pass QA & Start Packing" };
    case "in-packing":
      return { nextStatus: "ready-for-dispatch", label: "Finish Packing & Move to FG Store" };
    case "ready-for-dispatch":
      return { nextStatus: "dispatched", label: "Dispatch Vehicle" };
    case "dispatched":
    case "partially-dispatched":
      return { nextStatus: "completed", label: "Confirm Delivery (Upload POD)" };
    case "completed":
    default:
      return { nextStatus: null, label: "Order Completed" };
  }
}

export function advanceOrderWorkflow(orderId: string): { updated: Order[]; nextStatus: OrderStatus | null; orderName: string } {
  const current = getStoredOrders();
  const target = current.find(o => o.id === orderId);
  if (!target) return { updated: current, nextStatus: null, orderName: "" };

  const { nextStatus } = getNextStage(target.status);
  if (!nextStatus) return { updated: current, nextStatus: null, orderName: target.orderNumber };

  // Calculate realistic progressive quantities when advancing stages
  const updates: Partial<Order> = { status: nextStatus };
  if (nextStatus === "in-cutting") {
    updates.cuttingQty = target.totalQuantity;
  } else if (nextStatus === "in-stitching") {
    updates.cuttingQty = target.totalQuantity;
    updates.stitchingQty = Math.round(target.totalQuantity * 0.4);
  } else if (nextStatus === "in-finishing") {
    updates.cuttingQty = target.totalQuantity;
    updates.stitchingQty = target.totalQuantity;
    updates.finishingQty = Math.round(target.totalQuantity * 0.5);
  } else if (nextStatus === "in-quality") {
    updates.stitchingQty = target.totalQuantity;
    updates.finishingQty = target.totalQuantity;
  } else if (nextStatus === "in-packing") {
    updates.finishingQty = target.totalQuantity;
    updates.packedQty = Math.round(target.totalQuantity * 0.7);
  } else if (nextStatus === "ready-for-dispatch") {
    updates.packedQty = target.totalQuantity;
  } else if (nextStatus === "dispatched") {
    updates.packedQty = target.totalQuantity;
    updates.dispatchedQty = target.totalQuantity;
  } else if (nextStatus === "completed") {
    updates.cuttingQty = target.totalQuantity;
    updates.stitchingQty = target.totalQuantity;
    updates.finishingQty = target.totalQuantity;
    updates.packedQty = target.totalQuantity;
    updates.dispatchedQty = target.totalQuantity;
  }

  const updatedOrders = current.map(o => o.id === orderId ? { ...o, ...updates } : o);
  saveOrders(updatedOrders);
  return { updated: updatedOrders, nextStatus, orderName: target.orderNumber };
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPATCHES
// ─────────────────────────────────────────────────────────────────────────────
export function getStoredDispatches(): Dispatch[] {
  if (typeof window === "undefined") return initialDispatches;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DISPATCHES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(initialDispatches));
    return initialDispatches;
  } catch (e) {
    return initialDispatches;
  }
}

export function saveDispatches(dispatches: Dispatch[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(dispatches));
    notifyUpdate();
  } catch (e) {
    console.error("Error saving dispatches:", e);
  }
}

export function recordNewDispatch(newDispatch: Dispatch) {
  const currentDispatches = getStoredDispatches();
  const updatedDispatches = [newDispatch, ...currentDispatches];
  saveDispatches(updatedDispatches);

  // Synchronize Order: mark as Dispatched
  if (newDispatch.orderId || newDispatch.orderNumber) {
    const ordersList = getStoredOrders();
    const updatedOrders = ordersList.map(o => {
      if (o.id === newDispatch.orderId || o.orderNumber === newDispatch.orderNumber) {
        return {
          ...o,
          status: "dispatched" as OrderStatus,
          dispatchedQty: Math.max(o.dispatchedQty || 0, newDispatch.quantity || o.totalQuantity)
        };
      }
      return o;
    });
    saveOrders(updatedOrders);
  }

  return updatedDispatches;
}

export function markDispatchPODReceived(dispatchId: string, podDate: string, receiverName: string, remarks?: string) {
  const currentDispatches = getStoredDispatches();
  let affectedOrderId: string | null = null;
  let affectedOrderNo: string | null = null;

  const updatedDispatches = currentDispatches.map(d => {
    if (d.id === dispatchId) {
      affectedOrderId = d.orderId;
      affectedOrderNo = d.orderNumber;
      return {
        ...d,
        status: "pod-received" as const,
        deliveryDate: podDate,
        podReceivedDate: podDate,
        receiverName: receiverName || "Client Stores In-charge",
        remarks: remarks || "Received in good condition"
      };
    }
    return d;
  });
  saveDispatches(updatedDispatches);

  // Synchronize Order: mark as Completed
  if (affectedOrderId || affectedOrderNo) {
    const ordersList = getStoredOrders();
    const updatedOrders = ordersList.map(o => {
      if (o.id === affectedOrderId || o.orderNumber === affectedOrderNo) {
        return {
          ...o,
          status: "completed" as OrderStatus,
          dispatchedQty: o.totalQuantity,
          packedQty: o.totalQuantity
        };
      }
      return o;
    });
    saveOrders(updatedOrders);
  }

  return updatedDispatches;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY INSPECTIONS
// ─────────────────────────────────────────────────────────────────────────────
export function getStoredInspections(): QualityInspection[] {
  if (typeof window === "undefined") return initialInspections;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(initialInspections));
    return initialInspections;
  } catch (e) {
    return initialInspections;
  }
}

export function saveInspection(newInspection: QualityInspection) {
  const current = getStoredInspections();
  const updated = [newInspection, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {
    console.error("Error saving inspection:", e);
  }

  // Update order's quality status if passed
  if (newInspection.decision === "pass" || newInspection.decision === "conditional-pass") {
    const ordersList = getStoredOrders();
    const ord = ordersList.find(o => o.id === newInspection.orderId || o.orderNumber === newInspection.orderNumber);
    if (ord && (ord.status === "in-quality" || ord.status === "in-finishing")) {
      updateOrderStatus(ord.id, "in-packing");
    }
  }
  return updated;
}
