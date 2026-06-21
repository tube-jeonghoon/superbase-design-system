import { forwardRef, type SVGProps } from "react";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "color"> {
  name: IconName;
  size?: number;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 20, color = "currentColor", label, ...rest },
  ref,
) {
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={ICON_VIEWBOX}
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
      {...rest}
    >
      <path d={iconPaths[name]} />
    </svg>
  );
});
