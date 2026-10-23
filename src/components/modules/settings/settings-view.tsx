"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  companyDetails as initialCompanyDetails,
  factories as initialFactories,
  warehouses as initialWarehouses,
  departments as initialDepartments,
  employees
} from "@/lib/demo-data";
import { Factory, Warehouse as WarehouseType, Department } from "@/lib/types";
import {
  Settings, Building2, Users, Factory as FactoryIcon, Warehouse as WarehouseIcon,
  Hash, Workflow, Bell, Save, Database, Trash2, CheckCircle2, AlertTriangle,
  Plus, Edit2, Check, X, MapPin, Mail, Phone, ShieldCheck, Sliders, Layers, UserPlus, Filter
} from "lucide-react";

export function SettingsView({ basePath = "/owner" }: { basePath?: string }) {
  const [activeTab, setActiveTab] = useState("dataseed");
  const [seedDataEnabled, setSeedDataEnabled] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State for editable entities
  const [companyInfo, setCompanyInfo] = useState(initialCompanyDetails);
  const [factoryList, setFactoryList] = useState<Factory[]>(initialFactories);
  const [warehouseList, setWarehouseList] = useState<WarehouseType[]>(initialWarehouses);
  const [departmentList, setDepartmentList] = useState<Department[]>(initialDepartments);

  // Modal / Form States
  const [showAddFactoryModal, setShowAddFactoryModal] = useState(false);
  const [newFactory, setNewFactory] = useState({ name: "", code: "", address: "", city: "", capacity: 5000 });

  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "", type: "production" as const });

  // Numbering state
  const [numberingSeqs, setNumberingSeqs] = useState([
    { id: "1", entity: "Sales Orders", prefix: "ORD-2025-", next: "0011", format: "ORD-YYYY-XXXX" },
    { id: "2", entity: "Purchase Orders", prefix: "PO-2025-", next: "0249", format: "PO-YYYY-XXXX" },
    { id: "3", entity: "Styles", prefix: "GF-STYLE-", next: "0011", format: "GF-STYLE-XXXX" },
    { id: "4", entity: "Quality Inspection", prefix: "QC-2025-", next: "0459", format: "QC-YYYY-XXXX" },
    { id: "5", entity: "Dispatches", prefix: "DSP-2025-", next: "0048", format: "DSP-YYYY-XXXX" },
    { id: "6", entity: "Invoices", prefix: "INV-2026-", next: "1001", format: "INV-YYYY-XXXX" },
    { id: "7", entity: "Employees", prefix: "GF-", next: "0051", format: "GF-XXXX" },
  ]);

  // Approval Workflows state
  const [workflows, setWorkflows] = useState([
    { id: "w1", title: "High Value Purchase Order Approval", minAmount: "₹ 5,00,000", approver: "Managing Director", status: true, description: "Requires MD sign-off before vendor PO issuance" },
    { id: "w2", title: "Order Discount & Price Exception Approval", minAmount: "> 5.0%", approver: "Director - Operations", status: true, description: "Requires Operations Director review if FOB price falls below target margin" },
    { id: "w3", title: "Order Cancellation & PO Amendments", minAmount: "Any Value", approver: "Merchandising Director", status: true, description: "Multi-level verification required before cancelling confirmed orders" },
    { id: "w4", title: "PP Sample & Tech Pack Sign-Off", minAmount: "Pre-Production", approver: "Quality & Merchandising Managers", status: true, description: "Mandatory QA sign-off prior to bulk fabric cutting" },
  ]);

  // Notification Triggers state
  const [notifications, setNotifications] = useState([
    { id: "n1", event: "Ex-Factory Date Impending (7 Days)", email: true, whatsapp: true, inApp: true, role: "Merchandiser & Plant Manager" },
    { id: "n2", event: "Quality Inspection Rejection Exceeds AQL Limit", email: true, whatsapp: false, inApp: true, role: "QC Manager & Operations Head" },
    { id: "n3", event: "Low Fabric / Trim Inventory Stock Alert", email: false, whatsapp: true, inApp: true, role: "Store Manager & Purchaser" },
    { id: "n4", event: "Stitching Line Machine Breakdown Alert", email: false, whatsapp: true, inApp: true, role: "Maintenance Engineer & Supervisor" },
    { id: "n5", event: "High Value PO Approval Requested", email: true, whatsapp: true, inApp: true, role: "Managing Director" },
  ]);

  // User RBAC Matrix state
  const [rbacUsers, setRbacUsers] = useState([
    { id: "u1", name: "Vikram Rathore", role: "Managing Director", email: "vikram.rathore@mrityunjayenterprises.com", permissions: { orders: "Full", inventory: "Full", hr: "Full", settings: "Full" } },
    { id: "u2", name: "Anita Desai", role: "Director - Operations", email: "anita.desai@mrityunjayenterprises.com", permissions: { orders: "Full", inventory: "Full", hr: "View", settings: "Edit" } },
    { id: "u3", name: "Arjun Mehta", role: "Senior Merchandiser", email: "arjun.mehta@mrityunjayenterprises.com", permissions: { orders: "Edit", inventory: "View", hr: "None", settings: "None" } },
    { id: "u4", name: "Meera Joshi", role: "Production Manager", email: "meera.joshi@mrityunjayenterprises.com", permissions: { orders: "View", inventory: "Edit", hr: "View", settings: "None" } },
    { id: "u5", name: "Kavita Sharma", role: "Quality Manager", email: "kavita.sharma@mrityunjayenterprises.com", permissions: { orders: "View", inventory: "View", hr: "None", settings: "None" } },
    { id: "u6", name: "Deepak Agarwal", role: "HR Manager", email: "deepak.agarwal@mrityunjayenterprises.com", permissions: { orders: "None", inventory: "None", hr: "Full", settings: "None" } },
  ]);

  // User Editing & Permission State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Merchandiser",
    permissions: { orders: "Edit", inventory: "View", hr: "None", settings: "None" }
  });

  const handleSaveUserPermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setRbacUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    triggerToast(`Permissions for "${editingUser.name}" updated successfully!`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const created = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      permissions: { ...newUser.permissions }
    };
    setRbacUsers(prev => [...prev, created]);
    setNewUser({
      name: "",
      email: "",
      role: "Merchandiser",
      permissions: { orders: "Edit", inventory: "View", hr: "None", settings: "None" }
    });
    setShowAddUserModal(false);
    triggerToast(`User account "${created.name}" created!`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("garmentflow_seed_preloaded_data");
      setSeedDataEnabled(stored === "true");
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleSeedData = (enabled: boolean) => {
    setSeedDataEnabled(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("garmentflow_seed_preloaded_data", enabled ? "true" : "false");
    }
    const msg = enabled
      ? "Preloaded Demo Data enabled for testing."
      : "Preloaded Demo Data disabled! System is now running in Clean Slate Mode.";
    triggerToast(msg);
  };

  const handleAddFactory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactory.name || !newFactory.code) return;
    const created: Factory = {
      id: `f-${Date.now()}`,
      companyId: "c1",
      name: newFactory.name,
      code: newFactory.code,
      address: newFactory.address || "Industrial Area",
      city: newFactory.city || "Jaipur",
      capacity: Number(newFactory.capacity) || 5000,
      status: "active"
    };
    setFactoryList([...factoryList, created]);
    setNewFactory({ name: "", code: "", address: "", city: "", capacity: 5000 });
    setShowAddFactoryModal(false);
    triggerToast(`Factory Unit "${created.name}" added successfully!`);
  };


  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.name || !newDept.code) return;
    const created: Department = {
      id: `d-${Date.now()}`,
      factoryId: "f1",
      name: newDept.name,
      code: newDept.code,
      type: newDept.type,
      status: "active"
    };
    setDepartmentList([...departmentList, created]);
    setNewDept({ name: "", code: "", type: "production" });
    setShowAddDeptModal(false);
    triggerToast(`Department "${created.name}" added!`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Settings & Administration</h1>
          <p className="text-sm text-slate-500 mt-1">Company profile, factories, warehouses, user permissions & workflow configuration</p>
        </div>
        <button
          onClick={() => triggerToast("System settings updated successfully!")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
        >
          <Save size={16} /> Save All Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation Bar */}
        <div className="w-full lg:w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-2 space-y-1 h-fit">
          {[
            { id: "dataseed", label: "Data Seeding & Clean Slate", icon: <Database size={18} /> },
            { id: "company", label: "Company Profile", icon: <Building2 size={18} /> },
            { id: "factories", label: "Factories & Plants", icon: <FactoryIcon size={18} /> },
            { id: "warehouses", label: "Company Store", icon: <WarehouseIcon size={18} /> },
            { id: "departments", label: "Departments & Divisions", icon: <Layers size={18} /> },
            { id: "users", label: "Users & Role Permissions", icon: <Users size={18} /> },
            { id: "numbering", label: "Numbering Sequences", icon: <Hash size={18} /> },
            { id: "workflows", label: "Approval Workflows", icon: <Workflow size={18} /> },
            { id: "notifications", label: "Notification Triggers", icon: <Bell size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left font-medium",
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 md:p-8">

          {/* TAB 1: DATA SEEDING */}
          {activeTab === "dataseed" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database size={20} className="text-indigo-600" /> Data Seeding & Clean Slate Mode
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Configure whether GarmentFlow ERP starts with preloaded sample demo data or runs as a clean, production-ready environment.
                </p>
              </div>

              <div className={cn(
                "p-5 rounded-2xl border flex items-start gap-4 transition-all",
                !seedDataEnabled
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              )}>
                {!seedDataEnabled ? (
                  <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {!seedDataEnabled ? "Clean Slate Mode Active (No Preloaded Demo Data)" : "Preloaded Demo Data Seeding Active"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {!seedDataEnabled
                      ? "Preloaded sample orders, styles, buyers, and dummy entries are turned OFF. Your ERP environment is clean and ready for real operational data."
                      : "The system is currently displaying sample demo orders, styles, and transactions for demonstration purposes."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Auto-Seed Preloaded Demo Data</span>
                    <button
                      onClick={() => handleToggleSeedData(!seedDataEnabled)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative p-1",
                        seedDataEnabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full bg-white transition-transform",
                        seedDataEnabled ? "translate-x-6" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Toggle OFF to prevent seeding default sample data across all modules (Orders, Buyers, Styles, Procurement, HR & Inventory).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Wipe Preloaded Data</h4>
                    <p className="text-xs text-slate-500 mt-1">Clear all sample entries and reset to a clean slate immediately.</p>
                  </div>
                  <button
                    onClick={() => handleToggleSeedData(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold text-xs hover:bg-red-100 transition-colors w-fit"
                  >
                    <Trash2 size={15} /> Wipe Sample Data & Start Fresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY PROFILE */}
          {activeTab === "company" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Company Profile & Legal Details</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Primary business entity credentials used across GST tax invoices & legal documentation</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registered Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.companyName}
                    onChange={e => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Company Code / Prefix</label>
                  <input
                    type="text"
                    value={companyInfo.companyCode}
                    onChange={e => setCompanyInfo({ ...companyInfo, companyCode: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GSTIN / Tax Registration No.</label>
                  <input
                    type="text"
                    value={companyInfo.gstin}
                    onChange={e => setCompanyInfo({ ...companyInfo, gstin: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Functional Currency</label>
                  <input
                    type="text"
                    value={companyInfo.currency}
                    onChange={e => setCompanyInfo({ ...companyInfo, currency: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    value={companyInfo.email}
                    onChange={e => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Phone Number</label>
                  <input
                    type="text"
                    value={companyInfo.phone}
                    onChange={e => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Registered Head Office Address</label>
                  <input
                    type="text"
                    value={companyInfo.registeredAddress}
                    onChange={e => setCompanyInfo({ ...companyInfo, registeredAddress: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FACTORIES & PLANTS */}
          {activeTab === "factories" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Factories & Manufacturing Units</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Multi-unit plant management, floor line capacities & addresses</p>
                </div>
                <button
                  onClick={() => setShowAddFactoryModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <Plus size={15} /> Add Plant Unit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {factoryList.map((fact) => (
                  <div key={fact.id} className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold">
                          <FactoryIcon size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{fact.name}</h4>
                          <span className="text-xs font-mono font-bold text-indigo-600">{fact.code}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {fact.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <p className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" /> {fact.address}</p>
                      <p className="flex items-center justify-between">
                        <span>Daily Sewing Capacity:</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{fact.capacity.toLocaleString()} pcs / day</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Add Factory */}
              {showAddFactoryModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Manufacturing Plant</h3>
                      <button onClick={() => setShowAddFactoryModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleAddFactory} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Unit Name *</label>
                        <input type="text" required value={newFactory.name} onChange={e => setNewFactory({ ...newFactory, name: e.target.value })} placeholder="e.g. Mrityunjay Unit 3 - Bhilwara" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Unit Code *</label>
                        <input type="text" required value={newFactory.code} onChange={e => setNewFactory({ ...newFactory, code: e.target.value })} placeholder="e.g. TRP-U3" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Address Location</label>
                        <input type="text" value={newFactory.address} onChange={e => setNewFactory({ ...newFactory, address: e.target.value })} placeholder="Industrial Area, Sector..." className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Daily Stitching Capacity (PCS)</label>
                        <input type="number" value={newFactory.capacity} onChange={e => setNewFactory({ ...newFactory, capacity: Number(e.target.value) })} placeholder="6000" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddFactoryModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">Create Plant Unit</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPANY STORE */}
          {activeTab === "warehouses" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Company Store Master</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Central store for fabric rolls, trims, accessories and finished goods</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Single Central Store Configured
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
                <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-900 dark:text-indigo-200">
                  <p className="font-bold">Unified Single Store Architecture</p>
                  <p className="mt-0.5 text-indigo-700 dark:text-indigo-300">
                    Mrityunjay Enterprises operates with one unified central store at the Palri, Bhilwara facility. All raw materials, accessories, and finished goods are consolidated in this store.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {warehouseList.map((wh) => (
                  <div key={wh.id} className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center font-bold">
                          <WarehouseIcon size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{wh.name}</h4>
                          <span className="text-xs font-mono font-bold text-emerald-600">{wh.code}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 uppercase">
                        Active Store
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <MapPin size={13} className="text-slate-400" /> {wh.address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DEPARTMENTS */}
          {activeTab === "departments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Departments & Functional Divisions</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Production sections, commercial departments & operational hierarchy</p>
                </div>
                <button
                  onClick={() => setShowAddDeptModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <Plus size={15} /> Add Department
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {departmentList.map((d) => (
                  <div key={d.id} className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{d.name}</h4>
                      <span className="text-[10px] font-mono text-indigo-600 font-bold">{d.code}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 uppercase">
                      {d.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Modal Add Department */}
              {showAddDeptModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Department</h3>
                      <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>
                    <form onSubmit={handleAddDept} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Department Name *</label>
                        <input type="text" required value={newDept.name} onChange={e => setNewDept({ ...newDept, name: e.target.value })} placeholder="e.g. Sampling & CAD Pattern" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Short Code *</label>
                        <input type="text" required value={newDept.code} onChange={e => setNewDept({ ...newDept, code: e.target.value })} placeholder="e.g. CAD" className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold" />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Category Type</label>
                        <select value={newDept.type} onChange={e => setNewDept({ ...newDept, type: e.target.value as any })} className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold">
                          <option value="production">Production</option>
                          <option value="quality">Quality Assurance</option>
                          <option value="warehouse">Warehouse & Logistics</option>
                          <option value="commercial">Commercial / Sales</option>
                          <option value="admin">HR & Administration</option>
                          <option value="finance">Accounts & Finance</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddDeptModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">Save Department</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: USERS & ROLE PERMISSIONS */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Accounts & Role-Based Access Control (RBAC)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage user credentials, module privileges & authority levels</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <UserPlus size={15} /> Add User Account
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px]">
                      <th className="py-3 px-4 text-left">User Name & Email</th>
                      <th className="py-3 px-4 text-left">Assigned Role</th>
                      <th className="py-3 px-4 text-center">Orders</th>
                      <th className="py-3 px-4 text-center">Inventory</th>
                      <th className="py-3 px-4 text-center">HR & Payroll</th>
                      <th className="py-3 px-4 text-center">Settings</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rbacUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{usr.name}</p>
                          <p className="text-[11px] text-slate-400">{usr.email}</p>
                        </td>
                        <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">{usr.role}</td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px]", usr.permissions.orders === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : usr.permissions.orders === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : usr.permissions.orders === "View" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-500")}>
                            {usr.permissions.orders}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px]", usr.permissions.inventory === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : usr.permissions.inventory === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : usr.permissions.inventory === "View" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-500")}>
                            {usr.permissions.inventory}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px]", usr.permissions.hr === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : usr.permissions.hr === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : usr.permissions.hr === "View" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-500")}>
                            {usr.permissions.hr}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px]", usr.permissions.settings === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : usr.permissions.settings === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : usr.permissions.settings === "View" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-500")}>
                            {usr.permissions.settings}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setEditingUser(JSON.parse(JSON.stringify(usr)))}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs transition-colors"
                          >
                            <Sliders size={13} /> Edit Permissions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Modal 1: Edit User Permissions */}
              {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit User Role & Permissions</h3>
                        <p className="text-xs text-slate-500">Configure access levels for {editingUser.name}</p>
                      </div>
                      <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleSaveUserPermissions} className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">User Name</label>
                          <input
                            type="text"
                            required
                            value={editingUser.name}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
                          <input
                            type="email"
                            required
                            value={editingUser.email}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assigned System Role</label>
                        <select
                          value={editingUser.role}
                          onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-indigo-600 dark:text-indigo-400"
                        >
                          <option value="Managing Director">Managing Director</option>
                          <option value="Director - Operations">Director - Operations</option>
                          <option value="Senior Merchandiser">Senior Merchandiser</option>
                          <option value="Merchandiser">Merchandiser</option>
                          <option value="Production Manager">Production Manager</option>
                          <option value="Quality Manager">Quality Manager</option>
                          <option value="Store Manager">Store Manager</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="Accounts Manager">Accounts Manager</option>
                        </select>
                      </div>

                      {/* Module Permissions Matrix Controls */}
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Module Privilege Controls:</h4>

                        {[
                          { key: "orders", label: "Orders & Commercial Costing" },
                          { key: "inventory", label: "Inventory, Fabric & Trims" },
                          { key: "hr", label: "HRMS, Employees & Payroll" },
                          { key: "settings", label: "System Administration & Settings" },
                        ].map((mod) => (
                          <div key={mod.key} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{mod.label}</span>
                            <select
                              value={editingUser.permissions[mod.key] || "None"}
                              onChange={(e) => setEditingUser({
                                ...editingUser,
                                permissions: { ...editingUser.permissions, [mod.key]: e.target.value }
                              })}
                              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs text-indigo-600 dark:text-indigo-300"
                            >
                              <option value="Full">Full (Create/Edit/Delete)</option>
                              <option value="Edit">Edit (View & Edit)</option>
                              <option value="View">View Only</option>
                              <option value="None">No Access (Hidden)</option>
                            </select>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold">
                          Cancel
                        </button>
                        <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                          <Check size={14} /> Save Permission Matrix
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal 2: Add New User Account */}
              {showAddUserModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h3>
                      <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Corporate Email *</label>
                        <input
                          type="email"
                          required
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="rahul.sharma@mrityunjayenterprises.com"
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assigned Role</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                        >
                          <option value="Senior Merchandiser">Senior Merchandiser</option>
                          <option value="Merchandiser">Merchandiser</option>
                          <option value="Production Manager">Production Manager</option>
                          <option value="Quality Manager">Quality Manager</option>
                          <option value="Store Manager">Store Manager</option>
                          <option value="HR Manager">HR Manager</option>
                          <option value="Accounts Manager">Accounts Manager</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold">
                          Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
                          Create User Account
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NUMBERING SEQUENCES */}
          {activeTab === "numbering" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Auto-Numbering Sequences</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Configure transaction voucher prefixes & auto-increment formats</p>
                </div>
              </div>

              <div className="space-y-3">
                {numberingSeqs.map((seq, idx) => (
                  <div key={seq.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{seq.entity}</h4>
                      <p className="text-xs text-slate-500 font-mono">Format: {seq.format}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Prefix:</span>
                        <input
                          type="text"
                          value={seq.prefix}
                          onChange={(e) => {
                            const updated = [...numberingSeqs];
                            updated[idx].prefix = e.target.value;
                            setNumberingSeqs(updated);
                          }}
                          className="w-24 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-indigo-600 text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Next #:</span>
                        <input
                          type="text"
                          value={seq.next}
                          onChange={(e) => {
                            const updated = [...numberingSeqs];
                            updated[idx].next = e.target.value;
                            setNumberingSeqs(updated);
                          }}
                          className="w-20 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: APPROVAL WORKFLOWS */}
          {activeTab === "workflows" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Tier Approval Workflows</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authorization thresholds for high-value purchase orders, order cancellations & discounts</p>
                </div>
              </div>

              <div className="space-y-4">
                {workflows.map((wf, idx) => (
                  <div key={wf.id} className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-bold">
                          <Workflow size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{wf.title}</h4>
                          <p className="text-xs text-slate-500">{wf.description}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updated = [...workflows];
                          updated[idx].status = !updated[idx].status;
                          setWorkflows(updated);
                          triggerToast(`Workflow status updated!`);
                        }}
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors relative p-1",
                          wf.status ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                        )}
                      >
                        <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", wf.status ? "translate-x-5" : "translate-x-0")} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block font-semibold">Threshold Trigger:</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{wf.minAmount}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Designated Approver:</span>
                        <strong className="text-indigo-600 font-bold">{wf.approver}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: NOTIFICATION TRIGGERS */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notification Triggers & Alert Channels</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Automated SMS, WhatsApp & Email alerts for delivery dates, quality failures & stock levels</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {notifications.map((n, idx) => (
                  <div key={n.id} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.event}</h4>
                      <p className="text-[11px] text-slate-500">Recipients: <strong className="text-slate-700 dark:text-slate-300">{n.role}</strong></p>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={n.email}
                          onChange={(e) => {
                            const updated = [...notifications];
                            updated[idx].email = e.target.checked;
                            setNotifications(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        /> Email
                      </label>
                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={n.whatsapp}
                          onChange={(e) => {
                            const updated = [...notifications];
                            updated[idx].whatsapp = e.target.checked;
                            setNotifications(updated);
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        /> WhatsApp
                      </label>
                      <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={n.inApp}
                          onChange={(e) => {
                            const updated = [...notifications];
                            updated[idx].inApp = e.target.checked;
                            setNotifications(updated);
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        /> In-App
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default SettingsView;
