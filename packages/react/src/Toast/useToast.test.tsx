import { render } from "@testing-library/react";
import { useToast } from "./useToast";

function Probe() {
  useToast();
  return null;
}

describe("useToast", () => {
  it("throws when used outside ToastProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
