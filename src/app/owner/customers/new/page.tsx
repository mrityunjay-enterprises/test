"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buyers as initialBuyers } from "@/lib/demo-data";
import { Buyer } from "@/lib/types";
import { Save, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function NewBuyerPage() {
  const router = useRouter();

  // Form State
  const [code, setCode] = useState(`BYR-${String(Math.floor(Math.random() * 900 + 100))}`);
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState<"export" | "domestic" | "both">("export");
  const [type, setType] = useState<"retail" | "wholesale" | "private-label" | "brand">("brand");
  const [country, setCountry] = useState("United States");
  const [stateName, setStateName] = useState("New York");
  const [city, setCity] = useState("New York");
  const [currency, setCurrency] = useState("USD");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("LC 60 Days");
  const [creditLimit, setCreditLimit] = useState("500000");
  const [address, setAddress] = useState("");

  const [toastMsg, setToastMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || !name || !contactPerson || !email) {
      alert("Please fill in all required fields (Code, Company Name, Contact Person, Email).");
      return;
    }

    setSubmitting(true);

    const newBuyer: Buyer = {
      id: `b-${Date.now()}`,
      code,
      name,
      companyName: brand || name,
      category,
      type,
      contactPerson,
      email,
      phone: phone || "+1-555-0199",
      country,
      state: stateName,
      city,
      address: address || `${city}, ${country}`,
      currency,
      paymentTerms,
      creditLimit: parseFloat(creditLimit) || 100000,
      totalOrders: 0,
      totalOrderValue: 0,
      outstandingAmount: 0,
      rating: 5.0,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      const saved = localStorage.getItem("garmentflow_buyers");
      const currentList: Buyer[] = saved ? JSON.parse(saved) : initialBuyers;
      const updatedList = [newBuyer, ...currentList];
      localStorage.setItem("garmentflow_buyers", JSON.stringify(updatedList));
    } catch {
      // fallback
    }

    setToastMsg("New Buyer registered successfully!");
    setTimeout(() => {
      router.push("/owner/customers");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Register New Buyer Account</h1>
          <p className="text-sm text-slate-500 mt-1">Onboard brand, department store, wholesaler or domestic retail client account</p>
        </div>
        <Link href="/owner/customers" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Back to Buyers List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Buyer Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. BYR-006"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Company Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. H&M Hennes & Mauritz AB"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Brand / Division</label>
            <input
              type="text"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="e.g. H&M Womenswear"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="export">Export Client</option>
              <option value="domestic">Domestic Retail / Brand</option>
              <option value="both">Both Export & Domestic</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Client Type *</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="brand">International Fashion Brand</option>
              <option value="retail">Department Store / Retail Chain</option>
              <option value="wholesale">Wholesale Importer</option>
              <option value="private-label">Private Label Apparel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Country *</label>
            <input
              type="text"
              required
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="e.g. United Kingdom"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">State / Province</label>
            <input
              type="text"
              value={stateName}
              onChange={e => setStateName(e.target.value)}
              placeholder="e.g. Greater London"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. London"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Billing Currency</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Contact Person *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              placeholder="e.g. Emma Watson"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. buyer@hm.com"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. +44 20 7946 0912"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Payment Terms</label>
            <select
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
            >
              <option value="LC 60 Days">Letter of Credit (LC 60 Days)</option>
              <option value="LC 90 Days">Letter of Credit (LC 90 Days)</option>
              <option value="TT 30 Days">Telegraphic Transfer (TT 30 Days)</option>
              <option value="CAD">Cash Against Documents (CAD)</option>
              <option value="Advance 30%">30% Advance + Balance before BL</option>
              <option value="Net 30">Net 30 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Credit Limit</label>
            <input
              type="number"
              value={creditLimit}
              onChange={e => setCreditLimit(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Registered Office Address</label>
          <textarea
            rows={2}
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Full street address, city, postal code..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25 disabled:opacity-50"
          >
            <Save size={16} /> Register Buyer Account
          </button>
          <Link href="/owner/customers" className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
