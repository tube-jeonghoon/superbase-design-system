import { render, fireEvent } from "@testing-library/react";
import { useEscapeKey } from "./useEscapeKey";

function Esc({ active, onEscape }: { active: boolean; onEscape: () => void }) {
  useEscapeKey(active, onEscape);
  return null;
}

describe("useEscapeKey", () => {
  it("calls handler on Escape while active", () => {
    const onEscape = vi.fn();
    render(<Esc active={true} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("does nothing when inactive", () => {
    const onEscape = vi.fn();
    render(<Esc active={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
