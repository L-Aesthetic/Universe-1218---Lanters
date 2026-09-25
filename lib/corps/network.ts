import type { SharedCorpsSnapshot } from "./domain";

export const LOCAL_CORPS_SNAPSHOT: SharedCorpsSnapshot = {
  networkBound: false,
  activeWorldEvents: [],
  openAssistanceRequests: [],
};

export function describeCorpsNetwork(snapshot: SharedCorpsSnapshot) {
  if (!snapshot.networkBound) {
    return {
      state: "LOCAL_ONLY" as const,
      headline: "No shared Corps network is bound.",
      detail:
        "This build will not fabricate other Lanterns, assistance traffic, or global events. Connect the shared backend before those systems become active.",
    };
  }

  return {
    state: "CONNECTED" as const,
    headline: "Shared Corps network connected.",
    detail:
      `${snapshot.openAssistanceRequests.length} assistance requests and ${snapshot.activeWorldEvents.length} active world events are currently visible.`,
  };
}
