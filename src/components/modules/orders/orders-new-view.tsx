"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buyers, styles, factories, orders } from "@/lib/demo-data";
import {
  Save, Plus, Trash2, CheckCircle2, AlertCircle, ArrowLeft,
  FileText, Building2, PackageCheck, Receipt,
  X, UserPlus, IndianRupee, Sparkles
} from "lucide-react";
import { getStoredBuyers, saveStoredBuyer, generateNextBuyerCode, WORKFLOW_EVENT } from "@/lib/workflow-service";
import { Buyer, OrderStyleLine } from "@/lib/types";

export interface ColorSizeLine {
  id: string;
  styleId?: string;
  colorName: string;
  shadeCode: string;
  sizeBreakdown: string;
  quantity: number;
}

import { usePathname } from "next/navigation";

export function OrdersNewView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");

  // Buyers dynamic state from stored CRM directory
  const [buyerList, setBuyerList] = useState<Buyer[]>([]);
  const [isAddBuyerOpen, setIsAddBuyerOpen] = useState(false);
  const [buyerToast, setBuyerToast] = useState("");

  // Add Buyer Modal Form State (Full Format matching Buyers -> Add Buyer)
  const [newBuyerCode, setNewBuyerCode] = useState("");
  const [newBuyerName, setNewBuyerName] = useState("");
  const [newBuyerBrand, setNewBuyerBrand] = useState("");
  const [newBuyerCategory, setNewBuyerCategory] = useState<"domestic" | "export" | "both">("domestic");
  const [newBuyerType, setNewBuyerType] = useState<"retail" | "wholesale" | "private-label" | "brand">("brand");
  const [newBuyerGst, setNewBuyerGst] = useState("");
  const [newBuyerCountry, setNewBuyerCountry] = useState("");
  const [newBuyerState, setNewBuyerState] = useState("");
  const [newBuyerCity, setNewBuyerCity] = useState("");
  const [newBuyerCurrency, setNewBuyerCurrency] = useState("INR");
  const [newBuyerContactPerson, setNewBuyerContactPerson] = useState("");
  const [newBuyerEmail, setNewBuyerEmail] = useState("");
  const [newBuyerPhone, setNewBuyerPhone] = useState("");
  const [newBuyerPaymentTerms, setNewBuyerPaymentTerms] = useState("30% Advance + Balance before Dispatch");
  const [newBuyerCreditLimit, setNewBuyerCreditLimit] = useState("");
  const [newBuyerAddress, setNewBuyerAddress] = useState("");
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const syncBuyers = () => {
      try {
        const list = typeof getStoredBuyers === "function" ? getStoredBuyers() : buyers;
        setBuyerList(list || []);
      } catch (err) {
        console.warn("Could not sync stored buyers, falling back to demo data:", err);
        setBuyerList(buyers || []);
      }
    };
    syncBuyers();
    window.addEventListener(WORKFLOW_EVENT, syncBuyers);
    window.addEventListener("storage", syncBuyers);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, syncBuyers);
      window.removeEventListener("storage", syncBuyers);
    };
  }, []);

  const openAddBuyerModal = () => {
    setNewBuyerCode("");
    setNewBuyerName("");
    setNewBuyerBrand("");
    setNewBuyerCategory("domestic");
    setNewBuyerType("brand");
    setNewBuyerGst("");
    setNewBuyerCountry("");
    setNewBuyerState("");
    setNewBuyerCity("");
    setNewBuyerCurrency("INR");
    setNewBuyerContactPerson("");
    setNewBuyerEmail("");
    setNewBuyerPhone("");
    setNewBuyerPaymentTerms(paymentTerms || "30% Advance + Balance before Dispatch");
    setNewBuyerCreditLimit("");
    setNewBuyerAddress("");
    setModalErrors({});
    setIsAddBuyerOpen(true);
  };

  const handleSaveNewBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    const mErrs: Record<string, string> = {};
    if (!newBuyerName.trim()) mErrs.name = "Company Name is required";
    if (!newBuyerContactPerson.trim()) mErrs.contactPerson = "Contact Person is required";
    if (!newBuyerEmail.trim()) mErrs.email = "Email Address is required";

    if (Object.keys(mErrs).length > 0) {
      setModalErrors(mErrs);
      return;
    }

    const autoCode = newBuyerCode.trim() || generateNextBuyerCode();
    const cleanGst = newBuyerGst.trim().toUpperCase();
    const newBuyer: Buyer = {
      id: `b-${Date.now()}`,
      code: autoCode,
      name: newBuyerName.trim(),
      companyName: newBuyerBrand.trim() || newBuyerName.trim(),
      category: newBuyerCategory,
      type: newBuyerType,
      contactPerson: newBuyerContactPerson.trim(),
      email: newBuyerEmail.trim(),
      phone: newBuyerPhone.trim(),
      country: newBuyerCountry.trim(),
      state: newBuyerState.trim(),
      city: newBuyerCity.trim(),
      address: newBuyerAddress.trim(),
      currency: newBuyerCurrency || "INR",
      paymentTerms: newBuyerPaymentTerms || "30% Advance + Balance before Dispatch",
      creditLimit: parseFloat(newBuyerCreditLimit) || 0,
      totalOrders: 0,
      totalOrderValue: 0,
      outstandingAmount: 0,
      rating: 5.0,
      status: "active",
      gstNumber: cleanGst || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    saveStoredBuyer(newBuyer);
    setBuyerList(prev => [newBuyer, ...prev.filter(b => b.id !== newBuyer.id)]);
    setBuyerId(newBuyer.id);
    if (newBuyer.gstNumber) setBuyerGstNumber(newBuyer.gstNumber);
    if (newBuyer.city) setDestinationCity(newBuyer.city);
    if (newBuyer.paymentTerms) setPaymentTerms(newBuyer.paymentTerms);
    setErrors(prev => ({ ...prev, buyerId: "" }));

    setIsAddBuyerOpen(false);
    setBuyerToast(`Buyer "${newBuyer.name}" (${newBuyer.code}) registered and selected!`);
    setTimeout(() => setBuyerToast(""), 4000);
  };

  // Form State with Smart Defaults & Single Factory (Point 1)
  const [buyerId, setBuyerId] = useState("");
  const [buyerPO, setBuyerPO] = useState("");
  // Only one factory exists in the system: Mrityunjay Enterprises (Main Facility)
  const factoryId = "f1";
  const factoryName = "Mrityunjay Enterprises (Main Facility)";
  const [season, setSeason] = useState("");
  const [orderCategory, setOrderCategory] = useState("Domestic Brand Order");
  const [fabricComposition, setFabricComposition] = useState("");
  const [shadeCode, setShadeCode] = useState("");
  const [garmentFit, setGarmentFit] = useState("");
  const [exFactoryDate, setExFactoryDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Pricing (INR ₹), GST & Domestic Delivery
  const [unitRate, setUnitRate] = useState<string>("");
  const currency = "INR";
  const [gstRate, setGstRate] = useState<string>("5");
  const [buyerGstNumber, setBuyerGstNumber] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30% Advance + Balance before Dispatch");
  const [aqlLevel, setAqlLevel] = useState("AQL 2.5 Standard");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Multiple Style Masters state in Section 1 (starts with 1 empty unselected style)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([""]);

  const handleAddStyle = () => {
    setSelectedStyles(prev => [...prev, ""]);
  };

  const handleRemoveStyle = (index: number) => {
    if (selectedStyles.length > 1) {
      setSelectedStyles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdateStyle = (index: number, val: string) => {
    setSelectedStyles(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // Breakdown lines state (starts completely blank)
  const [lines, setLines] = useState<ColorSizeLine[]>([
    { id: "1", styleId: "", colorName: "", shadeCode: "", sizeBreakdown: "", quantity: 0 },
  ]);

  const addLine = () => {
    setLines(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        styleId: selectedStyles[prev.length % selectedStyles.length] || selectedStyles[0] || "st1",
        colorName: "",
        shadeCode: "",
        sizeBreakdown: "",
        quantity: 0
      }
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

  // Indian Domestic Commercial Calculations (All INR ₹)
  const totalQuantity = lines.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const unitRateNum = parseFloat(unitRate) || 0;
  const taxableAmount = totalQuantity * unitRateNum;
  const gstPct = parseFloat(gstRate) || 0;
  const gstAmount = Math.round(taxableAmount * (gstPct / 100));
  const totalOrderValue = taxableAmount + gstAmount;

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!buyerId) errs.buyerId = "Please select or register a buyer";
    if (selectedStyles.length === 0 || !selectedStyles[0]) errs.styleId = "Style selection is required";
    if (!buyerPO.trim()) errs.buyerPO = "Buyer PO / Order reference is required";
    if (totalQuantity <= 0) errs.quantity = "Total order quantity must be greater than 0";
    if (!unitRate || unitRateNum <= 0) errs.unitRate = "Price per piece (₹) is required";
    if (!destinationCity.trim()) errs.destinationCity = "Delivery destination is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const placeOfSupply = destinationCity.trim() || "Rajasthan";
    const hsnCode = "6109";
    const transporterName = "Road Transport";
    const freightTerms = "To-Pay";
    const isIntraState = placeOfSupply.toLowerCase().includes("rajasthan");

    // Generate Order Number
    const generatedNo = `ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedOrderNumber(generatedNo);

    const buyerObj = buyerList.find(b => b.id === buyerId) || buyers.find(b => b.id === buyerId);

    // Format all style master lines
    const formattedStyles: OrderStyleLine[] = lines.map((entry, idx) => {
      const sId = entry.styleId || selectedStyles[0] || "st1";
      const sObj = styles.find(s => s.id === sId) || styles[0];
      const lineQty = Number(entry.quantity) || 0;
      const unitVal = unitRateNum;
      return {
        id: entry.id || `stl-${idx + 1}`,
        styleId: sId,
        styleNumber: sObj?.styleNumber || "STYLE",
        styleName: sObj?.styleName || "Garment Style",
        colorName: entry.colorName || "Standard",
        shadeCode: entry.shadeCode || "",
        sizeBreakdown: entry.sizeBreakdown || "Standard",
        quantity: lineQty,
        unitPrice: unitVal,
        totalValue: lineQty * unitVal,
      };
    });

    const primaryStyle = styles.find(s => s.id === selectedStyles[0]) || styles[0];
    const styleDisplayName = selectedStyles.length > 1
      ? `${primaryStyle?.styleName || "Garment Style"} (+${selectedStyles.length - 1} more styles)`
      : (primaryStyle?.styleName || "Garment Style");
    const styleDisplayNumber = selectedStyles.length > 1
      ? `${primaryStyle?.styleNumber || "STYLE"} (Multi)`
      : (primaryStyle?.styleNumber || "STYLE-001");

    const newOrderObj = {
      id: `o-${Date.now()}`,
      orderNumber: generatedNo,
      buyerPO: buyerPO.trim(),
      buyerId: buyerId,
      buyerName: buyerObj?.name || "Client Buyer",
      brand: buyerObj?.companyName || buyerObj?.name || "Buyer Brand",
      styleId: selectedStyles[0] || "st1",
      styleName: styleDisplayName,
      styleNumber: styleDisplayNumber,
      styles: formattedStyles,
      orderDate: new Date().toISOString().split("T")[0],
      confirmationDate: new Date().toISOString().split("T")[0],
      deliveryDate: deliveryDate,
      shipmentDate: exFactoryDate,
      currency: "INR",
      paymentTerms: paymentTerms,
      totalQuantity: totalQuantity,
      unitPrice: unitRateNum,
      taxableAmount: taxableAmount,
      gstAmount: gstAmount,
      totalValue: totalOrderValue,
      gstRate: gstPct,
      buyerGstNumber: buyerGstNumber || (buyerObj as any)?.gstNumber || "",
      placeOfSupply: placeOfSupply,
      hsnCode: hsnCode,
      destinationCity: destinationCity,
      transporterName: transporterName,
      freightTerms: freightTerms,
      merchandiserId: "e3",
      merchandiserName: "Arjun Mehta",
      factoryId: factoryId,
      factoryName: factoryName,
      priority: "high" as const,
      status: "confirmed" as const,
      cuttingQty: 0,
      stitchingQty: 0,
      finishingQty: 0,
      packedQty: 0,
      dispatchedQty: 0,
      rejectedQty: 0,
      estimatedCost: taxableAmount * 0.7,
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
        factoryName: factoryName,
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

      // 3. CONNECTED STEP: Create Dispatch Booking (Domestic Road/Surface Logistics)
      const newDispatch = {
        id: `dsp-${Date.now()}`,
        dispatchNumber: `DSP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: newOrderObj.id,
        orderNumber: generatedNo,
        buyerName: newOrderObj.buyerName,
        destination: destinationCity,
        transporter: transporterName,
        freightTerms: freightTerms,
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

      // 4. CONNECTED STEP: Create Draft Tax Invoice in INR with GST
      const invoiceItems = formattedStyles.map((fs, idx) => {
        const lineTaxable = fs.quantity * unitRateNum;
        const lineTax = Math.round(lineTaxable * (gstPct / 100));
        return {
          id: `ii-${idx + 1}`,
          description: `${fs.styleName} (${fs.styleNumber}) - ${fs.colorName || "Standard"}`,
          hsnCode: hsnCode,
          quantity: fs.quantity,
          unit: "PCS",
          unitPrice: unitRateNum,
          discount: 0,
          taxableAmount: lineTaxable,
          taxRate: gstPct,
          total: lineTaxable + lineTax
        };
      });

      const newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceType: "tax-invoice" as const,
        buyerId: newOrderObj.buyerId,
        buyerName: newOrderObj.buyerName,
        buyerGstin: buyerGstNumber || (buyerObj as any)?.gstNumber || "08AAECP2948K1ZV",
        orderNumber: generatedNo,
        dispatchNumber: newDispatch.dispatchNumber,
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: deliveryDate,
        currency: "INR",
        hsnCode: hsnCode,
        paymentTerms: paymentTerms,
        placeOfSupply: placeOfSupply,
        destination: destinationCity,
        transporter: transporterName,
        items: invoiceItems.length > 0 ? invoiceItems : [
          {
            id: `ii-1`,
            description: `${newOrderObj.styleName} (${newOrderObj.styleNumber})`,
            hsnCode: hsnCode,
            quantity: totalQuantity,
            unit: "PCS",
            unitPrice: unitRateNum,
            discount: 0,
            taxableAmount: taxableAmount,
            taxRate: gstPct,
            total: totalOrderValue
          }
        ],
        subtotal: taxableAmount,
        taxRate: gstPct,
        cgstAmount: isIntraState ? Math.round(gstAmount / 2) : 0,
        sgstAmount: isIntraState ? Math.round(gstAmount / 2) : 0,
        igstAmount: !isIntraState ? gstAmount : 0,
        totalTax: gstAmount,
        totalAmount: totalOrderValue,
        amountPaid: 0,
        balanceDue: totalOrderValue,
        bankName: "State Bank of India (SBI)",
        bankAccount: "338901234567",
        bankIfsc: "SBIN0001234",
        status: "sent" as const,
        createdBy: "Commercial Merchandiser",
        notes: `Domestic GST Tax Invoice. Place of Supply: ${placeOfSupply}. HSN: ${hsnCode}. Transporter: ${transporterName}. Delivery: ${destinationCity}.`,
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

      {/* Main Order Form */}
      <form onSubmit={handleConfirmOrder} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 space-y-8 shadow-sm">
        {/* SECTION 1: Commercial & Buyer Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <Building2 size={18} /> 1. Commercial & Buyer PO Details
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Buyer Name <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={openAddBuyerModal}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                >
                  <Plus size={13} className="stroke-[2.5]" />
                  <span>Add New Buyer</span>
                </button>
              </div>
              <div className="flex gap-2">
                <select
                  value={buyerId}
                  onChange={e => {
                    const selId = e.target.value;
                    setBuyerId(selId);
                    setErrors(prev => ({ ...prev, buyerId: "" }));
                    const found = buyerList.find(b => b.id === selId);
                    if (found) {
                      if (found.gstNumber) setBuyerGstNumber(found.gstNumber);
                      if (found.city) setDestinationCity(found.city);
                      if (found.paymentTerms) setPaymentTerms(found.paymentTerms);
                    }
                  }}
                  className={cn(
                    "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 transition-all",
                    errors.buyerId ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                  )}
                >
                  <option value="">-- Select Buyer --</option>
                  {buyerList.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openAddBuyerModal}
                  title="Add New Buyer"
                  className="h-11 px-3.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                >
                  <Plus size={18} />
                </button>
              </div>
              {errors.buyerId && <p className="text-[11px] text-red-500 mt-1">{errors.buyerId}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Style Master <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddStyle}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer"
                >
                  <Plus size={12} className="stroke-[2.5]" />
                  <span>Add Another Style</span>
                </button>
              </div>
              <div className="space-y-2">
                {selectedStyles.map((sid, idx) => (
                  <div key={idx} className="flex gap-2">
                    <select
                      value={sid}
                      onChange={e => handleUpdateStyle(idx, e.target.value)}
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
                    {selectedStyles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStyle(idx)}
                        title="Remove Style"
                        className="h-11 px-3 rounded-xl border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
                placeholder="e.g. PO-NORD-2026-8849"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.buyerPO ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.buyerPO && <p className="text-[11px] text-red-500 mt-1">{errors.buyerPO}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Factory Production Unit
              </label>
              <input
                type="text"
                readOnly
                value={factoryName}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-default"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Season & Collection
              </label>
              <input
                type="text"
                value={season}
                onChange={e => setSeason(e.target.value)}
                placeholder="e.g. SS-2026 / Spring Sprint"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Order Category / Type
              </label>
              <select
                value={orderCategory}
                onChange={e => setOrderCategory(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option>Domestic Brand Order</option>
                <option>Wholesale / Distribution Order</option>
                <option>Retail Chain Supply</option>
                <option>OEM / Jobwork Contract</option>
                <option>Sampling / Trial Batch</option>
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

        {/* SECTION 3: Pricing, GST & Delivery Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            <IndianRupee size={18} /> 3. Pricing, GST & Delivery Details (₹ INR)
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
                Price per Piece (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="1"
                  value={unitRate}
                  onChange={e => { setUnitRate(e.target.value); setErrors(prev => ({ ...prev, unitRate: "" })); }}
                  placeholder="450"
                  className={cn(
                    "w-full h-11 pl-8 pr-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 transition-all",
                    errors.unitRate ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                  )}
                />
              </div>
              {errors.unitRate && <p className="text-[11px] text-red-500 mt-1">{errors.unitRate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                GST Rate (%)
              </label>
              <select
                value={gstRate}
                onChange={e => setGstRate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option value="5">5% (Readymade Garments)</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="0">0% (Nil / Exempt)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Buyer GST Number (Optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={buyerGstNumber}
                onChange={e => setBuyerGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 08AAAAA0000A1Z5"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={destinationCity}
                onChange={e => { setDestinationCity(e.target.value); setErrors(prev => ({ ...prev, destinationCity: "" })); }}
                placeholder="e.g. Jaipur, Delhi, Mumbai"
                className={cn(
                  "w-full h-11 px-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.destinationCity ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.destinationCity && <p className="text-[11px] text-red-500 mt-1">{errors.destinationCity}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Terms <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <option>30% Advance + Balance before Dispatch</option>
                <option>100% Advance Payment</option>
                <option>Against Bilty / Delivery (LR Copy)</option>
                <option>Net 30 Days Credit</option>
                <option>Net 15 Days Credit</option>
                <option>Cash on Delivery (COD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: Color & Size Ratio Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <PackageCheck size={18} /> 4. Color & Size Ratio Breakdown
            </div>
            <button
              type="button"
              onClick={addLine}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <Plus size={14} /> Add Color Variant
            </button>
          </div>

          <div className="space-y-3">
            {lines.map((line, idx) => (
              <div key={line.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 items-center">
                {selectedStyles.filter(Boolean).length > 1 && (
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Style Master</label>
                    <select
                      value={line.styleId || selectedStyles[0]}
                      onChange={e => updateLine(line.id, "styleId", e.target.value)}
                      className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                    >
                      {selectedStyles.filter(Boolean).map(sid => {
                        const s = styles.find(item => item.id === sid);
                        return <option key={sid} value={sid}>{s?.styleNumber || sid} - {s?.styleName || ""}</option>;
                      })}
                    </select>
                  </div>
                )}

                <div className={selectedStyles.filter(Boolean).length > 1 ? "sm:col-span-2" : "sm:col-span-3"}>
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

                <div className={selectedStyles.filter(Boolean).length > 1 ? "sm:col-span-3" : "sm:col-span-4"}>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Size Matrix (Ratio)</label>
                  <input
                    type="text"
                    value={line.sizeBreakdown}
                    onChange={e => updateLine(line.id, "sizeBreakdown", e.target.value)}
                    placeholder="S:200, M:400, L:400, XL:200"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium"
                  />
                </div>

                <div className={selectedStyles.filter(Boolean).length > 1 ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Quantity (Pcs)</label>
                  <input
                    type="number"
                    value={line.quantity || ""}
                    onChange={e => updateLine(line.id, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="1200"
                    className="w-full h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 text-center"
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

          {/* Order Totals */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Order Totals:</span>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                Quantity: <strong className="text-slate-900 dark:text-white text-sm">{totalQuantity.toLocaleString()} pcs</strong>
              </span>
              <span className="text-slate-600 dark:text-slate-400">
                Price / Pc: <strong className="text-slate-900 dark:text-white text-sm">₹{unitRateNum}</strong>
              </span>
              {gstPct > 0 && (
                <span className="text-slate-600 dark:text-slate-400">
                  GST ({gstRate}%): <strong className="text-slate-900 dark:text-white text-sm">₹{gstAmount.toLocaleString('en-IN')}</strong>
                </span>
              )}
              <span className="text-slate-600 dark:text-slate-400">
                Total Amount: <strong className="text-emerald-600 dark:text-emerald-400 text-base font-bold">₹{totalOrderValue.toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 5: Special Instructions */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Special Instructions & Domestic Delivery Notes
          </label>
          <textarea
            rows={3}
            value={specialInstructions}
            onChange={e => setSpecialInstructions(e.target.value)}
            placeholder="Specify carton labeling, box packing count, transporter bilty booking instructions, delivery gate requirements..."
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

      {/* Floating Success Toast for Newly Registered Buyer */}
      {buyerToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 animate-fade-in text-sm font-semibold">
          <CheckCircle2 size={18} className="flex-shrink-0" />
          <span>{buyerToast}</span>
        </div>
      )}

      {/* Register New Buyer Account Modal (Full Format matching Buyers -> Add Buyer) */}
      {isAddBuyerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Register New Buyer Account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Onboard brand, department store, wholesaler or domestic retail client account
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBuyerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveNewBuyer} className="space-y-5">
              {/* Row 1: Identification & General Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Buyer Code
                  </label>
                  <input
                    type="text"
                    value={newBuyerCode}
                    onChange={e => setNewBuyerCode(e.target.value)}
                    placeholder="Auto-generated if left blank (e.g. BYR-006)"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBuyerName}
                    onChange={e => {
                      setNewBuyerName(e.target.value);
                      setModalErrors(prev => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g. Trends Retail India Ltd"
                    className={cn(
                      "w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 transition-all",
                      modalErrors.name ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                    )}
                  />
                  {modalErrors.name && <p className="text-[11px] text-red-500 mt-1">{modalErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Brand / Division
                  </label>
                  <input
                    type="text"
                    value={newBuyerBrand}
                    onChange={e => setNewBuyerBrand(e.target.value)}
                    placeholder="e.g. Trends Ethnic / Retail"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    GST Number (GSTIN)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={newBuyerGst}
                    onChange={e => setNewBuyerGst(e.target.value.toUpperCase())}
                    placeholder="e.g. 08AAAAA0000A1Z5"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={newBuyerCategory}
                    onChange={e => setNewBuyerCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="domestic">Domestic Retail / Brand</option>
                    <option value="export">Export Client</option>
                    <option value="both">Both Export & Domestic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Client Type *
                  </label>
                  <select
                    value={newBuyerType}
                    onChange={e => setNewBuyerType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="brand">Fashion Brand</option>
                    <option value="retail">Department Store / Retail Chain</option>
                    <option value="wholesale">Wholesale Importer / Distributor</option>
                    <option value="private-label">Private Label Apparel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBuyerCountry}
                    onChange={e => setNewBuyerCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={newBuyerState}
                    onChange={e => setNewBuyerState(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={newBuyerCity}
                    onChange={e => setNewBuyerCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Billing Currency
                  </label>
                  <select
                    value={newBuyerCurrency}
                    onChange={e => setNewBuyerCurrency(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Contact Person, Commercial Terms */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBuyerContactPerson}
                    onChange={e => {
                      setNewBuyerContactPerson(e.target.value);
                      setModalErrors(prev => ({ ...prev, contactPerson: "" }));
                    }}
                    placeholder="e.g. Rajesh Kumar"
                    className={cn(
                      "w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                      modalErrors.contactPerson ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                    )}
                  />
                  {modalErrors.contactPerson && <p className="text-[11px] text-red-500 mt-1">{modalErrors.contactPerson}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newBuyerEmail}
                    onChange={e => {
                      setNewBuyerEmail(e.target.value);
                      setModalErrors(prev => ({ ...prev, email: "" }));
                    }}
                    placeholder="e.g. rajesh@example.com"
                    className={cn(
                      "w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                      modalErrors.email ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                    )}
                  />
                  {modalErrors.email && <p className="text-[11px] text-red-500 mt-1">{modalErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newBuyerPhone}
                    onChange={e => setNewBuyerPhone(e.target.value)}
                    placeholder="e.g. +91 98290 12345"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Payment Terms
                  </label>
                  <select
                    value={newBuyerPaymentTerms}
                    onChange={e => setNewBuyerPaymentTerms(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="30% Advance + Balance before Dispatch">30% Advance + Balance before Dispatch</option>
                    <option value="100% Advance Payment">100% Advance Payment</option>
                    <option value="Against Bilty / Delivery (LR Copy)">Against Bilty / Delivery (LR Copy)</option>
                    <option value="Net 30">Net 30 Days Credit</option>
                    <option value="Net 15">Net 15 Days Credit</option>
                    <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                    <option value="LC 60 Days">Letter of Credit (LC 60 Days)</option>
                    <option value="LC 90 Days">Letter of Credit (LC 90 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    Credit Limit (₹)
                  </label>
                  <input
                    type="number"
                    value={newBuyerCreditLimit}
                    onChange={e => setNewBuyerCreditLimit(e.target.value)}
                    placeholder="e.g. 500000"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              {/* Row 3: Registered Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Registered Office Address
                </label>
                <textarea
                  rows={2}
                  value={newBuyerAddress}
                  onChange={e => setNewBuyerAddress(e.target.value)}
                  placeholder="Full street address, city, postal code..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBuyerOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/25 cursor-pointer"
                >
                  <Save size={16} /> Register Buyer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
