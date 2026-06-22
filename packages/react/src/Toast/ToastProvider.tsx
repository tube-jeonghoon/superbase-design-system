import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Portal } from "../overlay/Portal";
import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import type { ToastApi, ToastData, ToastOptions, ToastConvenienceOptions } from "./types";
import styles from "./Toast.module.css";

const DEFAULT_DURATION = 4000;
const EXIT_MS = 120; // matches --duration-fast

let idCounter = 0;
const nextId = () => `toast-${++idCounter}`;

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const startExit = useCallback(
    (id: string) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, status: "exiting" } : t)));
      // Cancel any pending timer for this id (the just-fired auto-dismiss timer,
      // or a prior exit timer if dismiss() is called mid-exit) before scheduling.
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);
      const tm = setTimeout(() => remove(id), EXIT_MS);
      timers.current.set(id, tm);
    },
    [remove],
  );

  // Clear any pending timers if the provider unmounts while toasts are live.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((tm) => clearTimeout(tm));
      map.clear();
    };
  }, []);

  const show = useCallback(
    (opts: ToastOptions) => {
      const id = nextId();
      const duration = opts.duration === undefined ? DEFAULT_DURATION : opts.duration;
      const toast: ToastData = {
        id,
        title: opts.title,
        description: opts.description,
        variant: opts.variant ?? "info",
        duration,
        action: opts.action,
        status: "entering",
      };
      setToasts((list) => [...list, toast]);
      if (duration && duration > 0) {
        const tm = setTimeout(() => startExit(id), duration);
        timers.current.set(id, tm);
      }
      return id;
    },
    [startExit],
  );

  const dismiss = useCallback((id: string) => startExit(id), [startExit]);

  const api = useMemo<ToastApi>(() => {
    const make = (variant: ToastData["variant"]) => (title: string, opts?: ToastConvenienceOptions) =>
      show({ ...opts, title, variant });
    return {
      show,
      success: make("success"),
      error: make("danger"),
      warning: make("warning"),
      info: make("info"),
      dismiss,
    };
  }, [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Portal>
        <div className={styles.region} role="region" aria-label="Notifications">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}
