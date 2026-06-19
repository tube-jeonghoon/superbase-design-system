import { Svg, Path } from "react-native-svg";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";
import { ColorTextPrimary } from "@superbase/tokens/native";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  label?: string;
}

export function Icon({ name, size = 20, color = ColorTextPrimary, label }: IconProps) {
  const a11y = label
    ? { accessibilityRole: "image" as const, accessibilityLabel: label }
    : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  return (
    <Svg width={size} height={size} viewBox={ICON_VIEWBOX} {...a11y}>
      <Path
        d={iconPaths[name]}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
