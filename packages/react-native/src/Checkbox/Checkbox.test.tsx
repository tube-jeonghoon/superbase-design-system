import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox (RN)", () => {
  it("exposes checkbox role with checked state", () => {
    render(<Checkbox checked onChange={() => {}} accessibilityLabel="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeChecked();
  });

  it("calls onChange with the toggled value", () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} accessibilityLabel="x" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", () => {
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} disabled accessibilityLabel="x" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reports aria-checked=mixed when indeterminate", () => {
    render(<Checkbox checked={false} indeterminate accessibilityLabel="all" />);
    expect(screen.getByRole("checkbox", { name: "all" })).toHaveAttribute("aria-checked", "mixed");
  });
});
