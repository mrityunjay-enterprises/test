"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Compass, ArrowRight, CheckCircle2, Factory, Scissors, Shirt,
  Package, ShieldCheck, Truck, Receipt, Users, CreditCard,
  HelpCircle, BookOpen, Search, X, Sparkles, ChevronRight,
  Info, ExternalLink, Lightbulb, UserCheck, Layers, FileText
} from "lucide-react";

export interface WorkflowStage {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  simpleExplanation: string;
  role: string;
  roleIcon: string;
  keyOutputs: string[];
  jargonTerms: string[];
  href: string;
  actionText: string;
  badgeColor: string;
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "crm",
    stepNumber: 1,
    title: "Buyer & Enquiry",
    subtitle: "Commercial enquiry & buyer relationship",
    simpleExplanation: "Business begins here. You record who the buyer is, which garment styles they are interested in, target price, colorways, and requested delivery season.",
    role: "Merchandiser / Sales Head",
    roleIcon: "👔",
    keyOutputs: ["Buyer Profile", "Enquiry Sheet", "Target Costing Target"],
    jargonTerms: ["Tech Pack", "Inquiry (RFQ)", "Target Price"],
    href: "/dashboard/crm/enquiries",
    actionText: "Open Buyer Enquiries",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: "sampling",
    stepNumber: 2,
    title: "Sampling & Approvals",
    subtitle: "Prototype craftsmanship & buyer sign-off",
    simpleExplanation: "Master tailors stitch 1 or 2 test garments. The buyer inspects collar fit, drape, and stitch finish. Once the buyer sends formal approval, bulk production is authorized.",
    role: "Master Tailor & Sampling Head",
    roleIcon: "🧵",
    keyOutputs: ["Proto Sample", "Fit Comments", "Pre-Production (PP) Approval"],
    jargonTerms: ["Proto", "Fit Sample", "PP Sample", "Lab Dip"],
    href: "/dashboard/sampling/approvals",
    actionText: "View Sample Approvals",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
  },
  {
    id: "styles",
    stepNumber: 3,
    title: "Style Blueprint & BOM",
    subtitle: "Measurements, Bill of Materials & SMV",
    simpleExplanation: "The engineering blueprint of the garment. Specifies fabric consumption (meters per piece), list of trims (buttons, zippers, tags), and the sewing sequence (operations bulletin).",
    role: "Technical Designer / Merchandiser",
    roleIcon: "📐",
    keyOutputs: ["Size Spec Sheet", "Bill of Materials (BOM)", "Operation Bulletin"],
    jargonTerms: ["BOM", "SAM / SMV", "Grading", "Consumption"],
    href: "/dashboard/styles",
    actionText: "Explore Style Master & BOM",
    badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300"
  },
  {
    id: "orders",
    stepNumber: 4,
    title: "Order Booking & Costing",
    subtitle: "Confirm Purchase Order & delivery date",
    simpleExplanation: "The official contract. Buyer issues a Purchase Order (PO). The factory locks quantity per size/color, calculates fabric budget, cost per garment, and shipment deadline.",
    role: "Merchandiser & General Manager",
    roleIcon: "📋",
    keyOutputs: ["Confirmed PO", "Costing Sheet", "Time & Action (T&A) Calendar"],
    jargonTerms: ["PO", "Cut-to-Ship Ratio", "Gross Margin %", "T&A"],
    href: "/dashboard/orders",
    actionText: "Manage Orders & Costing",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    id: "inventory",
    stepNumber: 5,
    title: "Fabric Sourcing & Store",
    subtitle: "Raw material receipt, inspection & rack issue",
    simpleExplanation: "Buying bulk fabric and trims from textile mills. When rolls arrive at the factory gate, inspectors check them for shade variations and tears before issuing to the cutting floor.",
    role: "Storekeeper & Purchase Officer",
    roleIcon: "📦",
    keyOutputs: ["Fabric Roll Inventory", "4-Point Inspection Pass", "Material Issue Note"],
    jargonTerms: ["4-Point System", "Shade Lot", "GSM", "Issue Challan"],
    href: "/dashboard/inventory",
    actionText: "Check Fabric & Stores",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
  },
  {
    id: "cutting",
    stepNumber: 6,
    title: "Cutting Floor & Bundles",
    subtitle: "Fabric spreading, pattern cutting & QR bundles",
    simpleExplanation: "Fabric is spread flat in 50-100 layers (plies). Electric knives cut the pieces according to computer markers. Cut pieces are tied into numbered bundles with QR codes.",
    role: "Cutting Master & Spreaders",
    roleIcon: "✂️",
    keyOutputs: ["Cut Panel Bundles", "QR Bundle Barcodes", "Cutting Output Report"],
    jargonTerms: ["Plies", "Spreading", "Marker Efficiency", "Bundle Tag"],
    href: "/dashboard/production/cutting",
    actionText: "Open Cutting Room",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
  },
  {
    id: "stitching",
    stepNumber: 7,
    title: "Stitching Lines (Sewing)",
    subtitle: "Assembly lines, hourly output & inline QC",
    simpleExplanation: "The heart of the factory: 20-30 sewing machines per line stitch collar, sleeves, and body seams. Hourly targets are monitored, and roving QC inspectors catch flaws on the line.",
    role: "Floor Supervisor & Line Tailors",
    roleIcon: "🏭",
    keyOutputs: ["Stitched Garments", "Hourly Line Log", "Inline Defect Tracking"],
    jargonTerms: ["Line Balancing", "WIP", "DHU", "Bottleneck"],
    href: "/dashboard/production/stitching",
    actionText: "View Stitching Floor",
    badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300"
  },
  {
    id: "quality",
    stepNumber: 8,
    title: "Quality Assurance (QC)",
    subtitle: "End-line inspection, AQL audit & CAPA",
    simpleExplanation: "Every garment is inspected 100% at the end of the line. Before packing, a statistical AQL audit checks a random sample to guarantee buyer standards are met.",
    role: "Quality Assurance Manager & Inspectors",
    roleIcon: "🛡️",
    keyOutputs: ["QC Pass Garments", "Defect Log", "AQL Inspection Certificate"],
    jargonTerms: ["AQL 2.5", "CAPA", "Major/Minor Defect", "Pass Rate"],
    href: "/dashboard/quality/inspections",
    actionText: "Inspect Quality Logs",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300"
  },
  {
    id: "dispatch",
    stepNumber: 9,
    title: "Packing, Invoicing & Dispatch",
    subtitle: "Ironing, carton barcodes, GST invoice & shipment",
    simpleExplanation: "Garments are steam-ironed, barcode-tagged, folded, and packed in export cartons. A GST Tax invoice and E-Way bill are generated, and goods are loaded onto trucks for shipment.",
    role: "Finishing Head, Dispatch & Accounts",
    roleIcon: "🚚",
    keyOutputs: ["Packing List", "GST Tax Invoice", "Gate Pass & E-Way Bill"],
    jargonTerms: ["Carton Barcode", "GSTIN", "E-Way Bill", "LUT Export"],
    href: "/dashboard/dispatch",
    actionText: "Go to Dispatch & Invoices",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300"
  }
];

