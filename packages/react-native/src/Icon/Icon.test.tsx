import { render } from "@testing-library/react";
import { vi } from "vitest";
import { iconPaths } from "@superbase/icons";

vi.mock("react-native-svg", () => ({
  Svg: ({ children, ...rest }: { children?: unknown } & Record<string, unknown>) => (
    <svg {...(rest as Record<string, unknown>)}>{children as never}</svg>
  ),
  Path: (props: Record<string, unknown>) => <path {...(props as Record<string, unknown>)} />,
}));

const { Icon } = await import("./Icon");

describe("Icon (RN)", () => {
  it("renders a path with the named icon's d", () => {
    const { container } = render(<Icon name="check" />);
    expect(container.querySelector("path")?.getAttribute("d")).toBe(iconPaths.check);
  });

  it("applies size to the svg and color to the path stroke", () => {
    const { container } = render(<Icon name="check" size={32} color="red" />);
    expect(container.querySelector("svg")?.getAttribute("width")).toBe("32");
    expect(container.querySelector("path")?.getAttribute("stroke")).toBe("red");
  });
});
