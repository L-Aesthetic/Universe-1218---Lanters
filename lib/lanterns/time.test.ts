import { describe, expect, it } from "vitest";
import { addMillisecondsToClock } from "./time";

describe("addMillisecondsToClock", () => {
  it("derives the Rushville discovery time four minutes later", () => {
    expect(addMillisecondsToClock("02:13:41.811", 4 * 60 * 1000)).toBe(
      "02:17:41.811",
    );
  });

  it("wraps safely across midnight", () => {
    expect(addMillisecondsToClock("23:59:59.900", 200)).toBe(
      "00:00:00.100",
    );
  });

  it("rejects vague clock strings", () => {
    expect(() => addMillisecondsToClock("02:14", 1000)).toThrow(
      /HH:MM:SS\.mmm/,
    );
  });
});
