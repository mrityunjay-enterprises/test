"use client";

import React, { useState } from "react";
import { UserCheck, Plus, Sliders, X, Check, CheckCircle2, Monitor, Users, ExternalLink, ShieldCheck, Key } from "lucide-react";
import { cn } from "@/lib/utils";

const WORKSTATION_NODES = [
  { id: "node-01", nodeNum: "NODE 01", dept: "Merchandising & Planning", location: "Office Terminal 1", role: "Senior Merchandiser", panel: "Owner Portal", access: "Full (Orders, Sourcing & BOM)", badge: "Owner", note: "Buyer CRM, Tech packs & BOM costing" },
  { id: "node-02", nodeNum: "NODE 02", dept: "Merchandising & Planning", location: "Office Terminal 2", role: "Production Planner (PPC)", panel: "Owner Portal", access: "Full (T&A & Line Capacity)", badge: "Owner", note: "Delivery milestones & floor scheduling" },
  { id: "node-03", nodeNum: "NODE 03", dept: "Store", location: "Raw Material Godown", role: "Store In-charge", panel: "Factory Station", access: "Full (Fabric/Trims Inventory & GRN)", badge: "Factory", note: "Lot/Shade inward & cutting issuance" },
  { id: "node-04", nodeNum: "NODE 04", dept: "Cutting", location: "Cutting Master Desk", role: "Cutting Master / Supervisor", panel: "Factory Station", access: "Full (Lays, Markers & Cut Bundles)", badge: "Factory", note: "Marker efficiency & barcode bundle ticketing" },
  { id: "node-05", nodeNum: "NODE 05", dept: "Production Sewing", location: "Shop Floor Kiosk", role: "Sewing Floor Supervisor", panel: "Factory Station", access: "Full (Hourly Lines 1-6 & Alterations)", badge: "Factory", note: "Live operator output & line bottleneck alarms" },
  { id: "node-06", nodeNum: "NODE 06", dept: "Finishing", location: "Washing & Ironing Area", role: "Finishing In-charge", panel: "Factory Station", access: "Full (Wash, Pressing & Stain Tally)", badge: "Factory", note: "Garment audit & transfer to packing dock" },
  { id: "node-07", nodeNum: "NODE 07", dept: "Packing & Dispatch", location: "Dispatch Dock Terminal", role: "Packing & Shipping Officer", panel: "Factory Station", access: "Full (Carton Barcodes & Gate Pass)", badge: "Factory", note: "Cartonization, delivery challan & vehicle gate pass" },
  { id: "node-08", nodeNum: "NODE 08", dept: "Accounts & HR (Combined)", location: "Admin Office (Desk 1)", role: "Accounts & HR Executive (Terminal 1)", panel: "Owner Portal", access: "Full (Billing, Receivables & Payroll)", badge: "Combined", note: "GST Invoices, e-way bills & biometric payroll sync" },
  { id: "node-09", nodeNum: "NODE 09", dept: "Accounts & HR (Combined)", location: "Admin Office (Desk 2)", role: "Accounts & HR Executive (Terminal 2)", panel: "Owner Portal", access: "Full (Billing, Receivables & Payroll)", badge: "Combined", note: "GST Invoices, e-way bills & biometric payroll sync" },
  { id: "node-10", nodeNum: "NODE 10", dept: "Admin (Identical Full Permission)", location: "Managing Director Cabin", role: "Admin Terminal 1 (MD / Owner)", panel: "Full Super Admin", access: "Full Unrestricted Root Access", badge: "Admin", note: "Unrestricted control: Owner & Factory panels" },
  { id: "node-11", nodeNum: "NODE 11", dept: "Admin (Identical Full Permission)", location: "Director / Partner Cabin", role: "Admin Terminal 2 (Director / Partner)", panel: "Full Super Admin", access: "Full Unrestricted Root Access", badge: "Admin", note: "Unrestricted control: Owner & Factory panels" },
  { id: "node-12", nodeNum: "NODE 12", dept: "Admin (Identical Full Permission)", location: "General Manager Cabin", role: "Admin Terminal 3 (General Manager)", panel: "Full Super Admin", access: "Full Unrestricted Root Access", badge: "Admin", note: "Unrestricted control: Owner & Factory panels" },
];

