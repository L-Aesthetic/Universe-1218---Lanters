import { describe, expect, it } from "vitest";
import { askRing } from "./ring-query";
import type { CorpsRuntimeContext } from "./domain";

const base: CorpsRuntimeContext = {
  reviewed: ["scene", "witness", "record"],
  correlated: false,
  contactScanned: false,
  constructsBuilt: [],
  selected: true,
};

describe("askRing", () => {
  it("answers grounded Corps questions with citations", () => {
    const result = askRing("What is Oa?", base);

    expect(result.classification).toBe("KNOWN");
    expect(result.answer).toMatch(/central world/i);
    expect(result.citations[0]?.authority).toBe("DC_OFFICIAL_REFERENCE");
  });

  it("does not reveal unopened case records", () => {
    const result = askRing("What does the witness say?", {
      ...base,
      reviewed: ["scene"],
    });

    expect(result.classification).toBe("RESTRICTED");
  });

  it("refuses to invent why the record was sealed", () => {
    const result = askRing("Why was the prior record sealed?", base);

    expect(result.classification).toBe("KNOWN");
    expect(result.answer).toMatch(/does not state the motive/i);
    expect(result.answer).toMatch(/will not invent one/i);
  });

  it("reveals the three-origin echo only after the scan exists", () => {
    const before = askRing("How many origins does the contact have?", {
      ...base,
      correlated: true,
      contactScanned: false,
    });
    const after = askRing("How many origins does the contact have?", {
      ...base,
      correlated: true,
      contactScanned: true,
    });

    expect(before.answer).not.toMatch(/three incompatible/i);
    expect(after.classification).toBe("KNOWN");
    expect(after.answer).toMatch(/three incompatible/i);
  });

  it("returns UNKNOWN when the archive has no grounded answer", () => {
    const result = askRing("What did Abin Sur eat for breakfast?", base);

    expect(result.classification).toBe("UNKNOWN");
    expect(result.citations).toEqual([]);
  });

  it("marks causal synthesis as inference when sources do not state causation", () => {
    const result = askRing("Why is John Stewart interested in construction?", base);

    expect(result.classification).toBe("INFERRED");
    expect(result.citations.length).toBeGreaterThan(0);
  });
});
