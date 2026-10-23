"use client";

import React from "react";
import { Bell, Check, Trash2, CheckCheck, RotateCcw } from "lucide-react";
import { useNotifications } from "@/lib/hooks/use-notifications";

export function NotificationsView({ basePath }: { basePath?: string }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, reset } = useNotifications();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            System Notifications & Alerts
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time production bottlenecks, material shortages & pending approvals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={14} />
              <span>Mark All as Read</span>
            </button>
          )}

          {notifications.length === 0 && (
            <button
              onClick={() => reset()}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Reset Alerts</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-slate-400 mt-1">You are all caught up.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) markAsRead(n.id);
              }}
              className={`p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                !n.read ? "bg-indigo-50/20 dark:bg-indigo-950/10" : "opacity-80"
              }`}
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !n.read
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                <Bell size={18} />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm ${
                      !n.read
                        ? "font-bold text-slate-900 dark:text-white"
                        : "font-semibold text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n.id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