const initialUserRoles = [
  { id: "u1", name: "Arun Kapoor", email: "arun.kapoor@mrityunjayenterprises.com", role: "Managing Director (MD)", dept: "Admin (Node 10)", permissions: { orders: "Full", inventory: "Full", hr: "Full", settings: "Full" }, status: "active" },
  { id: "u2", name: "Vikram Singhania", email: "vikram.s@mrityunjayenterprises.com", role: "Director / Partner", dept: "Admin (Node 11)", permissions: { orders: "Full", inventory: "Full", hr: "Full", settings: "Full" }, status: "active" },
  { id: "u3", name: "Rajesh Verma", email: "rajesh.v@mrityunjayenterprises.com", role: "General Manager", dept: "Admin (Node 12)", permissions: { orders: "Full", inventory: "Full", hr: "Full", settings: "Full" }, status: "active" },
  { id: "u4", name: "Priya Sharma", email: "priya.s@mrityunjayenterprises.com", role: "Accounts & HR Executive", dept: "Accounts & HR (Node 08)", permissions: { orders: "Edit", inventory: "View", hr: "Full", settings: "View" }, status: "active" },
  { id: "u5", name: "Rahul Dave", email: "rahul.d@mrityunjayenterprises.com", role: "Accounts & HR Executive", dept: "Accounts & HR (Node 09)", permissions: { orders: "Edit", inventory: "View", hr: "Full", settings: "View" }, status: "active" },
  { id: "u6", name: "Priyanshu Jain", email: "priyanshu.j@mrityunjayenterprises.com", role: "Senior Merchandiser", dept: "Merchandising (Node 01)", permissions: { orders: "Full", inventory: "View", hr: "None", settings: "None" }, status: "active" },
  { id: "u7", name: "Meera Joshi", email: "meera.j@mrityunjayenterprises.com", role: "Production Planner", dept: "Planning PPC (Node 02)", permissions: { orders: "Edit", inventory: "Edit", hr: "View", settings: "None" }, status: "active" },
  { id: "u8", name: "Rajendra Singh", email: "rajendra.s@mrityunjayenterprises.com", role: "Store & Cutting Manager", dept: "Store (Node 03)", permissions: { orders: "View", inventory: "Full", hr: "None", settings: "None" }, status: "active" },
  { id: "u9", name: "Suresh Yadav", email: "suresh.y@mrityunjayenterprises.com", role: "Floor Supervisor", dept: "Sewing Lines (Node 05)", permissions: { orders: "View", inventory: "View", hr: "None", settings: "None" }, status: "active" },
  { id: "u10", name: "Kavita Sharma", email: "kavita.s@mrityunjayenterprises.com", role: "Quality Manager", dept: "Quality Control", permissions: { orders: "View", inventory: "View", hr: "None", settings: "None" }, status: "active" },
];

