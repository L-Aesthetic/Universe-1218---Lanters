import type { CorpsGateway } from "./gateway";
import { CorpsNetworkUnavailableError } from "./gateway";
import { LOCAL_CORPS_SNAPSHOT } from "./network";

export const localCorpsGateway: CorpsGateway = {
  kind: "local",

  async getSnapshot() {
    return LOCAL_CORPS_SNAPSHOT;
  },

  async requestAssistance() {
    throw new CorpsNetworkUnavailableError();
  },

  async respondToAssistance() {
    throw new CorpsNetworkUnavailableError();
  },

  async joinWorldEvent() {
    throw new CorpsNetworkUnavailableError();
  },
};
