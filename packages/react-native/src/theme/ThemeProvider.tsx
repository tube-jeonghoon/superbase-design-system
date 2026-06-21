import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, darkTheme, type ColorScheme } from "@superbase/tokens/native/theme";
import { ThemeContext } from "./ThemeContext";

export interface ThemeProviderProps {
  /** "light" | "dark" | "system". "system"이면 OS 설정을 따른다. 기본 "light". */
  colorScheme?: ColorScheme | "system";
  children: ReactNode;
}

export function ThemeProvider({ colorScheme = "light", children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const resolved = colorScheme === "system" ? systemScheme ?? "light" : colorScheme;
  const theme = resolved === "dark" ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
