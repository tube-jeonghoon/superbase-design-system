import { Pressable, View, Text as RNText } from "react-native";
import { useRadioContext } from "./RadioContext";
import {
  ColorBrandPrimary,
  ColorBorderDefault,
  ColorBackgroundDefault,
  ColorTextPrimary,
  RadiusFull,
  Spacing2,
  FontSizeBody,
} from "@superbase/tokens/native";

export interface RadioProps {
  value: string;
  label?: string;
  disabled?: boolean;
}

export function Radio({ value, label, disabled = false }: RadioProps) {
  const group = useRadioContext();
  const checked = group.value === value;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both. Do not remove.
      aria-checked={checked}
      disabled={disabled}
      onPress={() => group.onChange?.(value)}
      style={{ flexDirection: "row", alignItems: "center", gap: Spacing2, opacity: disabled ? 0.4 : 1 }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: RadiusFull,
          borderWidth: 2,
          borderColor: checked ? ColorBrandPrimary : ColorBorderDefault,
          backgroundColor: ColorBackgroundDefault,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View style={{ width: 10, height: 10, borderRadius: RadiusFull, backgroundColor: ColorBrandPrimary }} />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: FontSizeBody, color: ColorTextPrimary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
}
