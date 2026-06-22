import { Icon } from "../Icon/Icon";
import type { ToastData } from "./types";
import styles from "./Toast.module.css";

const VARIANT_ICON = { info: "info", success: "success", warning: "warning", danger: "error" } as const;

export interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastItemProps) {
  const { id, title, description, variant, action, status } = toast;
  return (
    <div
      className={styles.toast}
      data-variant={variant}
      data-state={status}
      role={variant === "danger" ? "alert" : "status"}
    >
      <span className={styles.icon}>
        <Icon name={VARIANT_ICON[variant]} size="sm" />
      </span>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            action.onClick();
            onDismiss(id);
          }}
        >
          {action.label}
        </button>
      )}
      <button type="button" className={styles.close} aria-label="Close" onClick={() => onDismiss(id)}>
        <Icon name="close" size="sm" />
      </button>
    </div>
  );
}
