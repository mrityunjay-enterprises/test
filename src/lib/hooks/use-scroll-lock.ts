"use client";

import { useEffect } from "react";

/**
 * Custom React hook to prevent body background scrolling when a modal or drawer is active.
 * Restores original overflow behavior cleanly on unmount or when `lock` becomes false.
 */
export function useScrollLock(lock: boolean = true) {
  useEffect(() => {
    if (!lock || typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow || "";
      document.body.style.paddingRight = originalPaddingRight || "";
    };
  }, [lock]);
}

export default useScrollLock;
