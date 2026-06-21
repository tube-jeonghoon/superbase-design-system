import { forwardRef, type ElementRef } from "react";
import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from "react-native";
import { useTheme } from "../theme/useTheme";

export type SwitchSize = "sm" | "md";

export interface SwitchProps
  extends Omit<RNSwitchProps, "value" | "onValueChange" | "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  size?: SwitchSize;
}

export const Switch = forwardRef<ElementRef<typeof RNSwitch>, SwitchProps>(function Switch(
  { checked, onChange, disabled, size = "md", style, ...rest },
  ref,
) {
  const t = useTheme();
  return (
    <RNSwitch
      ref={ref}
      value={checked}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: t.color.border.default, true: t.color.brand.primary }}
      style={[size === "sm" ? { transform: [{ scale: 0.8 }] } : null, style]}
      {...rest}
    />
  );
});
