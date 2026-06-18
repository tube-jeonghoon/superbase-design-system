import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "./Switch";

describe("Switch (RN)", () => {
  it("renders a switch reflecting checked state", () => {
    render(<Switch checked onChange={() => {}} accessibilityLabel="wifi" />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("calls onChange with the toggled value", () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} accessibilityLabel="wifi" />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
