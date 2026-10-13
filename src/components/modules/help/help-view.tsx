"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HelpCircle, BookOpen, MessageSquare, PhoneCall, FileText,
  Compass, Users, Lightbulb, Search, ArrowRight, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, Factory, Scissors, Shirt,
  Package, ShieldCheck, Truck, Receipt, ExternalLink
} from "lucide-react";
import {
  WORKFLOW_STAGES, GARMENT_GLOSSARY, ROLE_WALKTHROUGHS, QUICK_ACTIONS
} from "@/components/shared/garment-workflow-guide";

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

export function HelpView({ basePath }: { basePath?: string }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState<"flow" | "roles" | "glossary" | "faq">("flow");
  const [selectedStageId, setSelectedStageId] = useState<string>("crm");
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedStage = WORKFLOW_STAGES.find(s => s.id === selectedStageId) || WORKFLOW_STAGES[0];

  const filteredGlossary = GARMENT_GLOSSARY.filter(item =>
    item.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
    item.meaning.toLowerCase().includes(glossaryQuery.toLowerCase())
  );

  const faqs = [
    {
      q: "How does an order move from one department to the next?",
      a: "An order starts when Merchandising enters the buyer enquiry and confirms the Purchase Order. Once approved, Material Planning generates fabric requisitions. The Store issues fabric rolls to Cutting. After fabric is cut and bundled, bundle QR codes are scanned into Stitching. Finished garments undergo QC inspection and are then transferred to Finishing for packing, invoicing, and dispatch."
    },
    {
      q: "What is a 'Bundle' and why do we use QR codes on the shop floor?",
      a: "In garment manufacturing, pattern cut parts (like 30 sleeves, collars, or bodies) are tied together into a 'bundle'. Each bundle gets a unique QR code. As tailors sew specific operations, scanning the bundle QR logs real-time production, attributes pieces to operators, and prevents size/color mix-ups."
    },
    {
      q: "How do Quality (QC) inspections work in GarmentFlow?",
      a: "Inspections occur at 3 checkpoints: 1) Raw Material Arrival (4-point fabric roll inspection for holes/shade variation), 2) Inline Sewing (checking active lines for stitching tension and skipped stitches), and 3) Final AQL (Acceptable Quality Limit audit on packed cartons before dispatch). If defects exceed the threshold, the system flags rework or holds the shipment."
    },
    {
      q: "How are GST Invoices and Export LUT handled?",
      a: "GarmentFlow calculates Indian GST based on garment HSN codes (e.g. 6205 for shirts at 5% GST). For international export shipments under Letter of Undertaking (LUT), invoices are automatically processed with 0% tax, and export port shipping documents are attached."
    },
    {
      q: "Can different employees see only their own department?",
      a: "Yes! GarmentFlow includes role-based access control. Merchandisers see Buyer CRM and Sample queues; Floor Supervisors access live Stitching lines and Cutting tables; QC Inspectors see inspection logs; while Owners and Managing Directors access consolidated financial metrics, unit outputs, and bank ledgers."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} /> GarmentFlow Knowledge Master
            </span>
            <span className="text-xs text-indigo-200/70 font-semibold">• Factory Operations Guide</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            How GarmentFlow ERP Works
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Welcome to the interactive guide! Understand the 9-stage garment manufacturing lifecycle, department responsibilities, key garment industry acronyms, and common daily operations.
          </p>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSection("flow")}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeSection === "flow"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Compass size={16} /> 1. Factory Lifecycle Flow (9 Stages)
        </button>
        <button
          onClick={() => setActiveSection("roles")}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeSection === "roles"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Users size={16} /> 2. Department Roles & Handbooks
        </button>
        <button
          onClick={() => setActiveSection("glossary")}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeSection === "glossary"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <BookOpen size={16} /> 3. Jargon Buster (Glossary)
        </button>
        <button
          onClick={() => setActiveSection("faq")}
          className={cn(
            "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
            activeSection === "faq"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <HelpCircle size={16} /> 4. Frequently Asked Questions
        </button>
      </div>

      {/* SECTION 1: THE 9-STAGE FACTORY FLOW */}
      {activeSection === "flow" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass size={18} className="text-indigo-600" />
              The Garment Manufacturing Journey: Click Any Stage to Learn
            </h3>
            <p className="text-xs text-slate-500">
              In a garment factory, orders always follow this exact chronological sequence from initial customer contact to international shipping container:
            </p>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-2">
              {WORKFLOW_STAGES.map((st) => {
                const isSelected = st.id === selectedStageId;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStageId(st.id)}
                    className={cn(
                      "p-3 rounded-2xl border flex flex-col items-center text-center transition-all",
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                        : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                    )}
                  >
                    <span className="text-lg mb-1">{st.roleIcon}</span>
                    <span className="text-[10px] font-bold opacity-80">Step {st.stepNumber}</span>
                    <span className="text-xs font-bold line-clamp-1">{st.title.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Stage Deep Dive */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200/60 dark:border-slate-800 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                    Stage {selectedStage.stepNumber} of 9
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• {selectedStage.subtitle}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedStage.title}
                </h2>
              </div>
              <Link
                href={resolvePortalLink(selectedStage.href, pathname)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2"
              >
                {selectedStage.actionText} <ExternalLink size={15} />
              </Link>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What Happens in this Stage:</h4>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {selectedStage.simpleExplanation}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Responsible Staff</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                  <span>{selectedStage.roleIcon}</span> {selectedStage.role}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Outputs</span>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {selectedStage.keyOutputs.join(" • ")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry Terms Used</span>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {selectedStage.jargonTerms.join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: ROLES & HANDBOOKS */}
      {activeSection === "roles" && (
        <div className="space-y-6 animate-fade-in">
          <p className="text-sm text-slate-500">
            GarmentFlow assigns clear functions to each role so team members can focus strictly on what matters to them:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROLE_WALKTHROUGHS.map((rw) => (
              <div key={rw.role} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{rw.icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{rw.role}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{rw.focus}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Screens Used:</span>
                  {rw.keyScreens.map((scr) => (
                    <Link
                      key={scr.name}
                      href={resolvePortalLink(scr.href, pathname)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-100 dark:border-slate-700/60 transition-all group"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {scr.name}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{scr.desc}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: JARGON BUSTER */}
      {activeSection === "glossary" && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative max-w-lg">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search garment manufacturing acronyms (BOM, SAM, AQL, CAPA, PO)..."
              value={glossaryQuery}
              onChange={(e) => setGlossaryQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGlossary.map((item) => (
              <div key={item.term} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                  <BookOpen size={16} /> {item.term}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: FAQS */}
      {activeSection === "faq" && (
        <div className="space-y-4 animate-fade-in max-w-4xl">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} className="text-indigo-600" /> : <ChevronDown size={18} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Support Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live System Documentation</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Every screen in GarmentFlow includes live contextual help and automated validation to assist new users in recording error-free data.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <PhoneCall size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Dedicated Support Desk</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              For on-site operator training, customized barcode scanner configuration, or factory assistance, reach us at <strong>support@garmentflow.com</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
