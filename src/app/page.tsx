"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GarmentFlowLogo } from "@/components/ui/logo";
import { getAppUrl } from "@/lib/utils";
import { isOwnerRole } from "@/lib/permissions";
import {
  Eye, EyeOff, ArrowRight, Factory, BarChart3, Shield, Users, CreditCard, Package, Building2, Crown, Wrench
} from "lucide-react";

const ownerDemoAccounts = [
  {
    name: "Arun Kapoor",
    role: "Managing Director (MD)",
    dept: "Executive Management",
    email: "arun.kapoor@garmentflow.com",
    badge: "Owner / Full Access",
    badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    icon: <Crown size={16} className="text-purple-600" />,
    initials: "AK"
  },
  {
    name: "Vikram Singhania",
    role: "Super Admin",
    dept: "Enterprise Administration",
    email: "vikram.s@garmentflow.com",
    badge: "Super Admin",
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    icon: <Building2 size={16} className="text-indigo-600" />,
    initials: "VS"
  }
];

const factoryDemoAccounts = [
  {
    name: "Suresh Yadav",
    role: "Floor Supervisor",
    dept: "Stitching Lines",
    email: "suresh.y@garmentflow.com",
    badge: "Production Floor",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    icon: <Users size={16} className="text-blue-600" />,
    initials: "SY"
  },
  {
    name: "Kavita Sharma",
    role: "Quality Manager",
    dept: "Quality Assurance",
    email: "kavita.s@garmentflow.com",
    badge: "QC & CAPA",
    badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    icon: <Shield size={16} className="text-emerald-600" />,
    initials: "KS"
  },
  {
    name: "Rajendra Singh",
    role: "Store & Cutting Head",
    dept: "Store / Cutting",
    email: "rajendra.s@garmentflow.com",
    badge: "Stores & Cutting",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    icon: <Factory size={16} className="text-amber-600" />,
    initials: "RS"
  },
  {
    name: "Priyanka Tiwari",
    role: "Finance Manager",
    dept: "Accounts & Billing",
    email: "priyanka.t@garmentflow.com",
    badge: "Finance & Accounts",
    badgeColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    icon: <CreditCard size={16} className="text-cyan-600" />,
    initials: "PT"
  },
  {
    name: "Meera Joshi",
    role: "Merchandising Head",
    dept: "Merchandising & Planning",
    email: "meera.j@garmentflow.com",
    badge: "Merchandising",
    badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    icon: <Package size={16} className="text-pink-600" />,
    initials: "MJ"
  }
];

const allDemoAccounts = [...ownerDemoAccounts, ...factoryDemoAccounts];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(ownerDemoAccounts[0].email);
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  const loginAs = (acc: typeof allDemoAccounts[0]) => {
    setLoading(true);
    try {
      localStorage.setItem("garmentflow_user", JSON.stringify({
        name: acc.name,
        role: acc.role,
        dept: acc.dept,
        email: acc.email,
        badge: acc.badge,
        initials: acc.initials
      }));
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
    }, 300);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const matched = allDemoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || {
      name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, c => c.toUpperCase()),
      role: email.includes("owner") || email.includes("admin") ? "Managing Director (MD)" : "Floor Supervisor",
      dept: email.includes("owner") || email.includes("admin") ? "Executive Management" : "Garment Manufacturing",
      email: email,
      badge: email.includes("owner") || email.includes("admin") ? "Owner" : "User",
      initials: email.substring(0, 2).toUpperCase()
    };

    try {
      localStorage.setItem("garmentflow_user", JSON.stringify(matched));
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => {
      const isOwner = isOwnerRole(matched.role);
      const target = isOwner ? "/owner/dashboard" : "/factory/dashboard";
      try {
        router.push(target);
      } catch {
        // fallback
      }
      window.location.href = target;
    }, 300);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Enterprise Branding */}
      <div className="hidden lg:flex lg:w-[48%] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-purple-500 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-emerald-500 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
          <div>
            <GarmentFlowLogo size="lg" variant="light" />
            <p className="text-xs font-semibold text-indigo-200/90 mt-2 tracking-wide">
              GarmentFlow by{" "}
              <a
                href="https://crestadev.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
              >
                CrestaDev
              </a>
            </p>
          </div>

          <div className="space-y-6 my-auto max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-indigo-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Two-Panel Architecture: Cloud Owner & Local Factory
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Enterprise Garment Manufacturing ERP & MIS
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Separated architecture for business monitoring in the cloud and autonomous floor operations in factory units.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs mb-1">
                  <Crown size={14} /> Owner Portal
                </div>
                <p className="text-[11px] text-slate-300">
                  Cloud-accessible, multi-unit P&L, receivables, company MIS & compliance.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                  <Factory size={14} /> Factory Station
                </div>
                <p className="text-[11px] text-slate-300">
                  Shop-floor workstation, lines 1-6 tracking, cutting, QC & department workstations.
                </p>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-4">
            <span>GarmentFlow v2.4 (Enterprise Edition)</span>
            <span className="font-semibold text-slate-300">Mrityunjay Enterprises, Bhilwara</span>
          </div>
        </div>
      </div>

      {/* Right Side - Login Panel & Persona Selector */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-lg py-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200">
                Single Sign-On Authentication
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sign in to GarmentFlow
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select an account persona below to enter the full-featured GarmentFlow ERP Dashboard.
            </p>
          </div>

          {/* Persona Switcher Section 1: Owner Accounts */}
          <div className="mb-4 space-y-2">
            <p className="text-[11px] font-extrabold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Crown size={13} /> Owner & Executive Management
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ownerDemoAccounts.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => loginAs(acc)}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between hover:scale-[1.01] active:scale-95 shadow-sm hover:shadow-md ${email === acc.email ? "bg-purple-50/90 dark:bg-purple-950/60 border-purple-600 ring-2 ring-purple-500/30" : "bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-purple-400"}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-purple-600 shadow-sm">{acc.icon}</div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${acc.badgeColor}`}>{acc.badge}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{acc.name}</p>
                    <p className="text-[11px] text-slate-500 truncate font-medium">{acc.role}</p>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-1 block">→ Opens Owner Portal</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Persona Switcher Section 2: Factory Accounts */}
          <div className="mb-6 space-y-2">
            <p className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Factory size={13} /> Factory & Department Heads
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {factoryDemoAccounts.map((acc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => loginAs(acc)}
                  className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between hover:scale-[1.01] active:scale-95 shadow-sm hover:shadow-md ${email === acc.email ? "bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-600 ring-2 ring-emerald-500/30" : "bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 hover:border-emerald-400"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="p-1 rounded-lg bg-white dark:bg-slate-800 text-emerald-600 shadow-sm">{acc.icon}</div>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded-md ${acc.badgeColor}`}>{acc.badge}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{acc.name}</p>
                    <p className="text-[10px] text-slate-500 truncate font-medium">{acc.role}</p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">→ Opens Factory Station</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/25"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to Application <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs font-semibold text-slate-500">
            GarmentFlow by{" "}
            <a
              href="https://crestadev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              CrestaDev
            </a>{" "}
            •{" "}
            <a
              href="https://crestadev.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline font-mono text-[11px] text-slate-400"
            >
              crestadev.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
