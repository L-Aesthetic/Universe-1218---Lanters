import { describe, expect, it } from "vitest";
import { CASE_CLOCK, caseTimeline } from "./data";

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
