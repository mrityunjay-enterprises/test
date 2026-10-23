"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn, getAppUrl } from "@/lib/utils";
import { useFactorySidebar } from "./factory-sidebar";
import { isOwnerRole } from "@/lib/permissions";
import {
  Search, Bell, ChevronDown, Sun, Moon, Menu, Plus,
  Building2, Shield, User, Settings, LogOut, CheckSquare,
  AlertTriangle, DollarSign, Factory, ExternalLink, Clock,
  RefreshCw, CheckCircle2, ShieldAlert, Sparkles, HelpCircle,
  Wifi, WifiOff
} from "lucide-react";
import { GarmentWorkflowModal } from "@/components/shared/garment-workflow-guide";
import { NotificationDropdown } from "@/components/shared/notification-dropdown";

export function FactoryHeader() {
  const { collapsed, setMobileOpen } = useFactorySidebar();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Network Connectivity State (Factory Item 4)
  const [isOnline, setIsOnline] = useState(true);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const [currentUser, setCurrentUser] = useState({
    name: "Suresh Yadav",
    role: "Floor Supervisor",
    dept: "Stitching Lines",
    initials: "SY",
    email: "suresh.y@garmentflow.com",
  });

  React.useEffect(() => {
    // Switch off night mode system for now: enforce light mode
    document.documentElement.classList.remove("dark");
    const syncUser = () => {
      try {
        const saved = localStorage.getItem("garmentflow_user");
        if (saved) {
          setCurrentUser(JSON.parse(saved));
        }
      } catch (e) {
        console.error(e);
      }
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("garmentflow_user_changed", syncUser);
    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("garmentflow_user_changed", syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("garmentflow_user");
    window.location.href = getAppUrl("/");
  };

  const isOwner = isOwnerRole(currentUser.role);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center px-4 gap-3 transition-all duration-300",
        collapsed ? "left-0 lg:left-[72px]" : "left-0 lg:left-[264px]"
      )}
    >
      {/* Mobile menu trigger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Menu size={20} />
      </button>

      {/* Enterprise Factory Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold text-emerald-700 dark:text-emerald-300">
        <Factory size={15} className="text-emerald-600 dark:text-emerald-400" />
        <span className="hidden sm:inline">Mrityunjay Enterprises</span>
      </div>

      {/* Live Shift Status Banner */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <Clock size={13} className="text-emerald-600" />
        <span>Shift A (08:00 - 16:30)</span>
        <span className="text-slate-400">•</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">5/6 Lines Active</span>
      </div>

      {/* Operational Search */}
      <div className="flex-1 max-w-sm relative hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cuts, bundles, styles, operators..."
          className="w-full h-9 pl-9 pr-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Quick Floor Log Action */}
        <Link
          href="/factory/production"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm shadow-emerald-600/25"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Log Production</span>
          <span className="sm:hidden">Log</span>
        </Link>



        {/* If Owner is viewing factory, offer return to Owner portal */}
        {isOwner && (
          <Link
            href="/owner/dashboard"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-colors"
            title="Return to Owner Panel"
          >
            <Shield size={14} /> Owner Portal
          </Link>
        )}

        {/* Network & Connectivity Status Badge (Factory Item 4) */}
        {isOnline ? (
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold" title="Factory floor live connected to central cloud server">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Wifi size={13} className="text-emerald-600" />
            <span>Floor Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-bold animate-pulse" title="Working offline: entries cached locally">
            <WifiOff size={14} className="text-rose-600" />
            <span>Offline Mode (Local Cache)</span>
          </div>
        )}
        <NotificationDropdown basePath="/factory" accentColor="emerald" />

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser.initials || "SY"}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                {currentUser.dept || currentUser.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-scale-up">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  {currentUser.role}
                </span>
              </div>

              <Link
                href="/factory/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={15} /> My Profile
              </Link>

              <Link
                href="/factory/help"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <HelpCircle size={15} /> Shop Floor Guide & Help
              </Link>

              {isOwner && (
                <Link
                  href="/owner/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors font-semibold"
                >
                  <Shield size={15} /> Switch to Owner Portal
                </Link>
              )}

              {/* Department Role Switcher */}
              <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1.5">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Department Access:
                </p>
                <div className="space-y-0.5">
                  {[
                    { name: "Arun Kapoor", role: "Managing Director (MD)", dept: "Executive Management", initials: "AK" },
                    { name: "Meera Joshi", role: "Merchandising Head", dept: "Merchandising Department", initials: "MJ" },
                    { name: "Rajendra Singh", role: "Store Incharge", dept: "Store Department", initials: "RS" },
                    { name: "Kavita Sharma", role: "Quality Manager", dept: "Quality Department", initials: "KS" },
                    { name: "Ramesh Kumar", role: "Finishing Supervisor", dept: "Finishing Department", initials: "RK" },
                    { name: "Amit Verma", role: "Packing & Dispatch Lead", dept: "Packing & Dispatch Department", initials: "AV" },
                    { name: "Priyanka Tiwari", role: "Accounts & HR Executive", dept: "HR & Accounts Department", initials: "PT" },
                    { name: "Suresh Yadav", role: "Floor Supervisor", dept: "Stitching Lines", initials: "SY" },
                  ].map((u) => (
                    <button
                      key={u.role}
                      onClick={() => {
                        const userObj = { ...u, email: `${u.name.toLowerCase().replace(" ", ".")}@garmentflow.com` };
                        localStorage.setItem("garmentflow_user", JSON.stringify(userObj));
                        window.dispatchEvent(new Event("garmentflow_user_changed"));
                        setShowUserMenu(false);
                        window.location.href = "/factory/dashboard";
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-[11px] flex items-center justify-between transition-colors",
                        currentUser.role === u.role
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <span className="truncate">{u.role}</span>
                      {currentUser.role === u.role && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GarmentWorkflowModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
    </header>
  );
}
