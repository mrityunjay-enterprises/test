"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { styles as initialStyles, buyers } from "@/lib/demo-data";
import { Style, StyleAttachment } from "@/lib/types";
import {
  ArrowLeft, Shirt, FileText, Image as ImageIcon, UploadCloud, Plus,
  CheckCircle2, Download, Eye, X, Layers, Ruler, Scissors, Trash2, Edit3, Save, Paperclip
} from "lucide-react";

export default function StyleDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const styleId = id;

  const [style, setStyle] = useState<Style | null>(null);
  const [activeTab, setActiveTab] = useState<"techpack" | "bom" | "measurements" | "operations">("techpack");
  const [selectedAttachment, setSelectedAttachment] = useState<StyleAttachment | null>(null);

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
        <Link href="/owner/styles" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          <ArrowLeft size={14} /> Back to Style Master
        </Link>
      </div>
    );
  }

  // Handle file uploads specifically for this style
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    Array.from(files).forEach((file) => {
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const isImage = file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|svg)$/i.test(file.name);

      if (!isPdf && !isImage) {
        alert("Please upload an image (PNG, JPG, WEBP) or a PDF Tech Pack document.");
        setUploading(false);
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
          mainImage: (!style.mainImage && isImage) ? fileUrl : style.mainImage,
        };

        setStyle(updatedStyle);
        setSelectedAttachment(newAtt);

        // Sync with localStorage
        try {
          const saved = localStorage.getItem("garmentflow_styles");
          const list: Style[] = saved ? JSON.parse(saved) : initialStyles;
          const updatedList = list.map((s) => (s.id === style.id ? updatedStyle : s));
          localStorage.setItem("garmentflow_styles", JSON.stringify(updatedList));
        } catch {
          // fallback
        }

        setUploading(false);
        setToastMsg(`Uploaded ${file.name} successfully!`);
        setTimeout(() => setToastMsg(""), 3000);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (attId: string) => {
    if (!confirm("Are you sure you want to delete this document from the style?")) return;

    const remaining = (style.attachments || []).filter((a) => a.id !== attId);
    const updatedStyle = { ...style, attachments: remaining };
    setStyle(updatedStyle);

    if (selectedAttachment?.id === attId) {
      setSelectedAttachment(remaining.length > 0 ? remaining[0] : null);
    }

    try {
      const saved = localStorage.getItem("garmentflow_styles");
      const list: Style[] = saved ? JSON.parse(saved) : initialStyles;
      const updatedList = list.map((s) => (s.id === style.id ? updatedStyle : s));
      localStorage.setItem("garmentflow_styles", JSON.stringify(updatedList));
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/owner/styles" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline mb-1">
            <ArrowLeft size={14} /> Back to Style Master
          </Link>
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
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm shadow-indigo-500/25 cursor-pointer">
            <UploadCloud size={16} />
            <span>Upload Tech Pack / PDF</span>
            <input type="file" multiple accept="image/*,.pdf" onChange={handleUpload} className="hidden" />
          </label>
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
          <Shirt size={16} /> Tech Pack & Documents ({style.attachments?.length || 0})
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
          <Ruler size={16} /> Graded Measurement Spec
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "operations" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Scissors size={16} /> Operation Breakdown & SMV
        </button>
      </div>

      {/* TAB 1: TECH PACK & DOCUMENT VIEWER */}
      {activeTab === "techpack" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Attachment List */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Style Files & Sketches</h3>
                <span className="text-xs text-slate-400">{style.attachments?.length || 0} files</span>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {(style.attachments || []).map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedAttachment(att)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedAttachment?.id === att.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm"
                        : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {att.type === "pdf" ? (
                        <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{att.name}</p>
                        <p className="text-[10px] text-slate-400">{att.type.toUpperCase()} • {att.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }}
                        className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {(!style.attachments || style.attachments.length === 0) && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No files or sketches uploaded yet. Use the upload button above to attach tech packs or photos.
                  </div>
                )}
              </div>
            </div>

            {/* Fabric & Style Info Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">Fabric & Quality Specs</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                <div>Fabric: <span className="font-semibold text-slate-900 dark:text-white">{style.fabricType}</span></div>
                <div>GSM: <span className="font-semibold text-slate-900 dark:text-white">{style.gsm} gsm</span></div>
                <div>Comp: <span className="font-semibold text-slate-900 dark:text-white">{style.fabricComposition}</span></div>
                <div>Total SMV: <span className="font-semibold text-slate-900 dark:text-white">{style.smv} mins</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Embedded Document Viewer (PDF or Image) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex flex-col min-h-[600px]">
            {selectedAttachment ? (
              <div className="flex-1 flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {selectedAttachment.type === "pdf" ? <FileText size={18} className="text-red-500" /> : <ImageIcon size={18} className="text-indigo-500" />}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedAttachment.name}</h3>
                  </div>
                  <a
                    href={selectedAttachment.url}
                    download={selectedAttachment.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    <Download size={14} /> Download File
                  </a>
                </div>

                <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-[480px]">
                  {selectedAttachment.type === "image" ? (
                    <img
                      src={selectedAttachment.url}
                      alt={selectedAttachment.name}
                      className="max-h-[500px] w-auto object-contain rounded-lg shadow-xl"
                    />
                  ) : (
                    <iframe
                      src={selectedAttachment.url}
                      className="w-full h-full min-h-[500px] rounded-lg border-0 bg-white"
                      title={selectedAttachment.name}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <FileText size={48} className="text-slate-300" />
                <p className="text-sm font-semibold">Select a document or image on the left to preview</p>
                <p className="text-xs">You can view interactive PDF Tech Packs and zoomable high-resolution flat sketches directly here.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOM */}
      {activeTab === "bom" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Bill of Materials (BOM) Breakdown</h3>
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-2 text-left">Item Type</th>
                <th className="py-2 text-left">Item Name / Specification</th>
                <th className="py-2 text-left">Supplier</th>
                <th className="py-2 text-center">Consumption</th>
                <th className="py-2 text-center">Unit</th>
                <th className="py-2 text-right">Cost / Unit</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="font-semibold text-indigo-600 py-3">Fabric</td><td>Oxford Cotton Yarn Dyed</td><td>Vardhman Mills</td><td className="text-center font-bold">1.35</td><td className="text-center">Meters</td><td className="text-right font-mono">₹185.00</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="font-semibold text-indigo-600 py-3">Trims</td><td>Pearl Poly Buttons (18L)</td><td>YKK India</td><td className="text-center font-bold">12</td><td className="text-center">Pieces</td><td className="text-right font-mono">₹0.85</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="font-semibold text-indigo-600 py-3">Thread</td><td>Core Spun Polyester Thread 40/2</td><td>Coats India</td><td className="text-center font-bold">120</td><td className="text-center">Meters</td><td className="text-right font-mono">₹4.20</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="font-semibold text-indigo-600 py-3">Interlining</td><td>Woven Fusible Collar Canvas</td><td>Freudenberg</td><td className="text-center font-bold">0.25</td><td className="text-center">Meters</td><td className="text-right font-mono">₹45.00</td></tr>
              <tr className="border-b border-slate-100 dark:border-slate-800"><td className="font-semibold text-indigo-600 py-3">Label</td><td>Woven Brand Main & Care Label</td><td>Avery Dennison</td><td className="text-center font-bold">2</td><td className="text-center">Pieces</td><td className="text-right font-mono">₹3.50</td></tr>
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
