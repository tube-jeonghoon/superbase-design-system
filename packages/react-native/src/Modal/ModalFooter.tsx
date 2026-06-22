import type { ReactNode } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/useTheme";

export interface ModalFooterProps {
  children: ReactNode;
}

export function ModalFooter({ children }: ModalFooterProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: t.spacing["2"],
        paddingHorizontal: t.spacing["6"],
        paddingTop: t.spacing["3"],
        paddingBottom: t.spacing["6"],
      }}
    >
      {children}
    </View>
  );
}
