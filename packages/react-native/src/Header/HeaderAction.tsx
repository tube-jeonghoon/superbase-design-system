import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useHeaderContext } from "./HeaderContext";

export interface HeaderActionProps {
  icon: ReactNode;
  label: string;
  badge?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function HeaderAction({ icon, label, badge = false, onPress, disabled = false }: HeaderActionProps) {
  useHeaderContext();
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{
        width: t.size.fieldSm,
        height: t.size.fieldSm,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: t.radius.full,
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <View>{icon}</View>
      {badge ? (
        <View
          style={{
            position: "absolute",
            top: t.spacing["1"],
            right: t.spacing["1"],
            width: t.spacing["2"],
            height: t.spacing["2"],
            borderRadius: t.radius.full,
            backgroundColor: t.color.status.danger,
            borderWidth: t.borderWidth.thin,
            borderColor: t.color.background.default,
          }}
        />
      ) : null}
    </Pressable>
  );
}
