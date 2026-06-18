export interface DisplayToken {
  name: string;
  cssVar: string;
}

export const semanticColors: DisplayToken[] = [
  { name: "text.primary", cssVar: "--color-text-primary" },
  { name: "text.secondary", cssVar: "--color-text-secondary" },
  { name: "text.disabled", cssVar: "--color-text-disabled" },
  { name: "background.default", cssVar: "--color-background-default" },
  { name: "background.subtle", cssVar: "--color-background-subtle" },
  { name: "brand.primary", cssVar: "--color-brand-primary" },
  { name: "brand.pressed", cssVar: "--color-brand-pressed" },
  { name: "border.default", cssVar: "--color-border-default" },
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
