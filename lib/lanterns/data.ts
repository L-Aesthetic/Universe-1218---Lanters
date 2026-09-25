import type {
  CaseTimelineEvent,
  ConstructKind,
  Evidence,
  EvidenceId,
  Phase,
} from "./types";
import { ORIGINS } from "./canon";

export const STORAGE_KEY = "u1218-lantern-state-v1";
export const PLACEHOLDER_SERIAL = "2814-00000000";

export const VALID_PHASES: Phase[] = [
  "boot",
  "archive",
  "case",
  "selection",
  "lantern",
];

export const VALID_EVIDENCE_IDS: EvidenceId[] = [
  "scene",
  "witness",
  "record",
];

export const VALID_CONSTRUCTS: ConstructKind[] = [
  "shield",
  "bridge",
  "beacon",
];


export const CASE_CLOCK = {
  emission: "02:13:41.811",
  witnessFlash: "≈02:14",
  cameraCorruption: "≈02:14",
  gridOutage: "02:17",
  bodyDiscovered: "02:17:41.811",
} as const;

export const caseTimeline: CaseTimelineEvent[] = [
  {
    id: "emission",
    time: CASE_CLOCK.emission,
    label: "ANOMALOUS EMISSION",
    detail: "Ring telemetry records a 0.81 second event north of the later body position.",
    source: "RING TELEMETRY",
    certainty: "exact",
  },
  {
    id: "witness-flash",
    time: CASE_CLOCK.witnessFlash,
    label: "GREEN-WHITE FLASH REPORTED",
    detail: "Witness timing is approximate and independently overlaps the first camera metadata corruption.",
    source: "WITNESS",
    certainty: "approximate",
  },
  {
    id: "camera-corruption",
    time: CASE_CLOCK.cameraCorruption,
    label: "CAMERA METADATA CORRUPTION",
    detail: "Street camera metadata begins corrupting before the municipal incident log starts.",
    source: "MUNICIPAL",
    certainty: "approximate",
  },
  {
    id: "grid-outage",
    time: CASE_CLOCK.gridOutage,
    label: "POWER OUTAGE LOGGED",
    detail: "The local incident sequence begins with the municipal grid failure.",
    source: "MUNICIPAL",
    certainty: "exact",
  },
  {
    id: "body-discovered",
    time: CASE_CLOCK.bodyDiscovered,
    label: "BODY DISCOVERED",
    detail: "Discovery occurs exactly four minutes after the ring-recorded emission.",
    source: "DISCOVERY",
    certainty: "exact",
  },
];

export const evidence: Evidence[] = [
  {
    id: "scene",
    index: "01",
    label: "SCENE TELEMETRY",
    title: "Energy trace",
    summary:
      `A 0.81 second emission was recorded at ${CASE_CLOCK.emission}, exactly four minutes before the body was discovered.`,
    detail: [
      "Origin: 11.7 meters north of the victim.",
      `Emission time: ${CASE_CLOCK.emission}.`,
      "Duration: 0.81 seconds.",
      `Body discovered: ${CASE_CLOCK.bodyDiscovered}.`,
      "Known Earth technology match: none.",
      "Known Green Lantern ring signature match: none.",
      "The trace ends without a corresponding departure vector.",
    ],
    status: "observed",
    origin: ORIGINS.u1218Original,
  },
  {
    id: "witness",
    index: "02",
    label: "WITNESS STATEMENT",
    title: "The light came first",
    summary:
      "A witness and municipal camera metadata both place unexplained activity before the local incident log begins.",
    detail: [
      `Witness reports a green-white flash at approximately ${CASE_CLOCK.witnessFlash.replace("≈", "")}.`,
      `Street camera metadata begins corrupting at approximately ${CASE_CLOCK.cameraCorruption.replace("≈", "")}.`,
      `The municipal incident log begins with the grid outage at ${CASE_CLOCK.gridOutage}.`,
      "The witness could not identify a vehicle, aircraft, or person entering the scene.",
      "The local timeline is incomplete: two independent records show activity before the event local authorities treated as the beginning.",
    ],
    status: "unresolved",
    origin: ORIGINS.u1218Original,
  },
  {
    id: "record",
    index: "03",
    label: "OAN RECORD",
    title: "Prior contact",
    summary:
      "A sealed Corps record references the same waveform decades before the current incident.",
    detail: [
      "Archive family: Sector 2814 / anomalous contact.",
      "Original assignment: restricted.",
      "Outcome: restricted.",
      "Lantern testimony: removed from public service record.",
      "Reason for restriction: Guardian authorization required.",
    ],
    status: "restricted",
    origin: ORIGINS.u1218Adaptation,
  },
];

export const sectorNodes = [
  {
    id: "sol",
    name: "SOL",
    detail: "LOCAL SYSTEM // EARTH",
    status: "ACTIVE",
    origin: ORIGINS.u1218Adaptation,
  },
  {
    id: "oa",
    name: "OA",
    detail: "CORPS CENTRAL // ROUTE CLASSIFIED",
    status: "LINKED",
    origin: ORIGINS.dcCorps,
  },
  {
    id: "relay",
    name: "RELAY 2814-04",
    detail: "DEEP-SPACE ARCHIVE RELAY",
    status: "ONLINE",
    origin: ORIGINS.u1218Original,
  },
  {
    id: "dark",
    name: "UNKNOWN CONTACT",
    detail: "BEARING 044.18 // DISTANCE UNRESOLVED",
    status: "UNRESOLVED",
    origin: ORIGINS.u1218Original,
  },
] as const;

export const constructPrograms: Record<
  ConstructKind,
  {
    name: string;
    purpose: string;
    note: string;
    origin: typeof ORIGINS.u1218Original | typeof ORIGINS.u1218Adaptation;
    buildOrder: string[];
    structure: string;
    trainingClass: string;
  }
> = {
  shield: {
    name: "DEFENSIVE SHIELD",
    purpose: "Disperse frontal impact across a continuous energy surface.",
    note: "A continuous surface is only the last layer; the ring resolves the rim and internal bracing first.",
    origin: ORIGINS.u1218Adaptation,
    buildOrder: ["FIELD AXIS", "RIM", "INNER BRACING", "ENERGY SURFACE"],
    structure: "RADIAL BRACING",
    trainingClass: "DEFENSIVE FORM",
  },
  bridge: {
    name: "LOAD-BEARING BRIDGE",
    purpose: "Carry distributed weight across an unsupported span.",
    note: "Structural members must resolve the load path before the walking surface is filled.",
    origin: ORIGINS.u1218Adaptation,
    buildOrder: ["LOAD PATH", "SUPPORTS", "JOINTS", "WALKING SURFACE"],
    structure: "SUPPORTED SPAN",
    trainingClass: "STRUCTURAL FORM",
  },
  beacon: {
    name: "DISTRESS BEACON",
    purpose: "Broadcast a Corps-recognizable emergency signature.",
    note: "The exercise is about maintaining a clear carrier pattern rather than building a weapon.",
    origin: ORIGINS.u1218Original,
    buildOrder: ["CORE", "CARRIER", "REPEATER FIELD", "BROADCAST"],
    structure: "CONCENTRIC CARRIER",
    trainingClass: "UTILITY FORM",
  },
};
