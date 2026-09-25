import { CASE_META, ORIGINS } from "../lanterns/canon";
import {
  constructPrograms,
  evidence,
  sectorNodes,
} from "../lanterns/data";
import type {
  CorpsRuntimeContext,
  RingKnowledgeRecord,
} from "./domain";
import { WAVEFORM_MATCH_PERCENT } from "../lanterns/waveform";

export function buildRingKnowledge(
  context: CorpsRuntimeContext,
): RingKnowledgeRecord[] {
  const records: RingKnowledgeRecord[] = [
    {
      id: "corps-oa",
      title: "OA",
      body:
        "Oa is the central world associated with the Green Lantern Corps and the Guardians of the Universe.",
      tags: ["oa", "guardians", "corps", "central", "world"],
      origin: ORIGINS.dcCorps,
      access: "open",
      system: "corps",
      sourceLabel: ORIGINS.dcCorps.sourceLabel ?? "DC reference",
    },
    {
      id: "corps-constructs",
      title: "POWER RING CONSTRUCTS",
      body:
        "Green Lantern rings can create hard-light constructs shaped by the wielder's will and intent.",
      tags: ["construct", "constructs", "ring", "hard light", "will"],
      origin: ORIGINS.dcCorps,
      access: "open",
      system: "construct",
      sourceLabel: ORIGINS.dcCorps.sourceLabel ?? "DC reference",
    },
    {
      id: "john-construction",
      title: "JOHN STEWART // CONSTRUCTION LOGIC",
      body:
        "John Stewart is an architect; Universe-1218 training reflects that background by resolving load path, supports, joints, and surface instead of treating structure as decoration.",
      tags: ["john", "stewart", "architect", "construction", "bridge", "structure"],
      origin: ORIGINS.dcJohn,
      access: "open",
      system: "construct",
      sourceLabel: ORIGINS.dcJohn.sourceLabel ?? "DC reference",
    },
    {
      id: "rushville-premise",
      title: "RUSHVILLE INVESTIGATION",
      body:
        "Universe-1218 adapts the Lanterns premise of Hal Jordan and John Stewart investigating a murder in Rushville, Nebraska.",
      tags: ["rushville", "murder", "hal", "jordan", "john", "stewart", "nebraska"],
      origin: CASE_META.premiseOrigin,
      access: "open",
      system: "case",
      sourceLabel:
        CASE_META.premiseOrigin.sourceLabel ?? "Lanterns official reference",
    },
  ];

  for (const item of evidence) {
    const reviewed = context.reviewed.includes(item.id);

    records.push({
      id: `evidence-${item.id}`,
      title: item.title.toUpperCase(),
      body: reviewed
        ? [item.summary, ...item.detail].join(" ")
        : "This case record has not been reviewed in the current Lantern record.",
      tags: [
        item.id,
        item.label.toLowerCase(),
        item.title.toLowerCase(),
        "2814-e/001",
        "rushville",
      ],
      origin: item.origin,
      access: reviewed ? "open" : "restricted",
      system: "case",
      sourceLabel: `CASE ${CASE_META.id} // ${item.label}`,
    });
  }

  if (context.correlated) {
    records.push({
      id: "finding-waveform",
      title: "WAVEFORM CORRELATION",
      body:
        `The stored Rushville trace and prior-contact trace produce a ${WAVEFORM_MATCH_PERCENT}% Pearson correlation. The earlier record is off-world.`,
      tags: [
        "waveform",
        "correlation",
        "signal",
        "prior contact",
        "off-world",
        String(WAVEFORM_MATCH_PERCENT),
      ],
      origin: ORIGINS.u1218Original,
      access: "open",
      system: "case",
      sourceLabel: `CASE ${CASE_META.id} // RING ANALYSIS`,
    });
  }

  if (context.contactScanned) {
    records.push({
      id: "finding-spatial-echo",
      title: "SPATIAL ECHO",
      body:
        "The unresolved contact returns the same signature from three incompatible projected origins. Range remains unresolved.",
      tags: [
        "spatial echo",
        "three origins",
        "three",
        "contact",
        "sector",
        "signal",
        "range",
      ],
      origin: ORIGINS.u1218Original,
      access: "open",
      system: "sector",
      sourceLabel: `CASE ${CASE_META.id} // SECTOR SCAN`,
    });
  }

  for (const [kind, program] of Object.entries(constructPrograms)) {
    records.push({
      id: `construct-${kind}`,
      title: program.name,
      body:
        `${program.purpose} Structure: ${program.structure}. Assembly order: ${program.buildOrder.join(" → ")}.`,
      tags: [
        kind,
        "construct",
        program.trainingClass.toLowerCase(),
        program.structure.toLowerCase(),
      ],
      origin: program.origin,
      access: "open",
      system: "construct",
      sourceLabel: `RING TRAINING // ${program.name}`,
    });
  }

  for (const node of sectorNodes) {
    records.push({
      id: `sector-${node.id}`,
      title: node.name,
      body:
        node.id === "dark" && context.contactScanned
          ? "Three return paths are visible in the local Sector 2814 projection. Range is unresolved."
          : node.detail,
      tags: [node.id, node.name.toLowerCase(), "sector", "2814"],
      origin: node.origin,
      access:
        node.id === "dark" && !context.correlated ? "restricted" : "open",
      system: "sector",
      sourceLabel: `SECTOR 2814 // ${node.name}`,
    });
  }

  return records;
}
