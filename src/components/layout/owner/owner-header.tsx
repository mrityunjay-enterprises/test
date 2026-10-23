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
import { NotificationDropdown } from "@/components/shared/notification-dropdown";

export function OwnerHeader() {
  const router = useRouter();
  const { collapsed, setMobileOpen } = useOwnerSidebar();
  const [darkMode, setDarkMode] = useState(false);
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
    // Switch off night mode system for now: enforce light mode
    document.documentElement.classList.remove("dark");
    try {
      const saved = localStorage.getItem("garmentflow_user");
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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





        {/* Notifications */}
        <NotificationDropdown basePath="/owner" accentColor="purple" />

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
