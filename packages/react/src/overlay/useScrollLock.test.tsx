import { render } from "@testing-library/react";
import { useScrollLock } from "./useScrollLock";

function Lock({ active }: { active: boolean }) {
  useScrollLock(active);
  return null;
}

describe("useScrollLock", () => {
  it("locks documentElement overflow while active and restores after", () => {
    const { rerender, unmount } = render(<Lock active={false} />);
    expect(document.documentElement.style.overflow).toBe("");

    rerender(<Lock active={true} />);
    expect(document.documentElement.style.overflow).toBe("hidden");

    rerender(<Lock active={false} />);
    expect(document.documentElement.style.overflow).toBe("");

    unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("stays locked until the last active consumer releases (ref count)", () => {
    const a = render(<Lock active={true} />);
    const b = render(<Lock active={true} />);
    expect(document.documentElement.style.overflow).toBe("hidden");

    a.unmount();
    expect(document.documentElement.style.overflow).toBe("hidden"); // b still active

    b.unmount();
    expect(document.documentElement.style.overflow).toBe("");
  });
});
