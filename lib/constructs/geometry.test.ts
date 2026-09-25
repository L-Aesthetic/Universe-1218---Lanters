import { describe, expect, it } from "vitest";
import { buildConstructGeometry } from "./geometry";

describe("construct geometry", () => {
  for (const kind of ["shield", "bridge", "beacon"] as const) {
    it(`builds valid line-segment geometry for ${kind}`, () => {
      const geometry = buildConstructGeometry(kind);

      expect(geometry.vertices.length).toBeGreaterThan(0);
      expect(geometry.vertices.length % 6).toBe(0);
      expect(geometry.segmentCount).toBe(geometry.vertices.length / 6);

      for (const value of geometry.vertices) {
        expect(Number.isFinite(value)).toBe(true);
      }
    });
  }

  it("gives each training form meaningfully different geometry", () => {
    const counts = ["shield", "bridge", "beacon"].map(
      (kind) =>
        buildConstructGeometry(kind as "shield" | "bridge" | "beacon")
          .segmentCount,
    );

    expect(new Set(counts).size).toBe(3);
  });
});
