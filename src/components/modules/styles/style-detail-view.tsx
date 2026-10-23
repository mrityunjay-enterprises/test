"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { styles as initialStyles, buyers } from "@/lib/demo-data";
import { Style, StyleAttachment } from "@/lib/types";
import {
  ArrowLeft, Shirt, FileText, Image as ImageIcon, UploadCloud, Plus,
  CheckCircle2, Download, Eye, X, Layers, Ruler, Scissors, Trash2, Edit3, Save, Paperclip
} from "lucide-react";

import { Breadcrumb } from "@/components/ui/breadcrumb";

export function StyleDetailView({ id, basePath }: { id: string; basePath?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");
  const isOwner = prefix.startsWith("/owner");
  const styleId = id;

  const [style, setStyle] = useState<Style | null>(() => initialStyles.find((s) => s.id === id) || null);
  const [activeTab, setActiveTab] = useState<"techpack" | "bom" | "measurements" | "operations">("techpack");
  const [selectedAttachment, setSelectedAttachment] = useState<StyleAttachment | null>(() => {
    const s = initialStyles.find((st) => st.id === id);
    return s && s.attachments && s.attachments.length > 0 ? s.attachments[0] : null;
  });

  // Quick Upload State
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");


  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_styles");
      const currentList: Style[] = saved ? JSON.parse(saved) : initialStyles;
      const found = currentList.find((s) => s.id === styleId) || initialStyles.find((s) => s.id === styleId);
      if (found) {
        setStyle(found);
        if (found.attachments && found.attachments.length > 0) {
          setSelectedAttachment(found.attachments[0]);
        }
      }
    } catch {
      const found = initialStyles.find((s) => s.id === styleId);
      if (found) setStyle(found);
    }
  }, [styleId]);

  if (!style) {
    return (
      <div className="p-8 text-center animate-fade-in space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Style Not Found</h2>
        <p className="text-sm text-slate-500">The requested garment style code could not be found.</p>
        <Link href={`${prefix}/styles`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          <ArrowLeft size={14} /> Back to Style Master
        </Link>
      </div>
    );
  }

  // Handle uploading new Image / PDF file to this style
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg)$/i.test(file.name);

      if (!isPdf && !isImage) {
        alert("Please select an Image file (PNG, JPG, WEBP) or a PDF document.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        const sizeFormatted = file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;

        const newAtt: StyleAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: isPdf ? "pdf" : "image",
          url: fileUrl,
          size: sizeFormatted,
          uploadedAt: new Date().toISOString().split("T")[0],
        };

        const updatedAttachments = [...(style.attachments || []), newAtt];
        const updatedStyle: Style = {
          ...style,
          attachments: updatedAttachments,
          mainImage: style.mainImage || (newAtt.type === "image" ? newAtt.url : ""),
        };

        setStyle(updatedStyle);
        setSelectedAttachment(newAtt);

        // Sync with localStorage
        try {
          const saved = localStorage.getItem("garmentflow_styles");
          const currentList: Style[] = saved ? JSON.parse(saved) : initialStyles;
          const updatedList = currentList.map((s) => (s.id === style.id ? updatedStyle : s));
          localStorage.setItem("garmentflow_styles", JSON.stringify(updatedList));
        } catch {
          // fallback
        }

        setToastMsg(`File "${file.name}" uploaded successfully!`);
        setTimeout(() => setToastMsg(""), 3000);
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Navigation & Header with Breadcrumb (Owner Item 6) */}
      <div className="space-y-2">
        <Breadcrumb
          items={[
            { label: isOwner ? "Owner Portal" : "Factory Portal", href: `${prefix}/dashboard` },
            { label: "Styles & Tech Packs", href: `${prefix}/styles` },
            { label: `${style.styleNumber} — ${style.styleName}` }
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{style.styleName}</h1>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 font-bold">{style.styleNumber}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 uppercase">{style.status}</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Buyer: <span className="font-semibold text-slate-700 dark:text-slate-300">{style.buyerName}</span> • Season: {style.season} {style.year} • Category: {style.category}
            </p>
          </div>

          {/* Action: Upload File */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm shadow-indigo-500/25">
              <UploadCloud size={16} /> Upload Image / PDF
              <input type="file" multiple accept="image/*,.pdf" onChange={handleUploadFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("techpack")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "techpack" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Paperclip size={16} /> Tech Pack & Uploaded Files ({style.attachments?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("bom")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "bom" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers size={16} /> Bill of Materials (BOM)
        </button>
        <button
          onClick={() => setActiveTab("measurements")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "measurements" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Ruler size={16} /> Measurement Chart
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "operations" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Scissors size={16} /> Operation Bulletin (SMV: {style.smv}m)
        </button>
      </div>

      {/* TAB 1: TECH PACK & UPLOADED FILES */}
      {activeTab === "techpack" && (
        <div className="space-y-6">
          {/* Quick Specs summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div><span className="text-slate-400 block">Garment Type</span><span className="font-bold text-slate-800 dark:text-white">{style.garmentType}</span></div>
            <div><span className="text-slate-400 block">Fabric Type</span><span className="font-bold text-slate-800 dark:text-white">{style.fabricType}</span></div>
            <div><span className="text-slate-400 block">Composition</span><span className="font-bold text-slate-800 dark:text-white">{style.fabricComposition}</span></div>
            <div><span className="text-slate-400 block">GSM</span><span className="font-bold text-slate-800 dark:text-white">{style.gsm} gsm</span></div>
            <div><span className="text-slate-400 block">Target SMV</span><span className="font-bold text-indigo-600">{style.smv} mins</span></div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            {/* Sidebar List of Uploaded Documents & Images */}
            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800/40 p-4 border-r border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attachments ({style.attachments?.length || 0})</h3>
                <label className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer">
                  + Add File
                  <input type="file" multiple accept="image/*,.pdf" onChange={handleUploadFile} className="hidden" />
                </label>
              </div>

              <div className="space-y-2 max-h-[550px] overflow-y-auto">
                {style.attachments?.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedAttachment(att)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3 ${
                      selectedAttachment?.id === att.id
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-white font-semibold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {att.type === "pdf" ? (
                      <FileText size={20} className="text-red-500 flex-shrink-0" />
                    ) : (
                      <ImageIcon size={20} className="text-blue-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{att.name}</p>
                      <p className="text-[10px] text-slate-400">{att.type.toUpperCase()} • {att.size}</p>
                    </div>
                  </div>
                ))}

                {(!style.attachments || style.attachments.length === 0) && (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <Paperclip size={24} className="mx-auto text-slate-400" />
                    <p className="text-xs text-slate-500">No images or PDF files uploaded yet for this style.</p>
                    <label className="inline-block px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer">
                      Upload PDF / Image
                      <input type="file" multiple accept="image/*,.pdf" onChange={handleUploadFile} className="hidden" />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Viewer Pane */}
            <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[500px] relative">
              {selectedAttachment ? (
                selectedAttachment.type === "image" ? (
                  <div className="space-y-3 text-center">
                    <img src={selectedAttachment.url} alt={selectedAttachment.name} className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-slate-800" />
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">{selectedAttachment.name}</span>
                      <a href={selectedAttachment.url} download={selectedAttachment.name} className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
                        <Download size={12} /> Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
                      <span className="font-mono">{selectedAttachment.name} ({selectedAttachment.size})</span>
                      <a href={selectedAttachment.url} download={selectedAttachment.name} className="text-indigo-400 hover:underline flex items-center gap-1 font-semibold">
                        <Download size={14} /> Download PDF
                      </a>
                    </div>
                    <iframe src={selectedAttachment.url} className="w-full h-[65vh] rounded-xl border-0 bg-white" title={selectedAttachment.name} />
                  </div>
                )
              ) : (
                <div className="text-center text-slate-500">
                  <FileText size={48} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Select a Tech Pack PDF or image from the left sidebar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOM */}
      {activeTab === "bom" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bill of Materials Specification</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">Estimated BOM: ₹298.50 / pc</span>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2 text-left">Category</th>
                <th className="py-2 text-left">Item Description</th>
                <th className="py-2 text-left">Consumption / pc</th>
                <th className="py-2 text-left">Unit</th>
                <th className="py-2 text-left">Unit Rate</th>
                <th className="py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-bold text-indigo-600">Main Fabric</td><td>{style.fabricType} ({style.fabricComposition})</td><td>1.35</td><td>meters</td><td>₹185.00</td><td className="font-bold text-slate-800 dark:text-white">₹249.75</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-bold text-indigo-600">Interlining</td><td>Woven Collar Interlining 75GSM</td><td>0.25</td><td>meters</td><td>₹45.00</td><td className="font-bold text-slate-800 dark:text-white">₹11.25</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-bold text-indigo-600">Buttons</td><td>Mother of Pearl Buttons 18L</td><td>14</td><td>pcs</td><td>₹2.20</td><td className="font-bold text-slate-800 dark:text-white">₹30.80</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-bold text-indigo-600">Thread</td><td>Coats Epic #120 Thread - White</td><td>120</td><td>meters</td><td>₹0.15</td><td className="font-bold text-slate-800 dark:text-white">₹18.00</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: MEASUREMENTS */}
      {activeTab === "measurements" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Graded Measurement Chart (cm)</h3>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2 text-left">Measurement Point</th>
                <th className="py-2 text-center">Tol (+/-)</th>
                {style.sizes.map((s) => (
                  <th key={s} className="py-2 text-center">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-semibold text-slate-800 dark:text-white">Chest Width</td><td className="text-center text-slate-400">0.5</td><td className="text-center font-bold">52</td><td className="text-center font-bold">55</td><td className="text-center font-bold">58</td><td className="text-center font-bold">61</td><td className="text-center font-bold">64</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-semibold text-slate-800 dark:text-white">Body Length (HPS)</td><td className="text-center text-slate-400">1.0</td><td className="text-center font-bold">72</td><td className="text-center font-bold">74</td><td className="text-center font-bold">76</td><td className="text-center font-bold">78</td><td className="text-center font-bold">80</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-semibold text-slate-800 dark:text-white">Shoulder Width</td><td className="text-center text-slate-400">0.5</td><td className="text-center font-bold">44</td><td className="text-center font-bold">46</td><td className="text-center font-bold">48</td><td className="text-center font-bold">50</td><td className="text-center font-bold">52</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="py-2.5 font-semibold text-slate-800 dark:text-white">Sleeve Length</td><td className="text-center text-slate-400">0.5</td><td className="text-center font-bold">63</td><td className="text-center font-bold">64.5</td><td className="text-center font-bold">66</td><td className="text-center font-bold">67.5</td><td className="text-center font-bold">69</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: OPERATIONS */}
      {activeTab === "operations" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Operation Breakdown & SAM</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">Total Garment SAM: {style.smv} Mins</span>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2 text-left">#</th>
                <th className="py-2 text-left">Operation Name</th>
                <th className="py-2 text-left">Machine Type</th>
                <th className="py-2 text-left">SAM (min)</th>
                <th className="py-2 text-left">Target / hr</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-slate-100 dark:border-slate-800"><td>1</td><td className="font-semibold text-slate-800 dark:text-white">Collar Make & Attach</td><td>SNLS</td><td>2.40</td><td>25 pcs</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td>2</td><td className="font-semibold text-slate-800 dark:text-white">Front Placket & Buttons</td><td>SNLS + Buttonhole</td><td>3.10</td><td>19 pcs</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td>3</td><td className="font-semibold text-slate-800 dark:text-white">Sleeve Attach & Cuff</td><td>SNLS + Overlock</td><td>2.80</td><td>21 pcs</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td>4</td><td className="font-semibold text-slate-800 dark:text-white">Side Seam & Bottom Hem</td><td>Overlock + Hemmer</td><td>2.20</td><td>27 pcs</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