export const GARMENT_GLOSSARY = [
  { term: "BOM (Bill of Materials)", meaning: "The complete recipe list of every fabric, button, zipper, and sewing thread required to produce 1 garment." },
  { term: "SAM / SMV (Standard Allowed Minutes)", meaning: "The exact standard time (in minutes) an operator should take to complete sewing operations on one garment." },
  { term: "AQL (Acceptable Quality Limit)", meaning: "An international statistical inspection method (e.g. AQL 2.5) determining how many minor defects are permitted in a shipment batch." },
  { term: "CAPA (Corrective & Preventive Action)", meaning: "A structured investigation to find the root cause of a defect and ensure the error does not happen again." },
  { term: "WIP (Work In Progress)", meaning: "Garment pieces currently in production between cutting tables, sewing lines, and finishing." },
  { term: "Marker Efficiency", meaning: "The percentage of fabric surface utilized by cut patterns versus leftover scrap fabric (target is usually >88%)." },
  { term: "Plies", meaning: "Multiple layers of fabric laid flat on the cutting table before being sliced together with an electric cutting knife." },
  { term: "Bundle System", meaning: "Grouping cut parts of 20 to 50 garments together with a barcode tag so pieces stay organized through sewing lines." },
  { term: "DHU (Defects per Hundred Units)", meaning: "A quality metric tracking how many defects are discovered for every 100 garment pieces checked." },
  { term: "Cut-to-Ship Ratio", meaning: "The ratio of finished garments shipped to the buyer compared to the quantity of fabric panels cut (indicates factory waste)." },
  { term: "E-Way Bill", meaning: "An electronic permit required under Indian GST law for transporting goods worth over ₹50,000 across roads." },
  { term: "LUT (Letter of Undertaking)", meaning: "A legal document allowing Indian garment exporters to ship merchandise abroad with 0% GST." }
];

