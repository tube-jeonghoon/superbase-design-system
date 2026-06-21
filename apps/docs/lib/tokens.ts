export interface DisplayToken {
  name: string;
  cssVar: string;
}

export type ColorGroup = "text" | "brand" | "status";

export interface ColorToken extends DisplayToken {
  group: ColorGroup;
}

export const semanticColors: ColorToken[] = [
  { name: "text.primary", cssVar: "--color-text-primary", group: "text" },
  { name: "text.secondary", cssVar: "--color-text-secondary", group: "text" },
  { name: "text.disabled", cssVar: "--color-text-disabled", group: "text" },
  { name: "background.default", cssVar: "--color-background-default", group: "brand" },
  { name: "background.subtle", cssVar: "--color-background-subtle", group: "brand" },
  { name: "brand.primary", cssVar: "--color-brand-primary", group: "brand" },
  { name: "brand.pressed", cssVar: "--color-brand-pressed", group: "brand" },
  { name: "border.default", cssVar: "--color-border-default", group: "brand" },
  { name: "status.info", cssVar: "--color-status-info", group: "status" },
  { name: "status.success", cssVar: "--color-status-success", group: "status" },
  { name: "status.warning", cssVar: "--color-status-warning", group: "status" },
  { name: "status.danger", cssVar: "--color-status-danger", group: "status" },
];

export const spacingScale = [0, 1, 2, 3, 4, 6, 8] as const;

export const fontSizes: DisplayToken[] = [
  { name: "caption", cssVar: "--font-size-caption" },
  { name: "body", cssVar: "--font-size-body" },
  { name: "title", cssVar: "--font-size-title" },
  { name: "display", cssVar: "--font-size-display" },
];

export const radii: DisplayToken[] = [
  { name: "sm", cssVar: "--radius-sm" },
  { name: "md", cssVar: "--radius-md" },
  { name: "lg", cssVar: "--radius-lg" },
  { name: "full", cssVar: "--radius-full" },
];

export const shadows: DisplayToken[] = [
  { name: "sm", cssVar: "--shadow-sm" },
  { name: "md", cssVar: "--shadow-md" },
  { name: "lg", cssVar: "--shadow-lg" },
  { name: "xl", cssVar: "--shadow-xl" },
];

export const effectTokens: DisplayToken[] = [
  { name: "duration.fast", cssVar: "--duration-fast" },
  { name: "duration.base", cssVar: "--duration-base" },
  { name: "duration.slow", cssVar: "--duration-slow" },
  { name: "easing.standard", cssVar: "--easing-standard" },
  { name: "opacity.disabled", cssVar: "--opacity-disabled" },
  { name: "opacity.pressed", cssVar: "--opacity-pressed" },
  { name: "border-width.thin", cssVar: "--border-width-thin" },
  { name: "border-width.medium", cssVar: "--border-width-medium" },
  { name: "line-height.body", cssVar: "--line-height-body" },
];
