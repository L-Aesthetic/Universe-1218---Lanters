import type {
  AssistanceRequest,
  CorpsWorldEvent,
  SharedCorpsSnapshot,
} from "./domain";

export type AssistanceDraft = {
  assignmentId: string;
  requesterLanternId: string;
  sector: string;
  summary: string;
};

export type AssistanceResponseDraft = {
  requestId: string;
  responderLanternId: string;
  note: string;
};

export type CorpsGateway = {
  readonly kind: "local" | "shared";
  getSnapshot(): Promise<SharedCorpsSnapshot>;
  requestAssistance(
    draft: AssistanceDraft,
  ): Promise<AssistanceRequest>;
  respondToAssistance(
    draft: AssistanceResponseDraft,
  ): Promise<void>;
  joinWorldEvent(eventId: string): Promise<CorpsWorldEvent>;
};

export class CorpsNetworkUnavailableError extends Error {
  constructor(
    message = "A shared Corps backend is not connected to this build.",
  ) {
    super(message);
    this.name = "CorpsNetworkUnavailableError";
  }
}
