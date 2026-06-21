import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// react-native-svg resolves to raw TypeScript source under the "react-native"
// export condition, which vitest cannot transform from node_modules. Mock it
// globally so any component tree containing Icon renders in tests.
vi.mock("react-native-svg", () => ({
  Svg: ({ children, ...rest }: { children?: unknown } & Record<string, unknown>) => (
    <svg {...(rest as Record<string, unknown>)}>{children as never}</svg>
  ),
  Path: (props: Record<string, unknown>) => <path {...(props as Record<string, unknown>)} />,
}));

// react-native-web's useColorScheme reads window.matchMedia; jsdom lacks it.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;
}
