"use client";

import React, { useState, useEffect } from "react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import {
  Order,
  OrderStatus,
  FptRecord,
  GptRecord,
  SizeSetApproval,
  CutOrderReport,
  StitchingEndlineLog,
  FinishingStagePipeline,
  PieceWorkLog,
  Employee,
} from "@/lib/types";
import {
  getStoredOrders,
  updateOrderStatus,
  getStoredFptRecords,
  saveFptRecord,
  getStoredGptRecords,
  saveGptRecord,
  getStoredSizeSetRecords,
  saveSizeSetRecord,
  getStoredCutReports,
  saveCutOrderReport,
  getStoredEndlineLogs,
  saveEndlineLog,
  getStoredFinishingPipelines,
  saveFinishingPipeline,
  getStoredPieceWorkLogs,
  savePieceWorkLog,
  getOrderLaborCostSummary,
  WORKFLOW_EVENT,
  WORKFLOW_STAGES_SEQUENCE,
  getNextStage,
} from "@/lib/workflow-service";
import { employees as initialEmployees } from "@/lib/demo-data";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Scissors,
  ShieldCheck,
  RotateCcw,
  Layers,
  Package,
  Truck,
  DollarSign,
  Clock,
  ArrowRight,
  Check,
  Sparkles,
  FileText,
  Plus,
  RefreshCw,
  Building,
  User,
  FlaskConical,
  Flame,
  Shirt,
  Download,
} from "lucide-react";

interface Props {
  order: Order;
  onClose: () => void;
  onOrderUpdated?: (updated: Order) => void;
}

