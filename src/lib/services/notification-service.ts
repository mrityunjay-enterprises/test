// ============================================================================
// GarmentFlow ERP — Simple Notification Service
// ============================================================================
import { notifications as initialNotifications } from "@/lib/demo-data";
import { Notification } from "../types";

export const NOTIFICATION_STORAGE_KEY = "garmentflow_notifications";
export const NOTIFICATION_EVENT = "garmentflow:notification_updated";

export const notificationService = {
  getNotifications(): Notification[] {
    if (typeof window === "undefined") {
      return initialNotifications;
    }
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(initialNotifications));
        return initialNotifications;
      }
      return JSON.parse(stored);
    } catch {
      return initialNotifications;
    }
  },

  saveNotifications(list: Notification[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: list }));
    } catch (e) {
      console.error("Failed to save notifications", e);
    }
  },

  getUnreadCount(): number {
    const list = this.getNotifications();
    return list.filter((n) => !n.read).length;
  },

  markAsRead(id: string): void {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveNotifications(updated);
  },

  markAllAsRead(): void {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    this.saveNotifications(updated);
  },

  deleteNotification(id: string): void {
    const list = this.getNotifications();
    const updated = list.filter((n) => n.id !== id);
    this.saveNotifications(updated);
  },

  reset(): Notification[] {
    this.saveNotifications(initialNotifications);
    return initialNotifications;
  },
};
