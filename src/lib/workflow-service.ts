// ============================================================================
// GarmentFlow ERP — Central Workflow & State Service
// ============================================================================
import {
  Order,
  OrderStatus,
  Dispatch,
  QualityInspection,
  ProductionPlan,
  PackingList,
  FptRecord,
  GptRecord,
  SizeSetApproval,
  CutOrderReport,
  StitchingEndlineLog,
  FinishingStagePipeline,
  PieceWorkLog,
  Buyer,
  InventoryItem,
  FabricRoll,
  InventoryTransaction,
  MaterialIssueSlip,
  MaterialIssueItem,
  PurchaseOrder,
} from "./types";
import {
  orders as initialOrders,
  dispatches as initialDispatches,
  qualityInspections as initialInspections,
  productionPlans as initialPlans,
  buyers as initialBuyers,
  inventoryItems as initialInventoryItems,
  purchaseOrders as initialPurchaseOrders,
} from "./demo-data";

export const STORAGE_KEYS = {
  ORDERS: "garmentflow_orders",
  DISPATCHES: "garmentflow_dispatches",
  INSPECTIONS: "garmentflow_inspections",
  PLANS: "garmentflow_production_plans",
  PACKING_LISTS: "garmentflow_packing_lists",
  INVOICES: "garmentflow_invoices",
  FPT_RECORDS: "garmentflow_fpt_records",
  GPT_RECORDS: "garmentflow_gpt_records",
  SIZE_SET_RECORDS: "garmentflow_size_set_records",
  CUT_REPORTS: "garmentflow_cut_reports",
  ENDLINE_LOGS: "garmentflow_endline_logs",
  FINISHING_PIPELINES: "garmentflow_finishing_pipelines",
  PIECE_WORK_LOGS: "garmentflow_piece_work_logs",
  BUYERS: "garmentflow_buyers",
  INVENTORY_ITEMS: "garmentflow_inventory_items",
  FABRIC_ROLLS: "garmentflow_fabric_rolls",
  MATERIAL_ISSUES: "garmentflow_material_issues",
  INVENTORY_TRANSACTIONS: "garmentflow_inventory_transactions",
  PURCHASE_ORDERS: "garmentflow_purchase_orders",
};

// Custom broadcast event for real-time reactivity in client components
export const WORKFLOW_EVENT = "garmentflow:workflow_updated";

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(WORKFLOW_EVENT));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUYERS & CRM
// ─────────────────────────────────────────────────────────────────────────────
export function getStoredBuyers(): Buyer[] {
  if (typeof window === "undefined") return initialBuyers;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUYERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return initialBuyers;
}

export function saveStoredBuyer(buyer: Buyer): Buyer[] {
  const current = getStoredBuyers();
  const existsIndex = current.findIndex(b => b.id === buyer.id || b.code === buyer.code);
  let updated: Buyer[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = buyer;
  } else {
    updated = [buyer, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.BUYERS, JSON.stringify(updated));
    notifyUpdate();
  }
  return updated;
}

