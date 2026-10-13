"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, getAppUrl } from "@/lib/utils";
import { useOwnerSidebar } from "./owner-sidebar";
import { notifications as demoNotifications } from "@/lib/demo-data";
import {
  Search, Bell, ChevronDown, Sun, Moon, Menu, Plus,
  Building2, Shield, User, Settings, LogOut, CheckSquare,
  AlertTriangle, DollarSign, Factory, ExternalLink, Sparkles, HelpCircle
} from "lucide-react";
import { GarmentWorkflowModal } from "@/components/shared/garment-workflow-guide";

export function OwnerHeader() {
  const router = useRouter();
  const { collapsed, setMobileOpen } = useOwnerSidebar();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGuideModal, setShowGuideModal] = useState(false);

  const [currentUser, setCurrentUser] = useState({
    name: "Arun Kapoor",
    role: "Managing Director (MD)",
    dept: "Executive Management",
    initials: "AK",
    email: "arun.kapoor@garmentflow.com",
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

      {/* Enterprise Factory Scope Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
        <Building2 size={15} className="text-blue-600 dark:text-blue-400" />
        <span className="hidden sm:inline">Mrityunjay Enterprises</span>
      </div>

      {/* Global Executive Search */}
      <div className="flex-1 max-w-lg relative hidden md:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search orders, buyers, invoices, inventory..."
          className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 border border-slate-200 dark:border-slate-700 transition-all"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Executive Health Chip */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Health: 98.4% Delivery</span>
        </div>

        {/* Link to Factory Station for Owners/Super Admins */}
        <Link
          href="/factory/dashboard"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700"
          title="Inspect Shop-Floor Factory Station"
        >
          <Factory size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span>Factory Station</span>
          <ExternalLink size={12} className="text-slate-400" />
        </Link>

        {/* How ERP Works Guide Button */}
        <button
          onClick={() => setShowGuideModal(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:text-blue-300 dark:bg-blue-950/40 hover:bg-blue-100 text-xs font-semibold transition-all border border-blue-200 dark:border-blue-800"
          title="Understanding GarmentFlow ERP in Plain English"
        >
          <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
          <span>ERP Guide</span>
        </button>

        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {darkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Alerts & Notices</span>
                <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">Mark read</span>
              </div>
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">GST Invoice INV-2025-0091 Approved</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Value: ₹31.2 Lakhs • Export LUT filed</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Fabric Shortage Alert (3 Rolls)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">ORD-2025-0003 Poplin 60s compact below reorder</p>
                </div>
                <div className="p-2 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Production Output Milestone</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Jaipur Unit crossed 3,400 pcs today</p>
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser.initials || "AK"}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-scale-up">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {currentUser.role}
                </span>
              </div>

              <Link
                href="/owner/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <User size={15} /> My Profile
              </Link>

              <Link
                href="/owner/help"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <HelpCircle size={15} /> ERP Guide & Help
              </Link>

              <Link
                href="/owner/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings size={15} /> Company Settings
              </Link>

              <Link
                href="/factory/dashboard"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Factory size={15} /> Go to Factory Station
              </Link>

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
