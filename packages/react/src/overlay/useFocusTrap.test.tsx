import { useRef } from "react";
import { render } from "@testing-library/react";
import { useFocusTrap } from "./useFocusTrap";

function Trapped({ active }: { active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, active);
  return (
    <div>
      <button data-testid="outside">outside</button>
      <div ref={ref}>
        <button data-testid="first">first</button>
        <button data-testid="last">last</button>
      </div>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("moves focus into the container when activated", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();
    expect(document.activeElement).toBe(outside);

    const { getByTestId } = render(<Trapped active={true} />);
    expect(document.activeElement).toBe(getByTestId("first"));
    document.body.removeChild(outside);
  });

  it("restores focus to the previously focused element when deactivated", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.focus();

    const { rerender } = render(<Trapped active={true} />);
    rerender(<Trapped active={false} />);
    expect(document.activeElement).toBe(outside);
    document.body.removeChild(outside);
  });
});
