"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn, formatCurrency, formatNumber, formatDate, getStatusColor } from "@/lib/utils";
import {
  Search, Plus, Download, Package, Layers, AlertTriangle, Warehouse,
  FileText, Scissors, Check, X, ArrowUpRight, ArrowDownLeft,
  Printer, CheckCircle2, RefreshCw, Eye, Tag, AlertCircle, Building2, Truck
} from "lucide-react";
import {
  getStoredInventoryItems,
  saveStoredInventoryItem,
  addInventoryItem,
  adjustItemStock,
  getStoredFabricRolls,
  saveStoredFabricRoll,
  addFabricRoll,
  getStoredMaterialIssues,
  createMaterialIssue,
  getStoredInventoryTransactions,
  getStoredOrders,
  generateNextIssueSlipNumber,
  generateNextItemCode,
  generateNextRollNumber,
  WORKFLOW_EVENT,
} from "@/lib/workflow-service";
import { InventoryItem, FabricRoll, MaterialIssueSlip, InventoryTransaction, Order } from "@/lib/types";

// CSV Export Helper
function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const allRows = [headers, ...rows];
  const csvContent =
    "data:text/csv;charset=utf-8," +
    allRows
      .map((row) =>
        row
          .map((cell) => {
            const str = String(cell ?? "");
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function InventoryView({ basePath = "/factory" }: { basePath?: string }) {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"items" | "fabric" | "issues" | "transactions">("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // State loaded from central workflow service
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [rolls, setRolls] = useState<FabricRoll[]>([]);
  const [issues, setIssues] = useState<MaterialIssueSlip[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddRollModalOpen, setIsAddRollModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
  const [viewingIssueSlip, setViewingIssueSlip] = useState<MaterialIssueSlip | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state from workflow-service
  const syncData = () => {
    try {
      if (typeof getStoredInventoryItems === "function") setItems(getStoredInventoryItems());
      if (typeof getStoredFabricRolls === "function") setRolls(getStoredFabricRolls());
      if (typeof getStoredMaterialIssues === "function") setIssues(getStoredMaterialIssues());
      if (typeof getStoredInventoryTransactions === "function") setTransactions(getStoredInventoryTransactions());
      if (typeof getStoredOrders === "function") setOrders(getStoredOrders());
    } catch (err) {
      console.warn("Error synchronizing inventory store data:", err);
    }
  };

  useEffect(() => {
    syncData();
    window.addEventListener(WORKFLOW_EVENT, syncData);
    window.addEventListener("storage", syncData);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, syncData);
      window.removeEventListener("storage", syncData);
    };
  }, []);

  // Filtered Inventory Items
  const filteredItems = useMemo(() => {
    let result = [...items];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.itemName.toLowerCase().includes(q) ||
          i.itemCode.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.warehouseName.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "All") {
      result = result.filter((i) => i.category === categoryFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((i) => i.status === statusFilter);
    }
    return result;
  }, [items, searchQuery, categoryFilter, statusFilter]);

  // Filtered Fabric Rolls
  const filteredRolls = useMemo(() => {
    let result = [...rolls];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.rollNumber.toLowerCase().includes(q) ||
          r.fabricType.toLowerCase().includes(q) ||
          r.color.toLowerCase().includes(q) ||
          r.shade.toLowerCase().includes(q) ||
          r.lotNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }
    return result;
  }, [rolls, searchQuery, statusFilter]);

  // Filtered Material Issues
  const filteredIssues = useMemo(() => {
    let result = [...issues];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.slipNumber.toLowerCase().includes(q) ||
          (m.orderNumber && m.orderNumber.toLowerCase().includes(q)) ||
          m.department.toLowerCase().includes(q) ||
          m.receiverName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [issues, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalValuation = items.reduce((acc, i) => acc + (i.stockValue || 0), 0);
    const lowStockCount = items.filter((i) => i.status === "low-stock").length;
    const outOfStockCount = items.filter((i) => i.status === "out-of-stock").length;
    const totalRollsCount = rolls.length;
    const totalRollMeters = rolls.reduce((acc, r) => acc + (r.acceptedLength || 0), 0);
    const totalIssuesCount = issues.length;

    return {
      totalValuation,
      totalItems: items.length,
      lowStockCount,
      outOfStockCount,
      totalRollsCount,
      totalRollMeters,
      totalIssuesCount,
    };
  }, [items, rolls, issues]);

  // Export to CSV Function
  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];

    if (activeTab === "items") {
      const headers = [
        "Item Code",
        "Item Name",
        "Category",
        "Store Location",
        "Current Stock",
        "Reserved Stock",
        "Available Stock",
        "Unit",
        "Unit Price (INR)",
        "Stock Valuation (INR)",
        "Status",
        "Reorder Level",
        "Last Receipt Date",
        "Last Issue Date",
      ];
      const rows = filteredItems.map((i) => [
        i.itemCode,
        i.itemName,
        i.category,
        i.warehouseName,
        i.currentStock,
        i.reservedStock,
        i.availableStock,
        i.unit,
        i.avgPrice || i.lastPrice,
        i.stockValue,
        i.status,
        i.reorderLevel,
        i.lastReceiptDate || "N/A",
        i.lastIssueDate || "N/A",
      ]);
      downloadCsv(`garmentflow_inventory_stock_${timestamp}.csv`, headers, rows);
      showToast(`Exported ${rows.length} stock items to CSV successfully!`);
    } else if (activeTab === "fabric") {
      const headers = [
        "Roll Number",
        "Fabric Type",
        "Color",
        "Shade Lot",
        "Lot Number",
        "Width (in)",
        "GSM",
        "Accepted Length (m)",
        "Rack Location",
        "Inspection Status",
        "Allocated Order",
        "Status",
      ];
      const rows = filteredRolls.map((r) => [
        r.rollNumber,
        r.fabricType,
        r.color,
        r.shade,
        r.lotNumber,
        r.width,
        r.gsm,
        r.acceptedLength,
        `${r.location} (${r.warehouseName || "Main Factory Store"})`,
        r.inspectionStatus,
        r.allocatedOrderId || "Unallocated",
        r.status,
      ]);
      downloadCsv(`garmentflow_fabric_rolls_${timestamp}.csv`, headers, rows);
      showToast(`Exported ${rows.length} fabric rolls to CSV successfully!`);
    } else if (activeTab === "issues") {
      const headers = [
        "Slip Number",
        "Issue Date",
        "Order Number",
        "Department",
        "Receiver Name",
        "Issued By",
        "Total Issued Quantity",
        "Items Count",
        "Status",
        "Remarks",
      ];
      const rows = filteredIssues.map((m) => [
        m.slipNumber,
        m.issueDate,
        m.orderNumber || "General Issue",
        m.department,
        m.receiverName,
        m.issuedBy,
        m.totalQty,
        m.items.length,
        m.status,
        m.remarks || "",
      ]);
      downloadCsv(`garmentflow_material_issues_${timestamp}.csv`, headers, rows);
      showToast(`Exported ${rows.length} material issue slips to CSV successfully!`);
    } else {
      const headers = [
        "Txn Number",
        "Type",
        "Item Name",
        "Quantity",
        "Unit",
        "Store From",
        "Store To",
        "Order Number",
        "Reference Voucher",
        "Performed By",
        "Remarks",
        "Date & Time",
      ];
      const rows = transactions.map((t) => [
        t.transactionNumber,
        t.type.toUpperCase(),
        t.itemName,
        t.quantity,
        t.unit,
        t.warehouseFrom || "-",
        t.warehouseTo || "-",
        t.orderNumber || "-",
        `${t.referenceType}: ${t.referenceId}`,
        t.userName,
        t.remarks,
        t.createdAt,
      ]);
      downloadCsv(`garmentflow_inventory_transactions_${timestamp}.csv`, headers, rows);
      showToast(`Exported ${rows.length} transaction entries to CSV successfully!`);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // MODAL STATES & FORM HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  // 1. Material Issue Form State
  const [issueOrderId, setIssueOrderId] = useState("");
  const [issueDept, setIssueDept] = useState<MaterialIssueSlip["department"]>("Cutting");
  const [issueReceiver, setIssueReceiver] = useState("Rajendra Singh (Cutting Master)");
  const [issueRemarks, setIssueRemarks] = useState("");
  const [issueItemsList, setIssueItemsList] = useState<
    { itemId: string; requestedQty: number; issuedQty: number; selectedRolls: string[] }[]
  >([{ itemId: items[0]?.id || "", requestedQty: 100, issuedQty: 100, selectedRolls: [] }]);

  const handleOpenIssueModal = () => {
    if (items.length > 0) {
      setIssueItemsList([
        { itemId: items[0].id, requestedQty: 100, issuedQty: 100, selectedRolls: [] },
      ]);
    }
    setIssueOrderId(orders[0]?.id || "");
    setIssueDept("Cutting");
    setIssueReceiver("Rajendra Singh (Cutting Master)");
    setIssueRemarks("");
    setIsIssueModalOpen(true);
  };

  const handleAddIssueItemRow = () => {
    const defaultItem = items[0]?.id || "";
    setIssueItemsList((prev) => [
      ...prev,
      { itemId: defaultItem, requestedQty: 50, issuedQty: 50, selectedRolls: [] },
    ]);
  };

  const handleRemoveIssueItemRow = (idx: number) => {
    setIssueItemsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateIssueItemRow = (
    idx: number,
    field: "itemId" | "requestedQty" | "issuedQty" | "selectedRolls",
    value: any
  ) => {
    setIssueItemsList((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  const handleSubmitMaterialIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (issueItemsList.length === 0) {
      alert("Please add at least one item to issue.");
      return;
    }

    // Validate quantities against available stock
    for (const row of issueItemsList) {
      const itm = items.find((i) => i.id === row.itemId);
      if (!itm) continue;
      if (row.issuedQty > itm.availableStock) {
        alert(
          `Cannot issue ${row.issuedQty} ${itm.unit} of ${itm.itemName}. Available stock is only ${itm.availableStock} ${itm.unit}.`
        );
        return;
      }
      if (row.issuedQty <= 0) {
        alert(`Issue quantity for ${itm.itemName} must be greater than 0.`);
        return;
      }
    }

    const matchedOrder = orders.find((o) => o.id === issueOrderId);

    const formattedItems = issueItemsList.map((row, idx) => {
      const itm = items.find((i) => i.id === row.itemId)!;
      return {
        id: `mii-${Date.now()}-${idx}`,
        itemId: itm.id,
        itemCode: itm.itemCode,
        itemName: itm.itemName,
        category: itm.category,
        unit: itm.unit,
        requestedQty: Number(row.requestedQty),
        issuedQty: Number(row.issuedQty),
        rollNumbers: row.selectedRolls,
        remarks: `Issued for ${matchedOrder ? matchedOrder.orderNumber : "Floor Requirement"}`,
      };
    });

    const totalQty = formattedItems.reduce((acc, cur) => acc + cur.issuedQty, 0);

    const newSlip = createMaterialIssue({
      issueDate: new Date().toISOString().split("T")[0],
      orderId: matchedOrder?.id,
      orderNumber: matchedOrder?.orderNumber,
      styleNumber: matchedOrder?.styleName || matchedOrder?.styleId,
      department: issueDept,
      requestedBy: issueReceiver,
      issuedBy: "Ramesh Choudhary (Store In-charge)",
      receiverName: issueReceiver,
      status: "issued",
      items: formattedItems,
      totalQty,
      remarks: issueRemarks || `Material issue requisition for ${issueDept} floor`,
    });

    setIsIssueModalOpen(false);
    syncData();
    showToast(`Material Issue Slip ${newSlip.slipNumber} created and stock deducted successfully!`);
  };

  // 2. Add New Stock Item Form State
  const [newItemCode, setNewItemCode] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Fabric");
  const [newItemUnit, setNewItemUnit] = useState("Meters");
  const [newItemStock, setNewItemStock] = useState<number>(500);
  const [newItemUnitPrice, setNewItemUnitPrice] = useState<number>(180);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState<number>(200);

  const handleOpenAddItemModal = () => {
    setNewItemCategory("Fabric");
    setNewItemCode(generateNextItemCode("Fabric"));
    setNewItemName("");
    setNewItemUnit("Meters");
    setNewItemStock(500);
    setNewItemUnitPrice(180);
    setNewItemReorderLevel(200);
    setIsAddItemModalOpen(true);
  };

  const handleCategoryChange = (cat: string) => {
    setNewItemCategory(cat);
    setNewItemCode(generateNextItemCode(cat));
    if (cat === "Fabric") {
      setNewItemUnit("Meters");
    } else if (cat === "Accessories") {
      setNewItemUnit("Pcs");
    } else if (cat === "Packing") {
      setNewItemUnit("Pcs");
    } else {
      setNewItemUnit("Kg");
    }
  };

  const handleSubmitAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      alert("Please provide an item name.");
      return;
    }

    const created = addInventoryItem({
      itemCode: newItemCode || generateNextItemCode(newItemCategory),
      itemName: newItemName.trim(),
      category: newItemCategory,
      unit: newItemUnit,
      warehouseId: "w1",
      warehouseName: "Main Factory Store",
      currentStock: Number(newItemStock),
      reservedStock: 0,
      availableStock: Number(newItemStock),
      incomingStock: 0,
      reorderLevel: Number(newItemReorderLevel),
      minStock: Math.round(Number(newItemReorderLevel) * 0.5),
      maxStock: Math.round(Number(newItemStock) * 3),
      lastPrice: Number(newItemUnitPrice),
      avgPrice: Number(newItemUnitPrice),
      stockValue: Math.round(Number(newItemStock) * Number(newItemUnitPrice)),
      lastReceiptDate: new Date().toISOString().split("T")[0],
      lastIssueDate: "-",
      status: Number(newItemStock) === 0 ? "out-of-stock" : Number(newItemStock) <= Number(newItemReorderLevel) ? "low-stock" : "in-stock",
    });

    setIsAddItemModalOpen(false);
    syncData();
    showToast(`New inventory SKU "${created.itemName}" (${created.itemCode}) created successfully!`);
  };

  // 3. Stock Inward / Adjust Modal State
  const [adjustQty, setAdjustQty] = useState<number>(100);
  const [adjustType, setAdjustType] = useState<"receipt" | "adjustment">("receipt");
  const [adjustUnitPrice, setAdjustUnitPrice] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("GRN Supplier delivery receipt");

  const handleOpenAdjustModal = (item: InventoryItem) => {
    setSelectedItemForAdjust(item);
    setAdjustQty(item.reorderLevel || 100);
    setAdjustType("receipt");
    setAdjustUnitPrice(item.avgPrice || item.lastPrice || 0);
    setAdjustReason("Supplier GRN Delivery Inward");
    setIsAdjustStockModalOpen(true);
  };

  const handleSubmitAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;

    const delta = adjustType === "receipt" ? Math.abs(adjustQty) : adjustQty;
    adjustItemStock(selectedItemForAdjust.id, delta, adjustType, {
      remarks: adjustReason,
      unitPrice: adjustUnitPrice,
      userName: "Store In-charge (Ramesh Choudhary)",
    });

    setIsAdjustStockModalOpen(false);
    syncData();
    showToast(`Stock updated for ${selectedItemForAdjust.itemName} (${delta > 0 ? "+" : ""}${delta} ${selectedItemForAdjust.unit})`);
  };

  // 4. Add Fabric Roll State
  const [newRollType, setNewRollType] = useState("Oxford Cotton 60s");
  const [newRollColor, setNewRollColor] = useState("Optic White");
  const [newRollShade, setNewRollShade] = useState("Shade Lot A1");
  const [newRollLot, setNewRollLot] = useState("LOT-OXF-099");
  const [newRollWidth, setNewRollWidth] = useState(58);
  const [newRollGsm, setNewRollGsm] = useState(135);
  const [newRollLength, setNewRollLength] = useState(120);
  const [newRollRack, setNewRollRack] = useState("Rack A-04-A");

  const handleOpenAddRollModal = () => {
    setNewRollType("Oxford Cotton 60s");
    setNewRollColor("Optic White");
    setNewRollShade("Shade Lot A1");
    setNewRollLot(`LOT-FAB-${Date.now().toString().slice(-4)}`);
    setNewRollWidth(58);
    setNewRollGsm(135);
    setNewRollLength(120);
    setNewRollRack("Rack A-04-A");
    setIsAddRollModalOpen(true);
  };

  const handleSubmitAddRoll = (e: React.FormEvent) => {
    e.preventDefault();
    const rollNo = generateNextRollNumber();
    addFabricRoll({
      rollNumber: rollNo,
      supplierId: "sup1",
      supplierName: "Vardhman Textiles Ltd.",
      poNumber: "PO-2025-0024",
      fabricType: newRollType,
      composition: "100% Combed Cotton",
      color: newRollColor,
      shade: newRollShade,
      lotNumber: newRollLot,
      width: Number(newRollWidth),
      gsm: Number(newRollGsm),
      receivedLength: Number(newRollLength),
      acceptedLength: Number(newRollLength),
      rejectedLength: 0,
      warehouseId: "w1",
      warehouseName: "Main Factory Store",
      location: newRollRack,
      inspectionStatus: "accepted",
      status: "available",
    });

    setIsAddRollModalOpen(false);
    syncData();
    showToast(`Fabric Roll ${rollNo} (${newRollLength}m, ${newRollShade}) added to Store!`);
  };

  const categories = ["All", "Fabric", "Accessories", "Packing"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Store & Inventory Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Main Factory Store
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time fabric rolls, trims & accessories stock, storage racks & store issue vouchers (SIV)
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Working Export Button */}
          <button
            onClick={handleExport}
            id="export-inventory-csv-btn"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-sm"
            title="Download CSV spreadsheet report"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export CSV</span>
          </button>

          {/* Add New Stock Item */}
          <button
            onClick={handleOpenAddItemModal}
            id="add-stock-item-btn"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium hover:bg-slate-800 dark:hover:bg-white transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>Add Stock Item</span>
          </button>

          {/* Working Material Issue Button */}
          <button
            onClick={handleOpenIssueModal}
            id="material-issue-requisition-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Scissors size={16} />
            <span>Material Issue (SIV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => {
            setActiveTab("items");
            setStatusFilter("All");
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-3">
            <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.totalValuation)}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Total Valuation ({stats.totalItems} SKUs)
          </p>
        </div>

        <div
          onClick={() => {
            setActiveTab("fabric");
            setStatusFilter("All");
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-3">
            <Warehouse size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(stats.totalRollMeters)} m
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Fabric Rolls on Hand ({stats.totalRollsCount} rolls)
          </p>
        </div>

        <div
          onClick={() => {
            setActiveTab("items");
            setStatusFilter("low-stock");
          }}
          className={cn(
            "bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm cursor-pointer transition-all",
            statusFilter === "low-stock"
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-slate-200/60 dark:border-slate-800 hover:border-amber-300"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-3">
            <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowStockCount}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              Action Required
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-1">Below Reorder Level</p>
        </div>

        <div
          onClick={() => {
            setActiveTab("issues");
          }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3">
            <FileText size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalIssuesCount}</p>
          <p className="text-xs font-medium text-slate-500 mt-1">Material Issue Slips (SIV)</p>
        </div>
      </div>

      {/* Tabs Bar & Filtering */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Module Sub-Tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab("items")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === "items"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            Item Master Stock ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("fabric")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === "fabric"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            Fabric Roll Master ({rolls.length})
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === "issues"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            Material Issue Slips ({issues.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === "transactions"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            Movement Audit Ledger ({transactions.length})
          </button>
        </div>

        {/* Search & Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, fabric, roll..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>

          {activeTab === "items" && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                    categoryFilter === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {cat}
                </button>
              ))}
              {statusFilter !== "All" && (
                <button
                  onClick={() => setStatusFilter("All")}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 flex items-center gap-1"
                >
                  <span>{statusFilter}</span>
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {activeTab === "fabric" && (
            <button
              onClick={handleOpenAddRollModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100"
            >
              <Plus size={14} /> Add Fabric Roll
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: ITEM MASTER STOCK
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "items" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Item Code</th>
                  <th className="px-4 py-3.5">Item Details & Unit</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Store Location</th>
                  <th className="px-4 py-3.5 text-right">Current Stock</th>
                  <th className="px-4 py-3.5 text-right">Available</th>
                  <th className="px-4 py-3.5 text-right">Valuation</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Manage Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {item.itemCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-white">{item.itemName}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span>Unit: {item.unit}</span>
                        <span>•</span>
                        <span>Reorder Level: {formatNumber(item.reorderLevel)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-xs">
                        {item.warehouseName || "Main Factory Store"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-white">
                      {formatNumber(item.currentStock)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNumber(item.availableStock)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.stockValue)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                          item.status === "in-stock"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : item.status === "low-stock"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                            : item.status === "out-of-stock"
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                      >
                        {item.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleOpenAdjustModal(item)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors"
                      >
                        Inward / Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: FABRIC ROLL MASTER
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "fabric" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Individual Roll Master & Shade Groups
              </h3>
              <p className="text-xs text-slate-500">
                Tracked for color consistency, shrinkage test matching, and 4-point inspection pass
              </p>
            </div>
            <button
              onClick={handleOpenAddRollModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <Plus size={14} /> Inward New Roll
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Roll Number</th>
                  <th className="px-4 py-3.5">Fabric & Color</th>
                  <th className="px-4 py-3.5">Shade Lot</th>
                  <th className="px-4 py-3.5">Width & GSM</th>
                  <th className="px-4 py-3.5 text-right">Length (m)</th>
                  <th className="px-4 py-3.5">Rack Location</th>
                  <th className="px-4 py-3.5 text-center">4-Point QC</th>
                  <th className="px-4 py-3.5 text-center">Roll Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRolls.map((roll) => (
                  <tr
                    key={roll.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {roll.rollNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-white">{roll.fabricType}</p>
                      <p className="text-xs text-slate-400">{roll.color} ({roll.composition})</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        {roll.shade}
                      </span>
                      <p className="text-[10px] text-slate-400">{roll.lotNumber}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      <span>{roll.width}&quot; width</span> • <span>{roll.gsm} GSM</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-white">
                      {roll.acceptedLength} m
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                        {roll.location}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          roll.inspectionStatus === "accepted"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        )}
                      >
                        {roll.inspectionStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                          roll.status === "available"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : roll.status === "issued"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                            : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {roll.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: MATERIAL ISSUE SLIPS (SIV)
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "issues" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Material Issue Requisitions (Store Issue Vouchers)
              </h3>
              <p className="text-xs text-slate-500">
                Official outward material slips issued to Cutting, Stitching, Finishing & Sampling floors
              </p>
            </div>
            <button
              onClick={handleOpenIssueModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-500/25"
            >
              <Scissors size={14} /> New Material Issue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Slip #</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Production Order</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Receiver</th>
                  <th className="px-4 py-3.5">Issued Items</th>
                  <th className="px-4 py-3.5 text-right">Total Qty</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Voucher Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {issue.slipNumber}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      {formatDate(issue.issueDate)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-white">
                      {issue.orderNumber || "General Issue"}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {issue.department}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300">
                      {issue.receiverName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {issue.items.map((i) => i.itemName).join(", ")}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {formatNumber(issue.totalQty)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 uppercase">
                        {issue.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setViewingIssueSlip(issue)}
                        className="flex items-center justify-center gap-1 mx-auto px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                      >
                        <Eye size={13} />
                        <span>View Voucher</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 4: MOVEMENT AUDIT LEDGER
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "transactions" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Txn #</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Item Name</th>
                  <th className="px-4 py-3.5 text-right">Quantity</th>
                  <th className="px-4 py-3.5">Reference Document</th>
                  <th className="px-4 py-3.5">Store Movement</th>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{t.transactionNumber}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                          t.type === "receipt"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : t.type === "issue"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800"
                        )}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-white">{t.itemName}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800 dark:text-white">
                      {t.type === "issue" ? "-" : "+"}
                      {formatNumber(t.quantity)} {t.unit}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{t.referenceType}</p>
                      <p className="text-[10px] text-slate-400">{t.referenceId}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {t.warehouseFrom && <span>From: {t.warehouseFrom}</span>}
                      {t.warehouseTo && <span>To: {t.warehouseTo}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400">{t.userName}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{t.createdAt.slice(0, 16).replace("T", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 1: NEW MATERIAL ISSUE (SIV)
          ───────────────────────────────────────────────────────────────────────────── */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Scissors size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Create Material Issue Slip (SIV)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deducts warehouse stock and assigns fabric rolls / accessories to floor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitMaterialIssue} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Production Order
                  </label>
                  <select
                    value={issueOrderId}
                    onChange={(e) => setIssueOrderId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">General Issue (No Order Linked)</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.styleName || o.id} ({formatNumber(o.totalQuantity)} pcs)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Department
                  </label>
                  <select
                    value={issueDept}
                    onChange={(e) => setIssueDept(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Cutting">Cutting Room Floor</option>
                    <option value="Sampling">Sampling & Pattern Department</option>
                    <option value="Stitching">Stitching Assembly Lines</option>
                    <option value="Finishing">Finishing & Button Attaching</option>
                    <option value="Packing">Packing & Cartoning</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receiver Name & Designation
                </label>
                <input
                  type="text"
                  required
                  value={issueReceiver}
                  onChange={(e) => setIssueReceiver(e.target.value)}
                  placeholder="e.g. Rajendra Singh (Cutting Master)"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Items to Issue Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Materials & Quantities to Issue
                  </label>
                  <button
                    type="button"
                    onClick={handleAddIssueItemRow}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Another Item
                  </button>
                </div>

                <div className="space-y-3">
                  {issueItemsList.map((row, idx) => {
                    const currentItem = items.find((i) => i.id === row.itemId);
                    const matchingRolls = rolls.filter(
                      (r) =>
                        r.status === "available" &&
                        currentItem?.category === "Fabric" &&
                        (currentItem.itemName.toLowerCase().includes("oxford") && r.fabricType.toLowerCase().includes("oxford") ||
                         currentItem.itemName.toLowerCase().includes("denim") && r.fabricType.toLowerCase().includes("denim") ||
                         currentItem.itemName.toLowerCase().includes("georgette") && r.fabricType.toLowerCase().includes("georgette"))
                    );

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">Select Item</label>
                            <select
                              value={row.itemId}
                              onChange={(e) => handleUpdateIssueItemRow(idx, "itemId", e.target.value)}
                              className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.itemCode} — {i.itemName} (Avail: {formatNumber(i.availableStock)} {i.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-28">
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              Qty ({currentItem?.unit || "Units"})
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={currentItem?.availableStock || 99999}
                              value={row.issuedQty}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                handleUpdateIssueItemRow(idx, "issuedQty", val);
                                handleUpdateIssueItemRow(idx, "requestedQty", val);
                              }}
                              className="w-full h-9 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                            />
                          </div>

                          {issueItemsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveIssueItemRow(idx)}
                              className="p-2 text-rose-500 hover:text-rose-700 self-end mb-0.5"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* If fabric item, allow roll selection */}
                        {currentItem?.category === "Fabric" && matchingRolls.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                              Allocate Specific Fabric Rolls (Optional)
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {matchingRolls.map((r) => {
                                const isSelected = row.selectedRolls.includes(r.rollNumber);
                                return (
                                  <button
                                    type="button"
                                    key={r.id}
                                    onClick={() => {
                                      const next = isSelected
                                        ? row.selectedRolls.filter((rn) => rn !== r.rollNumber)
                                        : [...row.selectedRolls, r.rollNumber];
                                      handleUpdateIssueItemRow(idx, "selectedRolls", next);
                                    }}
                                    className={cn(
                                      "px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors",
                                      isSelected
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                    )}
                                  >
                                    {r.rollNumber} ({r.acceptedLength}m - {r.shade})
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Cutting Lay Batch
                </label>
                <input
                  type="text"
                  value={issueRemarks}
                  onChange={(e) => setIssueRemarks(e.target.value)}
                  placeholder="e.g. Lay 1 & 2 body panels, fastness inspected"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all"
                >
                  Confirm & Issue Materials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 2: ADD NEW STOCK ITEM
          ───────────────────────────────────────────────────────────────────────────── */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New Inventory SKU
              </h3>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAddItem} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <option value="Fabric">Fabric</option>
                    <option value="Accessories">Accessories & Trims</option>
                    <option value="Packing">Packing Material</option>
                    <option value="Chemicals">Chemicals & Washing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Item Code (SKU)
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemCode}
                    onChange={(e) => setNewItemCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. 100% Linen Yarn Dyed Fabric - Olive Green"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    placeholder="Meters, Pcs, Cones..."
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store Location
                  </label>
                  <div className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Main Factory Store
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Opening Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemUnitPrice}
                    onChange={(e) => setNewItemUnitPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newItemReorderLevel}
                    onChange={(e) => setNewItemReorderLevel(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/25"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 3: INWARD / ADJUST STOCK
          ───────────────────────────────────────────────────────────────────────────── */}
      {isAdjustStockModalOpen && selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Stock Inward / Adjustment
                </h3>
                <p className="text-xs text-slate-500">{selectedItemForAdjust.itemName}</p>
              </div>
              <button
                onClick={() => setIsAdjustStockModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustStock} className="space-y-4 pt-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Stock On Hand:</span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {formatNumber(selectedItemForAdjust.currentStock)} {selectedItemForAdjust.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Movement Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType("receipt")}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold border transition-all",
                      adjustType === "receipt"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 border-slate-200"
                    )}
                  >
                    + Inward Receipt (GRN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("adjustment")}
                    className={cn(
                      "py-2 rounded-xl text-xs font-semibold border transition-all",
                      adjustType === "adjustment"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 border-slate-200"
                    )}
                  >
                    Physical Count Audit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity ({selectedItemForAdjust.unit})
                </label>
                <input
                  type="number"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                />
              </div>

              {adjustType === "receipt" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit Delivery Price (₹)
                  </label>
                  <input
                    type="number"
                    value={adjustUnitPrice}
                    onChange={(e) => setAdjustUnitPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Document Reference
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Supplier GRN # / Physical count discrepancy"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Post Stock Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 4: INWARD FABRIC ROLL
          ───────────────────────────────────────────────────────────────────────────── */}
      {isAddRollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Inward Fabric Roll to Factory Store
              </h3>
              <button
                onClick={() => setIsAddRollModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitAddRoll} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fabric Type
                </label>
                <input
                  type="text"
                  required
                  value={newRollType}
                  onChange={(e) => setNewRollType(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    value={newRollColor}
                    onChange={(e) => setNewRollColor(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shade Lot #
                  </label>
                  <input
                    type="text"
                    required
                    value={newRollShade}
                    onChange={(e) => setNewRollShade(e.target.value)}
                    placeholder="e.g. Shade Lot A1"
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Length (m)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRollLength}
                    onChange={(e) => setNewRollLength(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Width (in)
                  </label>
                  <input
                    type="number"
                    value={newRollWidth}
                    onChange={(e) => setNewRollWidth(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSM
                  </label>
                  <input
                    type="number"
                    value={newRollGsm}
                    onChange={(e) => setNewRollGsm(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rack & Storage Bin in Store
                </label>
                <input
                  type="text"
                  required
                  value={newRollRack}
                  onChange={(e) => setNewRollRack(e.target.value)}
                  placeholder="e.g. Rack A-04-A"
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRollModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Confirm Roll Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          MODAL 5: VIEW & PRINT MATERIAL ISSUE SLIP (VOUCHER)
          ───────────────────────────────────────────────────────────────────────────── */}
      {viewingIssueSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={20} />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Store Issue Voucher (SIV) — {viewingIssueSlip.slipNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100"
                >
                  <Printer size={14} /> Print Voucher
                </button>
                <button
                  onClick={() => setViewingIssueSlip(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Voucher printable view */}
            <div className="p-6 mt-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Mrityunjay Enterprises Pvt. Ltd.
                  </h4>
                  <p className="text-xs text-slate-500">
                    Main Factory Store • Bhilwara, Rajasthan
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-indigo-600 text-sm">
                    {viewingIssueSlip.slipNumber}
                  </p>
                  <p className="text-xs text-slate-500">Date: {formatDate(viewingIssueSlip.issueDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <p className="text-slate-400">Order Reference:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {viewingIssueSlip.orderNumber || "General Store Requisition"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Destination Department:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">
                    {viewingIssueSlip.department} Floor
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Issued By:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{viewingIssueSlip.issuedBy}</p>
                </div>
                <div>
                  <p className="text-slate-400">Receiver:</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{viewingIssueSlip.receiverName}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="pt-2">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2">Item Code</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Shade / Roll Nos</th>
                      <th className="p-2 text-right">Issued Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {viewingIssueSlip.items.map((i) => (
                      <tr key={i.id}>
                        <td className="p-2 font-mono font-bold text-indigo-600">{i.itemCode}</td>
                        <td className="p-2 font-medium">{i.itemName}</td>
                        <td className="p-2 text-slate-500">
                          {i.rollNumbers && i.rollNumbers.length > 0
                            ? i.rollNumbers.join(", ")
                            : i.lotNumber || "-"}
                        </td>
                        <td className="p-2 text-right font-mono font-bold">
                          {formatNumber(i.issuedQty)} {i.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {viewingIssueSlip.issuedBy}
                  </p>
                  <p className="text-[10px]">Storekeeper Signature</p>
                </div>
                <div className="border-t border-slate-300 dark:border-slate-700 pt-2">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {viewingIssueSlip.receiverName}
                  </p>
                  <p className="text-[10px]">Receiving Supervisor Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryView;
