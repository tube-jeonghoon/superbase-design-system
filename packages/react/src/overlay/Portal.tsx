import { type ReactNode } from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  children: ReactNode;
}

/**
 * Renders children into document.body. SSR-safe: returns null on the server
 * (no `document`). On the client it portals synchronously during render, so the
 * portaled DOM exists at commit time — overlay effects that read the node in
 * their useEffect (e.g. focus-trap) run *after* it is mounted, not a tick early.
 */
export function Portal({ children }: PortalProps) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
