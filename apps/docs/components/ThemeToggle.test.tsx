import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("renders a switch defaulting to light (unchecked)", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).not.toBeChecked();
  });

  it("toggles document data-theme and persists to localStorage on click", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("switch"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("superbase-theme")).toBe("dark");
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("initializes from a stored dark preference", () => {
    localStorage.setItem("superbase-theme", "dark");
    render(<ThemeToggle />);
    expect(screen.getByRole("switch")).toBeChecked();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
