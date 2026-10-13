"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buyers as initialBuyers, orders as initialOrders } from "@/lib/demo-data";
import { Buyer, Order } from "@/lib/types";
import {
  ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Star, CreditCard,
  ShoppingBag, DollarSign, Clock, CheckCircle2, Shield, FileText, Plus,
  Edit, User, Calendar, ExternalLink
} from "lucide-react";
import { formatCurrency, formatNumber, getStatusColor } from "@/lib/utils";

export default function BuyerProfileClient({ id }: { id: string }) {
  const router = useRouter();
  const buyerId = id;

  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "financials">("overview");

  useEffect(() => {
    try {
      const savedBuyers = localStorage.getItem("garmentflow_buyers");
      const list: Buyer[] = savedBuyers ? JSON.parse(savedBuyers) : initialBuyers;
      const found = list.find(b => b.id === buyerId) || initialBuyers.find(b => b.id === buyerId);
      if (found) {
        setBuyer(found);
      }
    } catch {
      const found = initialBuyers.find(b => b.id === buyerId);
      if (found) setBuyer(found);
    }

    // Filter linked orders
    const linked = initialOrders.filter(o => o.buyerId === buyerId || o.buyerName.toLowerCase().includes((buyer?.name || "").toLowerCase()));
    setBuyerOrders(linked);
  }, [buyerId, buyer?.name]);

  if (!buyer) {
    return (
      <div className="p-12 text-center space-y-4 animate-fade-in">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Buyer Profile Not Found</h2>
        <p className="text-sm text-slate-500">The requested buyer account ID could not be found.</p>
        <Link href="/owner/customers" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          <ArrowLeft size={14} /> Back to Buyers Master
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header & Navigation */}
      <div>
        <Link href="/owner/customers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline mb-2">
          <ArrowLeft size={14} /> Back to Buyers Master
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-indigo-500/20">
              {buyer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{buyer.name}</h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {buyer.code}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(buyer.status)}`}>
                  {buyer.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <MapPin size={13} className="text-slate-400" /> {buyer.city}, {buyer.country} • Account Category: <span className="font-semibold text-indigo-600 uppercase">{buyer.category}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/owner/orders/new" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-500/25">
              <Plus size={16} /> Create Order for Buyer
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{buyer.totalOrders || buyerOrders.length} Orders</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Active Client Account</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Business Value</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{formatNumber(buyer.totalOrderValue || 4850000)}</p>
          <p className="text-xs text-slate-400 mt-1">Currency: {buyer.currency}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Dues</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{formatNumber(buyer.outstandingAmount || 420000)}</p>
          <p className="text-xs text-slate-400 mt-1">Terms: {buyer.paymentTerms}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Buyer Rating</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Star size={20} className="text-amber-400 fill-amber-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{buyer.rating} / 5.0</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Tier-1 Preferred Partner</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "overview" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 size={16} /> Account Overview & Contacts
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "orders" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShoppingBag size={16} /> Orders History ({buyerOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("financials")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "financials" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard size={16} /> Credit & Payment Terms
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User size={18} className="text-indigo-600" /> Primary Contact Person
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="w-24 text-xs text-slate-400 font-semibold">Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">{buyer.contactPerson}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="w-24 text-xs text-slate-400 font-semibold">Email</span>
                <a href={`mailto:${buyer.email}`} className="text-indigo-600 hover:underline flex items-center gap-1.5 font-medium">
                  <Mail size={14} /> {buyer.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="w-24 text-xs text-slate-400 font-semibold">Phone</span>
                <a href={`tel:${buyer.phone}`} className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                  <Phone size={14} className="text-slate-400" /> {buyer.phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="w-24 text-xs text-slate-400 font-semibold">Address</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">{buyer.address}, {buyer.city}, {buyer.country}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-indigo-600" /> Tax & Statutory Registrations
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block">GST / Tax Identification #</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">{buyer.gstNumber || "27AABCT3518Q1ZS"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block">PAN Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">{buyer.panNumber || "AABCT3518Q"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block">Base Currency</span>
                <span className="font-bold text-indigo-600 text-sm">{buyer.currency}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block">Account Onboarded</span>
                <span className="font-bold text-slate-800 dark:text-white text-sm">{buyer.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS HISTORY */}
      {activeTab === "orders" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full data-table text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                <th className="px-4 py-3 text-left">Order #</th>
                <th className="px-4 py-3 text-left">Buyer PO</th>
                <th className="px-4 py-3 text-left">Garment Style</th>
                <th className="px-4 py-3 text-left">Total Qty</th>
                <th className="px-4 py-3 text-left">Order Value</th>
                <th className="px-4 py-3 text-left">Delivery Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {buyerOrders.map((ord) => (
                <tr key={ord.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-600">{ord.orderNumber}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">{ord.buyerPO}</td>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{ord.styleName}</td>
                  <td className="px-4 py-3 font-bold">{ord.totalQuantity.toLocaleString()} pcs</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">₹{ord.totalValue.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{ord.deliveryDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase border ${getStatusColor(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
              {buyerOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No active production orders found for this buyer.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: FINANCIALS */}
      {activeTab === "financials" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Credit & Ledger Overview</h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-xl border border-amber-200">
              Outstanding Dues: {formatNumber(buyer.outstandingAmount || 420000)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block">Total Credit Line Approved</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{formatNumber(buyer.creditLimit)}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block">Available Credit Balance</span>
              <span className="text-xl font-bold text-emerald-600 mt-1 block">{formatNumber(buyer.creditLimit - buyer.outstandingAmount)}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block">Payment Instrument</span>
              <span className="text-xl font-bold text-indigo-600 mt-1 block">{buyer.paymentTerms}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