export const ROLE_WALKTHROUGHS = [
  {
    role: "Owner / Managing Director (MD)",
    icon: "👑",
    focus: "Business Profitability, Delivery Deadlines & Cash Flow",
    keyScreens: [
      { name: "Executive Dashboard", href: "/dashboard", desc: "Consolidated revenue, profit margins & floor outputs" },
      { name: "Order Tracking", href: "/owner/orders", desc: "Check which buyer orders are on schedule vs delayed" },
      { name: "GST Invoices & Dues", href: "/owner/invoices", desc: "View unpaid buyer invoices and incoming cash flow" },
      { name: "Executive Reports", href: "/owner/reports", desc: "Export company-wide MIS reports in Excel/PDF" }
    ]
  },
  {
    role: "Merchandiser & Planning Head",
    icon: "📦",
    focus: "Buyer Communication, Samples & Order Delivery",
    keyScreens: [
      { name: "Buyer CRM", href: "/dashboard/crm/buyers", desc: "Manage client details, orders history & enquiries" },
      { name: "Sample Approvals", href: "/dashboard/sampling/approvals", desc: "Track buyer fit comments & PP sample sign-offs" },
      { name: "Style Master & BOM", href: "/dashboard/styles", desc: "Define fabric consumption and garment trim specs" },
      { name: "Order Costing", href: "/dashboard/orders/costing", desc: "Calculate cost per piece and gross profit margin" }
    ]
  },
  {
    role: "Production & Floor Supervisor",
    icon: "🧵",
    focus: "Cutting, Sewing Lines & Daily Worker Output",
    keyScreens: [
      { name: "Cutting Floor", href: "/dashboard/production/cutting", desc: "Track table schedules, plies and cut piece counts" },
      { name: "Stitching Lines", href: "/dashboard/production/stitching", desc: "Live monitoring of sewing lines and line efficiency" },
      { name: "Hourly Output", href: "/dashboard/production/hourly", desc: "Real-time hourly piece production vs planned target" },
      { name: "Bundle Movement", href: "/dashboard/production/bundles", desc: "Scan and track QR-coded garment bundles" }
    ]
  },
  {
    role: "Quality Assurance (QC) Manager",
    icon: "🛡️",
    focus: "Zero-Defect Shipments & AQL Standards",
    keyScreens: [
      { name: "QC Inspections", href: "/dashboard/quality/inspections", desc: "Inline sewing checks, end-line audit & fabric rolls" },
      { name: "New Inspection Form", href: "/dashboard/quality/inspections/new", desc: "Submit quick defect counts and pass/rework decisions" },
      { name: "Defect Analysis", href: "/dashboard/quality/defects", desc: "Top stitching defects (skip stitch, broken seam, stains)" },
      { name: "CAPA Corrective Actions", href: "/dashboard/quality/capa", desc: "Prevent recurring floor problems" }
    ]
  },
  {
    role: "Storekeeper & Inventory Manager",
    icon: "🏭",
    focus: "Fabric Rolls, Trims & Material Requisitions",
    keyScreens: [
      { name: "Stock Overview", href: "/dashboard/inventory", desc: "Live meters of fabrics and trim items on hand" },
      { name: "Fabric Roll Master", href: "/dashboard/inventory/fabric", desc: "Track roll numbers, rack locations and shade lots" },
      { name: "Material Issue", href: "/dashboard/inventory/issue", desc: "Issue fabric rolls to cutting against job orders" },
      { name: "Purchase Orders", href: "/dashboard/procurement/orders", desc: "Receive incoming raw materials from yarn/fabric mills" }
    ]
  },
  {
    role: "Finance & Accounts Head",
    icon: "💰",
    focus: "GST Billing, Supplier Dues & Commercial Invoices",
    keyScreens: [
      { name: "All Invoices", href: "/dashboard/invoices", desc: "Search, filter, and track payment status of all bills" },
      { name: "New GST Invoice", href: "/dashboard/invoices/new", desc: "Generate 5% GST or 0% Export LUT tax invoices" },
      { name: "Payment Receipts", href: "/dashboard/invoices/payments", desc: "Log buyer wire transfers, NEFT/RTGS payments" },
      { name: "Job Work Challans", href: "/dashboard/job-work", desc: "Track outside embroidery/printing subcontractor payments" }
    ]
  }
];

