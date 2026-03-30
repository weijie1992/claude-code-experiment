import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingScreen from "@/components/LoadingScreen";

describe("LoadingScreen", () => {
  it("renders a loading indicator", () => {
    render(<LoadingScreen />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<LoadingScreen />);
    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
  });
});