export function UsersView({ basePath = "/owner" }: { basePath?: string }) {
  const [activeTab, setActiveTab] = useState<"nodes" | "users">("nodes");
  const [users, setUsers] = useState(initialUserRoles);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Senior Merchandiser",
    dept: "Merchandising & Planning",
    permissions: { orders: "Edit", inventory: "View", hr: "None", settings: "None" }
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    triggerToast(`Permissions for ${editingUser.name} updated!`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const created = {
      id: `u-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      dept: newUser.dept,
      permissions: newUser.permissions,
      status: "active"
    };
    setUsers([...users, created]);
    setNewUser({ name: "", email: "", role: "Senior Merchandiser", dept: "Merchandising & Planning", permissions: { orders: "Edit", inventory: "View", hr: "None", settings: "None" } });
    setShowAddModal(false);
    triggerToast(`User account ${created.name} created successfully!`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="text-emerald-400" size={20} />
          <span className="text-sm font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Workstation Nodes & Role Access</h1>
          <p className="text-sm text-slate-500 mt-1">12 physical factory nodes across 8 operational units • Unified Accounts & HR • 3 Full Super Admin nodes</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/nodes-and-permissions.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink size={14} className="text-indigo-600" /> Client Blueprint (PDF)
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus size={15} /> Add User Account
          </button>
        </div>
      </div>

      {/* Architecture Highlights Pill Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-900 dark:text-purple-300">3 Admin Nodes (10, 11, 12) — 100% Identical Full Permission</div>
            <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">MD, Director & GM terminals share full unrestricted Super Admin control across Owner and Factory portals without bottlenecks.</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Key size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-blue-900 dark:text-blue-300">Accounts & HR (Nodes 08 & 09) — Unified Single Department</div>
            <div className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5">Commercial GST billing, buyer receivables & fabric AP combined with worker biometric muster rolls and payroll for seamless cross-cover.</div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab("nodes")}
          className={cn(
            "pb-3.5 flex items-center gap-2 transition-colors relative",
            activeTab === "nodes"
              ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          )}
        >
          <Monitor size={15} /> Physical Workstation Nodes (12 Terminals)
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "pb-3.5 flex items-center gap-2 transition-colors relative",
            activeTab === "users"
              ? "text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          )}
        >
          <Users size={15} /> Assigned User Logins ({users.length})
        </button>
      </div>

      {/* TAB 1: Workstation Nodes */}
      {activeTab === "nodes" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 uppercase font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                <th className="px-4 py-3 text-left w-24">Node #</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Physical Terminal & Role</th>
                <th className="px-4 py-3 text-left">Panel</th>
                <th className="px-4 py-3 text-left">Access Scope</th>
                <th className="px-4 py-3 text-left">Primary Function</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {WORKSTATION_NODES.map((node) => (
                <tr key={node.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-700 text-[10px]">
                      {node.nodeNum}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">
                    {node.dept}
                    <div className="text-[11px] text-slate-500 font-normal">{node.location}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {node.role}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                        node.badge === "Admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
                          : node.badge === "Combined"
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                          : node.badge === "Owner"
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      )}
                    >
                      {node.panel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {node.access}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    {node.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: User Accounts */}
      {activeTab === "users" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 uppercase font-bold text-slate-600 dark:text-slate-300 text-[11px]">
                <th className="px-4 py-3 text-left">User Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role & Node</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-center">Inventory</th>
                <th className="px-4 py-3 text-center">HR & Settings</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3.5 text-xs text-indigo-600 font-medium">{u.email}</td>
                  <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div>{u.role}</div>
                    <div className="text-[10px] text-slate-400">{u.dept}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px]", u.permissions.orders === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : u.permissions.orders === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : u.permissions.orders === "View" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-500")}>
                      {u.permissions.orders}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px]", u.permissions.inventory === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : u.permissions.inventory === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : u.permissions.inventory === "View" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-slate-100 text-slate-500")}>
                      {u.permissions.inventory}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center font-bold">
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px]", u.permissions.settings === "Full" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : u.permissions.settings === "Edit" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" : "bg-slate-100 text-slate-500")}>
                      {u.permissions.settings}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setEditingUser(JSON.parse(JSON.stringify(u)))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 font-bold text-xs transition-colors"
                    >
                      <Sliders size={13} /> Edit Permissions
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

            <form onSubmit={handleSavePermissions} className="space-y-4 text-xs">
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
                  <option value="Managing Director (MD)">Managing Director (MD) — Node 10 (Full Super Admin)</option>
                  <option value="Director / Partner">Director / Partner — Node 11 (Full Super Admin)</option>
                  <option value="General Manager">General Manager — Node 12 (Full Super Admin)</option>
                  <option value="Accounts & HR Executive">Accounts & HR Executive — Nodes 08 & 09 (Combined)</option>
                  <option value="Senior Merchandiser">Senior Merchandiser — Node 01 (Owner Portal)</option>
                  <option value="Production Planner">Production Planner (PPC) — Node 02 (Owner Portal)</option>
                  <option value="Store In-charge">Store In-charge — Node 03 (Factory Station)</option>
                  <option value="Cutting Master">Cutting Master — Node 04 (Factory Station)</option>
                  <option value="Floor Supervisor">Sewing Floor Supervisor — Node 05 (Factory Station)</option>
                  <option value="Finishing In-charge">Finishing In-charge — Node 06 (Factory Station)</option>
                  <option value="Packing & Shipping Officer">Packing & Shipping Officer — Node 07 (Factory Station)</option>
                  <option value="Quality Manager">Quality Manager (Factory Station)</option>
                </select>
              </div>

              {/* Module Privileges */}
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New User Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="e.g. Priyanshu Sharma"
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
                  placeholder="priyanshu@mrityunjayenterprises.com"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assigned Role & Workstation Node</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="Managing Director (MD)">Managing Director (MD) — Node 10 (Full Super Admin)</option>
                  <option value="Director / Partner">Director / Partner — Node 11 (Full Super Admin)</option>
                  <option value="General Manager">General Manager — Node 12 (Full Super Admin)</option>
                  <option value="Accounts & HR Executive">Accounts & HR Executive — Nodes 08 & 09 (Combined)</option>
                  <option value="Senior Merchandiser">Senior Merchandiser — Node 01 (Owner Portal)</option>
                  <option value="Production Planner">Production Planner (PPC) — Node 02 (Owner Portal)</option>
                  <option value="Store In-charge">Store In-charge — Node 03 (Factory Station)</option>
                  <option value="Cutting Master">Cutting Master — Node 04 (Factory Station)</option>
                  <option value="Floor Supervisor">Sewing Floor Supervisor — Node 05 (Factory Station)</option>
                  <option value="Finishing In-charge">Finishing In-charge — Node 06 (Factory Station)</option>
                  <option value="Packing & Shipping Officer">Packing & Shipping Officer — Node 07 (Factory Station)</option>
                  <option value="Quality Manager">Quality Manager (Factory Station)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersView;