export function generateNextBuyerCode(): string {
  const current = getStoredBuyers();
  let maxNum = 0;
  for (const b of current) {
    if (!b.code) continue;
    const match = b.code.match(/BYR-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `BYR-${String(next).padStart(3, "0")}`;
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
  const updated = [newOrder, ...current.filter((o) => o.id !== newOrder.id)];
  saveOrders(updated);
  return updated;
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus, extraFields: Partial<Order> = {}) {
  const current = getStoredOrders();
  const updated = current.map((o) => {
    if (o.id === orderId) {
      return {
        ...o,
        status: newStatus,
        ...extraFields,
      };
    }
    return o;
  });
  saveOrders(updated);
  return updated;
}

export interface WorkflowStageItem {
  status: OrderStatus;
  label: string;
  department: string;
  nodeNumber: string;
  nodeName: string;
  panel: "Owner Portal" | "Factory Station" | "Admin Office";
  actionNote: string;
}

export const WORKFLOW_STAGES_SEQUENCE: WorkflowStageItem[] = [
  { status: "draft", label: "Draft Enquiry & Costing", department: "Merchandising", nodeNumber: "Node 01", nodeName: "Senior Merchandiser", panel: "Owner Portal", actionNote: "BOM costing sheet & tech pack" },
  { status: "awaiting-approval", label: "Management Approval", department: "Admin Management", nodeNumber: "Nodes 10-12", nodeName: "MD / Director / GM", panel: "Admin Office", actionNote: "Feasibility & margin validation" },
  { status: "confirmed", label: "Order Confirmed & Booked", department: "Merchandising", nodeNumber: "Node 01", nodeName: "Senior Merchandiser", panel: "Owner Portal", actionNote: "Production order registered" },
  { status: "fabric-inward", label: "Fabric & Trims Inward (GRN)", department: "Store & Warehouse", nodeNumber: "Node 03", nodeName: "Store In-charge", panel: "Factory Station", actionNote: "Rolls receipt & shade lot tagging" },
  { status: "fpt-testing", label: "Fabric Performance Test (FPT)", department: "Quality Testing Lab", nodeNumber: "Node 03B", nodeName: "Fabric QC Chemist", panel: "Factory Station", actionNote: "Shrinkage, GSM & Color Fastness check" },
  { status: "ppe-gpt", label: "PPE & Garment Performance Test (GPT)", department: "Quality Testing Lab", nodeNumber: "Node 03C", nodeName: "Garment Test Specialist", panel: "Factory Station", actionNote: "Wash appearance & seam strength test" },
  { status: "size-set-approval", label: "Size Set Approval Gate", department: "Sampling & Technical", nodeNumber: "Node 03D", nodeName: "Technical QA / Buyer", panel: "Owner Portal", actionNote: "Sample fit audit (Yes/No requirement gate)" },
  { status: "ready-for-cutting", label: "Raw Materials Issued to Cutting", department: "Store & Cutting", nodeNumber: "Node 04A", nodeName: "Store Issuer & Cutting Master", panel: "Factory Station", actionNote: "Fabric rolls & trims kit released to floor" },
  { status: "in-cutting", label: "Spreading & Cut Down", department: "Cutting Room", nodeNumber: "Node 04", nodeName: "Cutting Master", panel: "Factory Station", actionNote: "Multi-ply lay spreading & precision cutting" },
  { status: "cut-reported", label: "Order Cut Report Generated", department: "Cutting Room", nodeNumber: "Node 04B", nodeName: "Cutting Master & Auditor", panel: "Factory Station", actionNote: "Actual consumption, savings % & bundle ticketing" },
  { status: "in-stitching", label: "Sewing Line Assembly (Lines 1-6)", department: "Production Sewing", nodeNumber: "Node 05", nodeName: "Sewing Floor Supervisor", panel: "Factory Station", actionNote: "Bundle operation feeding & piece-rate work" },
  { status: "endline-checking", label: "Endline Checking & Alteration Loop", department: "Sewing Line QA", nodeNumber: "Node 05B", nodeName: "Endline Quality Auditor", panel: "Factory Station", actionNote: "100% garment audit: Pass / Alter / Damaged" },
  { status: "finishing-trims", label: "Stage 1: Bartack, Eyelet & Button", department: "Finishing Floor", nodeNumber: "Node 06A", nodeName: "Special Machine In-charge", panel: "Factory Station", actionNote: "Structural reinforcements & button attaching" },
  { status: "finishing-thread-trimming", label: "Stage 2: Thread Trimming", department: "Finishing Floor", nodeNumber: "Node 06B", nodeName: "Trimming Operators", panel: "Factory Station", actionNote: "Clean all loose thread ends inside/out" },
  { status: "finishing-press-1", label: "Stage 3: Steam Press 1", department: "Finishing Floor", nodeNumber: "Node 06C", nodeName: "Ironing Press Operators", panel: "Factory Station", actionNote: "First pass steam press & shape flattening" },
  { status: "finishing-initial-check", label: "Stage 4: Initial QC Inspection", department: "Finishing Floor QA", nodeNumber: "Node 06D", nodeName: "Initial QC Inspector", panel: "Factory Station", actionNote: "Pass to Final Press or route to Repair/Damage" },
  { status: "finishing-final-press", label: "Stage 5: Final Pressing", department: "Finishing Floor", nodeNumber: "Node 06E", nodeName: "Finish Press Specialists", panel: "Factory Station", actionNote: "Crease setting, collar/cuff high finish" },
  { status: "finishing-final-check", label: "Stage 6: Final QA Audit", department: "Finishing Floor QA", nodeNumber: "Node 06F", nodeName: "Final QA Inspector", panel: "Factory Station", actionNote: "Pre-packing final sign-off (Repair/Damage loop)" },
  { status: "in-packing", label: "Polybag, Tagging & Master Cartoning", department: "Packing & Dispatch", nodeNumber: "Node 07", nodeName: "Packing Officer", panel: "Factory Station", actionNote: "Barcode hangtag, fold polybag & carton packing" },
  { status: "ready-for-dispatch", label: "Delivery Challan & Gate Pass", department: "Packing & Dispatch", nodeNumber: "Node 07B", nodeName: "Shipping Officer", panel: "Factory Station", actionNote: "Finished goods store release & e-way bill" },
  { status: "dispatched", label: "Dispatched & In-Transit", department: "Shipping & Logistics", nodeNumber: "Node 07C", nodeName: "Transporter & Logistics", panel: "Factory Station", actionNote: "Vehicle loaded & container sealed" },
  { status: "completed", label: "Commercial GST Invoice & Payroll", department: "Accounts & HR", nodeNumber: "Nodes 08-09", nodeName: "Accounts & HR Executive", panel: "Owner Portal", actionNote: "Payment reconciliation & piece-rate wages settlement" }
];

export function getNextStage(currentStatus: OrderStatus): { nextStatus: OrderStatus | null; label: string } {
  switch (currentStatus) {
    case "draft":
      return { nextStatus: "awaiting-approval", label: "Submit for Approval" };
    case "awaiting-approval":
      return { nextStatus: "confirmed", label: "Confirm Order" };
    case "confirmed":
      return { nextStatus: "fabric-inward", label: "Inward Fabric & Trims (GRN)" };
    case "fabric-inward":
    case "material-planning":
    case "material-procurement":
      return { nextStatus: "fpt-testing", label: "Conduct Fabric Performance Test (FPT)" };
    case "fpt-testing":
      return { nextStatus: "ppe-gpt", label: "Conduct PPE & Garment Performance Test (GPT)" };
    case "ppe-gpt":
      return { nextStatus: "size-set-approval", label: "Size Set Approval Gate" };
    case "size-set-approval":
    case "ready-for-production":
      return { nextStatus: "ready-for-cutting", label: "Issue Raw Materials to Cutting" };
    case "ready-for-cutting":
      return { nextStatus: "in-cutting", label: "Start Spreading & Cutting" };
    case "in-cutting":
      return { nextStatus: "cut-reported", label: "Generate Order Cut Report" };
    case "cut-reported":
      return { nextStatus: "in-stitching", label: "Issue Bundles to Sewing Lines" };
    case "in-stitching":
    case "in-special-process":
      return { nextStatus: "endline-checking", label: "Send to Endline Checking" };
    case "endline-checking":
    case "stitching-alteration":
      return { nextStatus: "finishing-trims", label: "Pass to Finishing: Bartack & Button" };
    case "finishing-trims":
      return { nextStatus: "finishing-thread-trimming", label: "Pass to Thread Trimming" };
    case "finishing-thread-trimming":
      return { nextStatus: "finishing-press-1", label: "Pass to Initial Press 1" };
    case "finishing-press-1":
      return { nextStatus: "finishing-initial-check", label: "Submit for Initial Check QC" };
    case "finishing-initial-check":
    case "finishing-repair":
      return { nextStatus: "finishing-final-press", label: "Pass to Final Press" };
    case "finishing-final-press":
      return { nextStatus: "finishing-final-check", label: "Submit for Final Check QA" };
    case "finishing-final-check":
    case "in-finishing":
    case "in-quality":
      return { nextStatus: "in-packing", label: "Approve for Packing" };
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
  const target = current.find((o) => o.id === orderId);
  if (!target) return { updated: current, nextStatus: null, orderName: "" };

  const { nextStatus } = getNextStage(target.status);
  if (!nextStatus) return { updated: current, nextStatus: null, orderName: target.orderNumber };

  // Calculate realistic progressive quantities when advancing stages
  const updates: Partial<Order> = { status: nextStatus };
  const total = target.totalQuantity || 1000;

  if (nextStatus === "fpt-testing") {
    updates.fptStatus = "pending";
  } else if (nextStatus === "ppe-gpt") {
    updates.fptStatus = "pass";
    updates.gptStatus = "pending";
  } else if (nextStatus === "size-set-approval") {
    updates.gptStatus = "pass";
    updates.sizeSetRequired = target.sizeSetRequired !== undefined ? target.sizeSetRequired : true;
    updates.sizeSetStatus = "pending";
  } else if (nextStatus === "ready-for-cutting") {
    if (updates.sizeSetStatus !== "rejected") {
      updates.sizeSetStatus = "approved";
    }
  } else if (nextStatus === "in-cutting") {
    updates.cuttingQty = Math.round(total * 0.5);
  } else if (nextStatus === "cut-reported") {
    updates.cuttingQty = total;
  } else if (nextStatus === "in-stitching") {
    updates.cuttingQty = total;
    updates.stitchingQty = Math.round(total * 0.4);
  } else if (nextStatus === "endline-checking") {
    updates.cuttingQty = total;
    updates.stitchingQty = total;
  } else if (nextStatus === "finishing-trims" || nextStatus === "finishing-thread-trimming" || nextStatus === "finishing-press-1") {
    updates.stitchingQty = total;
    updates.finishingQty = Math.round(total * 0.3);
  } else if (nextStatus === "finishing-initial-check" || nextStatus === "finishing-final-press") {
    updates.stitchingQty = total;
    updates.finishingQty = Math.round(total * 0.7);
  } else if (nextStatus === "finishing-final-check") {
    updates.stitchingQty = total;
    updates.finishingQty = total;
  } else if (nextStatus === "in-packing") {
    updates.finishingQty = total;
    updates.packedQty = Math.round(total * 0.85);
  } else if (nextStatus === "ready-for-dispatch") {
    updates.packedQty = total;
  } else if (nextStatus === "dispatched") {
    updates.packedQty = total;
    updates.dispatchedQty = total;
  } else if (nextStatus === "completed") {
    updates.cuttingQty = total;
    updates.stitchingQty = total;
    updates.finishingQty = total;
    updates.packedQty = total;
    updates.dispatchedQty = total;
  }

  const updatedOrders = current.map((o) => (o.id === orderId ? { ...o, ...updates } : o));
  saveOrders(updatedOrders);
  return { updated: updatedOrders, nextStatus, orderName: target.orderNumber };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW QUALITY TESTING & AUDIT LOGS
// ─────────────────────────────────────────────────────────────────────────────

// Initial realistic testing records
const initialFptRecords: FptRecord[] = [
  {
    id: "fpt-1",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    lotNumber: "LOT-OXF-2025-01",
    fabricType: "100% Oxford Cotton White",
    shrinkageLength: -2.1,
    shrinkageWidth: -1.4,
    colorFastnessWash: 4.5,
    colorFastnessRubbing: 4.0,
    gsmRequired: 140,
    gsmActual: 142,
    status: "pass",
    testedBy: "Anil Saxena (Fabric Chemist)",
    testDate: "2025-06-12",
    remarks: "Dimensional stability within AATCC ±3% tolerance limit.",
  },
  {
    id: "fpt-2",
    orderId: "o2",
    orderNumber: "ORD-2025-0002",
    lotNumber: "LOT-GEO-2025-09",
    fabricType: "Poly Georgette Navy",
    shrinkageLength: -1.2,
    shrinkageWidth: -0.8,
    colorFastnessWash: 4.0,
    colorFastnessRubbing: 3.5,
    gsmRequired: 95,
    gsmActual: 96,
    status: "pass",
    testedBy: "Anil Saxena (Fabric Chemist)",
    testDate: "2025-06-18",
    remarks: "Dry rubbing pass 4.0, wet rubbing acceptable at 3.5.",
  },
];

const initialGptRecords: GptRecord[] = [
  {
    id: "gpt-1",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    washAppearance: "acceptable",
    seamStrength: 245,
    spiralityTorque: 2.1,
    status: "pass",
    testedBy: "Deepa Verma (Garment Lab)",
    testDate: "2025-06-14",
    remarks: "Post-wash appearance retains clean collar roll. Torque < 4% limit.",
  },
];

const initialSizeSetRecords: SizeSetApproval[] = [
  {
    id: "ss-1",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    isRequired: true,
    sampleCount: 5,
    buyerStatus: "approved",
    approvedBy: "Sarah Mitchell (Nordstrom Tech QA)",
    approvedDate: "2025-06-16",
    comments: "Size set approved across XS, S, M, L, XL with minor ease on armhole.",
  },
  {
    id: "ss-2",
    orderId: "o2",
    orderNumber: "ORD-2025-0002",
    isRequired: false,
    sampleCount: 0,
    buyerStatus: "waived",
    approvedBy: "James Thornton (M&S)",
    approvedDate: "2025-06-20",
    comments: "Repeat standard block size. Size set waived by buyer.",
  },
];

export function getStoredFptRecords(): FptRecord[] {
  if (typeof window === "undefined") return initialFptRecords;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FPT_RECORDS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.FPT_RECORDS, JSON.stringify(initialFptRecords));
    return initialFptRecords;
  } catch (e) {
    return initialFptRecords;
  }
}

export function saveFptRecord(record: FptRecord) {
  const current = getStoredFptRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.FPT_RECORDS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}

  // Update order's FPT status
  const orders = getStoredOrders();
  const ord = orders.find((o) => o.id === record.orderId || o.orderNumber === record.orderNumber);
  if (ord) {
    updateOrderStatus(ord.id, record.status === "pass" ? "ppe-gpt" : "fpt-testing", {
      fptStatus: record.status,
    });
  }
  return updated;
}

export function getStoredGptRecords(): GptRecord[] {
  if (typeof window === "undefined") return initialGptRecords;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GPT_RECORDS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.GPT_RECORDS, JSON.stringify(initialGptRecords));
    return initialGptRecords;
  } catch (e) {
    return initialGptRecords;
  }
}

