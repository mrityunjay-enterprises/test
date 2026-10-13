"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import { dispatches as demoDispatches, orders as demoOrders } from "@/lib/demo-data";
import { Dispatch } from "@/lib/types";
import {
  getStoredOrders,
  getStoredDispatches,
  saveDispatches,
  recordNewDispatch,
  markDispatchPODReceived,
  updateOrderStatus,
  WORKFLOW_EVENT
} from "@/lib/workflow-service";
import {
  Truck, Plus, Search, CheckCircle2, Clock, FileText, MapPin, X, Printer,
  ShieldCheck, ArrowRight, Package, Calendar, UserCheck, ChevronRight, Navigation, Upload
} from "lucide-react";

export function DispatchView({ basePath = "/factory" }: { basePath?: string }) {
  const [dispatchList, setDispatchList] = useState<Dispatch[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDispatchForGatePass, setSelectedDispatchForGatePass] = useState<Dispatch | null>(null);
  const [selectedDispatchForPOD, setSelectedDispatchForPOD] = useState<Dispatch | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Dispatch Form State
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [destination, setDestination] = useState("");
  const [transporter, setTransporter] = useState("VRL Logistics");
  const [vehicleNumber, setVehicleNumber] = useState("RJ-06-GB-4589");
  const [driverDetails, setDriverDetails] = useState("Ramesh Kumar (+91 98290 11223)");
  const [lrNumber, setLrNumber] = useState(`LR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [ewayBill, setEwayBill] = useState(`EWB-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
  const [invoiceRef, setInvoiceRef] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [cartons, setCartons] = useState<number>(120);
  const [quantity, setQuantity] = useState<number>(5000);
  const [grossWeight, setGrossWeight] = useState<number>(1800);
  const [netWeight, setNetWeight] = useState<number>(1600);
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split("T")[0]);

  // POD Upload Form State
  const [podReceiver, setPodReceiver] = useState("");
  const [podRemarks, setPodRemarks] = useState("");
  const [podDate, setPodDate] = useState(new Date().toISOString().split("T")[0]);

  const loadData = () => {
    setDispatchList(getStoredDispatches());
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

  const saveDispatchesToStorage = (newList: Dispatch[]) => {
    saveDispatches(newList);
    setDispatchList(newList);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Order Selection inside Modal
  const handleOrderChange = (ordId: string) => {
    setSelectedOrderId(ordId);
    const ord = ordersList.find((o) => o.id === ordId || o.orderNumber === ordId);
    if (ord) {
      setBuyerName(ord.buyerName);
      setDestination(`${ord.buyerName} Central Warehouse, Mumbai`);
      setQuantity(ord.totalQuantity || 5000);
      setCartons(Math.ceil((ord.totalQuantity || 5000) / 40));
      setGrossWeight(Math.round((ord.totalQuantity || 5000) * 0.35));
      setNetWeight(Math.round((ord.totalQuantity || 5000) * 0.32));
    }
  };

  // Create Dispatch Submit
  const handleCreateDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !destination) return;

    const matchedOrd = ordersList.find(o => o.id === selectedOrderId);

    const newDispatch: Dispatch = {
      id: `ds-${Date.now()}`,
      dispatchNumber: `DSP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      buyerId: matchedOrd?.buyerId || "b1",
      buyerName,
      orderId: selectedOrderId || "o1",
      orderNumber: matchedOrd?.orderNumber || selectedOrderId || "ORD-2026-NEW",
      shipmentDate: dispatchDate,
      dispatchDate,
      destination,
      transporter,
      vehicleNumber,
      lrNumber,
      cartons: Number(cartons) || 100,
      quantity: Number(quantity) || 1000,
      grossWeight: Number(grossWeight) || 1500,
      netWeight: Number(netWeight) || 1350,
      invoiceRef,
      ewayBill,
      status: "in-transit",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = recordNewDispatch(newDispatch);
    setDispatchList(updated);
    setShowCreateModal(false);
    showToast(`Dispatch Note ${newDispatch.dispatchNumber} created! Order marked as DISPATCHED.`);
  };

  // Update Status Action
  const handleUpdateStatus = (id: string, newStatus: Dispatch["status"]) => {
    const updated = dispatchList.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: newStatus,
          deliveryDate: newStatus === "delivered" || newStatus === "pod-received" ? new Date().toISOString().split("T")[0] : d.deliveryDate
        };
      }
      return d;
    });
    saveDispatchesToStorage(updated);

    // If delivered, also mark order completed
    if (newStatus === "delivered" || newStatus === "pod-received") {
      const d = dispatchList.find(item => item.id === id);
      if (d && d.orderId) {
        updateOrderStatus(d.orderId, "completed");
      }
    }

    showToast(`Dispatch status updated to ${newStatus.toUpperCase()}`);
  };

  // Save POD
  const handleSavePOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispatchForPOD) return;

    const updated = markDispatchPODReceived(
      selectedDispatchForPOD.id,
      podDate,
      podReceiver || "Store Officer",
      podRemarks
    );
    setDispatchList(updated);
    setSelectedDispatchForPOD(null);
    showToast(`POD recorded for ${selectedDispatchForPOD.dispatchNumber}! Order closed & marked COMPLETED.`);
  };

  // Filtering
  const filtered = dispatchList.filter(d => {
    const matchesSearch =
      d.dispatchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.transporter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.lrNumber && d.lrNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && d.status === statusFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up text-sm font-semibold border border-emerald-500">
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Outbound Logistics & Dispatch
            </span>
            <span className="text-xs font-semibold text-slate-400">• Mrityunjay Enterprises</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1.5 flex items-center gap-2">
            <Truck className="text-indigo-600" size={26} /> Dispatch Gate Pass & Shipments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Outbound lorry receipts (LR), gate pass memos, transporter allocation, E-Way bills & POD verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/25"
          >
            <Plus size={16} /> Create Dispatch Note
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <Link href={`${basePath}/dispatch`} className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-sm">
          All Dispatch Memos ({dispatchList.length})
        </Link>
        <Link href={`${basePath}/dispatch`} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Shipment Schedules
        </Link>
        <Link href={`${basePath}/dispatch`} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Container & Milestone Tracking
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dispatch #, buyer, transporter, LR #..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "planned", "in-transit", "delivered", "pod-received"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors",
                statusFilter === st
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              )}
            >
              {st.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Dispatches Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Dispatch Gate Pass #</th>
                <th className="px-4 py-3.5">Buyer & Destination</th>
                <th className="px-4 py-3.5">Transporter & Vehicle</th>
                <th className="px-4 py-3.5">LR / B/L & E-Way Bill</th>
                <th className="px-4 py-3.5 text-right">Cartons</th>
                <th className="px-4 py-3.5 text-right">Qty (PCS)</th>
                <th className="px-4 py-3.5">Dispatch Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    <Truck size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold">No dispatch notes found matching filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      {d.dispatchNumber}
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{d.orderNumber}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white">{d.buyerName}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{d.destination}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{d.transporter}</p>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">{d.vehicleNumber}</p>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{d.lrNumber || "N/A"}</span>
                      <span className="text-[10px] font-mono text-indigo-600 block mt-0.5">{d.ewayBill || "No EWB"}</span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                      {d.cartons} CTN
                    </td>

                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                      {d.quantity.toLocaleString()} PCS
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap font-medium">
                      {formatDate(d.dispatchDate)}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        value={d.status}
                        onChange={(e) => handleUpdateStatus(d.id, e.target.value as any)}
                        className={cn(
                          "text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer border focus:outline-none",
                          d.status === "delivered" || d.status === "pod-received"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            : d.status === "in-transit"
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                        )}
                      >
                        <option value="planned">PLANNED</option>
                        <option value="in-transit">IN TRANSIT</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="pod-received">POD RECEIVED</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedDispatchForGatePass(d)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                      >
                        <Printer size={12} /> Gate Pass
                      </button>

                      {d.status !== "pod-received" && (
                        <button
                          onClick={() => setSelectedDispatchForPOD(d)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Upload size={12} /> Record POD
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DISPATCH NOTE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="text-indigo-600" size={22} /> Create Dispatch Note & Lorry Receipt
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Generate Gate Pass, allocate vehicle, and dispatch finished goods</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Confirmed Order *</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-xs"
                  >
                    <option value="">Select Order (Optional)...</option>
                    {ordersList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} — {o.buyerName} ({o.styleName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Buyer Name *</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Reliance Trends / Nordstrom"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Destination Address *</label>
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Reliance DC, Bhiwandi, Maharashtra / Port of Nhava Sheva"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Transporter Name *</label>
                  <input
                    type="text"
                    required
                    value={transporter}
                    onChange={(e) => setTransporter(e.target.value)}
                    placeholder="e.g. VRL Logistics / Safexpress"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle / Container No. *</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. RJ-06-GB-4589"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lorry Receipt (LR) / B/L No.</label>
                  <input
                    type="text"
                    value={lrNumber}
                    onChange={(e) => setLrNumber(e.target.value)}
                    placeholder="e.g. LR-789012"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">E-Way Bill Number</label>
                  <input
                    type="text"
                    value={ewayBill}
                    onChange={(e) => setEwayBill(e.target.value)}
                    placeholder="e.g. EWB-3345678901"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Carton Count</label>
                  <input
                    type="number"
                    value={cartons}
                    onChange={(e) => setCartons(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Dispatched Quantity (PCS)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-extrabold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gross Weight (KG)</label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Net Weight (KG)</label>
                  <input
                    type="number"
                    value={netWeight}
                    onChange={(e) => setNetWeight(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-md"
                >
                  Generate & Dispatch Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD POD MODAL */}
      {selectedDispatchForPOD && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="text-emerald-600" size={18} /> Record Proof of Delivery (POD)
              </h3>
              <button onClick={() => setSelectedDispatchForPOD(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePOD} className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500 font-medium">Dispatch Note: <span className="font-bold text-indigo-600">{selectedDispatchForPOD.dispatchNumber}</span></p>
                <p className="text-slate-500 font-medium">Buyer: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDispatchForPOD.buyerName}</span></p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Receiving Date *</label>
                <input
                  type="date"
                  required
                  value={podDate}
                  onChange={(e) => setPodDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Receiver Name / Officer *</label>
                <input
                  type="text"
                  required
                  value={podReceiver}
                  onChange={(e) => setPodReceiver(e.target.value)}
                  placeholder="e.g. Anil Sharma (Store Manager)"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Delivery Remarks / Verification</label>
                <textarea
                  value={podRemarks}
                  onChange={(e) => setPodRemarks(e.target.value)}
                  placeholder="Cartons received intact with seals verified without shortage."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedDispatchForPOD(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Verify & Save POD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE GATE PASS MODAL */}
      {selectedDispatchForGatePass && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official Factory Gate Pass & Lorry Receipt (LR)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <Printer size={14} /> Print Gate Pass
                </button>
                <button
                  onClick={() => setSelectedDispatchForGatePass(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* PRINT CONTENT */}
            <div className="border-2 border-slate-900 p-6 space-y-4 text-xs font-sans">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
                <h2 className="text-lg font-black tracking-wider uppercase text-indigo-900">
                  MRITYUNJAY ENTERPRISES PVT. LTD.
                </h2>
                <p className="font-semibold text-slate-700">Palri, Bhilwara, State- Rajasthan • GSTIN: 08AAACD1234F1Z9</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-1">
                  OUTBOUND FACTORY DISPATCH GATE PASS & LORRY MEMO
                </p>
              </div>

              {/* Grid Memo Details */}
              <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-3 text-xs">
                <div>
                  <p><strong className="text-slate-500">Gate Pass No:</strong> <span className="font-bold font-mono">{selectedDispatchForGatePass.dispatchNumber}</span></p>
                  <p><strong className="text-slate-500">Dispatch Date:</strong> {formatDate(selectedDispatchForGatePass.dispatchDate)}</p>
                  <p><strong className="text-slate-500">Order Ref:</strong> {selectedDispatchForGatePass.orderNumber}</p>
                  <p><strong className="text-slate-500">Invoice Ref:</strong> {selectedDispatchForGatePass.invoiceRef}</p>
                </div>

                <div>
                  <p><strong className="text-slate-500">LR / B/L No:</strong> <span className="font-bold font-mono text-indigo-700">{selectedDispatchForGatePass.lrNumber || "N/A"}</span></p>
                  <p><strong className="text-slate-500">E-Way Bill:</strong> <span className="font-mono">{selectedDispatchForGatePass.ewayBill || "N/A"}</span></p>
                  <p><strong className="text-slate-500">Transporter:</strong> {selectedDispatchForGatePass.transporter}</p>
                  <p><strong className="text-slate-500">Vehicle No:</strong> <span className="font-bold font-mono">{selectedDispatchForGatePass.vehicleNumber}</span></p>
                </div>
              </div>

              {/* Destination & Buyer */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-700 uppercase text-[10px]">Buyer & Consignee Address:</p>
                <p className="font-extrabold text-slate-900">{selectedDispatchForGatePass.buyerName}</p>
                <p className="text-slate-600">{selectedDispatchForGatePass.destination}</p>
              </div>

              {/* Quantity Summary Table */}
              <table className="w-full border-collapse border border-slate-900 text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900 font-bold uppercase text-[10px]">
                    <th className="border-r border-slate-900 p-2">Item / Package Description</th>
                    <th className="border-r border-slate-900 p-2 text-right">No. of Cartons</th>
                    <th className="border-r border-slate-900 p-2 text-right">Total PCS</th>
                    <th className="border-r border-slate-900 p-2 text-right">Gross Wt (KG)</th>
                    <th className="p-2 text-right">Net Wt (KG)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="font-semibold">
                    <td className="border-r border-slate-900 p-2">Apparel Finished Goods (Export Quality Garments)</td>
                    <td className="border-r border-slate-900 p-2 text-right font-bold">{selectedDispatchForGatePass.cartons} CTN</td>
                    <td className="border-r border-slate-900 p-2 text-right font-extrabold text-indigo-700">{selectedDispatchForGatePass.quantity.toLocaleString()} PCS</td>
                    <td className="border-r border-slate-900 p-2 text-right">{selectedDispatchForGatePass.grossWeight || 1800} KG</td>
                    <td className="p-2 text-right">{selectedDispatchForGatePass.netWeight || 1600} KG</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="grid grid-cols-4 gap-4 pt-12 text-center text-[10px] font-bold uppercase">
                <div className="border-t border-slate-900 pt-1">Store Officer</div>
                <div className="border-t border-slate-900 pt-1">Security Gate Check</div>
                <div className="border-t border-slate-900 pt-1">Driver Signature</div>
                <div className="border-t border-slate-900 pt-1">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DispatchView;
