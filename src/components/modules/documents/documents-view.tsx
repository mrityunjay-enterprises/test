"use client";

import React from "react";
import { FileText, Upload, Download, Search, Folder, Plus, Eye, Filter } from "lucide-react";

const docList = [
  { name: "Nordstrom_Oxford_Shirt_TechPack_v2.pdf", category: "Tech Pack", size: "4.2 MB", date: "2025-04-05", entity: "Style GF-MCS-2025-001" },
  { name: "M&S_Maxi_Dress_Measurement_Chart.xlsx", category: "Measurement Chart", size: "1.8 MB", date: "2025-03-25", entity: "Style GF-WDR-2025-002" },
  { name: "Arvind_Mills_Fabric_Test_Report_Lot3.pdf", category: "Quality Report", size: "2.4 MB", date: "2025-05-12", entity: "PO-2025-0234" },
  { name: "Reliance_Trends_Denim_Packing_List.pdf", category: "Packing List", size: "1.1 MB", date: "2025-07-14", entity: "DSP-2025-0045" },
];

export function DocumentsView({ basePath }: { basePath?: string }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Document Management System</h1>
          <p className="text-sm text-slate-500 mt-1">Central repository for tech packs, purchase orders, compliance certificates & quality reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Document Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Entity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {docList.map((doc, i) => (
              <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3.5 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
                  <FileText size={16} className="text-indigo-600" />
                  {doc.name}
                </td>
                <td className="px-4 py-3.5"><span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{doc.category}</span></td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{doc.entity}</td>
                <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{doc.size}</td>
                <td className="px-4 py-3.5 text-xs text-slate-500">{doc.date}</td>
                <td className="px-4 py-3.5"><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"><Download size={14} /> Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