export function saveGptRecord(record: GptRecord) {
  const current = getStoredGptRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.GPT_RECORDS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}

  // Update order's GPT status
  const orders = getStoredOrders();
  const ord = orders.find((o) => o.id === record.orderId || o.orderNumber === record.orderNumber);
  if (ord) {
    updateOrderStatus(ord.id, record.status === "pass" ? "size-set-approval" : "ppe-gpt", {
      gptStatus: record.status,
    });
  }
  return updated;
}

export function getStoredSizeSetRecords(): SizeSetApproval[] {
  if (typeof window === "undefined") return initialSizeSetRecords;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SIZE_SET_RECORDS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.SIZE_SET_RECORDS, JSON.stringify(initialSizeSetRecords));
    return initialSizeSetRecords;
  } catch (e) {
    return initialSizeSetRecords;
  }
}

export function saveSizeSetRecord(record: SizeSetApproval) {
  const current = getStoredSizeSetRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.SIZE_SET_RECORDS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}

  // Update order's status
  const orders = getStoredOrders();
  const ord = orders.find((o) => o.id === record.orderId || o.orderNumber === record.orderNumber);
  if (ord) {
    const targetStatus = !record.isRequired || record.buyerStatus === "approved" || record.buyerStatus === "waived"
      ? "ready-for-cutting"
      : "size-set-approval";
    updateOrderStatus(ord.id, targetStatus, {
      sizeSetRequired: record.isRequired,
      sizeSetStatus: record.buyerStatus,
    });
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDER CUT REPORTS & CONSUMPTION AUDIT
// ─────────────────────────────────────────────────────────────────────────────
const initialCutReports: CutOrderReport[] = [
  {
    id: "cut-rep-1",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    styleNumber: "GF-SH-2025-001",
    color: "White Oxford",
    markerLengthMtrs: 12.8,
    pliesCount: 100,
    plannedConsumptionMtrs: 1.65,
    actualConsumptionMtrs: 1.58,
    fabricSavingsPercent: 4.24,
    tableWastagePcs: 14,
    rejectionPcs: 6,
    totalCutPcs: 6020,
    sizeBreakup: { S: 1200, M: 2410, L: 1810, XL: 600 },
    bundlesGenerated: 60,
    cutDate: "2025-06-22",
    masterName: "Rajendra Singh (Master)",
  },
];

export function getStoredCutReports(): CutOrderReport[] {
  if (typeof window === "undefined") return initialCutReports;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUT_REPORTS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.CUT_REPORTS, JSON.stringify(initialCutReports));
    return initialCutReports;
  } catch (e) {
    return initialCutReports;
  }
}

