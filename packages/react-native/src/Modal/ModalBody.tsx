import type { ReactNode } from "react";
import { ScrollView } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody({ children }: ModalBodyProps) {
  const t = useTheme();
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: t.spacing["6"], paddingVertical: t.spacing["2"] }}>
      {children}
    </ScrollView>
  );
}
