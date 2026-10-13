"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buyers, styles, factories, orders } from "@/lib/demo-data";
import {
  Save, Plus, Trash2, CheckCircle2, AlertCircle, ArrowLeft, Check,
  FileText, Building2, Sparkles, PackageCheck, ShieldCheck, DollarSign, Receipt
} from "lucide-react";

interface ColorSizeLine {
  id: string;
  colorName: string;
  shadeCode: string;
  sizeBreakdown: string;
  quantity: number;
}

import { usePathname } from "next/navigation";

export function OrdersNewView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");
  // Form State for Required Text Fields & Selects
  const [buyerId, setBuyerId] = useState("");
  const [styleId, setStyleId] = useState("");
  const [buyerPO, setBuyerPO] = useState("");
  const [factoryId, setFactoryId] = useState("");
  const [season, setSeason] = useState("");
  const [orderCategory, setOrderCategory] = useState("Export Order");
  const [fabricComposition, setFabricComposition] = useState("");
  const [shadeCode, setShadeCode] = useState("");
  const [garmentFit, setGarmentFit] = useState("");
  const [exFactoryDate, setExFactoryDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [fobPrice, setFobPrice] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [paymentTerms, setPaymentTerms] = useState("LC 60 Days");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [destinationPort, setDestinationPort] = useState("");
  const [aqlLevel, setAqlLevel] = useState("AQL 2.5");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Breakdown lines state
  const [lines, setLines] = useState<ColorSizeLine[]>([
    { id: "1", colorName: "", shadeCode: "", sizeBreakdown: "", quantity: 0 },
  ]);

  // Validation & Submission State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");

  const addLine = () => {
    setLines(prev => [
      ...prev,
      { id: Date.now().toString(), colorName: "", shadeCode: "", sizeBreakdown: "", quantity: 0 }
    ]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(prev => prev.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof ColorSizeLine, value: any) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const totalQuantity = lines.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const totalOrderValue = totalQuantity * (parseFloat(fobPrice) || 0);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!buyerId) errs.buyerId = "Buyer selection is required";
    if (!styleId) errs.styleId = "Style selection is required";
    if (!buyerPO.trim()) errs.buyerPO = "Buyer PO Number is required";
    if (!factoryId) errs.factoryId = "Factory unit is required";
    if (!season.trim()) errs.season = "Season / Collection is required";
    if (!fabricComposition.trim()) errs.fabricComposition = "Fabric Composition & GSM specs required";
    if (!shadeCode.trim()) errs.shadeCode = "Fabric Color / Shade Code required";
    if (!garmentFit.trim()) errs.garmentFit = "Garment Fit / Silhouette required";
    if (!exFactoryDate) errs.exFactoryDate = "Ex-Factory Date is required";
    if (!deliveryDate) errs.deliveryDate = "Target Delivery Date is required";
    if (!fobPrice || parseFloat(fobPrice) <= 0) errs.fobPrice = "Valid FOB Price is required";
    if (!portOfLoading.trim()) errs.portOfLoading = "Port of Loading is required";
    if (!destinationPort.trim()) errs.destinationPort = "Destination Country / Port is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Generate Order Number
    const generatedNo = `ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOrderNumber(generatedNo);

    const buyerObj = buyers.find(b => b.id === buyerId);
    const styleObj = styles.find(s => s.id === styleId);
    const factoryObj = factories.find(f => f.id === factoryId);

    const newOrderObj = {
      id: `o-${Date.now()}`,
      orderNumber: generatedNo,
      buyerPO: buyerPO,
      buyerId: buyerId,
      buyerName: buyerObj?.name || "Client Buyer",
      brand: buyerObj?.name || "Buyer Brand",
      styleId: styleId,
      styleName: styleObj?.styleName || "Garment Style",
      styleNumber: styleObj?.styleNumber || "STYLE-001",
      orderDate: new Date().toISOString().split("T")[0],
      confirmationDate: new Date().toISOString().split("T")[0],
      deliveryDate: deliveryDate,
      shipmentDate: exFactoryDate,
      currency: currency,
      paymentTerms: paymentTerms,
      totalQuantity: totalQuantity,
      unitPrice: parseFloat(fobPrice) || 0,
      totalValue: totalOrderValue,
      merchandiserId: "e3",
      merchandiserName: "Arjun Mehta",
      factoryId: factoryId,
      factoryName: factoryObj?.name || "Mrityunjay Enterprises",
      priority: "high",
      status: "confirmed",
      cuttingQty: 0,
      stitchingQty: 0,
      finishingQty: 0,
      packedQty: 0,
      dispatchedQty: 0,
      rejectedQty: 0,
      estimatedCost: totalOrderValue * 0.7,
      actualCost: 0,
      profitMargin: 30,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      // 1. Save to garmentflow_orders
      const savedOrders = localStorage.getItem("garmentflow_orders");
      const currentOrders = savedOrders ? JSON.parse(savedOrders) : orders;
      localStorage.setItem("garmentflow_orders", JSON.stringify([newOrderObj, ...currentOrders]));

      // 2. CONNECTED STEP: Create Production Plan
      const newPlan = {
        id: `pp-${Date.now()}`,
        planNumber: `PPC-2026-${Math.floor(100 + Math.random() * 900)}`,
        orderId: newOrderObj.id,
        orderNumber: generatedNo,
        buyerName: newOrderObj.buyerName,
        styleName: newOrderObj.styleName,
        lineName: "Line A - Stitching Floor",
        factoryName: newOrderObj.factoryName,
        plannedStartDate: new Date().toISOString().split("T")[0],
        plannedEndDate: exFactoryDate || deliveryDate,
        plannedQty: totalQuantity,
        completedQty: 0,
        dailyTarget: Math.round(totalQuantity / 15) || 400,
        targetEfficiency: 85,
        status: "in-progress",
        createdAt: new Date().toISOString().split("T")[0]
      };
      const savedPlans = localStorage.getItem("garmentflow_production_plans");
      const currentPlans = savedPlans ? JSON.parse(savedPlans) : [];
      localStorage.setItem("garmentflow_production_plans", JSON.stringify([newPlan, ...currentPlans]));

      // 3. CONNECTED STEP: Create Dispatch Booking
      const newDispatch = {
        id: `dsp-${Date.now()}`,
        dispatchNumber: `DSP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: newOrderObj.id,
        orderNumber: generatedNo,
        buyerName: newOrderObj.buyerName,
        destinationPort: destinationPort,
        exFactoryDate: exFactoryDate,
        totalCartons: Math.ceil(totalQuantity / 50),
        dispatchedQty: totalQuantity,
        vehicleNumber: "RJ-14-GA-5678",
        lrNumber: `LR-${generatedNo.slice(-4)}`,
        status: "scheduled",
        createdAt: new Date().toISOString().split("T")[0]
      };
      const savedDispatches = localStorage.getItem("garmentflow_dispatches");
      const currentDispatches = savedDispatches ? JSON.parse(savedDispatches) : [];
      localStorage.setItem("garmentflow_dispatches", JSON.stringify([newDispatch, ...currentDispatches]));

      // 4. CONNECTED STEP: Create Draft Tax Invoice
      const subtotalINR = Math.round(totalOrderValue * (currency === "USD" ? 83 : currency === "EUR" ? 90 : 1));
      const taxINR = Math.round(subtotalINR * 0.05);
      const totalINR = subtotalINR + taxINR;

      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceType: "tax-invoice" as const,
        buyerId: newOrderObj.buyerId,
        buyerName: newOrderObj.buyerName,
        buyerGstin: "06ALAPR8724P1ZH",
        orderNumber: generatedNo,
        dispatchNumber: newDispatch.dispatchNumber,
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: deliveryDate,
        currency: currency === "USD" || currency === "EUR" ? "INR" : currency,
        hsnCode: "620349",
        paymentTerms: paymentTerms,
        items: [
          {
            id: `ii-1`,
            description: `${newOrderObj.styleName} (${newOrderObj.styleNumber})`,
            hsnCode: "620349",
            quantity: totalQuantity,
            unit: "PCS",
            unitPrice: Math.round(subtotalINR / totalQuantity),
            discount: 0,
            taxableAmount: subtotalINR,
            taxRate: 5,
            total: totalINR
          }
        ],
        subtotal: subtotalINR,
        taxRate: 5,
        cgstAmount: Math.round(taxINR / 2),
        sgstAmount: Math.round(taxINR / 2),
        igstAmount: 0,
        totalTax: taxINR,
        totalAmount: totalINR,
        amountPaid: 0,
        balanceDue: totalINR,
        bankName: "Mrityunjay Demo Bank",
        bankAccount: "123456789012",
        bankIfsc: "CDEV0001234",
        status: "sent" as const,
        createdBy: "Commercial Merchandiser",
        createdAt: new Date().toISOString().split("T")[0]
      };
      const savedInvoices = localStorage.getItem("garmentflow_invoices");
      const currentInvoices = savedInvoices ? JSON.parse(savedInvoices) : [];
      localStorage.setItem("garmentflow_invoices", JSON.stringify([newInvoice, ...currentInvoices]));

    } catch (err) {
      console.error("Error saving connected process records:", err);
    }

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 animate-fade-in text-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800 shadow-xl space-y-5">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Order Confirmed & Booked
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{createdOrderNumber}</h2>
            <p className="text-sm text-slate-500 mt-1">
              Production Order successfully registered against PO <strong className="text-slate-800 dark:text-slate-200">{buyerPO}</strong>
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-left grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Total Quantity</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{totalQuantity.toLocaleString()} pcs</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Total Order Value</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{currency} {totalOrderValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Ex-Factory Date</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{exFactoryDate}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">AQL Quality Standard</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{aqlLevel}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href={`${prefix}/invoices/new?orderId=${createdOrderNumber}`}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md text-center flex items-center justify-center gap-1.5"
            >
              <Receipt size={16} /> Make Invoice from Order
            </Link>
            <Link
              href={`${prefix}/orders`}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md text-center"
            >
              View Orders List
            </Link>
            <button
              onClick={() => { setIsSubmitted(false); setErrors({}); }}
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              Create Another Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`${prefix}/orders`} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create & Confirm Order</h1>
            <p className="text-sm text-slate-500 mt-0.5">Book a production order against buyer PO with mandatory garment specifications</p>
          </div>
        </div>
      </div>

      {/* Global Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-700 dark:text-red-400">Please fill in all mandatory text fields</h4>
            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">There are {Object.keys(errors).length} required fields missing below.</p>
          </div>
        </div>
      )}

      {/* Main Order Form */}
      <form onSubmit={handleConfirmOrder} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 space-y-8 shadow-sm">
        {/* SECTION 1: Commercial & Buyer Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Building2 size={18} /> 1. Commercial & Buyer PO Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Buyer Name <span className="text-red-500">*</span>
              </label>
              <select
                value={buyerId}
                onChange={e => { setBuyerId(e.target.value); setErrors(prev => ({ ...prev, buyerId: "" })); }}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 transition-all",
                  errors.buyerId ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              >
                <option value="">-- Select Buyer --</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
              {errors.buyerId && <p className="text-[11px] text-red-500 mt-1">{errors.buyerId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Style Master <span className="text-red-500">*</span>
              </label>
              <select
                value={styleId}
                onChange={e => { setStyleId(e.target.value); setErrors(prev => ({ ...prev, styleId: "" })); }}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 transition-all",
                  errors.styleId ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              >
                <option value="">-- Select Style --</option>
                {styles.map(s => (
                  <option key={s.id} value={s.id}>{s.styleNumber} - {s.styleName}</option>
                ))}
              </select>
              {errors.styleId && <p className="text-[11px] text-red-500 mt-1">{errors.styleId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Buyer PO Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={buyerPO}
                onChange={e => { setBuyerPO(e.target.value); setErrors(prev => ({ ...prev, buyerPO: "" })); }}
                placeholder="e.g. PO-NORD-2025-8849"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.buyerPO ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.buyerPO && <p className="text-[11px] text-red-500 mt-1">{errors.buyerPO}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Factory Production Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={factoryId}
                onChange={e => { setFactoryId(e.target.value); setErrors(prev => ({ ...prev, factoryId: "" })); }}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 transition-all",
                  errors.factoryId ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              >
                <option value="">-- Select Factory Unit --</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.city})</option>
                ))}
              </select>
              {errors.factoryId && <p className="text-[11px] text-red-500 mt-1">{errors.factoryId}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Season & Collection <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={season}
                onChange={e => { setSeason(e.target.value); setErrors(prev => ({ ...prev, season: "" })); }}
                placeholder="e.g. AW-2025 / Summer Sprint"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.season ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.season && <p className="text-[11px] text-red-500 mt-1">{errors.season}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Order Category / Type <span className="text-red-500">*</span>
              </label>
              <select
                value={orderCategory}
                onChange={e => setOrderCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option>Export Order</option>
                <option>Domestic Order</option>
                <option>Sampling Order</option>
                <option>OEM Contract</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Garment & Fabric Technical Specifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <FileText size={18} /> 2. Garment & Fabric Required Specifications
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fabric Composition & GSM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fabricComposition}
                onChange={e => { setFabricComposition(e.target.value); setErrors(prev => ({ ...prev, fabricComposition: "" })); }}
                placeholder="e.g. 100% Cotton Single Jersey 180 GSM"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.fabricComposition ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.fabricComposition && <p className="text-[11px] text-red-500 mt-1">{errors.fabricComposition}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Fabric Color & Shade Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shadeCode}
                onChange={e => { setShadeCode(e.target.value); setErrors(prev => ({ ...prev, shadeCode: "" })); }}
                placeholder="e.g. Navy Blue #19-4024 TPC"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.shadeCode ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.shadeCode && <p className="text-[11px] text-red-500 mt-1">{errors.shadeCode}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Garment Fit / Silhouette Specs <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={garmentFit}
                onChange={e => { setGarmentFit(e.target.value); setErrors(prev => ({ ...prev, garmentFit: "" })); }}
                placeholder="e.g. Slim Fit / Regular Length"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.garmentFit ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.garmentFit && <p className="text-[11px] text-red-500 mt-1">{errors.garmentFit}</p>}
            </div>
          </div>
        </div>

        {/* SECTION 3: Pricing, Shipment & Logistics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <DollarSign size={18} /> 3. Pricing, Dates & Logistics
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Ex-Factory Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={exFactoryDate}
                onChange={e => { setExFactoryDate(e.target.value); setErrors(prev => ({ ...prev, exFactoryDate: "" })); }}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.exFactoryDate ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.exFactoryDate && <p className="text-[11px] text-red-500 mt-1">{errors.exFactoryDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => { setDeliveryDate(e.target.value); setErrors(prev => ({ ...prev, deliveryDate: "" })); }}
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.deliveryDate ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.deliveryDate && <p className="text-[11px] text-red-500 mt-1">{errors.deliveryDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                FOB Unit Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={fobPrice}
                onChange={e => { setFobPrice(e.target.value); setErrors(prev => ({ ...prev, fobPrice: "" })); }}
                placeholder="e.g. 14.50"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.fobPrice ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.fobPrice && <p className="text-[11px] text-red-500 mt-1">{errors.fobPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>INR</option>
                <option>AUD</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option>LC 60 Days</option>
                <option>LC 90 Days</option>
                <option>TT 30 Days Advance</option>
                <option>Net 30 Days</option>
                <option>DP / Sight</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Port of Loading <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={portOfLoading}
                onChange={e => { setPortOfLoading(e.target.value); setErrors(prev => ({ ...prev, portOfLoading: "" })); }}
                placeholder="e.g. Nhava Sheva (JNPT) / ICD Jaipur"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.portOfLoading ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.portOfLoading && <p className="text-[11px] text-red-500 mt-1">{errors.portOfLoading}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Destination Port / Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={destinationPort}
                onChange={e => { setDestinationPort(e.target.value); setErrors(prev => ({ ...prev, destinationPort: "" })); }}
                placeholder="e.g. Port of Los Angeles, USA"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.destinationPort ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.destinationPort && <p className="text-[11px] text-red-500 mt-1">{errors.destinationPort}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Quality Standard (AQL) <span className="text-red-500">*</span>
              </label>
              <select
                value={aqlLevel}
                onChange={e => setAqlLevel(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option>AQL 1.5 Strict</option>
                <option>AQL 2.5 Standard</option>
                <option>AQL 4.0 General</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Size & Color Ratio Matrix */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <PackageCheck size={18} /> 4. Color & Size Ratio Breakdown
            </div>
            <button
              type="button"
              onClick={addLine}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl"
            >
              <Plus size={14} /> Add Color Variant
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div key={line.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 items-center">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Color Name</label>
                  <input
                    type="text"
                    value={line.colorName}
                    onChange={e => updateLine(line.id, "colorName", e.target.value)}
                    placeholder="e.g. Navy Blue"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Shade Code</label>
                  <input
                    type="text"
                    value={line.shadeCode}
                    onChange={e => updateLine(line.id, "shadeCode", e.target.value)}
                    placeholder="NVY-01"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Size Matrix (Ratio)</label>
                  <input
                    type="text"
                    value={line.sizeBreakdown}
                    onChange={e => updateLine(line.id, "sizeBreakdown", e.target.value)}
                    placeholder="S:200, M:400, L:400, XL:200"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Quantity (Pcs)</label>
                  <input
                    type="number"
                    value={line.quantity || ""}
                    onChange={e => updateLine(line.id, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="1200"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 text-center"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(line.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors mt-4 sm:mt-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Calculated Totals */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Total Order Summary:</span>
            <div className="flex items-center gap-6 text-xs">
              <span className="text-slate-600 dark:text-slate-300">Total Units: <strong className="text-slate-900 dark:text-white text-sm">{totalQuantity.toLocaleString()} pcs</strong></span>
              <span className="text-slate-600 dark:text-slate-300">Order Value: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{currency} {totalOrderValue.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* SECTION 5: Special Instructions */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Special Instructions & Buyer Requirements
          </label>
          <textarea
            rows={3}
            value={specialInstructions}
            onChange={e => setSpecialInstructions(e.target.value)}
            placeholder="Specify hanger packing requirements, barcoding format, carton shipping marks, needle detector policy..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/25"
          >
            <CheckCircle2 size={18} /> Confirm Order
          </button>
          <Link
            href={`${prefix}/orders`}
            className="px-6 py-3.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
