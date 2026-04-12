import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HeistCardSkeleton from "@/components/HeistCardSkeleton";

describe("HeistCardSkeleton", () => {
  it("renders without crashing", () => {
    const { container } = render(<HeistCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the expected number of placeholder blocks", () => {
    const { container } = render(<HeistCardSkeleton />);
    const blocks = container.querySelectorAll('[class*="block"]');
    expect(blocks.length).toBeGreaterThan(0);
  });
});
