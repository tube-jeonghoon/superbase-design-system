import { useEffect } from "react";

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

function lock() {
  if (lockCount === 0) {
    const el = document.documentElement;
    const scrollbarWidth = window.innerWidth - el.clientWidth;
    savedOverflow = el.style.overflow;
    savedPaddingRight = el.style.paddingRight;
    el.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = parseFloat(window.getComputedStyle(el).paddingRight) || 0;
      el.style.paddingRight = `${current + scrollbarWidth}px`;
    }
  }
  lockCount += 1;
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const el = document.documentElement;
    el.style.overflow = savedOverflow;
    el.style.paddingRight = savedPaddingRight;
  }
}

/** Locks body scroll while `active`. Ref-counted across nested overlays. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
