import { useEffect, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { useModalContext } from "./ModalContext";
import styles from "./Modal.module.css";

export interface ModalHeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  showCloseButton?: boolean;
}

export function ModalHeader({ children, showCloseButton = true, className, ...rest }: ModalHeaderProps) {
  const { titleId, onClose, registerTitle } = useModalContext();
  useEffect(() => {
    registerTitle(true);
    return () => registerTitle(false);
  }, [registerTitle]);

  return (
    <header className={[styles.header, className].filter(Boolean).join(" ")} {...rest}>
      <h2 id={titleId} className={styles.title}>
        {children}
      </h2>
      {showCloseButton && (
        <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
          <Icon name="close" size="sm" />
        </button>
      )}
    </header>
  );
}
