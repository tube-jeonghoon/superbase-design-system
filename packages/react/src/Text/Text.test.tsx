import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text", () => {
  it("renders its children", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("reflects variant, weight, and color via data attributes", () => {
    render(
      <Text variant="title" weight="bold" color="brand">
        Hi
      </Text>,
    );
    const el = screen.getByText("Hi");
    expect(el).toHaveAttribute("data-variant", "title");
    expect(el).toHaveAttribute("data-weight", "bold");
    expect(el).toHaveAttribute("data-color", "brand");
  });

  it("defaults to span with body/regular/primary", () => {
    render(<Text>Plain</Text>);
    const el = screen.getByText("Plain");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-variant", "body");
    expect(el).toHaveAttribute("data-weight", "regular");
    expect(el).toHaveAttribute("data-color", "primary");
  });

  it("renders a custom element via the `as` prop", () => {
    render(<Text as="h1">Heading</Text>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Heading");
  });

  it("forwards ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Text ref={ref}>x</Text>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
