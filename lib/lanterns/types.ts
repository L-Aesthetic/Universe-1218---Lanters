import type { RecordOrigin } from "./canon";

export type Phase = "boot" | "archive" | "case" | "selection" | "lantern";

export type EvidenceId = "scene" | "witness" | "record";

export type Evidence = {
  id: EvidenceId;
  index: string;
  label: string;
  title: string;
  summary: string;
  detail: string[];
  status: "verified" | "conflict" | "restricted";
  origin: RecordOrigin;
};

export type PersistedState = {
  phase: Phase;
  reviewed: EvidenceId[];
  lanternName?: string;
  ringSerial?: string;
  correlated?: boolean;
  contactScanned?: boolean;
  selectedAt?: string;
  constructsBuilt?: ConstructKind[];
  activeEvidenceId?: EvidenceId;
  soundEnabled?: boolean;
};

export type RingSystem =
  | "record"
  | "case"
  | "archive"
  | "sector"
  | "construct";

export type ConstructKind = "shield" | "bridge" | "beacon";
export type ArchiveRecordId = EvidenceId | "prior";
export type SectorNodeId = "sol" | "oa" | "relay" | "dark";
