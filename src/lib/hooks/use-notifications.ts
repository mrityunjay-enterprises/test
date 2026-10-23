"use client";

import { useState, useEffect, useCallback } from "react";
import { Notification } from "../types";
import { notificationService, NOTIFICATION_EVENT } from "../services/notification-service";

export function useNotifications() {
  const [items, setItems] = useState<Notification[]>(() => notificationService.getNotifications());

  const reload = useCallback(() => {
    setItems(notificationService.getNotifications());
  }, []);

  useEffect(() => {
    reload();

    const handleUpdate = () => {
      setItems(notificationService.getNotifications());
    };

    window.addEventListener(NOTIFICATION_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(NOTIFICATION_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [reload]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
  };

  const reset = () => {
    notificationService.reset();
  };

  return {
    notifications: items,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    reset,
  };
}