export function saveCutOrderReport(report: CutOrderReport) {
  const current = getStoredCutReports();
  const updated = [report, ...current.filter((r) => r.id !== report.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.CUT_REPORTS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}

  // Update order's cuttingQty and status to cut-reported
  const orders = getStoredOrders();
  const ord = orders.find((o) => o.id === report.orderId || o.orderNumber === report.orderNumber);
  if (ord) {
    updateOrderStatus(ord.id, "cut-reported", {
      cuttingQty: report.totalCutPcs,
    });
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// STITCHING ENDLINE & ALTERATION LOGS
// ─────────────────────────────────────────────────────────────────────────────
const initialEndlineLogs: StitchingEndlineLog[] = [
  {
    id: "endline-1",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    lineId: "Line A",
    checkedPcs: 500,
    passedPcs: 472,
    alteredPcs: 24,
    repairedPcs: 22,
    damagedScrapPcs: 2,
    defects: [
      { type: "Broken Stitch at Placket", count: 12 },
      { type: "Uneven Sleeve Hem", count: 8 },
      { type: "Fabric Slub Cut", count: 2 },
    ],
    date: "2025-07-02",
  },
];

export function getStoredEndlineLogs(): StitchingEndlineLog[] {
  if (typeof window === "undefined") return initialEndlineLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENDLINE_LOGS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.ENDLINE_LOGS, JSON.stringify(initialEndlineLogs));
    return initialEndlineLogs;
  } catch (e) {
    return initialEndlineLogs;
  }
}

export function saveEndlineLog(log: StitchingEndlineLog) {
  const current = getStoredEndlineLogs();
  const updated = [log, ...current.filter((l) => l.id !== log.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.ENDLINE_LOGS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// FINISHING FLOOR 6-STAGE PIPELINE (Bartack/Eyelet/Button -> Thread Trimming -> Press 1 -> Initial Check -> Final Press -> Final Check)
// ─────────────────────────────────────────────────────────────────────────────
const initialFinishingPipelines: FinishingStagePipeline[] = [
  {
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    stage1TrimsDone: 5200,
    stage2ThreadTrimmed: 5100,
    stage3Press1Done: 4950,
    stage4InitialCheck: {
      inspected: 4950,
      passed: 4800,
      altered: 140,
      repaired: 135,
      damagedScrap: 5,
    },
    stage5FinalPress: 4800,
    stage6FinalCheck: {
      inspected: 4800,
      passed: 4760,
      altered: 38,
      repaired: 36,
      damagedScrap: 2,
    },
    readyForPacking: 4760,
  },
];

export function getStoredFinishingPipelines(): FinishingStagePipeline[] {
  if (typeof window === "undefined") return initialFinishingPipelines;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINISHING_PIPELINES);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.FINISHING_PIPELINES, JSON.stringify(initialFinishingPipelines));
    return initialFinishingPipelines;
  } catch (e) {
    return initialFinishingPipelines;
  }
}

export function saveFinishingPipeline(pipeline: FinishingStagePipeline) {
  const current = getStoredFinishingPipelines();
  const updated = [pipeline, ...current.filter((p) => p.orderNumber !== pipeline.orderNumber)];
  try {
    localStorage.setItem(STORAGE_KEYS.FINISHING_PIPELINES, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}

  // Synchronize finishing quantities on Order
  const orders = getStoredOrders();
  const ord = orders.find((o) => o.id === pipeline.orderId || o.orderNumber === pipeline.orderNumber);
  if (ord) {
    updateOrderStatus(ord.id, ord.status, {
      finishingQty: pipeline.readyForPacking,
    });
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// PIECE-RATE LOGGING & LABOR PAYMENT SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
const initialPieceWorkLogs: PieceWorkLog[] = [
  {
    id: "pw-1",
    workerId: "e16",
    workerCode: "GF-016",
    workerName: "Rekha Devi",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    operationName: "Collar Attachment & Topstitch",
    piecesCompleted: 350,
    piecesPassed: 345,
    piecesRejected: 5,
    ratePerPiece: 5.5,
    totalEarned: 345 * 5.5, // 1897.50
    date: "2025-07-10",
    shift: "A-Shift",
    verifiedBy: "Mohan Lal Saini (Line A Supervisor)",
  },
  {
    id: "pw-2",
    workerId: "e17",
    workerCode: "GF-017",
    workerName: "Sanjay Kumar",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    operationName: "Cuff Attachment & Button Placket",
    piecesCompleted: 400,
    piecesPassed: 392,
    piecesRejected: 8,
    ratePerPiece: 4.8,
    totalEarned: 392 * 4.8, // 1881.60
    date: "2025-07-10",
    shift: "A-Shift",
    verifiedBy: "Mohan Lal Saini (Line A Supervisor)",
  },
  {
    id: "pw-3",
    workerId: "e22",
    workerCode: "GF-022",
    workerName: "Kamla Devi",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    operationName: "Bartack & Button Stitch",
    piecesCompleted: 600,
    piecesPassed: 596,
    piecesRejected: 4,
    ratePerPiece: 2.5,
    totalEarned: 596 * 2.5, // 1490.00
    date: "2025-07-11",
    shift: "B-Shift",
    verifiedBy: "Sunita Kumari (Finishing QC)",
  },
  {
    id: "pw-4",
    workerId: "e24",
    workerCode: "GF-024",
    workerName: "Mamta Kumari",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    operationName: "Inside/Out Thread Trimming",
    piecesCompleted: 850,
    piecesPassed: 840,
    piecesRejected: 10,
    ratePerPiece: 1.2,
    totalEarned: 840 * 1.2, // 1008.00
    date: "2025-07-11",
    shift: "B-Shift",
    verifiedBy: "Sunita Kumari (Finishing QC)",
  },
  {
    id: "pw-5",
    workerId: "e16",
    workerCode: "GF-016",
    workerName: "Rekha Devi",
    orderId: "o2",
    orderNumber: "ORD-2025-0002",
    operationName: "Yoke Embroidery Attachment",
    piecesCompleted: 220,
    piecesPassed: 216,
    piecesRejected: 4,
    ratePerPiece: 8.0,
    totalEarned: 216 * 8.0, // 1728.00
    date: "2025-07-14",
    shift: "A-Shift",
    verifiedBy: "Bhanwar Lal (Line C Supervisor)",
  },
];

export function getStoredPieceWorkLogs(): PieceWorkLog[] {
  if (typeof window === "undefined") return initialPieceWorkLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PIECE_WORK_LOGS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.PIECE_WORK_LOGS, JSON.stringify(initialPieceWorkLogs));
    return initialPieceWorkLogs;
  } catch (e) {
    return initialPieceWorkLogs;
  }
}

export function savePieceWorkLog(pieceLog: PieceWorkLog) {
  const current = getStoredPieceWorkLogs();
  const updated = [pieceLog, ...current.filter((p) => p.id !== pieceLog.id)];
  try {
    localStorage.setItem(STORAGE_KEYS.PIECE_WORK_LOGS, JSON.stringify(updated));
    notifyUpdate();
  } catch (e) {}

  // Recalculate and update order labor cost
  const orderLogs = updated.filter((p) => p.orderNumber === pieceLog.orderNumber || p.orderId === pieceLog.orderId);
  const pieceRateTotal = orderLogs.reduce((acc, cur) => acc + (cur.totalEarned || 0), 0);
  
  const orders = getStoredOrders();
  const ord = orders.find((o) => o.id === pieceLog.orderId || o.orderNumber === pieceLog.orderNumber);
  if (ord) {
    // Hourly line support cost estimated at 40% of piece rate direct cost
    const hourlySupportCost = Math.round(pieceRateTotal * 0.4);
    const totalLaborCost = pieceRateTotal + hourlySupportCost;
    updateOrderStatus(ord.id, ord.status, {
      pieceRateLaborCost: pieceRateTotal,
      hourlyLaborCost: hourlySupportCost,
      actualCost: Math.max(ord.actualCost || 0, totalLaborCost + (ord.totalQuantity * 12)),
    });
  }

  return updated;
}

export function getOrderLaborCostSummary(orderNumber: string) {
  const logs = getStoredPieceWorkLogs().filter((p) => p.orderNumber === orderNumber);
  const pieceRateCost = logs.reduce((acc, cur) => acc + (cur.totalEarned || 0), 0);
  const piecesProduced = logs.reduce((acc, cur) => acc + (cur.piecesPassed || 0), 0);
  const hourlyLineSupport = Math.round(pieceRateCost * 0.4);
  const totalLaborCost = pieceRateCost + hourlyLineSupport;
  const unitLaborCost = piecesProduced > 0 ? (totalLaborCost / piecesProduced).toFixed(2) : "0.00";

  return {
    pieceRateCost,
    hourlyLineSupport,
    totalLaborCost,
    piecesProduced,
    unitLaborCost,
    logs,
  };
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
    const updatedOrders = ordersList.map((o) => {
      if (o.id === newDispatch.orderId || o.orderNumber === newDispatch.orderNumber) {
        return {
          ...o,
          status: "dispatched" as OrderStatus,
          dispatchedQty: Math.max(o.dispatchedQty || 0, newDispatch.quantity || o.totalQuantity),
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

  const updatedDispatches = currentDispatches.map((d) => {
    if (d.id === dispatchId) {
      affectedOrderId = d.orderId;
      affectedOrderNo = d.orderNumber;
      return {
        ...d,
        status: "pod-received" as const,
        deliveryDate: podDate,
        podReceivedDate: podDate,
        receiverName: receiverName || "Client Stores In-charge",
        remarks: remarks || "Received in good condition",
      };
    }
    return d;
  });
  saveDispatches(updatedDispatches);

  // Synchronize Order: mark as Completed
  if (affectedOrderId || affectedOrderNo) {
    const ordersList = getStoredOrders();
    const updatedOrders = ordersList.map((o) => {
      if (o.id === affectedOrderId || o.orderNumber === affectedOrderNo) {
        return {
          ...o,
          status: "completed" as OrderStatus,
          dispatchedQty: o.totalQuantity,
          packedQty: o.totalQuantity,
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
    const ord = ordersList.find((o) => o.id === newInspection.orderId || o.orderNumber === newInspection.orderNumber);
    if (ord && (ord.status === "in-quality" || ord.status === "in-finishing" || ord.status === "finishing-final-check")) {
      updateOrderStatus(ord.id, "in-packing");
    }
  }
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY, STORE, FABRIC ROLLS & MATERIAL ISSUES
// ─────────────────────────────────────────────────────────────────────────────

const initialFabricRolls: FabricRoll[] = [
  {
    id: "roll-1",
    rollNumber: "ROL-2025-0891",
    supplierId: "sup1",
    supplierName: "Vardhman Textiles Ltd.",
    poNumber: "PO-2025-0012",
    fabricType: "Oxford Cotton 60s",
    composition: "100% Combed Cotton",
    color: "Optic White",
    shade: "Shade Lot A1",
    lotNumber: "LOT-OXF-091",
    width: 58,
    gsm: 135,
    receivedLength: 120,
    acceptedLength: 120,
    rejectedLength: 0,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Rack A-01-B",
    inspectionStatus: "accepted",
    allocatedOrderId: "o1",
    status: "available",
  },
  {
    id: "roll-2",
    rollNumber: "ROL-2025-0892",
    supplierId: "sup1",
    supplierName: "Vardhman Textiles Ltd.",
    poNumber: "PO-2025-0012",
    fabricType: "Oxford Cotton 60s",
    composition: "100% Combed Cotton",
    color: "Optic White",
    shade: "Shade Lot A1",
    lotNumber: "LOT-OXF-091",
    width: 58,
    gsm: 135,
    receivedLength: 115,
    acceptedLength: 115,
    rejectedLength: 0,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Rack A-01-C",
    inspectionStatus: "accepted",
    allocatedOrderId: "o1",
    status: "available",
  },
  {
    id: "roll-3",
    rollNumber: "ROL-2025-0893",
    supplierId: "sup1",
    supplierName: "Vardhman Textiles Ltd.",
    poNumber: "PO-2025-0012",
    fabricType: "Oxford Cotton 60s",
    composition: "100% Combed Cotton",
    color: "Optic White",
    shade: "Shade Lot A2",
    lotNumber: "LOT-OXF-091",
    width: 58,
    gsm: 134,
    receivedLength: 125,
    acceptedLength: 125,
    rejectedLength: 0,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Rack A-02-A",
    inspectionStatus: "accepted",
    status: "available",
  },
  {
    id: "roll-4",
    rollNumber: "ROL-2025-0894",
    supplierId: "sup1",
    supplierName: "Vardhman Textiles Ltd.",
    poNumber: "PO-2025-0012",
    fabricType: "Oxford Cotton 60s",
    composition: "100% Combed Cotton",
    color: "Light Sky Blue",
    shade: "Shade Lot B1",
    lotNumber: "LOT-OXF-092",
    width: 58,
    gsm: 138,
    receivedLength: 100,
    acceptedLength: 98,
    rejectedLength: 2,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Rack A-03-A",
    inspectionStatus: "conditional",
    status: "available",
  },
  {
    id: "roll-5",
    rollNumber: "ROL-2025-0895",
    supplierId: "sup2",
    supplierName: "Arvind Mills Ltd.",
    poNumber: "PO-2025-0015",
    fabricType: "Stretch Denim 11oz",
    composition: "98% Cotton 2% Elastane",
    color: "Dark Indigo Raw",
    shade: "Shade Lot D1",
    lotNumber: "LOT-DNM-401",
    width: 60,
    gsm: 375,
    receivedLength: 85,
    acceptedLength: 85,
    rejectedLength: 0,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Rack B-01-A",
    inspectionStatus: "accepted",
    status: "available",
  },
  {
    id: "roll-6",
    rollNumber: "ROL-2025-0896",
    supplierId: "sup3",
    supplierName: "Banswara Syntex Ltd.",
    poNumber: "PO-2025-0018",
    fabricType: "Poly-Georgette High Twist",
    composition: "100% Polyester",
    color: "Midnight Navy",
    shade: "Shade Lot G1",
    lotNumber: "LOT-GEO-112",
    width: 44,
    gsm: 80,
    receivedLength: 140,
    acceptedLength: 140,
    rejectedLength: 0,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Rack C-02-B",
    inspectionStatus: "accepted",
    status: "available",
  },
  {
    id: "roll-7",
    rollNumber: "ROL-2025-0880",
    supplierId: "sup1",
    supplierName: "Vardhman Textiles Ltd.",
    poNumber: "PO-2025-0010",
    fabricType: "Oxford Cotton 60s",
    composition: "100% Combed Cotton",
    color: "Optic White",
    shade: "Shade Lot A1",
    lotNumber: "LOT-OXF-088",
    width: 58,
    gsm: 135,
    receivedLength: 110,
    acceptedLength: 110,
    rejectedLength: 0,
    warehouseId: "w1",
    warehouseName: "Main Factory Store",
    location: "Cutting Room Lay Floor",
    inspectionStatus: "accepted",
    allocatedOrderId: "o1",
    status: "issued",
  },
];

const initialMaterialIssues: MaterialIssueSlip[] = [
  {
    id: "mis-1",
    slipNumber: "MIS-2025-0041",
    issueDate: "2025-07-22",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    styleNumber: "STY-2025-001",
    department: "Cutting",
    requestedBy: "Rajendra Singh (Cutting Master)",
    issuedBy: "Ramesh Choudhary (Store In-charge)",
    receiverName: "Kailash Meena (Spreader / Lay In-charge)",
    status: "issued",
    items: [
      {
        id: "mii-1",
        itemId: "inv1",
        itemCode: "FAB-OXF-WHT",
        itemName: "Oxford Cotton Fabric - White",
        category: "Fabric",
        unit: "Meters",
        requestedQty: 1200,
        issuedQty: 1200,
        rollNumbers: ["ROL-2025-0880"],
        lotNumber: "LOT-OXF-088",
        remarks: "Issued for Lay 1 & 2 body panels",
      },
    ],
    totalQty: 1200,
    remarks: "Full cutting lay issuance for 1,200 pcs batch of Formal Shirts",
    gatePassNumber: "GP-2025-0182",
    createdAt: "2025-07-22T09:30:00",
  },
  {
    id: "mis-2",
    slipNumber: "MIS-2025-0042",
    issueDate: "2025-07-23",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    styleNumber: "STY-2025-001",
    department: "Stitching",
    requestedBy: "Suresh Yadav (Floor Supervisor Line A)",
    issuedBy: "Ramesh Choudhary (Store In-charge)",
    receiverName: "Mohan Lal Saini (Line A Supervisor)",
    status: "issued",
    items: [
      {
        id: "mii-2",
        itemId: "inv5",
        itemCode: "ACC-THR-WHT",
        itemName: "Coats Epic 120 Thread - White",
        category: "Accessories",
        unit: "Cone",
        requestedQty: 25,
        issuedQty: 25,
        remarks: "Line A 35 sewing machines setup",
      },
    ],
    totalQty: 25,
    remarks: "Sewing thread kit for ORD-2025-0001 Line A feeding",
    createdAt: "2025-07-23T11:15:00",
  },
  {
    id: "mis-3",
    slipNumber: "MIS-2025-0043",
    issueDate: "2025-07-24",
    orderId: "o3",
    orderNumber: "ORD-2025-0003",
    styleNumber: "STY-2025-003",
    department: "Cutting",
    requestedBy: "Rajendra Singh (Cutting Master)",
    issuedBy: "Ramesh Choudhary (Store In-charge)",
    receiverName: "Bhanwar Lal (Cutting Table 2)",
    status: "approved",
    items: [
      {
        id: "mii-3",
        itemId: "inv3",
        itemCode: "FAB-GEO-NVY",
        itemName: "Georgette Fabric - Navy",
        category: "Fabric",
        unit: "Meters",
        requestedQty: 850,
        issuedQty: 850,
        lotNumber: "LOT-GEO-110",
        remarks: "Printed georgette dresses cutting",
      },
      {
        id: "mii-4",
        itemId: "inv4",
        itemCode: "ACC-ZIP-NVY",
        itemName: "YKK Invisible Zipper 20cm - Navy",
        category: "Accessories",
        unit: "Pcs",
        requestedQty: 500,
        issuedQty: 500,
        remarks: "Matching color zipper bundles",
      },
    ],
    totalQty: 1350,
    remarks: "Approved for cutting and kitting tomorrow morning",
    createdAt: "2025-07-24T16:00:00",
  },
];

const initialInventoryTransactions: InventoryTransaction[] = [
  {
    id: "tx-1",
    transactionNumber: "TXN-2025-0912",
    type: "receipt",
    itemId: "inv1",
    itemName: "Oxford Cotton Fabric - White",
    quantity: 2500,
    unit: "Meters",
    warehouseTo: "Main Factory Store",
    referenceType: "GRN",
    referenceId: "GRN-2025-0112",
    userId: "u8",
    userName: "Ramesh Choudhary",
    remarks: "GRN received against PO-2025-0012 from Vardhman Textiles",
    createdAt: "2025-06-10T14:20:00",
  },
  {
    id: "tx-2",
    transactionNumber: "TXN-2025-0945",
    type: "issue",
    itemId: "inv1",
    itemName: "Oxford Cotton Fabric - White",
    quantity: 1200,
    unit: "Meters",
    warehouseFrom: "Main Factory Store",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    referenceType: "Material Issue Slip",
    referenceId: "MIS-2025-0041",
    userId: "u8",
    userName: "Ramesh Choudhary",
    remarks: "Fabric issued to Cutting Room for ORD-2025-0001",
    createdAt: "2025-07-22T09:30:00",
  },
  {
    id: "tx-3",
    transactionNumber: "TXN-2025-0952",
    type: "issue",
    itemId: "inv5",
    itemName: "Coats Epic 120 Thread - White",
    quantity: 25,
    unit: "Cone",
    warehouseFrom: "Main Factory Store",
    orderId: "o1",
    orderNumber: "ORD-2025-0001",
    referenceType: "Material Issue Slip",
    referenceId: "MIS-2025-0042",
    userId: "u8",
    userName: "Ramesh Choudhary",
    remarks: "Thread issued to Stitching Line A",
    createdAt: "2025-07-23T11:15:00",
  },
  {
    id: "tx-4",
    transactionNumber: "TXN-2025-0958",
    type: "adjustment",
    itemId: "inv4",
    itemName: "YKK Invisible Zipper 20cm - Navy",
    quantity: 50,
    unit: "Pcs",
    warehouseTo: "Main Factory Store",
    referenceType: "Physical Count Audit",
    referenceId: "AUD-2025-Q2",
    userId: "u8",
    userName: "Ramesh Choudhary",
    remarks: "Quarterly stock audit surplus reconciliation (+50 pcs)",
    createdAt: "2025-07-24T10:00:00",
  },
];

export function getStoredInventoryItems(): InventoryItem[] {
  if (typeof window === "undefined") return initialInventoryItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_ITEMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: InventoryItem) => ({
          ...item,
          warehouseId: "w1",
          warehouseName: "Main Factory Store",
        }));
      }
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(initialInventoryItems));
    return initialInventoryItems;
  } catch (e) {
    return initialInventoryItems;
  }
}

export function saveStoredInventoryItem(item: InventoryItem): InventoryItem[] {
  const current = getStoredInventoryItems();
  const existsIndex = current.findIndex((i) => i.id === item.id || i.itemCode === item.itemCode);
  let updated: InventoryItem[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = item;
  } else {
    updated = [item, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(updated));
    notifyUpdate();
  }
  return updated;
}

export function addInventoryItem(itemData: Omit<InventoryItem, "id">): InventoryItem {
  const current = getStoredInventoryItems();
  const id = `inv-${Date.now()}`;
  const newItem: InventoryItem = {
    ...itemData,
    id,
    stockValue: Math.round(itemData.currentStock * (itemData.avgPrice || itemData.lastPrice || 0)),
  };
  const updated = [newItem, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(updated));
    notifyUpdate();
  }
  return newItem;
}

export function adjustItemStock(
  itemId: string,
  deltaQty: number,
  type: "receipt" | "issue" | "adjustment",
  details: {
    orderId?: string;
    orderNumber?: string;
    remarks?: string;
    userName?: string;
    warehouse?: string;
    unitPrice?: number;
    referenceType?: string;
    referenceId?: string;
  } = {}
): { items: InventoryItem[]; transaction: InventoryTransaction } {
  const current = getStoredInventoryItems();
  let affectedItem: InventoryItem | null = null;

  const updated = current.map((i) => {
    if (i.id === itemId || i.itemCode === itemId) {
      const newStock = Math.max(0, i.currentStock + deltaQty);
      const newAvailable = Math.max(0, i.availableStock + deltaQty);
      const avgPrice = details.unitPrice && details.unitPrice > 0 ? (i.avgPrice + details.unitPrice) / 2 : i.avgPrice;
      const stockValue = Math.round(newStock * avgPrice);
      
      let status: InventoryItem["status"] = "in-stock";
      if (newStock === 0) status = "out-of-stock";
      else if (newStock <= i.reorderLevel) status = "low-stock";
      else if (newStock >= i.maxStock) status = "excess";

      affectedItem = {
        ...i,
        currentStock: newStock,
        availableStock: newAvailable,
        avgPrice,
        stockValue,
        status,
        lastReceiptDate: deltaQty > 0 ? new Date().toISOString().split("T")[0] : i.lastReceiptDate,
        lastIssueDate: deltaQty < 0 ? new Date().toISOString().split("T")[0] : i.lastIssueDate,
      };
      return affectedItem;
    }
    return i;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(updated));
  }

  // Record transaction
  const txNumber = `TXN-${Date.now().toString().slice(-6)}`;
  const transaction: InventoryTransaction = {
    id: `tx-${Date.now()}`,
    transactionNumber: txNumber,
    type,
    itemId,
    itemName: affectedItem ? (affectedItem as InventoryItem).itemName : itemId,
    quantity: Math.abs(deltaQty),
    unit: affectedItem ? (affectedItem as InventoryItem).unit : "Units",
    warehouseFrom: deltaQty < 0 ? (details.warehouse || (affectedItem as any)?.warehouseName || "Main Factory Store") : undefined,
    warehouseTo: deltaQty > 0 ? (details.warehouse || (affectedItem as any)?.warehouseName || "Main Factory Store") : undefined,
    orderId: details.orderId,
    orderNumber: details.orderNumber,
    referenceType: details.referenceType || (type === "receipt" ? "Goods Receipt Note (GRN)" : type === "issue" ? "Material Issue Slip" : "Stock Adjustment"),
    referenceId: details.referenceId || txNumber,
    userId: "current-user",
    userName: details.userName || "Store Master",
    remarks: details.remarks || `Stock ${type} of ${Math.abs(deltaQty)} units`,
    createdAt: new Date().toISOString(),
  };

  const currentTx = getStoredInventoryTransactions();
  const updatedTx = [transaction, ...currentTx];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_TRANSACTIONS, JSON.stringify(updatedTx));
    notifyUpdate();
  }

  return { items: updated, transaction };
}

export function getStoredFabricRolls(): FabricRoll[] {
  if (typeof window === "undefined") return initialFabricRolls;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FABRIC_ROLLS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((roll: FabricRoll) => ({
          ...roll,
          warehouseId: "w1",
          warehouseName: "Main Factory Store",
        }));
      }
    }
    localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(initialFabricRolls));
    return initialFabricRolls;
  } catch (e) {
    return initialFabricRolls;
  }
}

