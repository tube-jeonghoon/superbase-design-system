import { render } from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { Text } from "../Text/Text";

describe("dark theme integration", () => {
  it("renders components without error under a dark provider", () => {
    const { getByText } = render(
      <ThemeProvider colorScheme="dark">
        <Text>hi</Text>
      </ThemeProvider>,
    );
    expect(getByText("hi")).toBeInTheDocument();
  });

  it("renders differently under light vs dark (color flips through useTheme)", () => {
    // react-native-web emits style as generated atomic classes (or inline style);
    // either way the rendered markup differs when the resolved color differs.
    const { container: light } = render(
      <ThemeProvider colorScheme="light">
        <Text>hi</Text>
      </ThemeProvider>,
    );
    const { container: dark } = render(
      <ThemeProvider colorScheme="dark">
        <Text>hi</Text>
      </ThemeProvider>,
    );
    expect(light.innerHTML).not.toEqual(dark.innerHTML);
  });
});
