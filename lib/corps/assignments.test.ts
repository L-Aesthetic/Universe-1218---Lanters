import { describe, expect, it } from "vitest";
import {
  deriveAssignments,
  getCurrentAssignment,
} from "./assignments";

describe("deriveAssignments", () => {
  it("starts with evidence review as the active assignment", () => {
    const assignments = deriveAssignments({
      reviewed: ["scene"],
      correlated: false,
      contactScanned: false,
      constructsBuilt: [],
      selected: true,
    });

    expect(assignments[0].state).toBe("active");
    expect(getCurrentAssignment(assignments)?.id).toBe("2814-E-001-A");
  });

  it("opens waveform work only after all three records are reviewed", () => {
    const assignments = deriveAssignments({
      reviewed: ["scene", "witness", "record"],
      correlated: false,
      contactScanned: false,
      constructsBuilt: [],
      selected: true,
    });

    expect(assignments[0].state).toBe("complete");
    expect(assignments[1].state).toBe("available");
    expect(getCurrentAssignment(assignments)?.id).toBe("2814-E-001-B");
  });

  it("advances to sector tracing after correlation", () => {
    const assignments = deriveAssignments({
      reviewed: ["scene", "witness", "record"],
      correlated: true,
      contactScanned: false,
      constructsBuilt: [],
      selected: true,
    });

    expect(assignments[1].state).toBe("complete");
    expect(assignments[2].state).toBe("available");
  });

  it("queues unimplemented phase-offset work instead of pretending it works", () => {
    const assignments = deriveAssignments({
      reviewed: ["scene", "witness", "record"],
      correlated: true,
      contactScanned: true,
      constructsBuilt: [],
      selected: true,
    });

    expect(assignments[3].state).toBe("queued");
    expect(assignments[3].dependency).toMatch(/not deployed/i);
  });
});
