import { forwardRef, type ElementRef } from "react";
import { Svg, Path } from "react-native-svg";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";
import { useTheme } from "../theme/useTheme";

export type IconSize = "xs" | "sm" | "md" | "lg";

export interface IconProps {
  name: IconName;
  size?: number | IconSize;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<ElementRef<typeof Svg>, IconProps>(function Icon(
  { name, size = "md", color, label },
  ref,
) {
  const t = useTheme();
  const px = typeof size === "number" ? size : t.size.icon[size];
  const stroke = color ?? t.color.text.primary;
  // Use W3C accessibility props: valid DOM attributes on web (react-native-svg
  // forwards props verbatim, so RN-only props like accessibilityElementsHidden
  // would leak to the DOM and warn) and mapped to native a11y by RN 0.71+.
  const a11y = label
    ? ({ role: "img" as const, "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <Svg ref={ref} width={px} height={px} viewBox={ICON_VIEWBOX} {...a11y}>
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
