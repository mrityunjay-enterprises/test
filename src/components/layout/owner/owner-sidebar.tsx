"use client";

import React, { useState, createContext, useContext, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  Factory,
  Scissors,
  Shirt,
  Layers,
  Shield,
  Archive,
  Truck,
  Package,
  ShoppingBag,
  Building2,
  Receipt,
  CreditCard,
  DollarSign,
  GanttChart,
  Sparkles,
  Users,
  UserCheck,
  Calendar,
  CheckSquare,
  BarChart3,
  Settings,
  UserCog,
  Activity,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ArrowRightLeft,
  Crown,
  FileText,
  Bell
} from "lucide-react";
import { GarmentFlowLogo } from "@/components/ui/logo";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const OwnerSidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useOwnerSidebar = () => useContext(OwnerSidebarContext);

export function OwnerSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <OwnerSidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </OwnerSidebarContext.Provider>
  );
}

export interface NavChildItem {
  label: string;
  href: string;
  badge?: string | number;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  children?: NavChildItem[];
  section?: string;
}

const ownerNavItems: NavItem[] = [
  // 1. OVERVIEW
  {
    label: "Dashboard",
    href: "/owner/dashboard",
    icon: <LayoutDashboard size={18} />,
    section: "Overview",
  },

  // 2. COMMERCIAL & PRE-PRODUCTION
  {
    label: "Orders",
    href: "/owner/orders",
    icon: <ClipboardList size={18} />,
    badge: "Active",
    badgeColor: "bg-blue-600/30 text-blue-200 border border-blue-500/40",
    section: "Commercial & Orders",
  },
  {
    label: "Buyers (CRM)",
    href: "/owner/customers",
    icon: <Users size={18} />,
    section: "Commercial & Orders",
  },
  {
    label: "Styles & Tech Packs",
    href: "/owner/styles",
    icon: <Shirt size={18} />,
    section: "Commercial & Orders",
  },
  {
    label: "Sampling Lab",
    href: "/owner/sampling",
    icon: <Sparkles size={18} />,
    section: "Commercial & Orders",
  },

  // 3. PLANNING & SOURCING
  {
    label: "Planning (PPC)",
    href: "/owner/planning",
    icon: <GanttChart size={18} />,
    section: "Planning & Sourcing",
  },
  {
    label: "Store & Inventory",
    href: "/owner/inventory",
    icon: <Package size={18} />,
    badge: 3,
    badgeColor: "bg-amber-600/30 text-amber-200 border border-amber-500/40",
    section: "Planning & Sourcing",
  },
  {
    label: "Purchase Orders",
    href: "/owner/purchase",
    icon: <ShoppingBag size={18} />,
    section: "Planning & Sourcing",
  },
  {
    label: "Suppliers & Vendors",
    href: "/owner/vendors",
    icon: <Building2 size={18} />,
    section: "Planning & Sourcing",
  },

  // 4. MANUFACTURING & OPERATIONS
  {
    label: "Production",
    href: "/owner/production",
    icon: <Factory size={18} />,
    section: "Manufacturing & Floor",
    children: [
      { label: "Overview", href: "/owner/production" },
      { label: "Cutting Department", href: "/owner/cutting" },
      { label: "Stitching Lines", href: "/owner/stitching" },
      { label: "Finishing & Pressing", href: "/owner/finishing" },
    ],
  },
  {
    label: "Quality (QC)",
    href: "/owner/quality",
    icon: <Shield size={18} />,
    section: "Manufacturing & Floor",
  },
  {
    label: "Packing",
    href: "/owner/packing",
    icon: <Archive size={18} />,
    section: "Manufacturing & Floor",
  },
  {
    label: "Dispatch & Shipments",
    href: "/owner/dispatch",
    icon: <Truck size={18} />,
    section: "Manufacturing & Floor",
  },

  // 5. FINANCE & APPROVALS
  {
    label: "Finance & Costing",
    href: "/owner/invoices",
    icon: <Receipt size={18} />,
    section: "Finance & Approvals",
    children: [
      { label: "Invoices & GST", href: "/owner/invoices" },
      { label: "Payment Receipts", href: "/owner/payments" },
      { label: "Costing & Expenses", href: "/owner/expenses" },
      { label: "Accounts Ledger", href: "/owner/ledger" },
    ],
  },
  {
    label: "Approvals & Tasks",
    href: "/owner/approvals",
    icon: <CheckSquare size={18} />,
    section: "Finance & Approvals",
  },
  {
    label: "Reports & MIS",
    href: "/owner/reports",
    icon: <BarChart3 size={18} />,
    section: "Finance & Approvals",
  },

  // 6. ADMINISTRATION & SETTINGS
  {
    label: "HRMS & Attendance",
    href: "/owner/employees",
    icon: <UserCheck size={18} />,
    section: "Administration & System",
    children: [
      { label: "Employees", href: "/owner/employees" },
      { label: "Attendance Summary", href: "/owner/attendance" },
      { label: "Leave Approvals", href: "/owner/leave" },
      { label: "Payroll Register", href: "/owner/payroll" },
    ],
  },
  {
    label: "Company Documents",
    href: "/owner/documents",
    icon: <FileText size={18} />,
    section: "Administration & System",
  },
  {
    label: "Settings & System",
    href: "/owner/settings",
    icon: <Settings size={18} />,
    section: "Administration & System",
    children: [
      { label: "Company Settings", href: "/owner/settings" },
      { label: "System Users", href: "/owner/users" },
      { label: "Roles & Permissions", href: "/owner/roles" },
      { label: "Audit Logs", href: "/owner/audit-logs" },
      { label: "Help & Blueprint", href: "/owner/help" },
    ],
  },
];

