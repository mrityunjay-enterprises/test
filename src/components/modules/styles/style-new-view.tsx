"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { buyers as initialBuyers, styles as initialStyles } from "@/lib/demo-data";
import { StyleAttachment, Style, Buyer } from "@/lib/types";
import { getStoredBuyers, WORKFLOW_EVENT } from "@/lib/workflow-service";
import {
  Save, Plus, Trash2, Layers, UploadCloud, FileText, Image as ImageIcon,
  CheckCircle2, X, Eye, Paperclip, ArrowLeft
} from "lucide-react";

// Default categories and their sub-categories for garment production
const DEFAULT_CATEGORY_MAP: Record<string, string[]> = {
  "Shirts": [
    "Formal",
    "Casual",
    "Denim",
    "Linen",
    "Partywear",
    "Oversized / Drop Shoulder",
    "Check / Flannel"
  ],
  "T-Shirts / Polos": [
    "Round Neck",
    "Polo Collar",
    "V-Neck",
    "Henley",
    "Graphic Print",
    "Activewear / Gym Tee"
  ],
  "Trousers / Pants": [
    "Formal Trousers",
    "Chinos",
    "Denim Jeans",
    "Cargo Pants",
    "Joggers / Trackpants"
  ],
  "Kurtis / Ethnic": [
    "Straight Kurti",
    "Anarkali",
    "Short Kurta",
    "Ethnic Dress",
    "Palazzo Suit"
  ],
  "Dresses / Skirts": [
    "Casual Dress",
    "Maxi Dress",
    "Midi Dress",
    "Bodycon",
    "A-Line Skirt"
  ],
  "Outerwear / Jackets": [
    "Denim Jacket",
    "Bomber Jacket",
    "Blazer",
    "Hoodie / Sweatshirt",
    "Windcheater"
  ],
  "Activewear": [
    "Gym Tee",
    "Trackpants",
    "Sports Shorts",
    "Tank Top"
  ]
};

