import type { RecordOrigin } from "../lanterns/canon";
import type {
  ConstructKind,
  EvidenceId,
  SectorNodeId,
} from "../lanterns/types";

export type CorpsRuntimeContext = {
  reviewed: EvidenceId[];
  correlated: boolean;
  contactScanned: boolean;
  constructsBuilt: ConstructKind[];
  selected: boolean;
};

export type RingKnowledgeAccess = "open" | "restricted";
export type RingAnswerClass = "KNOWN" | "INFERRED" | "RESTRICTED" | "UNKNOWN";

export type RingKnowledgeRecord = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  origin: RecordOrigin;
  access: RingKnowledgeAccess;
  system:
    | "case"
    | "archive"
    | "sector"
    | "construct"
    | "corps";
  sourceLabel: string;
};

export type RingCitation = {
  id: string;
  title: string;
  sourceLabel: string;
  authority: RecordOrigin["authority"];
};

export type RingQueryResult = {
  classification: RingAnswerClass;
  answer: string;
  citations: RingCitation[];
  matchedRecordIds: string[];
};

export type AssignmentState =
  | "complete"
  | "active"
  | "available"
  | "blocked"
  | "queued";

export type CorpsAssignment = {
  id: string;
  caseId: string;
  title: string;
  brief: string;
  objective: string;
  state: AssignmentState;
  targetSystem: "archive" | "case" | "sector" | "construct";
  dependency?: string;
};

export type AssistanceRequestStatus =
  | "open"
  | "answered"
  | "accepted"
  | "closed"
  | "cancelled";

export type AssistanceRequest = {
  id: string;
  assignmentId: string;
  requesterLanternId: string;
  sector: string;
  summary: string;
  status: AssistanceRequestStatus;
  createdAt: string;
};

export type WorldEventStatus =
  | "scheduled"
  | "active"
  | "resolved"
  | "cancelled";

export type CorpsWorldEvent = {
  id: string;
  title: string;
  status: WorldEventStatus;
  startsAt: string;
  endsAt?: string;
  scope: "corps" | "sector" | "subsector";
  sectorId?: SectorNodeId | string;
  brief: string;
};

export type SharedCorpsSnapshot = {
  networkBound: boolean;
  activeWorldEvents: CorpsWorldEvent[];
  openAssistanceRequests: AssistanceRequest[];
};
