"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { styles as initialStyles } from "@/lib/demo-data";
import { Style, StyleAttachment } from "@/lib/types";
import {
  Search, Plus, Shirt, Palette, Ruler, FileText, ChevronRight, Copy, Edit,
  Trash2, UploadCloud, Eye, Paperclip, X, Image as ImageIcon, Download, CheckCircle2
} from "lucide-react";


export function StylesView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");

  const [styleList, setStyleList] = useState<Style[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload modal state
  const [uploadModalStyle, setUploadModalStyle] = useState<Style | null>(null);
  const [uploadFiles, setUploadFiles] = useState<StyleAttachment[]>([]);

  // Preview modal state
  const [viewerStyle, setViewerStyle] = useState<Style | null>(null);
  const [selectedPreview, setSelectedPreview] = useState<StyleAttachment | null>(null);

  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_styles");
      if (saved) {
        setStyleList(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    setStyleList(initialStyles);
  }, []);

  const saveStyles = (data: Style[]) => {
    setStyleList(data);
    try {
      localStorage.setItem("garmentflow_styles", JSON.stringify(data));
    } catch {
      // fallback
    }
  };

  // Upload file handler for specific style
  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadModalStyle) return;

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

        setUploadFiles((prev) => [...prev, newAtt]);
      };

      reader.readAsDataURL(file);
    });
  };

  const handleSaveAttachments = () => {
    if (!uploadModalStyle) return;
    const updated = styleList.map((s) => {
      if (s.id === uploadModalStyle.id) {
        const existingAtts = s.attachments || [];
        const merged = [...existingAtts, ...uploadFiles];
        const newMain = s.mainImage || (merged.find((a) => a.type === "image")?.url || "");
        return { ...s, attachments: merged, mainImage: newMain };
      }
      return s;
    });

    saveStyles(updated);
    setUploadModalStyle(null);
    setUploadFiles([]);
    setToastMsg("Style attachments uploaded successfully!");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const filtered = styleList.filter(s =>
    s.styleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.styleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Style Master</h1>
          <p className="text-sm text-slate-500 mt-1">Centralized garment styles, Tech Pack PDF uploads, sketches & measurement charts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`${prefix}/styles/new`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25"
          >
            <Plus size={16} /> Create Style
          </Link>
        </div>


      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search style number, name, buyer..." className="w-full h-10 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {filtered.map(style => {
          const pdfs = style.attachments?.filter(a => a.type === "pdf") || [];
          const images = style.attachments?.filter(a => a.type === "image") || [];
          const coverImage = style.mainImage || (images.length > 0 ? images[0].url : null);

          return (
            <div key={style.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  {coverImage ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0 cursor-pointer" onClick={() => { setViewerStyle(style); setSelectedPreview(images[0] || null); }}>
                      <img src={coverImage} alt={style.styleName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Shirt size={24} />
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase">
                      {style.status}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{style.styleName}</h3>
                <p className="text-xs font-mono text-indigo-500 mt-0.5">{style.styleNumber}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{style.description}</p>

                {/* Attached Files Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {pdfs.length > 0 && (
                    <button
                      onClick={() => { setViewerStyle(style); setSelectedPreview(pdfs[0]); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <FileText size={13} /> {pdfs.length} PDF Tech Pack{pdfs.length > 1 ? "s" : ""}
                    </button>
                  )}
                  {images.length > 0 && (
                    <button
                      onClick={() => { setViewerStyle(style); setSelectedPreview(images[0]); }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      <ImageIcon size={13} /> {images.length} Image{images.length > 1 ? "s" : ""}
                    </button>
                  )}
                  <button
                    onClick={() => { setUploadModalStyle(style); setUploadFiles([]); }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-xs font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <UploadCloud size={13} /> Upload File
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Buyer</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{style.buyerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">SMV (Min)</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{style.smv} mins</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Fabric</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{style.fabricType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GSM</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">{style.gsm} gsm</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-4">
                  {style.colors.map(c => (
                    <span key={c.id} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link href={`${prefix}/styles/${style.id}`} className="flex-1 text-center py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  View Tech Pack & BOM
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK UPLOAD MODAL */}
      {uploadModalStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setUploadModalStyle(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Style Files</h3>
                <p className="text-xs text-indigo-500 font-mono">{uploadModalStyle.styleNumber} — {uploadModalStyle.styleName}</p>
              </div>
              <button onClick={() => setUploadModalStyle(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/40 relative">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleQuickUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <UploadCloud size={28} className="mx-auto text-indigo-600 mb-2" />
              <p className="text-xs font-semibold text-slate-800 dark:text-white">Click or drag Image or PDF file to upload</p>
              <p className="text-[10px] text-slate-400 mt-1">Tech Pack PDF, sketches, measurement sheets</p>
            </div>

            {uploadFiles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-auto">
                {uploadFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-800 dark:text-white truncate flex-1">{f.name}</span>
                    <span className="text-[10px] text-slate-400 px-2">{f.size}</span>
                    <button onClick={() => setUploadFiles(prev => prev.filter(x => x.id !== f.id))} className="text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleSaveAttachments}
                disabled={uploadFiles.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Save Attachments ({uploadFiles.length})
              </button>
              <button onClick={() => setUploadModalStyle(null)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT & IMAGE VIEWER MODAL */}
      {viewerStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewerStyle(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewerStyle.styleName} — Tech Pack & Attachments</h3>
                <p className="text-xs text-indigo-500 font-mono">{viewerStyle.styleNumber} • Buyer: {viewerStyle.buyerName}</p>
              </div>
              <button onClick={() => setViewerStyle(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Attachment Sidebar */}
              <div className="w-full md:w-72 bg-slate-50 dark:bg-slate-800/60 p-4 border-r border-slate-200 dark:border-slate-800 overflow-y-auto space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Attached Documents ({viewerStyle.attachments?.length || 0})</h4>
                {viewerStyle.attachments?.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setSelectedPreview(att)}
                    className={cn(
                      "p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-3",
                      selectedPreview?.id === att.id
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white font-semibold"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    {att.type === "pdf" ? <FileText size={18} className="text-red-500 flex-shrink-0" /> : <ImageIcon size={18} className="text-blue-500 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{att.name}</p>
                      <p className="text-[10px] text-slate-400">{att.type.toUpperCase()} • {att.size}</p>
                    </div>
                  </div>
                ))}
                {(!viewerStyle.attachments || viewerStyle.attachments.length === 0) && (
                  <p className="text-xs text-slate-400 py-4 text-center">No attachments uploaded yet.</p>
                )}
              </div>

              {/* Main Document / Image Viewer Area */}
              <div className="flex-1 p-6 bg-slate-950 flex flex-col items-center justify-center overflow-auto relative min-h-[400px]">
                {selectedPreview ? (
                  selectedPreview.type === "image" ? (
                    <div className="space-y-3 text-center">
                      <img src={selectedPreview.url} alt={selectedPreview.name} className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl border border-slate-800" />
                      <p className="text-xs text-slate-400 font-mono">{selectedPreview.name}</p>
                    </div>
                  ) : (
                    <iframe src={selectedPreview.url} className="w-full h-[65vh] rounded-lg border-0 bg-white" title={selectedPreview.name} />
                  )
                ) : (
                  <div className="text-center text-slate-500">
                    <FileText size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Select an attachment from the sidebar to preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


