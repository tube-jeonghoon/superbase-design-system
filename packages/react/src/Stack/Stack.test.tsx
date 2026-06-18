import { render, screen } from "@testing-library/react";
import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders children inside a flex container", () => {
    render(
      <Stack>
        <span>child</span>
      </Stack>,
    );
    const stack = screen.getByText("child").parentElement as HTMLElement;
    expect(stack).toHaveStyle({ display: "flex" });
  });

  it("applies direction and gap from props", () => {
    render(
      <Stack direction="row" gap={4}>
        <span>x</span>
      </Stack>,
    );
    const stack = screen.getByText("x").parentElement as HTMLElement;
    expect(stack).toHaveAttribute("data-direction", "row");
    expect(stack).toHaveStyle({ flexDirection: "row", gap: "var(--spacing-4)" });
  });
});
