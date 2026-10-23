"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Buyer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Save, ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { generateNextBuyerCode, saveStoredBuyer } from "@/lib/workflow-service";

export default function NewBuyerPage() {
  const router = useRouter();

  // Form State — completely clean with zero prefilled data
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<"export" | "domestic" | "both">("domestic");
  const [type, setType] = useState<"retail" | "wholesale" | "private-label" | "brand">("brand");
  const [gstNumber, setGstNumber] = useState("");
  const [country, setCountry] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30% Advance + Balance before Dispatch");
  const [creditLimit, setCreditLimit] = useState("");
  const [address, setAddress] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Company Name is required";
    if (!contactPerson.trim()) errs.contactPerson = "Contact Person is required";
    if (!email.trim()) errs.email = "Email Address is required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    const autoCode = code.trim() || generateNextBuyerCode();
    const newBuyer: Buyer = {
      id: `b-${Date.now()}`,
      code: autoCode,
      name: name.trim(),
      companyName: brand.trim() || name.trim(),
      category,
      type,
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      state: stateName.trim(),
      city: city.trim(),
      address: address.trim(),
      currency: currency || "INR",
      paymentTerms: paymentTerms || "30% Advance + Balance before Dispatch",
      creditLimit: parseFloat(creditLimit) || 0,
      totalOrders: 0,
      totalOrderValue: 0,
      outstandingAmount: 0,
      rating: 5.0,
      status: "active",
      gstNumber: gstNumber.trim().toUpperCase() || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    };

    saveStoredBuyer(newBuyer);

    setToastMsg(`Buyer "${newBuyer.name}" (${newBuyer.code}) registered successfully!`);
    setTimeout(() => {
      router.push("/owner/customers");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Main Form Container - Exact same structure as the Add Buyer Modal */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 space-y-6 shadow-sm">
        {/* Header matching New Order Add Buyer */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <UserPlus size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Register New Buyer Account
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Onboard brand, department store, wholesaler or domestic retail client account
              </p>
            </div>
          </div>
          <Link
            href="/owner/customers"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Buyers List
          </Link>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Identification & General Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Buyer Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
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
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Trends Retail India Ltd"
                className={cn(
                  "w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 transition-all",
                  errors.name ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Brand / Division
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
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
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 08AAAAA0000A1Z5"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
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
                value={type}
                onChange={e => setType(e.target.value as any)}
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
                value={country}
                onChange={e => setCountry(e.target.value)}
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
                value={stateName}
                onChange={e => setStateName(e.target.value)}
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
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Jaipur"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Billing Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
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
                value={contactPerson}
                onChange={e => {
                  setContactPerson(e.target.value);
                  setErrors(prev => ({ ...prev, contactPerson: "" }));
                }}
                placeholder="e.g. Rajesh Kumar"
                className={cn(
                  "w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.contactPerson ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.contactPerson && <p className="text-[11px] text-red-500 mt-1">{errors.contactPerson}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: "" }));
                }}
                placeholder="e.g. rajesh@example.com"
                className={cn(
                  "w-full h-10 px-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 transition-all",
                  errors.email ? "border-red-500 focus:ring-red-400" : "border-slate-200 dark:border-slate-700 focus:ring-indigo-500/40"
                )}
              />
              {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +91 98290 12345"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Payment Terms
              </label>
              <select
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
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
                value={creditLimit}
                onChange={e => setCreditLimit(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          {/* Row 3: Registered Office Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Registered Office Address
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Full street address, city, postal code..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/owner/customers"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} /> Register Buyer Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
