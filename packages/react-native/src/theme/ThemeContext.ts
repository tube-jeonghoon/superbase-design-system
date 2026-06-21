import { createContext } from "react";
import { lightTheme, type Theme } from "@superbase/tokens/native/theme";

// 기본값 lightTheme → Provider 없이 useTheme()를 써도 라이트 동작(하위호환).
export const ThemeContext = createContext<Theme>(lightTheme);
