import type {
  CorpsRuntimeContext,
  RingCitation,
  RingKnowledgeRecord,
  RingQueryResult,
} from "./domain";
import { buildRingKnowledge } from "./knowledge";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "the",
  "to",
  "what",
  "where",
  "why",
  "with",
]);

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9%\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function scoreRecord(record: RingKnowledgeRecord, query: string) {
  const queryTokens = tokens(query);
  if (queryTokens.length === 0) return 0;

  const title = normalize(record.title);
  const body = normalize(record.body);
  const tags = record.tags.map(normalize);
  const normalizedQuery = normalize(query);

  let score = 0;

  if (title.includes(normalizedQuery)) score += 8;
  if (body.includes(normalizedQuery)) score += 5;

  for (const token of queryTokens) {
    if (title.includes(token)) score += 4;
    if (tags.some((tag) => tag.includes(token))) score += 3;
    if (body.includes(token)) score += 1;
  }

  return score;
}

function toCitation(record: RingKnowledgeRecord): RingCitation {
  return {
    id: record.id,
    title: record.title,
    sourceLabel: record.sourceLabel,
    authority: record.origin.authority,
  };
}

function composeKnown(records: RingKnowledgeRecord[]) {
  if (records.length === 1) return records[0].body;

  return records
    .slice(0, 3)
    .map((record) => record.body)
    .join(" ");
}

function isWhyQuestion(query: string) {
  return normalize(query).startsWith("why ");
}

export function askRing(
  query: string,
  context: CorpsRuntimeContext,
): RingQueryResult {
  const knowledge = buildRingKnowledge(context);
  const ranked = knowledge
    .map((record) => ({ record, score: scoreRecord(record, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const bestScore = ranked[0]?.score ?? 0;
  const strong = ranked.filter(
    (item) => item.score >= Math.max(4, bestScore - 3),
  );

  const restricted = strong.filter(
    (item) => item.record.access === "restricted",
  );
  const open = strong.filter((item) => item.record.access === "open");

  if (open.length === 0 && restricted.length > 0) {
    return {
      classification: "RESTRICTED",
      answer:
        "Relevant records exist, but they are not available at the current case state. Review or unlock the source record before the ring can answer from it.",
      citations: restricted.slice(0, 3).map(({ record }) => toCitation(record)),
      matchedRecordIds: restricted.map(({ record }) => record.id),
    };
  }

  if (open.length === 0 || bestScore < 4) {
    return {
      classification: "UNKNOWN",
      answer:
        "The current archive does not contain enough grounded information to answer that question.",
      citations: [],
      matchedRecordIds: [],
    };
  }

  const topOpen = open.slice(0, 3).map(({ record }) => record);

  if (isWhyQuestion(query)) {
    const asksAboutSeal = /seal|sealed|restrict|guardian/.test(normalize(query));

    if (asksAboutSeal) {
      const record = knowledge.find((item) => item.id === "evidence-record");
      const citations = record ? [toCitation(record)] : [];

      return {
        classification: record?.access === "open" ? "KNOWN" : "RESTRICTED",
        answer:
          record?.access === "open"
            ? "The record confirms that a Guardian seal was applied after the field report, but the current archive does not state the motive. The ring will not invent one."
            : "The relevant Corps record has not been reviewed in the current case state.",
        citations,
        matchedRecordIds: record ? [record.id] : [],
      };
    }

    return {
      classification: "INFERRED",
      answer:
        `The archive supports this much: ${composeKnown(topOpen)} The causal explanation remains an inference unless a source record states it directly.`,
      citations: topOpen.map(toCitation),
      matchedRecordIds: topOpen.map((record) => record.id),
    };
  }

  return {
    classification: "KNOWN",
    answer: composeKnown(topOpen),
    citations: topOpen.map(toCitation),
    matchedRecordIds: topOpen.map((record) => record.id),
  };
}