export function OwnerSidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useOwnerSidebar();
  const pathname = usePathname();
  const cleanPath = (pathname || "/owner/dashboard").replace(/\/$/, "");

  const [searchFilter, setSearchFilter] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState("Arun Kapoor");
  const [userRole, setUserRole] = useState("Managing Director (MD)");

  const asideRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Prevent sidebar scroll from scrolling the main page
  useEffect(() => {
    const aside = asideRef.current;
    const nav = navRef.current;
    if (!aside || !nav) return;

    const onWheel = (e: WheelEvent) => {
      const { deltaY } = e;
      if (!deltaY) return;

      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;
      const atTop = nav.scrollTop <= 0;
      const atBottom = nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 1;

      // Prevent window scroll chaining when reaching boundaries
      if ((isScrollingUp && atTop) || (isScrollingDown && atBottom)) {
        e.preventDefault();
        return;
      }

      // If cursor is on sidebar header, search box, or footer, redirect scroll to the nav list
      if (!nav.contains(e.target as Node)) {
        nav.scrollTop += deltaY;
        e.preventDefault();
      }
    };

    aside.addEventListener("wheel", onWheel, { passive: false });
    return () => aside.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.role) setUserRole(parsed.role);
      }
    } catch { }
  }, []);

  // Auto-expand group if current path is in children
  useEffect(() => {
    ownerNavItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (c) => cleanPath === c.href.replace(/\/$/, "") || cleanPath.startsWith(c.href + "/")
        );
        if (isChildActive) {
          setOpenGroups((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [cleanPath]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Filter items by search query if any
  const filteredNavItems = useMemo(() => {
    if (!searchFilter.trim()) return ownerNavItems;
    const q = searchFilter.toLowerCase();
    return ownerNavItems
      .map((item) => {
        const matchesParent =
          item.label.toLowerCase().includes(q) ||
          Boolean(item.section && item.section.toLowerCase().includes(q));
        const matchingChildren = item.children?.filter((c) =>
          c.label.toLowerCase().includes(q)
        );
        if (matchesParent || (matchingChildren && matchingChildren.length > 0)) {
          return {
            ...item,
            children: matchingChildren && matchingChildren.length > 0 ? matchingChildren : item.children,
          };
        }
        return null;
      })
      .filter(Boolean) as NavItem[];
  }, [searchFilter]);

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={asideRef}
        style={{ overscrollBehavior: "contain" }}
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 shadow-xl select-none overscroll-contain",
          collapsed ? "w-[72px]" : "w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
          <Link href="/owner/dashboard" className="flex items-center gap-3 overflow-hidden group">
            {/* Precision Woven Emblem */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/25 border border-indigo-400/20">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white">
                <path d="M18 4L29 10V26L18 32L7 26V10L18 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="opacity-40" />
                <path d="M18 8L25 12V24L18 28L11 24V12L18 8Z" fill="url(#gf-logo-sidebar-owner)" />
                <path d="M12 15L18 19L24 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 21L18 25L24 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="18" y1="11" x2="18" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gf-logo-sidebar-owner" x1="11" y1="8" x2="25" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#4338CA" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {!collapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base font-bold tracking-tight text-white leading-none">
                  Garment<span className="text-indigo-400">Flow</span>
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  ERP
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Menu Search (when expanded) */}
        {!collapsed && (
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/20">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full h-8 pl-8 pr-7 rounded-md bg-slate-800/70 border border-slate-700 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation List */}
        <div
          ref={navRef}
          style={{ overscrollBehavior: "contain" }}
          className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin overscroll-contain"
        >
          {filteredNavItems.map((item, index) => {
            const hasChildren = item.children && item.children.length > 0;
            const isGroupOpen = openGroups[item.label] || Boolean(searchFilter.trim());
            const isSelfActive = cleanPath === item.href.replace(/\/$/, "");
            const isChildActive =
              hasChildren &&
              item.children?.some(
                (c) => cleanPath === c.href.replace(/\/$/, "") || cleanPath.startsWith(c.href + "/")
              );
            const isAnyActive = isSelfActive || isChildActive;

            const isNewSection =
              !searchFilter.trim() &&
              Boolean(item.section) &&
              (index === 0 || filteredNavItems[index - 1]?.section !== item.section);

            return (
              <React.Fragment key={item.label}>
                {isNewSection && (
                  !collapsed ? (
                    <div
                      className={cn(
                        "px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase select-none",
                        index > 0 ? "pt-3.5 border-t border-slate-800/60 mt-2" : "pt-0.5"
                      )}
                    >
                      {item.section}
                    </div>
                  ) : (
                    index > 0 && <div className="my-2 border-t border-slate-800/80 mx-2" />
                  )
                )}

                <div className="space-y-0.5">
                  {hasChildren ? (
                    // Parent Item with Submenu
                    <div
                      onClick={() => toggleGroup(item.label)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors group",
                        isAnyActive
                          ? "bg-slate-800 text-white font-semibold"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            isAnyActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                          )}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!collapsed && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[10px] font-bold px-1.5 py-0.2 rounded",
                                item.badgeColor || "bg-slate-800 text-slate-300"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                          <span className="text-slate-400">
                            {isGroupOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Direct Link Item
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group",
                        isSelfActive
                          ? "bg-blue-600 text-white font-semibold shadow-sm"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            isSelfActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                          )}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.2 rounded flex-shrink-0",
                            item.badgeColor || "bg-slate-800 text-slate-300"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Submenu Items */}
                  {hasChildren && isGroupOpen && !collapsed && (
                    <div className="pl-7 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-4">
                      {item.children?.map((child) => {
                        const isSubActive = cleanPath === child.href.replace(/\/$/, "");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors",
                              isSubActive
                                ? "bg-blue-600 text-white font-semibold shadow-sm"
                                : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                            )}
                          >
                            <span className="truncate">{child.label}</span>
                            {child.badge && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Sidebar Footer: Collapse Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          >
            {collapsed ? "→ Expand" : "← Collapse"}
          </button>
        </div>
      </aside>
    </>
  );
}
