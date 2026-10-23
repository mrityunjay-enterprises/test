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
  Receipt,
  CreditCard,
  GanttChart,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ArrowRightLeft,
  FileText,
  Bell
} from "lucide-react";
import { GarmentFlowLogo } from "@/components/ui/logo";
import { isFactoryPathAllowed } from "@/lib/permissions";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const FactorySidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useFactorySidebar = () => useContext(FactorySidebarContext);

export function FactorySidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <FactorySidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </FactorySidebarContext.Provider>
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
}

const factoryNavItems: NavItem[] = [
  {
    label: "Floor Dashboard",
    href: "/factory/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Floor Orders",
    href: "/factory/orders",
    icon: <ClipboardList size={18} />,
    badge: "Merchandising",
    badgeColor: "bg-blue-600/30 text-blue-200 border border-blue-500/40",
  },
  {
    label: "Production Tracking",
    href: "/factory/production",
    icon: <Factory size={18} />,
    children: [
      { label: "Floor Overview", href: "/factory/production" },
      { label: "Cutting Department", href: "/factory/cutting" },
      { label: "Stitching Lines (1-6)", href: "/factory/stitching" },
      { label: "Finishing & Pressing", href: "/factory/finishing" },
    ],
  },
  {
    label: "Quality Assurance (QC)",
    href: "/factory/quality",
    icon: <Shield size={18} />,
    badge: "AQL",
    badgeColor: "bg-emerald-600/30 text-emerald-200 border border-emerald-500/40",
  },
  {
    label: "Packing & Cartons",
    href: "/factory/packing",
    icon: <Archive size={18} />,
  },
  {
    label: "Dispatch & Gate Pass",
    href: "/factory/dispatch",
    icon: <Truck size={18} />,
  },
  {
    label: "Store & Inventory",
    href: "/factory/inventory",
    icon: <Package size={18} />,
    badge: 3,
    badgeColor: "bg-amber-600/30 text-amber-200 border border-amber-500/40",
  },
  {
    label: "Planning & Schedule",
    href: "/factory/planning",
    icon: <GanttChart size={18} />,
  },
  {
    label: "Staff & Attendance (HRMS)",
    href: "/factory/employees",
    icon: <UserCheck size={18} />,
    children: [
      { label: "Operators & Staff", href: "/factory/employees" },
      { label: "Shift Attendance", href: "/factory/attendance" },
      { label: "Worker Leave", href: "/factory/leave" },
    ],
  },
  {
    label: "Accounts & Invoices",
    href: "/factory/invoices",
    icon: <Receipt size={18} />,
    children: [
      { label: "Invoices & Billing", href: "/factory/invoices" },
      { label: "Payment Receipts", href: "/factory/payments" },
    ],
  },
  {
    label: "Floor Reports",
    href: "/factory/reports",
    icon: <BarChart3 size={18} />,
  },
  {
    label: "Floor Manual & Help",
    href: "/factory/help",
    icon: <HelpCircle size={18} />,
  },
];

export function FactorySidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useFactorySidebar();
  const pathname = usePathname();
  const cleanPath = (pathname || "/factory/dashboard").replace(/\/$/, "");

  const [searchFilter, setSearchFilter] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [userName, setUserName] = useState("Suresh Yadav");
  const [userRole, setUserRole] = useState("Floor Supervisor");
  const [userDept, setUserDept] = useState("Stitching Lines");

  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem("garmentflow_user");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.role) setUserRole(parsed.role);
          if (parsed.dept) setUserDept(parsed.dept);
        }
      } catch { }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("garmentflow_user_changed", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("garmentflow_user_changed", syncUser);
    };
  }, []);

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

  // Filter items by role permissions first
  const permittedNavItems = useMemo(() => {
    return factoryNavItems
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const allowedChildren = item.children.filter((child) =>
            isFactoryPathAllowed(userRole, child.href)
          );
          if (allowedChildren.length > 0) {
            return {
              ...item,
              children: allowedChildren,
            };
          }
          if (isFactoryPathAllowed(userRole, item.href)) {
            return { ...item, children: undefined };
          }
          return null;
        }

        if (isFactoryPathAllowed(userRole, item.href)) {
          return item;
        }
        return null;
      })
      .filter(Boolean) as NavItem[];
  }, [userRole]);

  // Auto-expand group if current path is in children
  useEffect(() => {
    permittedNavItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some(
          (c) => cleanPath === c.href.replace(/\/$/, "") || cleanPath.startsWith(c.href + "/")
        );
        if (isChildActive) {
          setOpenGroups((prev) => ({ ...prev, [item.label]: true }));
        }
      }
    });
  }, [cleanPath, permittedNavItems]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Filter permitted items by search query
  const filteredNavItems = useMemo(() => {
    if (!searchFilter.trim()) return permittedNavItems;
    const q = searchFilter.toLowerCase();
    return permittedNavItems
      .map((item) => {
        const matchesParent = item.label.toLowerCase().includes(q);
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
  }, [permittedNavItems, searchFilter]);

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
          <Link href="/factory/dashboard" className="flex items-center gap-3 overflow-hidden group">
            {/* Precision Woven Emblem */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/25 border border-indigo-400/20">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white">
                <path d="M18 4L29 10V26L18 32L7 26V10L18 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="opacity-40" />
                <path d="M18 8L25 12V24L18 28L11 24V12L18 8Z" fill="url(#gf-logo-sidebar-factory)" />
                <path d="M12 15L18 19L24 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 21L18 25L24 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="18" y1="11" x2="18" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gf-logo-sidebar-factory" x1="11" y1="8" x2="25" y2="28" gradientUnits="userSpaceOnUse">
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
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  FLOOR
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

        {/* Current Station Info Banner (when expanded) */}
        {!collapsed && (
          <div className="px-3 py-2 bg-slate-950/30 border-b border-slate-800/80 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift A Active</span>
            </div>
            <span className="text-slate-400 font-medium truncate">{userDept}</span>
          </div>
        )}

        {/* Quick Menu Search (when expanded) */}
        {!collapsed && (
          <div className="p-3 border-b border-slate-800/80 bg-slate-950/20">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search station..."
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
          {filteredNavItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isGroupOpen = openGroups[item.label] || Boolean(searchFilter.trim());
            const isSelfActive = cleanPath === item.href.replace(/\/$/, "");
            const isChildActive =
              hasChildren &&
              item.children?.some(
                (c) => cleanPath === c.href.replace(/\/$/, "") || cleanPath.startsWith(c.href + "/")
              );
            const isAnyActive = isSelfActive || isChildActive;

            return (
              <div key={item.label} className="space-y-0.5">
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