export function saveStoredFabricRoll(roll: FabricRoll): FabricRoll[] {
  const current = getStoredFabricRolls();
  const existsIndex = current.findIndex((r) => r.id === roll.id || r.rollNumber === roll.rollNumber);
  let updated: FabricRoll[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = roll;
  } else {
    updated = [roll, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(updated));
    notifyUpdate();
  }
  return updated;
}

export function addFabricRoll(rollData: Omit<FabricRoll, "id">): FabricRoll {
  const current = getStoredFabricRolls();
  const newRoll: FabricRoll = {
    ...rollData,
    id: `roll-${Date.now()}`,
  };
  const updated = [newRoll, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(updated));
    notifyUpdate();
  }
  return newRoll;
}

export function getStoredMaterialIssues(): MaterialIssueSlip[] {
  if (typeof window === "undefined") return initialMaterialIssues;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATERIAL_ISSUES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.MATERIAL_ISSUES, JSON.stringify(initialMaterialIssues));
    return initialMaterialIssues;
  } catch (e) {
    return initialMaterialIssues;
  }
}

export function saveMaterialIssue(issue: MaterialIssueSlip): MaterialIssueSlip[] {
  const current = getStoredMaterialIssues();
  const existsIndex = current.findIndex((m) => m.id === issue.id || m.slipNumber === issue.slipNumber);
  let updated: MaterialIssueSlip[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = issue;
  } else {
    updated = [issue, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.MATERIAL_ISSUES, JSON.stringify(updated));
    notifyUpdate();
  }
  return updated;
}

