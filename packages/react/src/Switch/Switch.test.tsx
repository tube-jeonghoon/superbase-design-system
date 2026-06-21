import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("exposes the switch role and checked state", () => {
    render(<Switch checked aria-label="wifi" />);
    expect(screen.getByRole("switch", { name: "wifi" })).toBeChecked();
  });

  it("calls onChange with the toggled value", async () => {
    const onChange = vi.fn();
    render(<Switch checked={false} onChange={onChange} aria-label="wifi" />);
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("does not call onChange when disabled", async () => {
    const onChange = vi.fn();
    render(
      <Switch checked={false} onChange={onChange} disabled aria-label="wifi" />,
    );
    await userEvent.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards ref to the switch button", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch checked={false} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
