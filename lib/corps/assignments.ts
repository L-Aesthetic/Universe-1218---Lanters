import type {
  CorpsAssignment,
  CorpsRuntimeContext,
} from "./domain";

export function deriveAssignments(
  context: CorpsRuntimeContext,
): CorpsAssignment[] {
  const reviewComplete = context.reviewed.length === 3;

  const assignments: CorpsAssignment[] = [
    {
      id: "2814-E-001-A",
      caseId: "2814-E/001",
      title: "ESTABLISH THE SEQUENCE",
      brief:
        "Build the earliest defensible sequence from scene, witness, and archive records.",
      objective: "Review all three available records.",
      state: reviewComplete ? "complete" : "active",
      targetSystem: "archive",
    },
    {
      id: "2814-E-001-B",
      caseId: "2814-E/001",
      title: "COMPARE PRIOR CONTACT",
      brief:
        "Test whether the historic Corps trace and the Rushville emission describe the same signal family.",
      objective: "Run the stored waveform correlation.",
      state: context.correlated
        ? "complete"
        : reviewComplete
          ? "available"
          : "blocked",
      targetSystem: "case",
      dependency: reviewComplete ? undefined : "ALL THREE RECORDS REQUIRED",
    },
    {
      id: "2814-E-001-C",
      caseId: "2814-E/001",
      title: "TRACE THE RETURN",
      brief:
        "Follow the correlated signal into the local Sector 2814 projection.",
      objective: "Scan the unresolved contact.",
      state: context.contactScanned
        ? "complete"
        : context.correlated
          ? "available"
          : "blocked",
      targetSystem: "sector",
      dependency: context.correlated ? undefined : "CORRELATION REQUIRED",
    },
    {
      id: "2814-E-001-D",
      caseId: "2814-E/001",
      title: "RESOLVE THE SPATIAL ECHO",
      brief:
        "Determine why one signature resolves across three incompatible return paths.",
      objective: "Compare the phase offset between the returned paths.",
      state: context.contactScanned ? "queued" : "blocked",
      targetSystem: "sector",
      dependency: context.contactScanned
        ? "PHASE-OFFSET TOOL NOT DEPLOYED"
        : "CONTACT SCAN REQUIRED",
    },
  ];

  return assignments;
}

export function getCurrentAssignment(assignments: CorpsAssignment[]) {
  return (
    assignments.find((assignment) => assignment.state === "active") ??
    assignments.find((assignment) => assignment.state === "available") ??
    assignments.find((assignment) => assignment.state === "queued") ??
    assignments.at(-1)
  );
}
