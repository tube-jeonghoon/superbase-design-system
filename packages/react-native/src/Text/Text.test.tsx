import { render, screen } from "@testing-library/react";
import { Text } from "./Text";

describe("Text (RN)", () => {
  it("renders its children", () => {
    render(<Text>Hello</Text>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("accepts variant/weight/color props without error", () => {
    render(
      <Text variant="title" weight="bold" color="brand">
        Hi
      </Text>,
    );
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });

  it("forwards ref to the underlying element", () => {
    const ref = { current: null as unknown };
    render(<Text ref={ref as never}>hello</Text>);
    expect(ref.current).not.toBeNull();
  });
});
