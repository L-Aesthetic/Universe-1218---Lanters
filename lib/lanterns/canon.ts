export type CanonAuthority =
  | "DC_OFFICIAL_REFERENCE"
  | "LANTERNS_2026"
  | "U1218_ADAPTATION"
  | "U1218_ORIGINAL";

export type CanonConfidence = "verified" | "adapted" | "original";

export type RecordOrigin = {
  authority: CanonAuthority;
  confidence: CanonConfidence;
  label: string;
  sourceLabel?: string;
  sourceUrl?: string;
  note?: string;
};

export const ORIGINS = {
  dcCorps: {
    authority: "DC_OFFICIAL_REFERENCE",
    confidence: "verified",
    label: "DC REFERENCE",
    sourceLabel: "Green Lantern Corps | Official DC Character",
    sourceUrl: "https://www.dc.com/characters/green-lantern-corps",
  },
  dcJohn: {
    authority: "DC_OFFICIAL_REFERENCE",
    confidence: "verified",
    label: "DC REFERENCE",
    sourceLabel: "John Stewart | Official DC Character",
    sourceUrl: "https://www.dc.com/characters/john-stewart",
  },
  lanternsPremise: {
    authority: "LANTERNS_2026",
    confidence: "verified",
    label: "LANTERNS REFERENCE",
    sourceLabel: "The Lanterns Stars Shine a Light on Their Rushville Residents",
    sourceUrl:
      "https://www.dc.com/blog/2026-08-14/the-lanterns-stars-shine-a-light-on-their-rushville-residents",
  },
  u1218Adaptation: {
    authority: "U1218_ADAPTATION",
    confidence: "adapted",
    label: "U1218 ADAPTATION",
    note:
      "Uses established Green Lantern concepts inside the project's alternate continuity.",
  },
  u1218Original: {
    authority: "U1218_ORIGINAL",
    confidence: "original",
    label: "U1218 ORIGINAL",
    note:
      "Created for this fan continuity; not presented as official DC canon.",
  },
} satisfies Record<string, RecordOrigin>;

export const CASE_META = {
  id: "2814-E/001",
  continuity: "UNIVERSE-1218",
  location: "RUSHVILLE, NEBRASKA // EARTH // SECTOR 2814",
  premiseOrigin: ORIGINS.lanternsPremise,
  recordOrigin: ORIGINS.u1218Adaptation,
} as const;
