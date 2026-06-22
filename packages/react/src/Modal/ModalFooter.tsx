import { type HTMLAttributes, type ReactNode } from "react";
import styles from "./Modal.module.css";

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ModalFooter({ children, className, ...rest }: ModalFooterProps) {
  return (
    <div className={[styles.footer, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
