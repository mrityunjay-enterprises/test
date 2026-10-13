"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buyers, orders, invoices } from "@/lib/demo-data";
import { Save, Plus, Trash2, ArrowLeft, Receipt, Building, Truck, FileText, CheckCircle2 } from "lucide-react";

export function InvoiceNewView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");

  const [selectedOrderId, setSelectedOrderId] = useState("");

  // Invoice Header & Logistics State
  const todayStr = new Date().toISOString().split("T")[0];
  const [invoiceNo, setInvoiceNo] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState(todayStr);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 Days");
  const [referenceNo, setReferenceNo] = useState("");
  const [otherRef, setOtherRef] = useState("");
  const [buyerPoNo, setBuyerPoNo] = useState("");
  const [dispatchDocNo, setDispatchDocNo] = useState("");
  const [dispatchedThrough, setDispatchedThrough] = useState("Road Transport");
  const [destination, setDestination] = useState("");
  const [billOfLading, setBillOfLading] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [termsOfDelivery, setTermsOfDelivery] = useState("FOB Factory");

  // Supplier / Seller Info
  const [sellerName, setSellerName] = useState("Mrityunjay Enterprises");
  const [sellerAddress, setSellerAddress] = useState("Palri, Bhilwara, State- Rajasthan");
  const [sellerGstin, setSellerGstin] = useState("08AAACD1234F1Z9");
  const [sellerState, setSellerState] = useState("Rajasthan, Code : 08");

  // Consignee (Ship to) Info
  const [consigneeName, setConsigneeName] = useState("");
  const [consigneeAddress, setConsigneeAddress] = useState("");
  const [consigneeGstin, setConsigneeGstin] = useState("");
  const [consigneeState, setConsigneeState] = useState("");

  // Buyer (Bill to) Info
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerState, setBuyerState] = useState("");

  // Bank & Tax Details
  const [bankName, setBankName] = useState("State Bank of India (Bhilwara)");
  const [accountNo, setAccountNo] = useState("389201948201");
  const [ifscCode, setIfscCode] = useState("SBIN0001234");
  const [igstRate, setIgstRate] = useState(5);
  const [roundOff, setRoundOff] = useState(0);

  // Line Items
  const [items, setItems] = useState([
    { description: "", hsnCode: "620349", quantity: 0, taxRateIncl: 0, rateExcl: 0, per: "PCS" },
  ]);

  const [ordersList, setOrdersList] = useState(orders);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let activeOrders = orders;
    try {
      const saved = localStorage.getItem("garmentflow_orders");
      if (saved) {
        activeOrders = JSON.parse(saved);
        setOrdersList(activeOrders);
      }
    } catch {
      // fallback
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlOrderId = params.get("orderId");
      if (urlOrderId) {
        handleSelectOrder(urlOrderId, activeOrders);
      }
    }
  }, []);

  // Auto-populate from selected Order
  const handleSelectOrder = (orderId: string, listToUse?: any[]) => {
    setSelectedOrderId(orderId);
    if (!orderId) return;
    const searchList = listToUse || ordersList;
    const ord = searchList.find((o: any) => o.id === orderId || o.orderNumber === orderId);
    if (!ord) return;

    const buyerObj = buyers.find(b => b.id === ord.buyerId);
    const address = buyerObj ? `${buyerObj.address}, ${buyerObj.city}, ${buyerObj.state}` : `${ord.buyerName} Corporate Office`;
    const gstin = buyerObj ? `06${buyerObj.code.replace(/[^0-9]/g, "")}1ZH` : "06ALAPR8724P1ZH";
    const stateStr = buyerObj ? `${buyerObj.state}` : "Haryana, Code : 06";

    setBuyerPoNo(ord.buyerPO);
    setBuyerName(ord.buyerName);
    setBuyerAddress(address);
    setBuyerGstin(gstin);
    setBuyerState(stateStr);

    setConsigneeName(ord.buyerName);
    setConsigneeAddress(address);
    setConsigneeGstin(gstin);
    setConsigneeState(stateStr);

    setDestination(buyerObj?.city || "GURUGRAM");
    setPaymentTerms(ord.paymentTerms || "Net 30 Days");

    const calculatedRate = Math.round(ord.unitPrice * (ord.currency === "USD" ? 83 : ord.currency === "EUR" ? 90 : 1));
    const calculatedRateIncl = Math.round(calculatedRate * 1.05);

    setItems([
      {
        description: `${ord.styleName.toUpperCase()} (${ord.styleNumber})`,
        hsnCode: "620349",
        quantity: ord.totalQuantity || 1000,
        taxRateIncl: calculatedRateIncl,
        rateExcl: calculatedRate,
        per: "PCS",
      },
    ]);
  };

  // Calculations
  const calculateTotalQty = () => items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const calculateTaxableSubtotal = () => items.reduce((sum, i) => sum + ((Number(i.quantity) || 0) * (Number(i.rateExcl) || 0)), 0);
  const taxableSubtotal = calculateTaxableSubtotal();
  const totalIgst = (taxableSubtotal * igstRate) / 100;
  const grandTotal = Math.round(taxableSubtotal + totalIgst + roundOff);

  const addItem = () => {
    setItems([...items, { description: "", hsnCode: "620349", quantity: 0, taxRateIncl: 0, rateExcl: 0, per: "PCS" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === "taxRateIncl") {
      updated[index].rateExcl = parseFloat((Number(value) / (1 + igstRate / 100)).toFixed(2));
    }
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newInvoiceObj = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNo,
      invoiceType: "tax-invoice" as const,
      buyerId: `b-${Date.now()}`,
      buyerName: buyerName || "Client Buyer Account",
      buyerGstin: buyerGstin || "06ALAPR8724P1ZH",
      orderNumber: buyerPoNo || "PO-DIRECT",
      dispatchNumber: dispatchDocNo || `DSP-${invoiceNo.slice(-4)}`,
      invoiceDate: invoiceDate,
      dueDate: invoiceDate,
      currency: "INR",
      hsnCode: items[0]?.hsnCode || "620349",
      paymentTerms: paymentTerms,
      items: items.map((it, idx) => ({
        id: `ii-${idx}`,
        description: it.description || "Garment Product",
        hsnCode: it.hsnCode || "620349",
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.rateExcl) || 0,
        total: (Number(it.quantity) || 0) * (Number(it.rateExcl) || 0),
        taxRate: igstRate,
        taxAmount: ((Number(it.quantity) || 0) * (Number(it.rateExcl) || 0) * igstRate) / 100,
      })),
      subtotal: taxableSubtotal,
      totalTax: totalIgst,
      cgst: 0,
      sgst: 0,
      igst: totalIgst,
      totalAmount: grandTotal,
      amountPaid: 0,
      balanceDue: grandTotal,
      status: "pending" as const,
      paymentMethod: "bank-transfer" as const,
      pdfUrl: `/invoices/${invoiceNo}.pdf`,
    };

    try {
      const saved = localStorage.getItem("garmentflow_invoices");
      const currentList = saved ? JSON.parse(saved) : invoices;
      const updatedList = [newInvoiceObj, ...currentList];
      localStorage.setItem("garmentflow_invoices", JSON.stringify(updatedList));
    } catch {
      // fallback
    }

    setTimeout(() => {
      window.location.href = `${prefix}/invoices`;
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href={`${prefix}/invoices`} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create GST Tax Invoice</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 pl-10">
            {prefix === "/owner" ? "Owner Portal" : prefix === "/factory" ? "Factory Workstation" : "Department Finance"} • Mrityunjay Enterprises Tax Invoice
          </p>
        </div>

        {/* Quick Order Selector */}
        <div className="flex items-center gap-2 pl-10 sm:pl-0">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Auto-Fill from Order:</label>
          <select
            value={selectedOrderId}
            onChange={(e) => handleSelectOrder(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="">Choose an order (Optional)...</option>
            {ordersList.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} — {o.buyerName} ({o.styleName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {submitted ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-800 p-12 text-center space-y-4 shadow-xl animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Invoice Generated Successfully!</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Invoice <span className="font-bold text-slate-900 dark:text-white">{invoiceNo}</span> created for <span className="font-bold text-emerald-600">₹{grandTotal.toLocaleString()}</span> ({calculateTotalQty()} PCS).
          </p>
          <p className="text-xs text-slate-400">Redirecting to Invoices...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Invoice Header & Logistics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText size={18} className="text-indigo-600" /> Invoice Logistics & Order References
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Invoice No. *</label>
                <input type="text" required value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="e.g. INV/2026/001" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Dated *</label>
                <input type="date" required value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Delivery Note</label>
                <input type="text" value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="e.g. DN-030" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Mode / Terms of Payment</label>
                <input type="text" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="e.g. Net 30 Days" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Supplier Ref / Order No</label>
                <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="e.g. ORD-2026-001" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Buyer PO No & Date</label>
                <input type="text" value={buyerPoNo} onChange={e => setBuyerPoNo(e.target.value)} placeholder="e.g. PO-890123" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Dispatch Doc No.</label>
                <input type="text" value={dispatchDocNo} onChange={e => setDispatchDocNo(e.target.value)} placeholder="e.g. DISP-045" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Dispatched Through</label>
                <input type="text" value={dispatchedThrough} onChange={e => setDispatchedThrough(e.target.value)} placeholder="e.g. Road Transport" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Destination</label>
                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Gurugram" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Bill of Lading / LR No.</label>
                <input type="text" value={billOfLading} onChange={e => setBillOfLading(e.target.value)} placeholder="e.g. LR-4091" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Motor Vehicle No.</label>
                <input type="text" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)} placeholder="e.g. RJ-06-GB-1234" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Terms of Delivery</label>
                <input type="text" value={termsOfDelivery} onChange={e => setTermsOfDelivery(e.target.value)} placeholder="e.g. FOB Factory / CIF Port" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Section 2: Parties Information (Seller, Consignee, Buyer) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Seller */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building size={14} className="text-indigo-600" /> Seller Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Company Name</label>
                  <input type="text" value={sellerName} onChange={e => setSellerName(e.target.value)} className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Address</label>
                  <textarea rows={2} value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">GSTIN / UIN</label>
                  <input type="text" value={sellerGstin} onChange={e => setSellerGstin(e.target.value)} className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">State & State Code</label>
                  <input type="text" value={sellerState} onChange={e => setSellerState(e.target.value)} className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            {/* Consignee */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Truck size={14} className="text-indigo-600" /> Consignee (Ship To) Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Consignee Name</label>
                  <input type="text" value={consigneeName} onChange={e => setConsigneeName(e.target.value)} placeholder="Enter Consignee / Store Name" className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Shipping Address</label>
                  <textarea rows={2} value={consigneeAddress} onChange={e => setConsigneeAddress(e.target.value)} placeholder="Enter Destination Delivery Address" className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">GSTIN / UIN</label>
                  <input type="text" value={consigneeGstin} onChange={e => setConsigneeGstin(e.target.value)} placeholder="Enter Consignee GSTIN" className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">State & State Code</label>
                  <input type="text" value={consigneeState} onChange={e => setConsigneeState(e.target.value)} placeholder="State, Code : XX" className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            {/* Buyer */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Receipt size={14} className="text-indigo-600" /> Buyer (Bill To) Details
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Buyer Legal Name</label>
                  <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Enter Buyer Corporate Name" className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Billing Address</label>
                  <textarea rows={2} value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} placeholder="Enter Official Billing Address" className="w-full p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">GSTIN / UIN</label>
                  <input type="text" value={buyerGstin} onChange={e => setBuyerGstin(e.target.value)} placeholder="Enter Buyer GSTIN" className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">State & State Code</label>
                  <input type="text" value={buyerState} onChange={e => setBuyerState(e.target.value)} placeholder="State, Code : XX" className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Line Items Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt size={18} className="text-indigo-600" /> Goods Description & Tax Rates
              </h2>
              <button type="button" onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors">
                <Plus size={14} /> Add Line Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-left">
                    <th className="py-2.5 pr-2 w-8">#</th>
                    <th className="py-2.5 pr-2">Description of Goods</th>
                    <th className="py-2.5 pr-2 w-28">HSN/SAC</th>
                    <th className="py-2.5 pr-2 w-24 text-right">Quantity</th>
                    <th className="py-2.5 pr-2 w-20">Unit</th>
                    <th className="py-2.5 pr-2 w-28 text-right">Rate (Excl. Tax)</th>
                    <th className="py-2.5 pr-2 w-32 text-right">Amount (₹)</th>
                    <th className="py-2.5 pl-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, idx) => {
                    const lineAmount = (Number(item.quantity) || 0) * (Number(item.rateExcl) || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-2 pr-2 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            required
                            placeholder="e.g. 100% Cotton Printed Shirt"
                            value={item.description}
                            onChange={e => handleItemChange(idx, "description", e.target.value)}
                            className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={item.hsnCode}
                            onChange={e => handleItemChange(idx, "hsnCode", e.target.value)}
                            className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity || ""}
                            onChange={e => handleItemChange(idx, "quantity", e.target.value)}
                            className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-medium"
                          />
                        </td>
                        <td className="py-2 pr-2">
                          <select
                            value={item.per}
                            onChange={e => handleItemChange(idx, "per", e.target.value)}
                            className="w-full h-8 px-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            <option value="PCS">PCS</option>
                            <option value="SETS">SETS</option>
                            <option value="MTR">MTR</option>
                            <option value="KG">KG</option>
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={item.rateExcl || ""}
                            onChange={e => handleItemChange(idx, "rateExcl", e.target.value)}
                            className="w-full h-8 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-medium"
                          />
                        </td>
                        <td className="py-2 pr-2 text-right font-bold text-slate-800 dark:text-slate-200">
                          ₹ {lineAmount.toLocaleString()}
                        </td>
                        <td className="py-2 pl-2 text-center">
                          {items.length > 1 && (
                            <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Subtotals & Taxes */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-3 max-w-sm text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-700 space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bank Payment Wire Instructions:</span>
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="col-span-2 font-medium">{bankName}</span>
                    <span className="text-slate-400">A/c No:</span>
                    <span className="col-span-2 font-mono font-bold">{accountNo}</span>
                    <span className="text-slate-400">Branch IFSC:</span>
                    <span className="col-span-2 font-mono">{ifscCode}</span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>Total Quantity:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{calculateTotalQty()} PCS</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600 dark:text-slate-400">
                  <span>Taxable Subtotal:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹ {taxableSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 items-center text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span>IGST Output Tax:</span>
                    <select
                      value={igstRate}
                      onChange={e => setIgstRate(Number(e.target.value))}
                      className="h-6 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold"
                    >
                      <option value="5">5% (Garments &lt; ₹1,000)</option>
                      <option value="12">12% (Garments &gt; ₹1,000)</option>
                      <option value="0">0% (Export LUT / SEZ)</option>
                    </select>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">₹ {totalIgst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-slate-200 dark:border-slate-700 text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  <span>Grand Total (INR):</span>
                  <span>₹ {grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Link
              href={`${prefix}/invoices`}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25"
            >
              <Save size={16} /> Save & Generate GST Invoice
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
