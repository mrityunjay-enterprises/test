"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Building2, Shield, Key, CheckCircle } from "lucide-react";

export function ProfileView({ basePath }: { basePath?: string }) {
  const [currentUser, setCurrentUser] = useState({
    name: "Arun Kapoor",
    role: "Managing Director (MD)",
    dept: "Executive Management",
    email: "arun.kapoor@garmentflow.com",
    initials: "AK"
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Profile & Access Rights</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your active account credentials, department role, and security preferences</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          {currentUser.initials}
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{currentUser.role} • {currentUser.dept}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><Mail size={14} /> {currentUser.email}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} /> +91-98290-12345</span>
            <span className="flex items-center gap-1.5"><Building2 size={14} /> Mrityunjay Enterprises</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Department Permissions</h3>
        <div className="flex flex-wrap gap-2">
          {[currentUser.role, currentUser.dept, "GarmentFlow ERP License", "Audit Verified User", "Multi-Unit Access"].map((perm, idx) => (
            <span key={idx} className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
              {perm}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
