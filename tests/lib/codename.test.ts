import { describe, it, expect } from "vitest";
import { generateCodename } from "@/lib/codename";

describe("generateCodename", () => {
  it("returns a non-empty string", () => {
    expect(generateCodename().length).toBeGreaterThan(0);
  });

  it("starts with an uppercase letter (PascalCase)", () => {
    const codename = generateCodename();
    expect(codename[0]).toBe(codename[0].toUpperCase());
  });

  it("contains no spaces or hyphens", () => {
    const codename = generateCodename();
    expect(codename).not.toMatch(/[\s-]/);
  });

  it("is made up of exactly 3 capitalised segments", () => {
    // Each segment starts with an uppercase letter — split on uppercase boundaries
    const codename = generateCodename();
    const segments = codename.match(/[A-Z][a-z]+/g);
    expect(segments).toHaveLength(3);
  });

  it("produces different values across multiple calls (probabilistic)", () => {
    const results = new Set(
      Array.from({ length: 20 }, () => generateCodename()),
    );
    expect(results.size).toBeGreaterThan(1);
  });
});
