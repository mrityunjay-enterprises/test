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
  RefreshCw, CheckCircle2, ShieldAlert, Sparkles, HelpCircle
} from "lucide-react";
import { GarmentWorkflowModal } from "@/components/shared/garment-workflow-guide";

export function FactoryHeader() {
  const { collapsed, setMobileOpen } = useFactorySidebar();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    name: "Suresh Yadav",
    role: "Floor Supervisor",
    dept: "Stitching Lines",
    initials: "SY",
    email: "suresh.y@garmentflow.com",
  });

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("garmentflow_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const isOwner = isOwnerRole(currentUser.role);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("garmentflow_user");
    window.location.href = getAppUrl("/");
  };

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

        {/* How ERP Works Guide Button */}
        <button
          onClick={() => setShowGuideModal(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 dark:bg-emerald-900/30 hover:bg-emerald-500/20 text-xs font-bold transition-all border border-emerald-300/60 dark:border-emerald-700/60"
          title="Understanding GarmentFlow ERP in Plain English"
        >
          <Sparkles size={14} className="text-emerald-500" />
          <span>How ERP Works</span>
        </button>

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

        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Shift Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Shop Floor Alerts</span>
                <span className="text-[10px] text-emerald-600 font-semibold">Active Shift</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Line 4 Crossed Target (960 pcs)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Crew neck t-shirt production running ahead</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Line 3 Needle Guide Maintenance</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Reported by QC at 11:15 AM</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Cutting Table 2 Auto-Spreading</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">32 Plies complete for Floral Maxi Dress</p>
                </div>
              </div>
            </div>
          )}
        </div>

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
