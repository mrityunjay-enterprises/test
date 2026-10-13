"use client";

import React, { useState } from "react";
import { UserCheck, Plus, Sliders, X, Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const initialUserRoles = [
  { id: "u1", name: "Arun Kapoor", email: "arun.kapoor@mrityunjayenterprises.com", role: "Managing Director (MD)", dept: "Executive Management", permissions: { orders: "Full", inventory: "Full", hr: "Full", settings: "Full" }, status: "active" },
  { id: "u2", name: "Kavita Sharma", email: "kavita.s@mrityunjayenterprises.com", role: "Quality Manager", dept: "Quality Control", permissions: { orders: "View", inventory: "View", hr: "None", settings: "None" }, status: "active" },
  { id: "u3", name: "Rajendra Singh", email: "rajendra.s@mrityunjayenterprises.com", role: "Store & Cutting Manager", dept: "Store / Cutting", permissions: { orders: "View", inventory: "Full", hr: "None", settings: "None" }, status: "active" },
  { id: "u4", name: "Meera Joshi", email: "meera.j@mrityunjayenterprises.com", role: "Production Planner", dept: "Merchandising & Planning", permissions: { orders: "Edit", inventory: "Edit", hr: "View", settings: "None" }, status: "active" },
  { id: "u5", name: "Suresh Yadav", email: "suresh.y@mrityunjayenterprises.com", role: "Floor Supervisor", dept: "Stitching Line A", permissions: { orders: "View", inventory: "View", hr: "None", settings: "None" }, status: "active" },
];

export function UsersView({ basePath = "/owner" }: { basePath?: string }) {
  const [users, setUsers] = useState(initialUserRoles);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Merchandiser",
    dept: "Merchandising",
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
    setNewUser({ name: "", email: "", role: "Merchandiser", dept: "Merchandising", permissions: { orders: "Edit", inventory: "View", hr: "None", settings: "None" } });
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User & Role Access Management</h1>
          <p className="text-sm text-slate-500 mt-1">Role-based permission matrix, user credentials & department access control</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
        >
          <Plus size={16} /> Add User Account
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 uppercase font-bold text-slate-600 dark:text-slate-300 text-[11px]">
              <th className="px-4 py-3 text-left">User Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
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
                <td className="px-4 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{u.role}</td>
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
                  <option value="Managing Director (MD)">Managing Director (MD)</option>
                  <option value="Director - Operations">Director - Operations</option>
                  <option value="Senior Merchandiser">Senior Merchandiser</option>
                  <option value="Production Planner">Production Planner</option>
                  <option value="Quality Manager">Quality Manager</option>
                  <option value="Store & Cutting Manager">Store & Cutting Manager</option>
                  <option value="Floor Supervisor">Floor Supervisor</option>
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
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Assigned Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="Senior Merchandiser">Senior Merchandiser</option>
                  <option value="Merchandiser">Merchandiser</option>
                  <option value="Production Planner">Production Planner</option>
                  <option value="Quality Manager">Quality Manager</option>
                  <option value="Store & Cutting Manager">Store & Cutting Manager</option>
                  <option value="Floor Supervisor">Floor Supervisor</option>
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
