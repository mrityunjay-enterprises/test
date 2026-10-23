"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "dark" | "light" | "auto";
  showSubtitle?: boolean;
}

export function GarmentFlowLogo({
  collapsed = false,
  size = "md",
  className,
  variant = "auto",
  showSubtitle = false,
}: LogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Precision Woven Emblem (Custom Vector Logo - No generic AI Sparkles) */}
      <div className={cn(
        "rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/25 border border-indigo-400/20 relative group",
        iconSizes[size]
      )}>
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
          {/* Garment Outer Shield / Fabric Fold */}
          <path d="M18 4L29 10V26L18 32L7 26V10L18 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="opacity-40" />
          {/* Inner Weave Hexagon */}
          <path d="M18 8L25 12V24L18 28L11 24V12L18 8Z" fill="url(#gf-logo-grad)" />
          {/* Intertwined Loom Threads */}
          <path d="M12 15L18 19L24 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 21L18 25L24 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="18" y1="11" x2="18" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="gf-logo-grad" x1="11" y1="8" x2="25" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "font-bold tracking-tight leading-none",
              textSizes[size],
              isLight ? "text-white" : "text-slate-900 dark:text-white"
            )}>
              Garment<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 uppercase tracking-wider">
              ERP
            </span>
          </div>
          {showSubtitle && (
            <span className={cn(
              "text-[10px] font-medium tracking-wider uppercase mt-1",
              isLight ? "text-indigo-200/80" : "text-slate-500 dark:text-slate-400"
            )}>
              Manufacturing Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
}
