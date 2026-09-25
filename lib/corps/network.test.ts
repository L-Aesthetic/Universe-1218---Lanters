import { describe, expect, it } from "vitest";
import {
  LOCAL_CORPS_SNAPSHOT,
  describeCorpsNetwork,
} from "./network";

describe("Corps network boundary", () => {
  it("does not invent shared activity before a backend is bound", () => {
    const status = describeCorpsNetwork(LOCAL_CORPS_SNAPSHOT);

    expect(status.state).toBe("LOCAL_ONLY");
    expect(LOCAL_CORPS_SNAPSHOT.activeWorldEvents).toHaveLength(0);
    expect(LOCAL_CORPS_SNAPSHOT.openAssistanceRequests).toHaveLength(0);
    expect(status.detail).toMatch(/will not fabricate/i);
  });
});
