import {
  STORAGE_KEY,
  VALID_CONSTRUCTS,
  VALID_EVIDENCE_IDS,
  VALID_PHASES,
} from "./data";
import type {
  ConstructKind,
  EvidenceId,
  PersistedState,
  Phase,
} from "./types";

function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && VALID_PHASES.includes(value as Phase);
}

function isEvidenceId(value: unknown): value is EvidenceId {
  return (
    typeof value === "string" &&
    VALID_EVIDENCE_IDS.includes(value as EvidenceId)
  );
}

function isConstructKind(value: unknown): value is ConstructKind {
  return (
    typeof value === "string" &&
    VALID_CONSTRUCTS.includes(value as ConstructKind)
  );
}

export function normalizePersistedState(
  parsed: Partial<PersistedState>,
): Partial<PersistedState> {
  const reviewed = Array.isArray(parsed.reviewed)
    ? Array.from(new Set(parsed.reviewed.filter(isEvidenceId)))
    : [];

  let phase: Phase = isPhase(parsed.phase) ? parsed.phase : "boot";

  if ((phase === "selection" || phase === "lantern") && reviewed.length < 3) {
    phase = "case";
  }

  const contactScanned = parsed.contactScanned === true;
  const correlated = parsed.correlated === true || contactScanned;

  const constructsBuilt = Array.isArray(parsed.constructsBuilt)
    ? Array.from(new Set(parsed.constructsBuilt.filter(isConstructKind)))
    : [];

  const activeEvidenceId = isEvidenceId(parsed.activeEvidenceId)
    ? parsed.activeEvidenceId
    : reviewed.at(-1);

  const ringSerial =
    typeof parsed.ringSerial === "string" &&
    /^2814-\d{8}$/.test(parsed.ringSerial)
      ? parsed.ringSerial
      : undefined;

  const selectedAt =
    typeof parsed.selectedAt === "string" &&
    !Number.isNaN(Date.parse(parsed.selectedAt))
      ? parsed.selectedAt
      : undefined;

  return {
    phase,
    reviewed,
    lanternName:
      typeof parsed.lanternName === "string"
        ? parsed.lanternName.slice(0, 64)
        : undefined,
    ringSerial,
    correlated,
    contactScanned,
    selectedAt,
    constructsBuilt,
    activeEvidenceId,
    soundEnabled: parsed.soundEnabled !== false,
  };
}

export function loadPersistedState(): Partial<PersistedState> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizePersistedState(
      JSON.parse(raw) as Partial<PersistedState>,
    );
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedState() {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
