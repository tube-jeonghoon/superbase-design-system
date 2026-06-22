import { createContext, useContext } from "react";

export interface ModalContextValue {
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  registerTitle: (present: boolean) => void;
  registerDescription: (present: boolean) => void;
}

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal subcomponents must be used within <Modal>");
  return ctx;
}