export function createMaterialIssue(
  slipData: Omit<MaterialIssueSlip, "id" | "slipNumber" | "createdAt">
): MaterialIssueSlip {
  const currentSlips = getStoredMaterialIssues();
  const nextSlipNum = generateNextIssueSlipNumber();
  const newSlip: MaterialIssueSlip = {
    ...slipData,
    id: `mis-${Date.now()}`,
    slipNumber: nextSlipNum,
    createdAt: new Date().toISOString(),
  };

  // Deduct inventory items stock
  slipData.items.forEach((item) => {
    adjustItemStock(item.itemId, -Math.abs(item.issuedQty), "issue", {
      orderId: slipData.orderId,
      orderNumber: slipData.orderNumber,
      remarks: `Material Issue ${nextSlipNum} to ${slipData.department}: ${item.remarks || ""}`,
      userName: slipData.issuedBy,
      referenceType: "Material Issue Slip",
      referenceId: nextSlipNum,
    });

    // If specific fabric rolls were issued, mark them as issued in Fabric Roll Master
    if (item.rollNumbers && item.rollNumbers.length > 0) {
      const rolls = getStoredFabricRolls();
      const updatedRolls = rolls.map((r) => {
        if (item.rollNumbers?.includes(r.rollNumber)) {
          return {
            ...r,
            status: "issued" as const,
            allocatedOrderId: slipData.orderId || r.allocatedOrderId,
            location: `${slipData.department} Floor`,
          };
        }
        return r;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.FABRIC_ROLLS, JSON.stringify(updatedRolls));
      }
    }
  });

  const updatedSlips = [newSlip, ...currentSlips];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.MATERIAL_ISSUES, JSON.stringify(updatedSlips));
    notifyUpdate();
  }

  return newSlip;
}

