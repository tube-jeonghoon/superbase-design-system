import { forwardRef, type ElementRef } from "react";
import { Svg, Path } from "react-native-svg";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";
import { useTheme } from "../theme/useTheme";

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<ElementRef<typeof Svg>, IconProps>(function Icon(
  { name, size = 20, color, label },
  ref,
) {
  const t = useTheme();
  const stroke = color ?? t.color.text.primary;
  const a11y = label
    ? { accessibilityRole: "image" as const, accessibilityLabel: label }
    : { accessibilityElementsHidden: true, importantForAccessibility: "no-hide-descendants" as const };
  return (
    <Svg ref={ref} width={size} height={size} viewBox={ICON_VIEWBOX} {...a11y}>
      <Path
        d={iconPaths[name]}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});
