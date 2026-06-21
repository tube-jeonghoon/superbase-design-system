import { createRef } from "react";
import { render } from "@testing-library/react";
import { iconPaths } from "@superbase/icons";
import { Icon } from "./Icon";

describe("Icon", () => {
  it("renders an svg with the named path's d", () => {
    const { container } = render(<Icon name="check" />);
    expect(container.querySelector("path")?.getAttribute("d")).toBe(iconPaths.check);
  });

  it("applies size and color", () => {
    const { container } = render(<Icon name="check" size={32} color="red" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("stroke")).toBe("red");
  });

  it("is aria-hidden by default and labeled when label is given", () => {
    const { container, rerender } = render(<Icon name="check" />);
    expect(container.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<Icon name="search" label="검색" />);
    const labeled = container.querySelector('svg[role="img"]');
    expect(labeled?.getAttribute("aria-label")).toBe("검색");
  });

  it("forwards ref", () => {
    const ref = createRef<SVGSVGElement>();
    render(<Icon ref={ref} name="check" />);
    expect(ref.current).toBeInstanceOf(SVGSVGElement);
  });

  it("resolves named sizes to pixels", () => {
    const { container } = render(<Icon name="check" size="xs" />);
    expect(container.querySelector("svg")).toHaveAttribute("width", "12");
  });
});
