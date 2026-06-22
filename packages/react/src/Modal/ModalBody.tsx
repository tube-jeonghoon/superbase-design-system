import { useEffect, type HTMLAttributes, type ReactNode } from "react";
import { useModalContext } from "./ModalContext";
import styles from "./Modal.module.css";

export interface ModalBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ModalBody({ children, className, ...rest }: ModalBodyProps) {
  const { descriptionId, registerDescription } = useModalContext();
  useEffect(() => {
    registerDescription(true);
    return () => registerDescription(false);
  }, [registerDescription]);

  return (
    <div id={descriptionId} className={[styles.body, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
}
