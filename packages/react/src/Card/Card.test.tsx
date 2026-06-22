import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children with default elevation=sm", () => {
    const { container } = render(<Card>Body</Card>);
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(container.querySelector('[data-elevation="sm"]')).not.toBeNull();
  });

  it("supports bordered and elevation props", () => {
    const { container } = render(<Card elevation="lg" bordered>X</Card>);
    expect(container.querySelector('[data-elevation="lg"]')).not.toBeNull();
    expect(container.querySelector('[data-bordered="true"]')).not.toBeNull();
  });

  it("forwards ref to the div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref}>X</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
