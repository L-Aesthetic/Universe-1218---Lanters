import { describe, expect, it } from "vitest";
import {
  CASE_CLOCK,
  caseTimeline,
  sectorEchoOrigins,
  sectorNodes,
} from "./data";

describe("Rushville case timeline", () => {
  it("keeps the exact emission and discovery interval coherent", () => {
    expect(CASE_CLOCK.emission).toBe("02:13:41.811");
    expect(CASE_CLOCK.bodyDiscovered).toBe("02:17:41.811");
  });

  it("does not expose witness-derived events as scene telemetry", () => {
    const sceneEvents = caseTimeline.filter(
      (event) => event.evidenceId === "scene",
    );
    const witnessEvents = caseTimeline.filter(
      (event) => event.evidenceId === "witness",
    );

    expect(sceneEvents.map((event) => event.id)).toEqual([
      "emission",
      "body-discovered",
    ]);
    expect(witnessEvents.map((event) => event.id)).toEqual([
      "witness-flash",
      "camera-corruption",
      "grid-outage",
    ]);
  });
});


describe("Sector 2814 local projection", () => {
  it("keeps every projected point inside the local model", () => {
    const points = [
      ...sectorNodes.flatMap((node) =>
        node.projection ? [node.projection] : [],
      ),
      ...sectorEchoOrigins,
    ];

    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(0);
      expect(point.x).toBeLessThanOrEqual(100);
      expect(point.y).toBeGreaterThanOrEqual(0);
      expect(point.y).toBeLessThanOrEqual(100);
    }
  });

  it("does not pretend Oa has a local projected route", () => {
    const oa = sectorNodes.find((node) => node.id === "oa");
    expect(oa?.projection).toBeUndefined();
  });

  it("expands the unresolved contact into three modeled return paths", () => {
    expect(sectorEchoOrigins).toHaveLength(3);
  });
});
