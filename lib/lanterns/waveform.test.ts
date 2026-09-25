import { describe, expect, it } from "vitest";
import {
  CURRENT_TRACE,
  WAVEFORM_MATCH_PERCENT,
  pearsonCorrelation,
  toWaveformPoints,
} from "./waveform";

describe("pearsonCorrelation", () => {
  it("returns 1 for identical traces", () => {
    expect(pearsonCorrelation([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 8);
  });

  it("returns -1 for inverse traces", () => {
    expect(pearsonCorrelation([1, 2, 3], [3, 2, 1])).toBeCloseTo(-1, 8);
  });

  it("rejects mismatched sample counts", () => {
    expect(() => pearsonCorrelation([1, 2], [1])).toThrow(
      /same sample count/i,
    );
  });

  it("derives the displayed case match from the stored sample set", () => {
    expect(WAVEFORM_MATCH_PERCENT).toBe(91.4);
  });

  it("renders one visible point for every stored sample", () => {
    expect(toWaveformPoints(CURRENT_TRACE).split(" ")).toHaveLength(
      CURRENT_TRACE.length,
    );
  });
});