export const QUICK_ACTIONS = [
  { label: "Book a New Order from Buyer", desc: "Create a new sales order with style, qty, and delivery deadline", href: "/dashboard/orders/new", icon: Package, category: "Pre-Production" },
  { label: "Log Quality Inspection Report", desc: "Record inline or end-line defects and pass/fail decision", href: "/dashboard/quality/inspections/new", icon: ShieldCheck, category: "Manufacturing" },
  { label: "Check Live Stitching Lines", desc: "See today's hourly sewing output and line efficiency", href: "/dashboard/production/stitching", icon: Factory, category: "Manufacturing" },
  { label: "Generate a GST Tax Invoice", desc: "Create a formal invoice with GSTIN, HSN code, and tax breakdown", href: "/dashboard/invoices/new", icon: Receipt, category: "Commercial" },
  { label: "Inspect Fabric Rolls in Warehouse", desc: "4-point inspection for shade lot matching and defects", href: "/dashboard/inventory/inspection", icon: Scissors, category: "Supply Chain" },
  { label: "Record Employee Attendance", desc: "Mark daily shifts, present count, and biometric logs", href: "/dashboard/hrms/attendance", icon: UserCheck, category: "Human Resources" }
];

function resolvePortalLink(href: string, pathname: string | null) {
  const isFactory = pathname ? pathname.startsWith("/factory") : false;
  const prefix = isFactory ? "/factory" : "/owner";

  if (href.includes("/invoices")) return `${prefix}/invoices`;
  if (href.includes("/orders/new")) return `${prefix}/orders/new`;
  if (href.includes("/orders")) return `${prefix}/orders`;
  if (href.includes("/cutting")) return `${prefix}/cutting`;
  if (href.includes("/stitching")) return `${prefix}/stitching`;
  if (href.includes("/finishing")) return `${prefix}/finishing`;
  if (href.includes("/production")) return `${prefix}/production`;
  if (href.includes("/quality")) return `${prefix}/quality`;
  if (href.includes("/packing")) return `${prefix}/packing`;
  if (href.includes("/dispatch")) return `${prefix}/dispatch`;
  if (href.includes("/inventory")) return `${prefix}/inventory`;
  if (href.includes("/attendance")) return `${prefix}/attendance`;
  if (href.includes("/leave")) return `${prefix}/leave`;
  if (href.includes("/payroll")) return `${prefix}/payroll`;
  if (href.includes("/reports")) return `${prefix}/reports`;
  if (href.includes("/styles")) return isFactory ? `${prefix}/production` : `${prefix}/styles`;
  if (href.includes("/sampling")) return isFactory ? `${prefix}/production` : `${prefix}/sampling`;
  if (href.includes("/planning")) return `${prefix}/planning`;
  if (href.includes("/purchase") || href.includes("/procurement")) return isFactory ? `${prefix}/inventory` : `${prefix}/purchase`;
  if (href.includes("/crm") || href.includes("/buyers")) return isFactory ? `${prefix}/orders` : `${prefix}/customers`;

  return `${prefix}/dashboard`;
}

