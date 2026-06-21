import { forwardRef, type ElementRef } from "react";
import { Pressable, View, Text as RNText } from "react-native";
import { useRadioContext } from "./RadioContext";
import { useTheme } from "../theme/useTheme";

export type RadioSize = "sm" | "md";

export interface RadioProps {
  value: string;
  label?: string;
  disabled?: boolean;
  size?: RadioSize;
}

export const Radio = forwardRef<ElementRef<typeof Pressable>, RadioProps>(function Radio(
  { value, label, disabled = false, size = "md" },
  ref,
) {
  const t = useTheme();
  const group = useRadioContext();
  const checked = group.value === value;
  const box = size === "sm" ? t.size.controlSm : t.size.control;
  const dot = Math.round(box / 2);
  return (
    <Pressable
      ref={ref}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both. Do not remove.
      aria-checked={checked}
      disabled={disabled}
      onPress={() => group.onChange?.(value)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: t.spacing["2"],
        opacity: disabled ? t.opacity.disabled : 1,
      }}
    >
      <View
        style={{
          width: box,
          height: box,
          borderRadius: t.radius.full,
          borderWidth: t.borderWidth.medium,
          borderColor: checked ? t.color.brand.primary : t.color.border.default,
          backgroundColor: t.color.background.default,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View
            style={{ width: dot, height: dot, borderRadius: t.radius.full, backgroundColor: t.color.brand.primary }}
          />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: t.font.size.body, color: t.color.text.primary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
});
