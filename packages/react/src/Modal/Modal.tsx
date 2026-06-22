import {
  forwardRef,
  useCallback,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Portal } from "../overlay/Portal";
import { useFocusTrap } from "../overlay/useFocusTrap";
import { useScrollLock } from "../overlay/useScrollLock";
import { useEscapeKey } from "../overlay/useEscapeKey";
import { ModalContext } from "./ModalContext";
import styles from "./Modal.module.css";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose: () => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    size = "md",
    closeOnBackdropClick = true,
    closeOnEscape = true,
    children,
    className,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-desc`;
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const setPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useScrollLock(open);
  useFocusTrap(panelRef, open);
  useEscapeKey(open && closeOnEscape, onClose);

  if (!open) return null;

  return (
    <ModalContext.Provider
      value={{ onClose, titleId, descriptionId, registerTitle: setHasTitle, registerDescription: setHasDescription }}
    >
      <Portal>
        <div
          data-testid="modal-scrim"
          className={styles.scrim}
          role="presentation"
          onClick={(e) => {
            if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
          }}
        >
          <div
            ref={setPanel}
            role="dialog"
            aria-modal="true"
            aria-label={hasTitle ? undefined : ariaLabel}
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-describedby={hasDescription ? descriptionId : undefined}
            data-size={size}
            tabIndex={-1}
            className={[styles.panel, className].filter(Boolean).join(" ")}
            {...rest}
          >
            {children}
          </div>
        </div>
      </Portal>
    </ModalContext.Provider>
  );
});
