export type ToastVariant = "info" | "success" | "warning" | "danger";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms until auto-dismiss. 0 or null = sticky. Defaults to 4000. */
  duration?: number | null;
  action?: ToastAction;
}

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number | null;
  action?: ToastAction;
  status: "entering" | "visible" | "exiting";
}

export type ToastConvenienceOptions = Omit<ToastOptions, "title" | "variant">;

export interface ToastApi {
  show: (opts: ToastOptions) => string;
  success: (title: string, opts?: ToastConvenienceOptions) => string;
  error: (title: string, opts?: ToastConvenienceOptions) => string;
  warning: (title: string, opts?: ToastConvenienceOptions) => string;
  info: (title: string, opts?: ToastConvenienceOptions) => string;
  dismiss: (id: string) => void;
}