export function OrderManufacturingWorkflowModal({ order: initialOrder, onClose, onOrderUpdated }: Props) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [activeTab, setActiveTab] = useState<
    "overview" | "testing" | "cutting" | "stitching" | "finishing" | "labor-payment"
  >("overview");
  const [notification, setNotification] = useState<string | null>(null);

  // Sub-records state
  const [fpt, setFpt] = useState<FptRecord | null>(null);
  const [gpt, setGpt] = useState<GptRecord | null>(null);
  const [sizeSet, setSizeSet] = useState<SizeSetApproval | null>(null);
  const [cutReport, setCutReport] = useState<CutOrderReport | null>(null);
  const [endlineLog, setEndlineLog] = useState<StitchingEndlineLog | null>(null);
  const [finishing, setFinishing] = useState<FinishingStagePipeline | null>(null);
  const [pieceLogs, setPieceLogs] = useState<PieceWorkLog[]>([]);
  const [employeesList, setEmployeesList] = useState<Employee[]>(initialEmployees);

  // New Piece Work Log Form
  const [newLogWorkerId, setNewLogWorkerId] = useState("");
  const [newLogOpName, setNewLogOpName] = useState("Collar Attachment");
  const [newLogPcsCompleted, setNewLogPcsCompleted] = useState(250);
  const [newLogPcsPassed, setNewLogPcsPassed] = useState(246);
  const [newLogRate, setNewLogRate] = useState(5.5);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Load sub-records for this specific order
  const refreshRecords = () => {
    const orders = getStoredOrders();
    const currentOrd = orders.find((o) => o.id === order.id || o.orderNumber === order.orderNumber) || order;
    setOrder(currentOrd);

    const allFpt = getStoredFptRecords();
    setFpt(allFpt.find((r) => r.orderNumber === currentOrd.orderNumber) || null);

    const allGpt = getStoredGptRecords();
    setGpt(allGpt.find((r) => r.orderNumber === currentOrd.orderNumber) || null);

    const allSizeSet = getStoredSizeSetRecords();
    setSizeSet(allSizeSet.find((r) => r.orderNumber === currentOrd.orderNumber) || null);

    const allCut = getStoredCutReports();
    setCutReport(allCut.find((r) => r.orderNumber === currentOrd.orderNumber) || null);

    const allEndline = getStoredEndlineLogs();
    setEndlineLog(allEndline.find((r) => r.orderNumber === currentOrd.orderNumber) || null);

    const allFinishing = getStoredFinishingPipelines();
    setFinishing(allFinishing.find((r) => r.orderNumber === currentOrd.orderNumber) || null);

    const allPiece = getStoredPieceWorkLogs();
    setPieceLogs(allPiece.filter((p) => p.orderNumber === currentOrd.orderNumber));

    try {
      const savedEmps = localStorage.getItem("garmentflow_employees");
      if (savedEmps) setEmployeesList(JSON.parse(savedEmps));
    } catch (e) {}
  };

  useEffect(() => {
    refreshRecords();
    const handleSync = () => refreshRecords();
    window.addEventListener(WORKFLOW_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [order.id, order.orderNumber]);

  // 1. Advance to next stage helper
  const handleAdvanceStatus = (targetStatus: OrderStatus) => {
    updateOrderStatus(order.id, targetStatus);
    const updated = { ...order, status: targetStatus };
    setOrder(updated);
    if (onOrderUpdated) onOrderUpdated(updated);
    showToast(`Order status updated to: ${targetStatus.replace(/-/g, " ").toUpperCase()}`);
    refreshRecords();
  };

  // 2. FPT Pass/Fail Action
  const handleSaveFpt = (status: "pass" | "fail") => {
    const newRecord: FptRecord = {
      id: fpt?.id || `fpt_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      lotNumber: fpt?.lotNumber || "LOT-MEPL-2026-A1",
      fabricType: "Cotton / Poly Blend - Verified GSM",
      shrinkageLength: -2.0,
      shrinkageWidth: -1.5,
      colorFastnessWash: status === "pass" ? 4.5 : 2.5,
      colorFastnessRubbing: status === "pass" ? 4.0 : 2.0,
      gsmRequired: 160,
      gsmActual: status === "pass" ? 162 : 142,
      status,
      testedBy: "Anil Saxena (Fabric Chemist)",
      testDate: new Date().toISOString().split("T")[0],
      remarks: status === "pass" ? "Passed AATCC dimensional & color fastness tests." : "Failed rubbing fastness. Re-wash required.",
    };
    saveFptRecord(newRecord);
    setFpt(newRecord);
    showToast(status === "pass" ? "FPT PASSED! Advanced to PPE & GPT Testing." : "FPT Failed recorded.");
    refreshRecords();
  };

  // 3. GPT Pass/Fail Action
  const handleSaveGpt = (status: "pass" | "fail") => {
    const newRecord: GptRecord = {
      id: gpt?.id || `gpt_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      washAppearance: status === "pass" ? "acceptable" : "defect",
      seamStrength: status === "pass" ? 260 : 140,
      spiralityTorque: status === "pass" ? 2.3 : 6.8,
      status,
      testedBy: "Deepa Verma (Garment Lab)",
      testDate: new Date().toISOString().split("T")[0],
      remarks: status === "pass" ? "Seam strength > 200N. Low spirality." : "Excessive torque spirality post wash.",
    };
    saveGptRecord(newRecord);
    setGpt(newRecord);
    showToast(status === "pass" ? "GPT PASSED! Moved to Size Set Approval Gate." : "GPT Failed recorded.");
    refreshRecords();
  };

  // 4. Size Set Gate Action (Yes/No requirement and approval)
  const handleSaveSizeSet = (isRequired: boolean, buyerStatus: SizeSetApproval["buyerStatus"]) => {
    const newRecord: SizeSetApproval = {
      id: sizeSet?.id || `ss_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      isRequired,
      sampleCount: isRequired ? 5 : 0,
      buyerStatus,
      approvedBy: buyerStatus === "approved" ? "Buyer Technical QA Desk" : undefined,
      approvedDate: new Date().toISOString().split("T")[0],
      comments: !isRequired
        ? "Size set not required by client. Direct cutting approved."
        : buyerStatus === "approved"
        ? "Size set fit approved across all size specs."
        : "Pending sample clearance.",
    };
    saveSizeSetRecord(newRecord);
    setSizeSet(newRecord);
    showToast(
      !isRequired || buyerStatus === "approved" || buyerStatus === "waived"
        ? "Gate Passed! Advanced to Ready for Cutting."
        : "Size set status updated."
    );
    refreshRecords();
  };

  // 5. Generate Cut Order Report Action
  const handleGenerateCutReport = () => {
    const totalPcs = order.totalQuantity || 5000;
    const report: CutOrderReport = {
      id: cutReport?.id || `cut_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      styleNumber: order.styleNumber || "GF-2026",
      color: "Primary Shade",
      markerLengthMtrs: 14.5,
      pliesCount: 100,
      plannedConsumptionMtrs: 1.65,
      actualConsumptionMtrs: 1.58,
      fabricSavingsPercent: 4.24,
      tableWastagePcs: 12,
      rejectionPcs: 4,
      totalCutPcs: totalPcs,
      sizeBreakup: { S: Math.round(totalPcs * 0.2), M: Math.round(totalPcs * 0.4), L: Math.round(totalPcs * 0.3), XL: Math.round(totalPcs * 0.1) },
      bundlesGenerated: Math.round(totalPcs / 50),
      cutDate: new Date().toISOString().split("T")[0],
      masterName: "Rajendra Singh (Master)",
    };
    saveCutOrderReport(report);
    setCutReport(report);
    showToast(`Order Cut Report generated! ${totalPcs} cut pieces ready for sewing lines.`);
    refreshRecords();
  };

  // 6. Stitching Endline Checking Action (Increment Good, Alter, Repaired, Damaged)
  const handleEndlineIncrement = (type: "good" | "alter" | "repaired" | "damaged") => {
    const cur = endlineLog || {
      id: `endline_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      lineId: "Line A",
      checkedPcs: 0,
      passedPcs: 0,
      alteredPcs: 0,
      repairedPcs: 0,
      damagedScrapPcs: 0,
      defects: [],
      date: new Date().toISOString().split("T")[0],
    };

    let checked = cur.checkedPcs;
    let passed = cur.passedPcs;
    let altered = cur.alteredPcs;
    let repaired = cur.repairedPcs;
    let damaged = cur.damagedScrapPcs;

    if (type === "good") {
      checked += 10;
      passed += 10;
    } else if (type === "alter") {
      checked += 5;
      altered += 5;
    } else if (type === "repaired") {
      // Repaired moves from altered into passed
      if (altered >= 5) {
        altered -= 5;
        repaired += 5;
        passed += 5;
      }
    } else if (type === "damaged") {
      // Unrepairable scrap
      if (altered >= 2) altered -= 2;
      damaged += 2;
    }

    const updatedLog: StitchingEndlineLog = {
      ...cur,
      checkedPcs: checked,
      passedPcs: passed,
      alteredPcs: altered,
      repairedPcs: repaired,
      damagedScrapPcs: damaged,
    };
    saveEndlineLog(updatedLog);
    setEndlineLog(updatedLog);
    refreshRecords();
  };

  // 7. Finishing Floor Stage Increment Action
  const handleFinishingStep = (stage: "stage1" | "stage2" | "stage3" | "stage4_pass" | "stage4_repair" | "stage5" | "stage6_pass") => {
    const baseTotal = order.totalQuantity || 5000;
    const cur = finishing || {
      orderId: order.id,
      orderNumber: order.orderNumber,
      stage1TrimsDone: 0,
      stage2ThreadTrimmed: 0,
      stage3Press1Done: 0,
      stage4InitialCheck: { inspected: 0, passed: 0, altered: 0, repaired: 0, damagedScrap: 0 },
      stage5FinalPress: 0,
      stage6FinalCheck: { inspected: 0, passed: 0, altered: 0, repaired: 0, damagedScrap: 0 },
      readyForPacking: 0,
    };

    const delta = 100;
    const updated = { ...cur };

    if (stage === "stage1") {
      updated.stage1TrimsDone = Math.min(baseTotal, updated.stage1TrimsDone + delta);
    } else if (stage === "stage2") {
      updated.stage2ThreadTrimmed = Math.min(updated.stage1TrimsDone, updated.stage2ThreadTrimmed + delta);
    } else if (stage === "stage3") {
      updated.stage3Press1Done = Math.min(updated.stage2ThreadTrimmed, updated.stage3Press1Done + delta);
    } else if (stage === "stage4_pass") {
      updated.stage4InitialCheck.inspected += delta;
      updated.stage4InitialCheck.passed += delta;
    } else if (stage === "stage4_repair") {
      updated.stage4InitialCheck.inspected += delta;
      updated.stage4InitialCheck.altered += delta;
      updated.stage4InitialCheck.repaired += delta - 5;
      updated.stage4InitialCheck.damagedScrap += 5;
      updated.stage4InitialCheck.passed += delta - 5;
    } else if (stage === "stage5") {
      updated.stage5FinalPress = Math.min(updated.stage4InitialCheck.passed, updated.stage5FinalPress + delta);
    } else if (stage === "stage6_pass") {
      updated.stage6FinalCheck.inspected += delta;
      updated.stage6FinalCheck.passed += delta;
      updated.readyForPacking = updated.stage6FinalCheck.passed;
    }

    saveFinishingPipeline(updated);
    setFinishing(updated);
    refreshRecords();
  };

  // 8. Add Piece Work Log for worker
  const handleAddPieceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogWorkerId) {
      alert("Please select a worker.");
      return;
    }
    const worker = employeesList.find((e) => e.id === newLogWorkerId);
    if (!worker) return;

    const pcsCompleted = Number(newLogPcsCompleted) || 1;
    const pcsPassed = Math.min(pcsCompleted, Number(newLogPcsPassed) || 1);
    const pcsRejected = Math.max(0, pcsCompleted - pcsPassed);
    const rate = Number(newLogRate) || 4.5;
    const totalEarned = Math.round(pcsPassed * rate * 100) / 100; // Credited ONLY for passed pieces

    const newPieceLog: PieceWorkLog = {
      id: `pw_${Date.now()}`,
      workerId: worker.id,
      workerCode: worker.employeeCode,
      workerName: worker.fullName,
      orderId: order.id,
      orderNumber: order.orderNumber,
      operationName: newLogOpName,
      piecesCompleted: pcsCompleted,
      piecesPassed: pcsPassed,
      piecesRejected: pcsRejected,
      ratePerPiece: rate,
      totalEarned,
      date: new Date().toISOString().split("T")[0],
      shift: worker.shift || "General",
      verifiedBy: "Line Supervisor & QC Auditor",
    };

    savePieceWorkLog(newPieceLog);
    showToast(`Piece-work ticket logged for ${worker.fullName}: ₹${totalEarned} earned (${pcsPassed} passed pcs).`);
    refreshRecords();
  };

  const laborSummary = getOrderLaborCostSummary(order.orderNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/30">
              <Shirt size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Manufacturing & Quality Hub
                </h2>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {order.orderNumber}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold border bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                  {order.status.replace(/-/g, " ").toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.buyerName} • Style: {order.styleName} • {formatNumber(order.totalQuantity)} pcs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refreshRecords}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="bg-indigo-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} /> {notification}
            </span>
            <button onClick={() => setNotification(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/30 dark:bg-slate-800/20 py-2">
          {[
            { id: "overview", label: "Workflow Overview", dept: "All", icon: <Layers size={14} /> },
            { id: "testing", label: "1. FPT & GPT & Size Set", dept: "Merchandising", icon: <FlaskConical size={14} /> },
            { id: "cutting", label: "2. Cutting & Cut Report", dept: "Merchandising", icon: <Scissors size={14} /> },
            { id: "stitching", label: "3. Stitching Endline & Alter", dept: "Quality & Floor", icon: <ShieldCheck size={14} /> },
            { id: "finishing", label: "4. Finishing 6-Stage Floor", dept: "Finishing", icon: <Flame size={14} /> },
            { id: "labor-payment", label: "5. Piece-Rate & Labor Costing", dept: "HR & Accounts", icon: <DollarSign size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {tab.dept}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW & MILESTONE ADVANCE */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quantities summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Cut Pieces</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatNumber(order.cuttingQty || 0)} pcs
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {Math.round(((order.cuttingQty || 0) / order.totalQuantity) * 100)}% of order
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Sewing Output</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatNumber(order.stitchingQty || 0)} pcs
                  </p>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    {Math.round(((order.stitchingQty || 0) / order.totalQuantity) * 100)}% sewn
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Finishing Passed</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatNumber(order.finishingQty || 0)} pcs
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {Math.round(((order.finishingQty || 0) / order.totalQuantity) * 100)}% finished
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[11px] font-semibold text-slate-400">Packed / Carton</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatNumber(order.packedQty || 0)} pcs
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {Math.round(((order.packedQty || 0) / order.totalQuantity) * 100)}% packed
                  </span>
                </div>
              </div>

              {/* End-to-End Stepper Progression */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Full Manufacturing Sequence & State Stepper
                  </h3>
                  <button
                    onClick={() => {
                      const next = getNextStage(order.status);
                      if (next.nextStatus) handleAdvanceStatus(next.nextStatus);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                  >
                    <span>Advance Next Stage</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                  {WORKFLOW_STAGES_SEQUENCE.map((stage, idx) => {
                    const isCurrent = order.status === stage.status;
                    return (
                      <div
                        key={stage.status}
                        className={cn(
                          "p-3 rounded-2xl border text-xs flex items-center justify-between transition-all",
                          isCurrent
                            ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 font-bold text-indigo-950 dark:text-indigo-200 shadow-sm ring-1 ring-indigo-500/30"
                            : "bg-white dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                              isCurrent ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-200 dark:bg-slate-700"
                            )}
                          >
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{stage.label}</p>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {stage.nodeNumber} • {stage.department}
                            </span>
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => handleAdvanceStatus(stage.status)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                            Current
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TESTING (FPT + GPT + SIZE SET APPROVAL GATE) */}
          {activeTab === "testing" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold block text-sm mb-1">Testing Sequence Rule:</span>
                1. Order Confirmed → 2. Fabric Inward (GRN) → 3. <strong>FPT</strong> passes → 4. <strong>PPE & GPT</strong> passes → 5. <strong>Size Set Gate</strong> (If Yes: Approval Required; if No: Direct to Cutting).
              </div>

              {/* FPT Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="text-indigo-600" size={18} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Fabric Performance Test (FPT)
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-bold uppercase",
                      fpt?.status === "pass"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : fpt?.status === "fail"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    Status: {fpt?.status || "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">Shrinkage Length:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {fpt ? `${fpt.shrinkageLength}%` : "-2.0%"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">Color Fastness Wash:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {fpt ? `${fpt.colorFastnessWash} / 5` : "4.5 / 5"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">Rubbing Fastness:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {fpt ? `${fpt.colorFastnessRubbing} / 5` : "4.0 / 5"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">GSM Actual / Req:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {fpt ? `${fpt.gsmActual} / ${fpt.gsmRequired}` : "162 / 160"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleSaveFpt("fail")}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                  >
                    Mark FPT Fail
                  </button>
                  <button
                    onClick={() => handleSaveFpt("pass")}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Record FPT PASS ✓
                  </button>
                </div>
              </div>

              {/* GPT Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="text-purple-600" size={18} />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      PPE & Garment Performance Test (GPT)
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-bold uppercase",
                      gpt?.status === "pass"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                        : gpt?.status === "fail"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    Status: {gpt?.status || "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">Wash Appearance:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 capitalize">
                      {gpt ? gpt.washAppearance : "Acceptable"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">Seam Strength:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {gpt ? `${gpt.seamStrength} N` : "260 N"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-slate-400">Torque / Spirality:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                      {gpt ? `${gpt.spiralityTorque}%` : "2.3%"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleSaveGpt("fail")}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 text-xs font-bold"
                  >
                    Mark GPT Fail
                  </button>
                  <button
                    onClick={() => handleSaveGpt("pass")}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Record GPT PASS ✓
                  </button>
                </div>
              </div>

              {/* Size Set Approval Gate */}
              <div className="p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">
                      Size Set Approval Gate (Buyer Requirement)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      If Yes: Sample is submitted to buyer. If No: Order bypasses and goes directly to Cutting.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full font-bold uppercase",
                      sizeSet?.buyerStatus === "approved" || sizeSet?.buyerStatus === "waived"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-white"
                    )}
                  >
                    Gate: {sizeSet?.buyerStatus || "Pending"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleSaveSizeSet(false, "waived")}
                    className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    Size Set NOT Required (Direct to Cutting)
                  </button>
                  <button
                    onClick={() => handleSaveSizeSet(true, "approved")}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all"
                  >
                    Approve Size Set (Clear for Cutting)
                  </button>
                  <button
                    onClick={() => handleSaveSizeSet(true, "rejected")}
                    className="px-3.5 py-2 rounded-xl border border-rose-300 text-rose-600 text-xs font-semibold"
                  >
                    Reject Size Set (Re-Sample)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUTTING & CUT ORDER REPORT */}
          {activeTab === "cutting" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Cutting Floor & Order Cut Report
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fabric & trims issued, multi-ply lay cut down, consumption audited.
                  </p>
                </div>
                <button
                  onClick={handleGenerateCutReport}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Scissors size={14} />
                  <span>Generate Cut Order Report</span>
                </button>
              </div>

              {cutReport ? (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600">
                        AUDITED ORDER CUT REPORT
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cutReport.totalCutPcs.toLocaleString()} Pieces Cut Down
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
                      +{cutReport.fabricSavingsPercent}% Fabric Savings
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Planned Consumption:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {cutReport.plannedConsumptionMtrs} m / garment
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Actual Consumption:</span>
                      <p className="font-bold text-emerald-600 mt-0.5">
                        {cutReport.actualConsumptionMtrs} m / garment
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Plies Count:</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        {cutReport.pliesCount} Plies
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-400">Barcode Bundles:</span>
                      <p className="font-bold text-indigo-600 mt-0.5">
                        {cutReport.bundlesGenerated} Bundles Ready
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Cut Size Breakup
                    </span>
                    <div className="flex gap-4 text-xs font-semibold">
                      {Object.entries(cutReport.sizeBreakup).map(([sz, qty]) => (
                        <div key={sz} className="text-center">
                          <span className="text-slate-400 block text-[10px]">{sz}</span>
                          <span className="text-slate-800 dark:text-slate-200">{qty.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <Scissors className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    No Cut Report generated yet for this order.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click "Generate Cut Order Report" after plies have been spread on cutting table.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STITCHING ENDLINE & ALTERATION LOOP */}
          {activeTab === "stitching" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 text-xs">
                <span className="font-bold block text-sm mb-1 text-indigo-900 dark:text-indigo-200">
                  Sewing Quality Equation:
                </span>
                Total Checked = <strong>Good Passed</strong> + <strong>Under Alteration</strong> + <strong>Repaired</strong> + <strong>Damaged Scrap</strong>.
                Alterations must be repaired or condemned to scrap before moving to Finishing.
              </div>

              {/* Live Endline Counter Board */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">✓ Good Passed</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {endlineLog?.passedPcs || 0} pcs
                  </p>
                  <button
                    onClick={() => handleEndlineIncrement("good")}
                    className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-sm"
                  >
                    +10 Passed
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-300">⚠️ In Alteration</span>
                  <p className="text-2xl font-black text-amber-600 mt-1">
                    {endlineLog?.alteredPcs || 0} pcs
                  </p>
                  <button
                    onClick={() => handleEndlineIncrement("alter")}
                    className="mt-2 w-full py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold shadow-sm"
                  >
                    +5 Alter Defect
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300">🔄 Repaired & Passed</span>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {endlineLog?.repairedPcs || 0} pcs
                  </p>
                  <button
                    onClick={() => handleEndlineIncrement("repaired")}
                    className="mt-2 w-full py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold shadow-sm"
                  >
                    Pass Repaired
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                  <span className="text-xs font-bold text-rose-800 dark:text-rose-300">❌ Damaged Scrap</span>
                  <p className="text-2xl font-black text-rose-600 mt-1">
                    {endlineLog?.damagedScrapPcs || 0} pcs
                  </p>
                  <button
                    onClick={() => handleEndlineIncrement("damaged")}
                    className="mt-2 w-full py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-sm"
                  >
                    Condemn to Scrap
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FINISHING FLOOR 6-STAGE PIPELINE */}
          {activeTab === "finishing" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-bold block text-sm mb-1 text-slate-900 dark:text-white">
                  Finishing Floor 6-Stage Process:
                </span>
                1. <strong>Bartack/Eyelet/Button</strong> → 2. <strong>Thread Trimming</strong> → 3. <strong>Press 1</strong> → 4. <strong>Initial Check</strong> (Pass → Final Press / Fail → Repairing) → 5. <strong>Final Press</strong> → 6. <strong>Final Check</strong> (Pass → Packing / Fail → Repairing).
              </div>

              {/* 6 Stage Trackers */}
              <div className="space-y-3">
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Stage 1: Bartack, Eyelet & Button
                    </h4>
                    <p className="text-[11px] text-slate-400">Buttons stitched & reinforced</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {finishing?.stage1TrimsDone || 0} pcs
                    </span>
                    <button
                      onClick={() => handleFinishingStep("stage1")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      +100 Pcs
                    </button>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Stage 2: Thread Trimming
                    </h4>
                    <p className="text-[11px] text-slate-400">Inside/outside loose threads clipped</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {finishing?.stage2ThreadTrimmed || 0} pcs
                    </span>
                    <button
                      onClick={() => handleFinishingStep("stage2")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      +100 Pcs
                    </button>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Stage 3: Press 1 (Steam Iron)
                    </h4>
                    <p className="text-[11px] text-slate-400">First stage flattening press</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {finishing?.stage3Press1Done || 0} pcs
                    </span>
                    <button
                      onClick={() => handleFinishingStep("stage3")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      +100 Pcs
                    </button>
                  </div>
                </div>

                {/* Stage 4: Initial Check */}
                <div className="p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                        Stage 4: Initial QC Check (Pass → Final Press / Fail → Repair)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Inspected: {finishing?.stage4InitialCheck.inspected || 0} pcs • Passed:{" "}
                        <strong className="text-emerald-600">{finishing?.stage4InitialCheck.passed || 0}</strong> • Altered:{" "}
                        <strong className="text-amber-600">{finishing?.stage4InitialCheck.altered || 0}</strong> • Damaged:{" "}
                        <strong className="text-rose-600">{finishing?.stage4InitialCheck.damagedScrap || 0}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleFinishingStep("stage4_repair")}
                        className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 text-xs font-bold"
                      >
                        Fail → Repair
                      </button>
                      <button
                        onClick={() => handleFinishingStep("stage4_pass")}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        Pass to Final Press ✓
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stage 5: Final Press */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Stage 5: Final Press
                    </h4>
                    <p className="text-[11px] text-slate-400">Crease setting & showroom finish</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {finishing?.stage5FinalPress || 0} pcs
                    </span>
                    <button
                      onClick={() => handleFinishingStep("stage5")}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      +100 Pcs
                    </button>
                  </div>
                </div>

                {/* Stage 6: Final QA Check */}
                <div className="p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Stage 6: Final QA Audit → Handover to Packing
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Approved: <strong className="text-emerald-600">{finishing?.readyForPacking || 0} pcs</strong> ready for polybag & carton packing
                    </p>
                  </div>
                  <button
                    onClick={() => handleFinishingStep("stage6_pass")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    Pass Final QA & Move to Packing
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LABOR PAYMENT & PIECE-RATE LOGGING */}
          {activeTab === "labor-payment" && (
            <div className="space-y-6">
              {/* Labor Cost Reconciliation Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                    Piece-Rate Direct Wages
                  </span>
                  <p className="text-xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
                    {formatCurrency(laborSummary.pieceRateCost)}
                  </p>
                  <span className="text-[10px] text-purple-600">QC Passed operations</span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                    Hourly Helper / Line Support
                  </span>
                  <p className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-1">
                    {formatCurrency(laborSummary.hourlyLineSupport)}
                  </p>
                  <span className="text-[10px] text-amber-600">Helpers & Line checkers</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                    Total Actual Labor Cost
                  </span>
                  <p className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-1">
                    {formatCurrency(laborSummary.totalLaborCost)}
                  </p>
                  <span className="text-[10px] text-indigo-600">Direct + Indirect line wages</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Unit Labor Cost
                  </span>
                  <p className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1">
                    ₹{laborSummary.unitLaborCost} / pc
                  </p>
                  <span className="text-[10px] text-emerald-600">Per good garment produced</span>
                </div>
              </div>

              {/* Log Piece-Work Ticket Form */}
              <form
                onSubmit={handleAddPieceLog}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Plus size={14} /> Log Worker Piece-Rate Operation Ticket
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    * Wages credited ONLY for QC-Passed Pieces
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1 font-semibold">Worker / Operator</label>
                    <select
                      value={newLogWorkerId}
                      onChange={(e) => setNewLogWorkerId(e.target.value)}
                      required
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Worker...</option>
                      {employeesList
                        .filter((e) => ["Stitching", "Finishing", "Cutting"].includes(e.department))
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.fullName} ({emp.employeeCode}) — {emp.wageType || emp.employmentType}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Operation</label>
                    <select
                      value={newLogOpName}
                      onChange={(e) => setNewLogOpName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Collar Attachment">Collar Attachment</option>
                      <option value="Sleeve Stitch">Sleeve Stitch</option>
                      <option value="Side Seam Assembly">Side Seam Assembly</option>
                      <option value="Bartack & Button">Bartack & Button</option>
                      <option value="Thread Trimming">Thread Trimming</option>
                      <option value="Steam Pressing">Steam Pressing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">QC Passed Pcs</label>
                    <input
                      type="number"
                      min={1}
                      value={newLogPcsPassed}
                      onChange={(e) => setNewLogPcsPassed(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 mb-1 font-semibold">Rate / Pc (₹)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.5}
                      value={newLogRate}
                      onChange={(e) => setNewLogRate(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Gross Ticket Value:{" "}
                    <strong className="text-purple-600 font-mono">
                      ₹{((Number(newLogPcsPassed) || 0) * (Number(newLogRate) || 0)).toFixed(2)}
                    </strong>
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20"
                  >
                    Credit Piece Ticket ✓
                  </button>
                </div>
              </form>

              {/* Logged Piece Work History for this order */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Logged Piece-Rate Operations on {order.orderNumber}
                </h4>

                {pieceLogs.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                          <th className="p-3">Worker</th>
                          <th className="p-3">Operation</th>
                          <th className="p-3 text-right">Completed</th>
                          <th className="p-3 text-right">QC Passed</th>
                          <th className="p-3 text-right">Rejected</th>
                          <th className="p-3 text-right">Rate</th>
                          <th className="p-3 text-right">Earned (₹)</th>
                          <th className="p-3 text-right">Shift / Verified</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {pieceLogs.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                              {p.workerName} <span className="text-[10px] text-slate-400 font-mono">({p.workerCode})</span>
                            </td>
                            <td className="p-3 text-slate-700 dark:text-slate-300">{p.operationName}</td>
                            <td className="p-3 text-right font-mono">{p.piecesCompleted}</td>
                            <td className="p-3 text-right font-mono font-bold text-emerald-600">{p.piecesPassed}</td>
                            <td className="p-3 text-right font-mono text-rose-500">{p.piecesRejected}</td>
                            <td className="p-3 text-right font-mono">₹{p.ratePerPiece.toFixed(2)}</td>
                            <td className="p-3 text-right font-mono font-bold text-purple-600">
                              {formatCurrency(p.totalEarned)}
                            </td>
                            <td className="p-3 text-right text-[10px] text-slate-400">{p.shift}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">No piece-rate tickets logged yet.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={14} />
            <span>Real-time shop floor sync enabled</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
}
export default OrderManufacturingWorkflowModal;
