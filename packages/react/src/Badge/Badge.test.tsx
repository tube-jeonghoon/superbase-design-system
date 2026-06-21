import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("reflects variant via data attribute", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK")).toHaveAttribute("data-variant", "success");
  });

  it("defaults variant to neutral", () => {
    render(<Badge>n</Badge>);
    expect(screen.getByText("n")).toHaveAttribute("data-variant", "neutral");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref}>x</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });
});
