import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from "react-native";
import { ColorBrandPrimary, ColorGray200 } from "@superbase/tokens/native";

export interface SwitchProps
  extends Omit<RNSwitchProps, "value" | "onValueChange" | "onChange"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export function Switch({ checked, onChange, disabled, ...rest }: SwitchProps) {
  return (
    <RNSwitch
      value={checked}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: ColorGray200, true: ColorBrandPrimary }}
      {...rest}
    />
  );
}
