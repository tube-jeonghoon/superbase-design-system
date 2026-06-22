import { render, screen } from "@testing-library/react";
import { Portal } from "./Portal";

describe("Portal", () => {
  it("renders children into document.body", () => {
    render(
      <div data-testid="host">
        <Portal>
          <span>portaled</span>
        </Portal>
      </div>,
    );
    const portaled = screen.getByText("portaled");
    expect(portaled).toBeInTheDocument();
    // children land on body, not inside the host wrapper
    expect(screen.getByTestId("host").contains(portaled)).toBe(false);
  });
});
