export const ICON_VIEWBOX = "0 0 24 24";

export const iconPaths = {
  "chevron-left": "M15 6l-6 6 6 6",
  "chevron-right": "M9 6l6 6-6 6",
  "chevron-up": "M6 15l6-6 6 6",
  "chevron-down": "M6 9l6 6 6-6",
  check: "M5 13l4 4 10-10",
  close: "M6 6l12 12M18 6L6 18",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  search: "M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0zM20 20l-5.8-5.8",
  menu: "M4 7h16M4 12h16M4 17h16",
  info: "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0zM12 11v5M12 8h0.01",
  warning: "M12 4L3 20h18L12 4zM12 10v4M12 17h0.01",
  success: "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0zM8 12l3 3 5-5",
  error: "M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0zM9.5 9.5l5 5M14.5 9.5l-5 5",
  star: "M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z",
  heart: "M12 20l-1.1-1C6.6 15.2 4 12.9 4 9.9 4 7.6 5.8 6 7.9 6c1.4 0 2.8.7 3.6 1.9C12.3 6.7 13.7 6 15.1 6 17.2 6 19 7.6 19 9.9c0 3-2.6 5.3-6.9 9.1L12 20z",
  user: "M8 8a4 4 0 1 0 8 0 4 4 0 1 0-8 0zM5 20a7 7 0 0 1 14 0",
  settings: "M4 8h9M17 8h3M4 16h3M11 16h9M15 6v4M8 14v4",
} as const;

export type IconName = keyof typeof iconPaths;

export const iconNames = Object.keys(iconPaths) as IconName[];
