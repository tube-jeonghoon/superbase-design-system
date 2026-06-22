import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { ToastContext } from "./ToastContext";
import { Toast } from "./Toast";
import type { ToastApi, ToastData, ToastOptions, ToastConvenienceOptions } from "./types";

const DEFAULT_DURATION = 4000;
const EXIT_MS = 120;

let idCounter = 0;
const nextId = () => `toast-${++idCounter}`;

export interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const t = useTheme();
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timers.current.delete(id);
    }
  }, []);

  const startExit = useCallback(
    (id: string) => {
      setToasts((list) => list.map((x) => (x.id === id ? { ...x, status: "exiting" } : x)));
      // Cancel any pending timer (just-fired auto-dismiss, or a prior exit timer
      // if dismiss() is called mid-exit) before scheduling removal.
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);
      const tm = setTimeout(() => remove(id), EXIT_MS);
      timers.current.set(id, tm);
    },
    [remove],
  );

  // Clear pending timers if the provider unmounts while toasts are live.
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
    const make =
      (variant: ToastData["variant"]) =>
      (title: string, opts?: ToastConvenienceOptions) =>
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
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          paddingHorizontal: t.spacing["4"],
          paddingBottom: t.spacing["6"],
          gap: t.spacing["2"],
        }}
      >
        {toasts.map((x) => (
          <Toast key={x.id} toast={x} onDismiss={dismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
