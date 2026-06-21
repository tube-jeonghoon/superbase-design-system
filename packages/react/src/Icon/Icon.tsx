import { forwardRef, type SVGProps } from "react";
import { iconPaths, ICON_VIEWBOX, type IconName } from "@superbase/icons";

export type IconSize = "xs" | "sm" | "md" | "lg";

const ICON_PX: Record<IconSize, number> = { xs: 12, sm: 16, md: 20, lg: 24 };

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "color"> {
  name: IconName;
  size?: number | IconSize;
  color?: string;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = "md", color = "currentColor", label, ...rest },
  ref,
) {
  const px = typeof size === "number" ? size : ICON_PX[size];
  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);
  return (
    <svg
      ref={ref}
      width={px}
      height={px}
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
