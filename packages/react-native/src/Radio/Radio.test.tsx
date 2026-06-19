import { render, screen, fireEvent } from "@testing-library/react";
import { RadioGroup } from "./RadioGroup";
import { Radio } from "./Radio";

describe("RadioGroup + Radio (RN)", () => {
  it("reflects the group value as checked state", () => {
    render(
      <RadioGroup value="b">
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio", { name: "A" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });

  it("calls the group onChange with the selected value", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" />
      </RadioGroup>,
    );
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("throws when a Radio is used outside a RadioGroup", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Radio value="a" label="A" />)).toThrow(
      "Radio must be used within a RadioGroup",
    );
    spy.mockRestore();
  });
});