export function GarmentWorkflowBanner({ onOpenFullModal }: { onOpenFullModal?: () => void }) {
  const pathname = usePathname();
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>(WORKFLOW_STAGES[0]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 lg:p-7 border border-indigo-800/40 shadow-xl relative overflow-hidden transition-all">
      {/* Background glow decorative */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider flex items-center gap-1.5">
              <Compass size={13} className="text-indigo-400" /> Garment Factory Blueprint
            </span>
            <span className="text-xs text-indigo-200/70">• Plain English Workflow Guide</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            How This ERP Works: The Garment Lifecycle
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
            From buyer enquiry to shipping container: click any of the 9 stages below to understand what happens and who manages it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenFullModal && (
            <button
              onClick={onOpenFullModal}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <BookOpen size={14} /> Full Guide & Glossary
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all"
          >
            {isExpanded ? "Collapse View" : "Expand Guide"}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="pt-5 space-y-5 relative z-10 animate-fade-in">
          {/* Stepper Carousel / Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {WORKFLOW_STAGES.map((stage) => {
              const isSelected = selectedStage.id === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className={cn(
                    "flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all text-xs group",
                    isSelected
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.03]"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600 hover:text-white"
                  )}
                >
                  <span className="text-sm mb-1">{stage.roleIcon}</span>
                  <span className="text-[10px] font-bold text-indigo-300 mb-0.5">Step {stage.stepNumber}</span>
                  <span className="font-semibold leading-tight line-clamp-1">{stage.title.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Stage Details Card */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 backdrop-blur-sm">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Step {selectedStage.stepNumber} of 9
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedStage.title}
                </h3>
                <span className="text-xs text-slate-400">• {selectedStage.subtitle}</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedStage.simpleExplanation}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="text-slate-400">Responsible Role:</span>
                  <strong className="text-indigo-300">{selectedStage.role}</strong>
                </span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="text-slate-400">Key Deliverable:</span>
                  <strong className="text-emerald-300">{selectedStage.keyOutputs.join(", ")}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
              <Link
                href={resolvePortalLink(selectedStage.href, pathname)}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {selectedStage.actionText} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function GarmentWorkflowModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"flow" | "roles" | "glossary" | "tasks">("flow");
  const [selectedStage, setSelectedStage] = useState<WorkflowStage>(WORKFLOW_STAGES[0]);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");

  if (!isOpen) return null;

  const filteredGlossary = GARMENT_GLOSSARY.filter(item =>
    item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
    item.meaning.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const filteredTasks = QUICK_ACTIONS.filter(task =>
    task.label.toLowerCase().includes(taskSearch.toLowerCase()) ||
    task.desc.toLowerCase().includes(taskSearch.toLowerCase()) ||
    task.category.toLowerCase().includes(taskSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">

        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} /> GarmentFlow Knowledge Base
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Easy ERP Manual</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Understanding GarmentFlow ERP in Plain English
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
          <button
            onClick={() => setActiveTab("flow")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "flow"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Compass size={15} /> 1. The 9-Stage Factory Flow
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "roles"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Users size={15} /> 2. Roles & Who Does What
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "tasks"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <Lightbulb size={15} /> 3. Common Daily Tasks
          </button>
          <button
            onClick={() => setActiveTab("glossary")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "glossary"
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            <BookOpen size={15} /> 4. Jargon Buster (Glossary)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: 9-STAGE FLOW */}
          {activeTab === "flow" && (
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                <strong>How orders travel through the factory:</strong> Click on each step below to see its plain-language meaning, who executes it, and which screen in GarmentFlow handles it.
              </div>

              {/* Stage selector bar */}
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
                {WORKFLOW_STAGES.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(stage)}
                    className={cn(
                      "p-3 rounded-2xl border flex flex-col items-center text-center transition-all",
                      selectedStage.id === stage.id
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <span className="text-lg mb-1">{stage.roleIcon}</span>
                    <span className="text-[10px] font-bold opacity-80">Step {stage.stepNumber}</span>
                    <span className="text-xs font-bold line-clamp-1">{stage.title.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Selected Stage Detail */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Stage {selectedStage.stepNumber} • {selectedStage.subtitle}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {selectedStage.title}
                    </h3>
                  </div>
                  <Link
                    href={resolvePortalLink(selectedStage.href, pathname)}
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {selectedStage.actionText} <ExternalLink size={14} />
                  </Link>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">In Plain English:</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {selectedStage.simpleExplanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 uppercase">Primary Owner / Role</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                      <span>{selectedStage.roleIcon}</span> {selectedStage.role}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500 uppercase">Key Deliverables</span>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      {selectedStage.keyOutputs.join(" • ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === "roles" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GarmentFlow organizes tasks by department so everyone knows their exact daily responsibilities:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLE_WALKTHROUGHS.map((rw) => (
                  <div key={rw.role} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rw.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rw.role}</h4>
                        <p className="text-xs text-slate-400">{rw.focus}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                      {rw.keyScreens.map((ks) => (
                        <Link
                          key={ks.name}
                          href={resolvePortalLink(ks.href, pathname)}
                          onClick={onClose}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-xs transition-colors group"
                        >
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{ks.name}</span>
                            <p className="text-[11px] text-slate-400">{ks.desc}</p>
                          </div>
                          <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMMON TASKS */}
          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="What would you like to do? (e.g. order, invoice, cut, attendance)..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredTasks.map((t) => (
                  <Link
                    key={t.label}
                    href={resolvePortalLink(t.href, pathname)}
                    onClick={onClose}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <t.icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {t.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 transition-colors">
                        {t.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {t.desc}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GLOSSARY */}
          {activeTab === "glossary" && (
            <div className="space-y-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search garment industry abbreviations (e.g. BOM, SAM, AQL, CAPA)..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredGlossary.map((item) => (
                  <div key={item.term} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
                      <BookOpen size={14} /> {item.term}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Need in-depth documentation? Visit the <Link href="/dashboard/help" onClick={onClose} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Help & Learning Center</Link>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Got it, thanks!
          </button>
        </div>

      </div>
    </div>
  );
}
