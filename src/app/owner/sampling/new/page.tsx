"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buyers, styles } from "@/lib/demo-data";
import { Save, Plus, ArrowLeft } from "lucide-react";

export default function NewSamplePage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/owner/sampling");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">New Sample Request</h1>
          <p className="text-sm text-slate-500 mt-1">Initiate Proto, Fit, Salesman, Size Set or PP sample development</p>
        </div>
        <Link href="/owner/sampling" className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Back to Sampling
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Buyer *</label>
            <select required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
              <option value="">Select Buyer</option>
              {buyers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Style / Tech Pack *</label>
            <select required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
              <option value="">Select Style</option>
              {styles.map(s => <option key={s.id} value={s.id}>{s.styleNumber} — {s.styleName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sample Stage / Type *</label>
            <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
              <option>Proto Sample</option>
              <option>Fit Sample</option>
              <option>Salesman Sample (SMS)</option>
              <option>Size Set</option>
              <option>Pre-Production (PP) Sample</option>
              <option>TOP (Top of Production)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Target Dispatch Date *</label>
            <input type="date" required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Quantity Required</label>
            <input type="number" defaultValue={3} placeholder="e.g. 3" className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Assigned Sampling Master</label>
            <select className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
              <option>Suresh Master</option>
              <option>Ramesh Master</option>
              <option>Devendra Master</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5">Buyer Comments & Special Instructions</label>
          <textarea rows={3} placeholder="Buyer fitting comments, fabric substitutes, special wash instructions..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none" />
        </div>

        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Save size={16} /> Submit Sample Request
          </button>
          <Link href="/owner/sampling" className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
