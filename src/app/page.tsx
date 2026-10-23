"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GarmentFlowLogo } from "@/components/ui/logo";
import { isOwnerRole } from "@/lib/permissions";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
  Crown,
  Factory,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";

interface DemoAccount {
  name: string;
  role: string;
  dept: string;
  email: string;
  badge: string;
  initials: string;
}

const ownerAccount: DemoAccount = {
  name: "Arun Kapoor",
  role: "Managing Director (MD)",
  dept: "Executive Management",
  email: "arun.kapoor@garmentflow.com",
  badge: "Owner / Full Access",
  initials: "AK",
};

const factoryAccount: DemoAccount = {
  name: "Suresh Yadav",
  role: "Floor Supervisor",
  dept: "Stitching Lines",
  email: "suresh.y@garmentflow.com",
  badge: "Production Floor",
  initials: "SY",
};

const otherDemoAccounts: DemoAccount[] = [
  {
    name: "Meera Joshi",
    role: "Merchandising Head",
    dept: "Merchandising Department",
    email: "meera.j@garmentflow.com",
    badge: "Merchandising",
    initials: "MJ",
  },
  {
    name: "Rajendra Singh",
    role: "Store Incharge",
    dept: "Store Department",
    email: "rajendra.s@garmentflow.com",
    badge: "Store & Inventory",
    initials: "RS",
  },
  {
    name: "Kavita Sharma",
    role: "Quality Manager",
    dept: "Quality Department",
    email: "kavita.s@garmentflow.com",
    badge: "Quality (QC)",
    initials: "KS",
  },
  {
    name: "Ramesh Kumar",
    role: "Finishing Supervisor",
    dept: "Finishing Department",
    email: "ramesh.k@garmentflow.com",
    badge: "Finishing Floor",
    initials: "RK",
  },
  {
    name: "Amit Verma",
    role: "Packing & Dispatch Lead",
    dept: "Packing & Dispatch Department",
    email: "amit.v@garmentflow.com",
    badge: "Packing & Dispatch",
    initials: "AV",
  },
  {
    name: "Priyanka Tiwari",
    role: "Accounts & HR Executive",
    dept: "HR & Accounts Department",
    email: "priyanka.t@garmentflow.com",
    badge: "HRMS & Accounts",
    initials: "PT",
  },
  {
    name: "Vikram Singhania",
    role: "Super Admin",
    dept: "Enterprise Administration",
    email: "vikram.s@garmentflow.com",
    badge: "Super Admin",
    initials: "VS",
  },
];

const allAccounts = [ownerAccount, factoryAccount, ...otherDemoAccounts];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(ownerAccount.email);
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showOtherRoles, setShowOtherRoles] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const performLogin = (acc: DemoAccount) => {
    setLoading(true);
    setFeedback(`Signing in as ${acc.name}...`);

    try {
      localStorage.setItem("garmentflow_user", JSON.stringify(acc));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      const isOwner = isOwnerRole(acc.role);
      const target = isOwner ? "/owner/dashboard" : "/factory/dashboard";
      try {
        router.push(target);
      } catch {
        // fallback
      }
      window.location.href = target;
    }, 200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const matched = allAccounts.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    ) || {
      name: email
        .split("@")[0]
        .replace(".", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      role:
        email.toLowerCase().includes("owner") ||
        email.toLowerCase().includes("admin") ||
        email.toLowerCase().includes("arun") ||
        email.toLowerCase().includes("vikram")
          ? "Managing Director (MD)"
          : "Floor Supervisor",
      dept:
        email.toLowerCase().includes("owner") ||
        email.toLowerCase().includes("admin")
          ? "Executive Management"
          : "Garment Manufacturing",
      email: email.trim(),
      badge:
        email.toLowerCase().includes("owner") ||
        email.toLowerCase().includes("admin")
          ? "Owner"
          : "User",
      initials: email.slice(0, 2).toUpperCase(),
    };

    performLogin(matched);
  };

  return (
    <div className="h-screen min-h-[560px] w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-y-auto md:overflow-hidden relative selection:bg-indigo-500 selection:text-white px-4 py-3 sm:py-4">
      {/* Subtle Background Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[360px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Top minimal status bar */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex items-center justify-between text-[11px] text-slate-400">
        <span>Mrityunjay Enterprises</span>
        <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>System Online</span>
        </div>
      </div>

      {/* Main Login Card - Compact & Centered */}
      <main className="relative z-10 flex items-center justify-center my-auto">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none p-6 sm:p-7 backdrop-blur-sm">
            {/* Centered Brand & Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <GarmentFlowLogo size="md" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white mt-3">
                Sign in to your account
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                GarmentFlow ERP & MIS Platform
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@garmentflow.com"
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert("Demo password: admin123\nYou can also click the demo buttons below.")
                    }
                    className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Remember this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/25 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {feedback && (
              <p className="mt-2 text-center text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse font-medium">
                {feedback}
              </p>
            )}

            {/* Quick Demo Access Divider */}
            <div className="relative my-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200/80 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                  Or One-Click Demo
                </span>
              </div>
            </div>

            {/* Compact Quick Demo Access */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => performLogin(ownerAccount)}
                disabled={loading}
                className="h-9 px-2.5 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100/80 dark:hover:bg-purple-900/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Crown size={13} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    Owner (MD)
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={() => performLogin(factoryAccount)}
                disabled={loading}
                className="h-9 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 text-left transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Factory size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                    Factory Staff
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  →
                </span>
              </button>
            </div>

            {/* Other Demo Roles Collapsible */}
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowOtherRoles(!showOtherRoles)}
                className="w-full flex items-center justify-center gap-1 py-1 text-[10px] font-semibold text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <span>Other roles (QC, Store, Finance, Merchandiser)</span>
                {showOtherRoles ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>

              {showOtherRoles && (
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 space-y-1">
                  {otherDemoAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => performLogin(acc)}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-2 py-1 rounded-md text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] transition-colors"
                    >
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {acc.name} <span className="text-[10px] text-slate-400">({acc.role})</span>
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                        Login →
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security note */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Encrypted 256-bit Enterprise Access</span>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="relative z-10 w-full max-w-sm mx-auto flex items-center justify-between text-[10px] text-slate-400 pt-1">
        <span>GarmentFlow v2.4</span>
        <div>
          By{" "}
          <a
            href="https://crestadev.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            CrestaDev
          </a>
        </div>
      </footer>
    </div>
  );
}
