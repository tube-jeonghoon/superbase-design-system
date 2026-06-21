import { useContext } from "react";
import type { Theme } from "@superbase/tokens/native/theme";
import { ThemeContext } from "./ThemeContext";

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
