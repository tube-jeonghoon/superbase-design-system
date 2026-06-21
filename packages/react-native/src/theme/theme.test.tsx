import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { useTheme } from "./useTheme";

function Probe() {
  const t = useTheme();
  return <span>{t.color.background.default}</span>;
}

describe("ThemeProvider / useTheme", () => {
  it("defaults to light theme without a provider (non-breaking)", () => {
    render(<Probe />);
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
  });

  it("provides light theme by default", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("#ffffff")).toBeInTheDocument();
  });

  it("provides dark theme when colorScheme='dark'", () => {
    render(
      <ThemeProvider colorScheme="dark">
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("#191f28")).toBeInTheDocument();
  });
});
