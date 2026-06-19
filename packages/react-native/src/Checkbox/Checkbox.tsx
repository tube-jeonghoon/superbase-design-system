import {
  Pressable,
  View,
  Text as RNText,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  ColorBrandPrimary,
  ColorBorderDefault,
  ColorBackgroundDefault,
  ColorWhite,
  ColorTextPrimary,
  RadiusSm,
  Spacing2,
  FontSizeBody,
} from "@superbase/tokens/native";

export interface CheckboxProps
  extends Omit<PressableProps, "children" | "style" | "onPress"> {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Checkbox({
  checked,
  onChange,
  disabled = false,
  label,
  style,
  ...rest
}: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      // aria-checked is required: react-native-web's Pressable does not surface
      // accessibilityState.checked as aria-checked. Keep both (native uses
      // accessibilityState; RNW/web a11y tree needs aria-checked). Do not remove.
      aria-checked={checked}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={[
        { flexDirection: "row", alignItems: "center", gap: Spacing2, opacity: disabled ? 0.4 : 1 },
        style,
      ]}
      {...rest}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: RadiusSm,
          borderWidth: 2,
          borderColor: checked ? ColorBrandPrimary : ColorBorderDefault,
          backgroundColor: checked ? ColorBrandPrimary : ColorBackgroundDefault,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? (
          <View style={{ width: 10, height: 10, borderRadius: 1, backgroundColor: ColorWhite }} />
        ) : null}
      </View>
      {label != null ? (
        <RNText style={{ fontSize: FontSizeBody, color: ColorTextPrimary }}>{label}</RNText>
      ) : null}
    </Pressable>
  );
}
