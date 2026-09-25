import { describe, expect, it } from "vitest";
import { CorpsNetworkUnavailableError } from "./gateway";
import { localCorpsGateway } from "./local-gateway";

describe("local Corps gateway", () => {
  it("returns an explicit offline shared-network snapshot", async () => {
    const snapshot = await localCorpsGateway.getSnapshot();

    expect(snapshot.networkBound).toBe(false);
    expect(snapshot.activeWorldEvents).toEqual([]);
    expect(snapshot.openAssistanceRequests).toEqual([]);
  });

  it("cannot silently pretend an assistance request was sent", async () => {
    await expect(
      localCorpsGateway.requestAssistance({
        assignmentId: "2814-E-001-C",
        requesterLanternId: "2814-12345678",
        sector: "2814",
        summary: "Need a second ring on this contact.",
      }),
    ).rejects.toBeInstanceOf(CorpsNetworkUnavailableError);
  });

  it("cannot join a world event without a shared backend", async () => {
    await expect(
      localCorpsGateway.joinWorldEvent("oa-event-001"),
    ).rejects.toBeInstanceOf(CorpsNetworkUnavailableError);
  });
});