export function StyleNewView({ basePath }: { basePath?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const prefix = basePath || (pathname?.startsWith("/owner") ? "/owner" : pathname?.startsWith("/factory") ? "/factory" : "/owner");

  // Buyers list from workflow service / local storage
  const [buyerList, setBuyerList] = useState<Buyer[]>([]);

  useEffect(() => {
    const syncBuyers = () => {
      try {
        const stored = getStoredBuyers();
        setBuyerList(stored && stored.length > 0 ? stored : initialBuyers);
      } catch {
        setBuyerList(initialBuyers);
      }
    };
    syncBuyers();
    window.addEventListener(WORKFLOW_EVENT, syncBuyers);
    window.addEventListener("storage", syncBuyers);
    return () => {
      window.removeEventListener(WORKFLOW_EVENT, syncBuyers);
      window.removeEventListener("storage", syncBuyers);
    };
  }, []);

  // Form Fields
  const [styleNumber, setStyleNumber] = useState("");
  const [styleName, setStyleName] = useState("");
  const [buyerId, setBuyerId] = useState("");

  // Categories & Subcategories State with Local Storage persistence
  const [categoriesMap, setCategoriesMap] = useState<Record<string, string[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("garmentflow_style_category_map");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_CATEGORY_MAP;
  });

  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");

  // Inline Category creation
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Inline Subcategory creation
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const handleCategoryChange = (newCat: string) => {
    if (newCat === "__NEW__") {
      setIsAddingCategory(true);
      setNewCategoryName("");
      return;
    }
    setCategory(newCat);
    const subList = categoriesMap[newCat] || [];
    setSubcategory(subList.length > 0 ? subList[0] : "");
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const updated = {
      ...categoriesMap,
      [trimmed]: categoriesMap[trimmed] || []
    };
    setCategoriesMap(updated);
    try {
      localStorage.setItem("garmentflow_style_category_map", JSON.stringify(updated));
    } catch (e) {}

    setCategory(trimmed);
    setSubcategory("");
    setNewCategoryName("");
    setIsAddingCategory(false);
    // Automatically prompt for adding subcategory for this new category
    setIsAddingSubcategory(true);
  };

  const handleAddNewSubcategory = () => {
    const trimmed = newSubcategoryName.trim();
    if (!trimmed) return;

    const currentSubs = categoriesMap[category] || [];
    if (!currentSubs.includes(trimmed)) {
      const updated = {
        ...categoriesMap,
        [category]: [...currentSubs, trimmed]
      };
      setCategoriesMap(updated);
      try {
        localStorage.setItem("garmentflow_style_category_map", JSON.stringify(updated));
      } catch (e) {}
    }

    setSubcategory(trimmed);
    setNewSubcategoryName("");
    setIsAddingSubcategory(false);
  };

  const [gender, setGender] = useState<"men" | "women" | "kids" | "unisex" | "">("");
  const [season, setSeason] = useState("");
  const [year, setYear] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [fabricComposition, setFabricComposition] = useState("");
  const [fabricColor, setFabricColor] = useState("");
  const [gsm, setGsm] = useState("");
  const [smv, setSmv] = useState("");
  const [description, setDescription] = useState("");

  // Uploaded Files (Images & PDFs)
  const [attachments, setAttachments] = useState<StyleAttachment[]>([]);
  const [mainImage, setMainImage] = useState<string>("");
  const [previewFile, setPreviewFile] = useState<StyleAttachment | null>(null);

  // BOM & Operations — starts clean without prefilled mock data
  const [boms, setBoms] = useState<Array<{ type: string; name: string; consumption: string; unit: string; rate: string }>>([]);
  const [ops, setOps] = useState<Array<{ name: string; smv: string; machine: string }>>([]);

  const [toastMsg, setToastMsg] = useState("");

  // File Upload Handler (Image or PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setAttachments((prev) => [...prev, newAtt]);

        if (isImage && !mainImage) {
          setMainImage(fileUrl);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    const target = attachments.find((a) => a.id === id);
    if (target && target.url === mainImage) {
      const remainingImages = attachments.filter((a) => a.id !== id && a.type === "image");
      setMainImage(remainingImages.length > 0 ? remainingImages[0].url : "");
    }
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveStyle = (e: React.FormEvent) => {
    e.preventDefault();

    if (!styleNumber || !styleName || !buyerId) {
      alert("Please fill in all required fields (Style Number, Style Name, Buyer).");
      return;
    }

    const buyerObj = buyerList.find((b) => b.id === buyerId);

    const newStyle: Style = {
      id: `st-${Date.now()}`,
      styleNumber,
      styleName,
      buyerId,
      buyerName: buyerObj ? buyerObj.name : "Custom Buyer",
      brand: buyerObj ? buyerObj.companyName : "Brand",
      season: season || "SS",
      year: year || "2025",
      category: category || "Shirts",
      subcategory: subcategory || (categoriesMap[category] ? categoriesMap[category][0] : category),
      gender: gender || "men",
      garmentType: subcategory || category,
      description: description || `${styleName} - ${fabricType}`,
      mainImage: mainImage || (attachments.find((a) => a.type === "image")?.url || ""),
      attachments: attachments,
      fabricType: fabricType || "Cotton",
      fabricComposition: fabricComposition || "100% Cotton",
      fabricColor: fabricColor || "Multi",
      gsm: parseFloat(gsm) || 150,
      smv: parseFloat(smv) || 15.0,
      colors: [{ id: "c-1", name: "Default", code: "DFT" }],
      sizes: ["S", "M", "L", "XL"],
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };

    // Save to localStorage
    try {
      const saved = localStorage.getItem("garmentflow_styles");
      const currentList: Style[] = saved ? JSON.parse(saved) : initialStyles;
      const updatedList = [newStyle, ...currentList];
      localStorage.setItem("garmentflow_styles", JSON.stringify(updatedList));
    } catch {
      // fallback
    }

    setToastMsg("Garment style created successfully!");
    setTimeout(() => {
      router.push(`${prefix}/styles`);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={18} /> <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Create Garment Style</h1>
          <p className="text-sm text-slate-500 mt-1">Define Tech Pack, upload style sketches/PDF documents, BOM, and operation SMVs</p>
        </div>
        <Link href={`${prefix}/styles`} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Back to Style Master
        </Link>
      </div>

      <form onSubmit={handleSaveStyle} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 space-y-6">
        {/* Style Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Style Number / Code *</label>
            <input type="text" required value={styleNumber} onChange={e => setStyleNumber(e.target.value)} placeholder="e.g. STL-2025-089" className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Style Name *</label>
            <input type="text" required value={styleName} onChange={e => setStyleName(e.target.value)} placeholder="e.g. Slim Fit Denim Jacket" className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Buyer *</label>
            <select required value={buyerId} onChange={e => setBuyerId(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">Select Buyer</option>
              {buyerList.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
            </select>
          </div>

          {/* Category with inline Add New */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">Category *</label>
              {!isAddingCategory && (
                <button
                  type="button"
                  onClick={() => { setIsAddingCategory(true); setNewCategoryName(""); }}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={12} className="stroke-[2.5]" />
                  <span>Add Category</span>
                </button>
              )}
            </div>

            {isAddingCategory ? (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewCategory();
                      } else if (e.key === "Escape") {
                        setIsAddingCategory(false);
                      }
                    }}
                    placeholder="e.g. Kurtis / Sweaters"
                    className="flex-1 h-10 px-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNewCategory()}
                    className="px-3 h-10 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-2.5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Type category name & click Add</p>
              </div>
            ) : (
              <select
                value={category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium"
              >
                <option value="">-- Select Category --</option>
                {Object.keys(categoriesMap).map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="__NEW__">+ Add New Category...</option>
              </select>
            )}
          </div>

          {/* Subcategory with inline Add New */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                Sub-Category {category ? `(${category})` : ""}
              </label>
              {!isAddingSubcategory && category && (
                <button
                  type="button"
                  onClick={() => { setIsAddingSubcategory(true); setNewSubcategoryName(""); }}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                >
                  <Plus size={12} className="stroke-[2.5]" />
                  <span>Add Sub-Category</span>
                </button>
              )}
            </div>

            {isAddingSubcategory ? (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newSubcategoryName}
                    onChange={e => setNewSubcategoryName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewSubcategory();
                      } else if (e.key === "Escape") {
                        setIsAddingSubcategory(false);
                      }
                    }}
                    placeholder={`e.g. Type of ${category || "garment"} (Formal, Casual)`}
                    className="flex-1 h-10 px-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNewSubcategory()}
                    className="px-3 h-10 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingSubcategory(false)}
                    className="px-2.5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Add sub-type for {category || "category"}</p>
              </div>
            ) : (
              <select
                value={subcategory}
                onChange={e => {
                  if (e.target.value === "__NEW__") {
                    setIsAddingSubcategory(true);
                    setNewSubcategoryName("");
                  } else {
                    setSubcategory(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-medium"
              >
                <option value="">-- Select Sub-Category --</option>
                {(categoriesMap[category] || []).length === 0 ? (
                  category ? <option value="" disabled>No sub-categories yet</option> : null
                ) : (
                  (categoriesMap[category] || []).map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))
                )}
                {category && <option value="__NEW__">+ Add New Sub-Category...</option>}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Gender / Target Group</label>
            <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40">
              <option value="">Select Target Group</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Season & Year</label>
            <div className="flex gap-2 max-w-sm">
              <input type="text" value={season} onChange={e => setSeason(e.target.value)} placeholder="SS / AW" className="flex-1 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
              <input type="text" value={year} onChange={e => setYear(e.target.value)} placeholder="2025" className="w-24 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
            </div>
          </div>
        </div>

        {/* Fabric Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Fabric Type</label>
            <input type="text" value={fabricType} onChange={e => setFabricType(e.target.value)} placeholder="e.g. Oxford Cotton" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Composition</label>
            <input type="text" value={fabricComposition} onChange={e => setFabricComposition(e.target.value)} placeholder="e.g. 100% Cotton" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">GSM</label>
            <input type="number" value={gsm} onChange={e => setGsm(e.target.value)} placeholder="e.g. 140" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Garment SMV (min)</label>
            <input type="number" step="0.1" value={smv} onChange={e => setSmv(e.target.value)} placeholder="e.g. 18.5" className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
          </div>
        </div>

        {/* FILE UPLOAD SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Paperclip size={16} className="text-indigo-600" />
                Upload Style Documents & Images (PDF / Sketches)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Attach Tech Pack PDFs, spec sheets, flat sketches, or garment photos</p>
            </div>
            <span className="text-xs text-indigo-600 font-semibold">{attachments.length} attached</span>
          </div>

          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/20 relative group">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Drop your Image or PDF Tech Pack here, or <span className="text-indigo-600 underline">Browse files</span>
              </p>
              <p className="text-xs text-slate-400">Supports PDF tech packs, flat sketches (PNG, JPG, WEBP), Measurement sheets up to 20MB</p>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative group shadow-sm">
                  {att.type === "image" ? (
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 relative">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      {mainImage === att.url && (
                        <span className="absolute bottom-0 inset-x-0 bg-indigo-600 text-white text-[8px] font-bold text-center py-0.5">MAIN</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center flex-shrink-0">
                      <FileText size={22} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">{att.name}</p>
                    <p className="text-[10px] text-slate-400">{att.type.toUpperCase()} • {att.size}</p>
                    {att.type === "image" && mainImage !== att.url && (
                      <button
                        type="button"
                        onClick={() => setMainImage(att.url)}
                        className="text-[10px] text-indigo-600 font-semibold hover:underline mt-0.5"
                      >
                        Set as Main Cover
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(att)}
                      className="p-1 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Preview"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Initial BOM items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Initial Bill of Materials (BOM)</h3>
            <button type="button" onClick={() => setBoms(p => [...p, { type: "Trims", name: "", consumption: "", unit: "pcs", rate: "" }])} className="text-xs font-semibold text-indigo-600 flex items-center gap-1"><Plus size={14} /> Add Material</button>
          </div>
          <div className="space-y-2">
            {boms.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No BOM materials added yet. Click &quot;+ Add Material&quot; to add.
              </p>
            ) : (
              boms.map((b, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <select value={b.type} onChange={e => { const nb = [...boms]; nb[i].type = e.target.value; setBoms(nb); }} className="w-28 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                    <option>Fabric</option><option>Trims</option><option>Thread</option><option>Label</option><option>Packaging</option>
                  </select>
                  <input type="text" value={b.name} onChange={e => { const nb = [...boms]; nb[i].name = e.target.value; setBoms(nb); }} placeholder="Material name" className="flex-1 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                  <input type="text" value={b.consumption} onChange={e => { const nb = [...boms]; nb[i].consumption = e.target.value; setBoms(nb); }} placeholder="Cons/pc" className="w-20 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center" />
                  <input type="text" value={b.unit} onChange={e => { const nb = [...boms]; nb[i].unit = e.target.value; setBoms(nb); }} placeholder="Unit" className="w-16 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center" />
                  <button type="button" onClick={() => setBoms(p => p.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Operation Bulletin */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operation Bulletin & SMV</h3>
            <button type="button" onClick={() => setOps(p => [...p, { name: "", smv: "", machine: "SNLS" }])} className="text-xs font-semibold text-indigo-600 flex items-center gap-1"><Plus size={14} /> Add Operation</button>
          </div>
          <div className="space-y-2">
            {ops.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No operations added yet. Click &quot;+ Add Operation&quot; to add.
              </p>
            ) : (
              ops.map((o, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-xs font-bold text-slate-400 w-6">#{i + 1}</span>
                  <input type="text" value={o.name} onChange={e => { const no = [...ops]; no[i].name = e.target.value; setOps(no); }} placeholder="Operation name" className="flex-1 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs" />
                  <input type="text" value={o.smv} onChange={e => { const no = [...ops]; no[i].smv = e.target.value; setOps(no); }} placeholder="SMV (min)" className="w-24 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-center" />
                  <select value={o.machine} onChange={e => { const no = [...ops]; no[i].machine = e.target.value; setOps(no); }} className="w-28 h-9 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                    <option>SNLS</option><option>DNLS</option><option>Overlock 4F</option><option>Flatlock</option><option>Buttonhole</option><option>Bar Tack</option><option>Manual</option>
                  </select>
                  <button type="button" onClick={() => setOps(p => p.filter((_, j) => j !== i))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/25">
            <Save size={16} /> Save Style Master
          </button>
          <Link href={`${prefix}/styles`} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            Cancel
          </Link>
        </div>
      </form>

      {/* Attachment Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {previewFile.type === "pdf" ? <FileText className="text-red-500" size={18} /> : <ImageIcon className="text-indigo-500" size={18} />}
                {previewFile.name}
              </h3>
              <button onClick={() => setPreviewFile(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950">
              {previewFile.type === "image" ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-h-[70vh] object-contain rounded-lg shadow-xl" />
              ) : (
                <iframe src={previewFile.url} className="w-full h-[70vh] rounded-lg border-0" title={previewFile.name} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
