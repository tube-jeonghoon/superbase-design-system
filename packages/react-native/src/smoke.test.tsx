import { render, screen } from "@testing-library/react";
import { Text } from "react-native";

describe("rn test harness", () => {
  it("renders react-native primitives via react-native-web", () => {
    render(<Text>harness-ok</Text>);
    expect(screen.getByText("harness-ok")).toBeInTheDocument();
  });
});
