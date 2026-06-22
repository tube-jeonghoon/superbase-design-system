import type { ReactNode } from "react";
import { View, Text as RNText, Pressable, type TextStyle } from "react-native";
import { Icon } from "../Icon/Icon";
import { useTheme } from "../theme/useTheme";
import { useModalContext } from "./ModalContext";

export interface ModalHeaderProps {
  children: ReactNode;
  showCloseButton?: boolean;
}

export function ModalHeader({ children, showCloseButton = true }: ModalHeaderProps) {
  const t = useTheme();
  const { onClose } = useModalContext();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: t.spacing["3"],
        paddingHorizontal: t.spacing["6"],
        paddingTop: t.spacing["6"],
        paddingBottom: t.spacing["3"],
      }}
    >
      <RNText
        style={{ flex: 1, fontSize: t.font.size.title, fontWeight: String(t.font.weight.bold) as TextStyle["fontWeight"], color: t.color.text.primary }}
      >
        {children}
      </RNText>
      {showCloseButton && (
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
          <Icon name="close" size="sm" />
        </Pressable>
      )}
    </View>
  );
}