export function getStoredInventoryTransactions(): InventoryTransaction[] {
  if (typeof window === "undefined") return initialInventoryTransactions;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY_TRANSACTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.INVENTORY_TRANSACTIONS, JSON.stringify(initialInventoryTransactions));
    return initialInventoryTransactions;
  } catch (e) {
    return initialInventoryTransactions;
  }
}

export function generateNextIssueSlipNumber(): string {
  const current = getStoredMaterialIssues();
  let maxNum = 43;
  for (const s of current) {
    if (!s.slipNumber) continue;
    const match = s.slipNumber.match(/MIS-\d+-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  const year = new Date().getFullYear();
  return `MIS-${year}-${String(next).padStart(4, "0")}`;
}

export function generateNextItemCode(category: string): string {
  const current = getStoredInventoryItems();
  let prefix = "RAW";
  if (category.toLowerCase().includes("fabric")) prefix = "FAB";
  else if (category.toLowerCase().includes("access")) prefix = "ACC";
  else if (category.toLowerCase().includes("pack")) prefix = "PKG";
  else if (category.toLowerCase().includes("chem") || category.toLowerCase().includes("wash")) prefix = "CHM";

  const count = current.filter((i) => i.itemCode?.startsWith(prefix)).length + 1;
  return `${prefix}-GEN-${String(count).padStart(3, "0")}`;
}

export function generateNextRollNumber(): string {
  const rolls = getStoredFabricRolls();
  let maxNum = 896;
  for (const r of rolls) {
    const match = r.rollNumber.match(/ROL-\d+-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  const year = new Date().getFullYear();
  return `ROL-${year}-${String(next).padStart(4, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PURCHASE ORDERS (PROCUREMENT)
// ─────────────────────────────────────────────────────────────────────────────

export function getStoredPurchaseOrders(): PurchaseOrder[] {
  if (typeof window === "undefined") return initialPurchaseOrders;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(initialPurchaseOrders));
    return initialPurchaseOrders;
  } catch (e) {
    return initialPurchaseOrders;
  }
}

export function saveStoredPurchaseOrder(po: PurchaseOrder): PurchaseOrder[] {
  const current = getStoredPurchaseOrders();
  const existsIndex = current.findIndex((p) => p.id === po.id || p.poNumber === po.poNumber);
  let updated: PurchaseOrder[];
  if (existsIndex >= 0) {
    updated = [...current];
    updated[existsIndex] = po;
  } else {
    updated = [po, ...current];
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(updated));
    notifyUpdate();
  }
  return updated;
}

export function addPurchaseOrder(poData: Omit<PurchaseOrder, "id">): PurchaseOrder {
  const current = getStoredPurchaseOrders();
  const newPO: PurchaseOrder = {
    ...poData,
    id: `po-${Date.now()}`,
  };
  const updated = [newPO, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(updated));
    notifyUpdate();
  }
  return newPO;
}

export function generateNextPoNumber(): string {
  const current = getStoredPurchaseOrders();
  let maxNum = 248;
  for (const po of current) {
    if (!po.poNumber) continue;
    const match = po.poNumber.match(/PO-\d+-(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  const year = new Date().getFullYear();
  return `PO-${year}-${String(next).padStart(4, "0")}`;
}


