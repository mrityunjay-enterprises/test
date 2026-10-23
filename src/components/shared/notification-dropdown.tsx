"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { Notification } from "@/lib/types";

interface NotificationDropdownProps {
  basePath: "/factory" | "/owner";
  accentColor?: "emerald" | "purple";
}

export function NotificationDropdown({
  basePath,
  accentColor = "emerald",
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isEmerald = accentColor === "emerald";
  const badgeDot = isEmerald ? "bg-emerald-500" : "bg-purple-500";
  const title = isEmerald ? "Shop Floor Alerts" : "Alerts & Notices";
  const linkText = isEmerald ? "View all factory alerts" : "View all alerts";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${badgeDot}`}
          />
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-scale-up">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{title}</span>
            {unreadCount > 0 ? (
              <button
                onClick={() => markAllAsRead()}
                className={`text-[10px] font-semibold hover:underline flex items-center gap-0.5 ${
                  isEmerald ? "text-emerald-600" : "text-purple-600"
                }`}
              >
                <CheckCheck size={11} />
                <span>Mark all read</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">All read</span>
            )}
          </div>

          {/* List */}
          <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-400">No notifications</p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                  }}
                  className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    !n.read
                      ? isEmerald
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/40"
                        : "bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/40"
                      : "bg-slate-50 dark:bg-slate-800/40 opacity-75"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badgeDot}`} />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href={`${basePath}/notifications`}
              onClick={() => setIsOpen(false)}
              className={`text-[11px] font-semibold hover:underline ${
                isEmerald ? "text-emerald-600" : "text-purple-600"
              }`}
            >
              {linkText}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
