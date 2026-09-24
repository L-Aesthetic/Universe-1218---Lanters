import { describe, expect, it } from "vitest";
import {
  deriveCaseIntelligence,
  deriveSelectionObservation,
} from "./intelligence";

describe("deriveCaseIntelligence", () => {
  it("starts with evidence review without inventing a conclusion", () => {
    const state = deriveCaseIntelligence({
      reviewed: ["scene"],
      correlated: false,
      contactScanned: false,
    });

    expect(state.stage).toBe("archive-review");
    expect(state.recommendedSystem).toBe("archive");
    expect(state.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "scene-emission",
          confidence: "observed",
        }),
      ]),
    );
  });

  it("moves to correlation only after all three records are reviewed", () => {
    const state = deriveCaseIntelligence({
      reviewed: ["witness", "scene", "record"],
      correlated: false,
      contactScanned: false,
    });

    expect(state.stage).toBe("waveform-correlation");
    expect(state.nextAction).toMatch(/waveform correlation/i);
  });

  it("moves to sector tracing after a correlation", () => {
    const state = deriveCaseIntelligence({
      reviewed: ["scene", "witness", "record"],
      correlated: true,
      contactScanned: false,
    });

    expect(state.stage).toBe("sector-trace");
    expect(state.recommendedSystem).toBe("sector");
    expect(state.findings.at(-1)?.id).toBe("waveform-match");
  });

  it("treats a contact scan as a later state and preserves the prior finding", () => {
    const state = deriveCaseIntelligence({
      reviewed: ["scene", "witness", "record"],
      correlated: true,
      contactScanned: true,
    });

    expect(state.stage).toBe("spatial-echo");
    expect(state.status).toBe("ESCALATED");
    expect(state.findings.map((finding) => finding.id)).toEqual(
      expect.arrayContaining(["waveform-match", "spatial-echo"]),
    );
  });
});

describe("deriveSelectionObservation", () => {
  it("describes behavior without assigning a personality score", () => {
    const observation = deriveSelectionObservation([
      "record",
      "witness",
      "scene",
    ]);

    expect(observation.firstInquiry).toBe("SEALED CORPS RECORD");
    expect(observation.method).toMatch(/restricted record/i);
    expect(observation.persistence).toMatch(/kept the case open/i);
  });
});
