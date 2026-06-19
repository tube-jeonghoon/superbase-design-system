import { render, screen, waitFor } from "@testing-library/react";
import { useTokenValue } from "./useTokenValue";

function Probe({ cssVar }: { cssVar: string }) {
  return <span>{useTokenValue(cssVar)}</span>;
}

describe("useTokenValue", () => {
  afterEach(() => {
    document.documentElement.style.removeProperty("--test-color");
    document.documentElement.removeAttribute("data-theme");
  });

  it("reads the computed value of a CSS variable", () => {
    document.documentElement.style.setProperty("--test-color", "#abc123");
    render(<Probe cssVar="--test-color" />);
    expect(screen.getByText("#abc123")).toBeInTheDocument();
  });

  it("updates when data-theme changes", async () => {
    document.documentElement.style.setProperty("--test-color", "#111111");
    render(<Probe cssVar="--test-color" />);
    expect(screen.getByText("#111111")).toBeInTheDocument();

    document.documentElement.style.setProperty("--test-color", "#222222");
    document.documentElement.setAttribute("data-theme", "dark");
    await waitFor(() =>
      expect(screen.getByText("#222222")).toBeInTheDocument(),
    );
  });
});
