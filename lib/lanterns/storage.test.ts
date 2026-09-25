import { describe, expect, it } from "vitest";
import { normalizePersistedState } from "./storage";

describe("normalizePersistedState", () => {
  it("deduplicates valid evidence and keeps the last reviewed record active", () => {
    const state = normalizePersistedState({
      phase: "case",
      reviewed: ["scene", "witness", "scene"],
    });

    expect(state.reviewed).toEqual(["scene", "witness"]);
    expect(state.activeEvidenceId).toBe("witness");
  });

  it("does not allow selection or Lantern state before the investigation is complete", () => {
    const state = normalizePersistedState({
      phase: "lantern",
      reviewed: ["scene"],
      ringSerial: "2814-12345678",
    });

    expect(state.phase).toBe("case");
  });

  it("repairs dependent findings without inventing unrelated progress", () => {
    const state = normalizePersistedState({
      phase: "case",
      reviewed: ["scene", "witness", "record"],
      correlated: false,
      contactScanned: true,
    });

    expect(state.contactScanned).toBe(true);
    expect(state.correlated).toBe(true);
  });

  it("drops invalid local identity and training values", () => {
    const state = normalizePersistedState({
      phase: "case",
      reviewed: [],
      ringSerial: "not-a-ring",
      selectedAt: "not-a-date",
      constructsBuilt: ["shield", "shield", "invalid" as "shield"],
    });

    expect(state.ringSerial).toBeUndefined();
    expect(state.selectedAt).toBeUndefined();
    expect(state.constructsBuilt).toEqual(["shield"]);
  });
});
