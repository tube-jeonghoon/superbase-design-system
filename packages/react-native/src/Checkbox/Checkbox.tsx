import { forwardRef, type ElementRef } from "react";
import {
  Pressable,
  View,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/useTheme";

export interface CheckboxProps
  extends Omit<PressableProps, "children" | "style" | "onPress"> {
  checked: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const Checkbox = forwardRef<ElementRef<typeof Pressable>, CheckboxProps>(function Checkbox(
  { checked, indeterminate = false, onChange, disabled = false, label, style, ...rest },
  ref,
) {
  const t = useTheme();
  const box = t.size.control;
  const mark = Math.round(box / 2);
  const filled = checked || indeterminate;
  return (
    <Pressable
      ref={ref}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? "mixed" : checked, disabled }}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both. Do not remove.
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: t.spacing["2"],
          opacity: disabled ? t.opacity.disabled : 1,
        },
        style,
      ]}
      {...rest}
    >
      <View
        style={{
          width: box,
          height: box,
          borderRadius: t.radius.sm,
          borderWidth: t.borderWidth.medium,
          borderColor: filled ? t.color.brand.primary : t.color.border.default,
          backgroundColor: filled ? t.color.brand.primary : t.color.background.default,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {indeterminate ? (
          <View style={{ width: mark, height: t.borderWidth.medium, borderRadius: 1, backgroundColor: "#ffffff" }} />
        ) : checked ? (
          <View style={{ width: mark, height: mark, borderRadius: 1, backgroundColor: "#ffffff" }} />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: t.font.size.body, color: t.color.text.primary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
});
