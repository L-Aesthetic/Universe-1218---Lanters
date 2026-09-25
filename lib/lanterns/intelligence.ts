import { WAVEFORM_MATCH_PERCENT } from "./waveform";
import type {
  EvidenceId,
  RingSystem,
} from "./types";

export type CaseStage =
  | "archive-review"
  | "waveform-correlation"
  | "sector-trace"
  | "spatial-echo";

export type CaseFinding = {
  id: string;
  label: string;
  detail: string;
  confidence: "observed" | "correlated" | "unresolved";
};

export type CaseIntelligence = {
  stage: CaseStage;
  status: string;
  question: string;
  objective: string;
  nextAction: string;
  recommendedSystem: RingSystem;
  findings: CaseFinding[];
};

export function deriveCaseIntelligence(input: {
  reviewed: EvidenceId[];
  correlated: boolean;
  contactScanned: boolean;
}): CaseIntelligence {
  const { reviewed, correlated, contactScanned } = input;

  const findings: CaseFinding[] = [];

  if (reviewed.includes("scene")) {
    findings.push({
      id: "scene-emission",
      label: "ANOMALOUS EMISSION",
      detail:
        "A short-duration energy event was measured before the body was discovered.",
      confidence: "observed",
    });
  }

  if (reviewed.includes("witness")) {
    findings.push({
      id: "pre-incident-activity",
      label: "LOCAL TIMELINE INCOMPLETE",
      detail:
        "Witness testimony and camera metadata both place unexplained activity before the municipal incident log begins.",
      confidence: "unresolved",
    });
  }

  if (reviewed.includes("record")) {
    findings.push({
      id: "prior-contact",
      label: "PRIOR CONTACT",
      detail:
        "A sealed Corps-era record contains a related waveform family.",
      confidence: "unresolved",
    });
  }

  if (correlated) {
    findings.push({
      id: "waveform-match",
      label: "WAVEFORM MATCH",
      detail:
        `Current and historical traces share a ${WAVEFORM_MATCH_PERCENT}% Pearson correlation across the stored sample set.`,
      confidence: "correlated",
    });
  }

  if (contactScanned) {
    findings.push({
      id: "spatial-echo",
      label: "SPATIAL ECHO",
      detail:
        "One signature resolves simultaneously from three incompatible coordinates.",
      confidence: "observed",
    });

    return {
      stage: "spatial-echo",
      status: "ESCALATED",
      question: "How can one signature arrive from three places?",
      objective:
        "Resolve whether the three-origin echo is propagation, duplication, or deliberate masking.",
      nextAction:
        "Compare the phase offset between the three returned signal paths.",
      recommendedSystem: "sector",
      findings,
    };
  }

  if (correlated) {
    return {
      stage: "sector-trace",
      status: "CORRELATION FOUND",
      question: "Where did the matching signal originate?",
      objective: "Trace the matching off-world signature through Sector 2814.",
      nextAction: "Scan the unresolved contact associated with the waveform.",
      recommendedSystem: "sector",
      findings,
    };
  }

  if (reviewed.length === 3) {
    return {
      stage: "waveform-correlation",
      status: "REOPENED",
      question: "Why was the prior-contact record sealed?",
      objective:
        "Test whether the historical record and current scene describe the same phenomenon.",
      nextAction: "Run a waveform correlation between the two traces.",
      recommendedSystem: "case",
      findings,
    };
  }

  return {
    stage: "archive-review",
    status: "ACTIVE",
    question: "What happened in Rushville?",
    objective: "Review the available records without assuming they agree.",
    nextAction: "Continue reviewing unresolved evidence.",
    recommendedSystem: "archive",
    findings,
  };
}

export function deriveSelectionObservation(reviewed: EvidenceId[]) {
  const first = reviewed[0];

  const firstInquiry =
    first === "record"
      ? "SEALED CORPS RECORD"
      : first === "witness"
        ? "WITNESS TESTIMONY"
        : "SCENE TELEMETRY";

  const method =
    first === "record"
      ? "You tested the restricted record before the physical trace."
      : first === "witness"
        ? "You checked the witness account before the instruments."
        : "You started with measured scene data before testimony.";

  return {
    firstInquiry,
    method,
    persistence:
      reviewed.length === 3
        ? "You kept the case open after the records stopped agreeing."
        : "Investigation incomplete.",
  };
}
