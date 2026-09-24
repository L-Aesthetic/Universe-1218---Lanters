"use client";

import { useEffect, useState } from "react";

import {
  PLACEHOLDER_SERIAL,
  VALID_CONSTRUCTS,
  VALID_EVIDENCE_IDS,
  VALID_PHASES,
  constructPrograms,
  evidence,
  sectorNodes,
} from "../lib/lanterns/data";
import { CASE_META, ORIGINS } from "../lib/lanterns/canon";
import { createRingSerial, ringFeedback } from "../lib/lanterns/device";
import {
  deriveCaseIntelligence,
  deriveSelectionObservation,
} from "../lib/lanterns/intelligence";
import {
  clearPersistedState,
  loadPersistedState,
  savePersistedState,
} from "../lib/lanterns/storage";
import type {
  ArchiveRecordId,
  ConstructKind,
  Evidence,
  EvidenceId,
  PersistedState,
  Phase,
  RingSystem,
  SectorNodeId,
} from "../lib/lanterns/types";
import type { RecordOrigin } from "../lib/lanterns/canon";

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

function LanternMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={compact ? "lantern-mark lantern-mark--compact" : "lantern-mark"}
    >
      <span className="lantern-mark__cap lantern-mark__cap--top" />
      <span className="lantern-mark__core" />
      <span className="lantern-mark__cap lantern-mark__cap--bottom" />
    </span>
  );
}

function Classification({ value }: { value: string }) {
  return <span className="classification">{value}</span>;
}

function RecordOriginBadge({ origin }: { origin: RecordOrigin }) {
  return (
    <span
      className={`origin-badge origin-badge--${origin.confidence}`}
      title={origin.note ?? origin.sourceLabel ?? origin.label}
    >
      {origin.label}
    </span>
  );
}

function PowerRingArtifact() {
  return (
    <span className="power-ring" aria-hidden="true">
      <span className="power-ring__band" />
      <span className="power-ring__face">
        <span className="power-ring__inlay power-ring__inlay--top" />
        <span className="power-ring__inlay power-ring__inlay--left" />
        <span className="power-ring__core">
          <i className="power-ring__core-ring power-ring__core-ring--one" />
          <i className="power-ring__core-ring power-ring__core-ring--two" />
          <i className="power-ring__core-ring power-ring__core-ring--three" />
          <i className="power-ring__core-ring power-ring__core-ring--four" />
          <i className="power-ring__core-dot" />
        </span>
        <span className="power-ring__inlay power-ring__inlay--right" />
        <span className="power-ring__inlay power-ring__inlay--bottom" />
      </span>
      <span className="power-ring__energy" />
    </span>
  );
}

function EvidenceCard({
  item,
  reviewed,
  active,
  onOpen,
}: {
  item: Evidence;
  reviewed: boolean;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      className={[
        "evidence-card",
        reviewed ? "evidence-card--reviewed" : "",
        active ? "evidence-card--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onOpen}
      aria-pressed={active}
    >
      <span className="evidence-card__index">{item.index}</span>
      <span className="evidence-card__copy">
        <span className="eyebrow">{item.label}</span>
        <strong>{item.title}</strong>
        <span>{item.summary}</span>
      </span>
      <span className="evidence-card__state">
        {reviewed ? "REVIEWED" : "OPEN"}
      </span>
    </button>
  );
}

function BootScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <section className="screen screen--boot">
      <div className="stars" aria-hidden="true" />
      <div className="boot-scan" aria-hidden="true" />
      <div className="boot-center">
        <LanternMark />
        <div className="boot-kicker">UNIVERSE-1218</div>
        <h1 data-phase-heading tabIndex={-1}>OAN CENTRAL ARCHIVE</h1>
        <p>Remote archive handshake detected in Sector 2814.</p>
        <div className="boot-readout" aria-label="archive connection status">
          <span>
            <b>SECTOR</b>
            <em>2814</em>
          </span>
          <span>
            <b>LOCAL DESIGNATION</b>
            <em>EARTH</em>
          </span>
          <span>
            <b>UNRESOLVED INCIDENTS</b>
            <em>01</em>
          </span>
        </div>
        <button className="primary-action" type="button" onClick={onEnter}>
          <span>ESTABLISH ARCHIVE LINK</span>
          <i aria-hidden="true">→</i>
        </button>
      </div>
      <div className="corner-readout corner-readout--left">
        ACCESS NODE // EARTH
      </div>
      <div className="corner-readout corner-readout--right">
        AUTHORITY // UNVERIFIED
      </div>
    </section>
  );
}

function ArchiveScreen({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="screen screen--archive">
      <div className="archive-shell">
        <header className="archive-header">
          <div className="archive-brand">
            <LanternMark compact />
            <span>
              <b>OAN CENTRAL ARCHIVE</b>
              <small>UNIVERSE-1218 // SECTOR 2814</small>
            </span>
          </div>
          <Classification value="OBSERVER ACCESS" />
        </header>

        <main className="archive-main">
          <div className="archive-orbit" aria-hidden="true">
            <span className="orbit orbit--one" />
            <span className="orbit orbit--two" />
            <span className="orbit orbit--three" />
            <span className="earth-node">
              <i />
            </span>
            <span className="incident-pulse" />
          </div>

          <div className="archive-copy">
            <div className="eyebrow">ACTIVE INCIDENT // {CASE_META.id}</div>
            <h2 data-phase-heading tabIndex={-1}>The body is local.<br />The signal is not.</h2>
            <p>
              Local authorities logged a homicide. Corps telemetry logged
              something else. The two records cannot both be complete.
            </p>

            <dl className="incident-facts">
              <div>
                <dt>STATUS</dt>
                <dd>ACTIVE</dd>
              </div>
              <div>
                <dt>ASSIGNED</dt>
                <dd>JORDAN, H. / STEWART, J.</dd>
              </div>
              <div>
                <dt>LOCATION</dt>
                <dd>{CASE_META.location}</dd>
              </div>
              <div>
                <dt>CONTINUITY</dt>
                <dd>{CASE_META.continuity}</dd>
              </div>
              <div>
                <dt>ANOMALY</dt>
                <dd>UNCLASSIFIED</dd>
              </div>
            </dl>

            <button className="primary-action" type="button" onClick={onOpen}>
              <span>OPEN INCIDENT 2814-E/001</span>
              <i aria-hidden="true">→</i>
            </button>
          </div>
        </main>

        <footer className="archive-footer">
          <span>ARCHIVE LATENCY 18MS</span>
          <span>U1218 ADAPTATION // FAN CONTINUITY</span>
          <span>EARTH RELAY 04 ONLINE</span>
        </footer>
      </div>
    </section>
  );
}

function CaseScreen({
  reviewed,
  activeId,
  onOpenEvidence,
  onInterrupt,
}: {
  reviewed: EvidenceId[];
  activeId: EvidenceId;
  onOpenEvidence: (id: EvidenceId) => void;
  onInterrupt: () => void;
}) {
  const active = evidence.find((item) => item.id === activeId) ?? evidence[0];
  const complete = reviewed.length === evidence.length;

  return (
    <section className="screen screen--case">
      <div className="case-shell">
        <header className="case-header">
          <div className="archive-brand">
            <LanternMark compact />
            <span>
              <h1 className="case-title" data-phase-heading tabIndex={-1}>CASE {CASE_META.id}</h1>
              <small>{CASE_META.location}</small>
            </span>
          </div>
          <div className="case-progress">
            <span>{String(reviewed.length).padStart(2, "0")}</span>
            <i>/</i>
            <b>{String(evidence.length).padStart(2, "0")}</b>
            <small>EVIDENCE REVIEWED</small>
          </div>
        </header>

        <div className="case-grid">
          <aside className="evidence-list" aria-label="case evidence">
            <div className="eyebrow">AVAILABLE RECORDS</div>
            {evidence.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                reviewed={reviewed.includes(item.id)}
                active={active.id === item.id}
                onOpen={() => onOpenEvidence(item.id)}
              />
            ))}
          </aside>

          <article className="evidence-view">
            <div className="evidence-view__topline">
              <span>{active.label}</span>
              <span className="evidence-authority">
                <RecordOriginBadge origin={active.origin} />
                <Classification
                  value={
                    active.status === "verified"
                      ? "MEASURED"
                      : active.status === "conflict"
                        ? "CONFLICT"
                        : "PARTIAL RECORD"
                  }
                />
              </span>
            </div>

            <figure className="forensic-field">
              <div aria-hidden="true">
                <span className="forensic-grid" />
                <span className="forensic-body">
                  <i className="body-head" />
                  <i className="body-spine" />
                  <i className="body-arm body-arm--left" />
                  <i className="body-arm body-arm--right" />
                  <i className="body-leg body-leg--left" />
                  <i className="body-leg body-leg--right" />
                </span>
                <span className="forensic-origin">
                  <i />
                  <b>UNKNOWN EMISSION</b>
                  <small>11.7 M</small>
                </span>
                <span className="forensic-time">02:17:43.811</span>
              </div>
              <figcaption className="sr-only">
                Two-dimensional ring telemetry reconstruction of the Rushville
                scene. The body position is known; an anomalous emission was
                measured 11.7 meters north of the victim. Unknown movement is
                deliberately not drawn.
              </figcaption>
            </figure>

            <div className="evidence-detail">
              <div>
                <div className="eyebrow">ARCHIVE SUMMARY</div>
                <h2>{active.title}</h2>
                <p>{active.summary}</p>
              </div>
              <ul>
                {active.detail.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            {complete ? (
              <button
                className="interrupt-action"
                type="button"
                aria-label="Continue to observer scan"
                onClick={onInterrupt}
              >
                <span className="interrupt-action__pulse" aria-hidden="true" />
                <span>
                  <b>ARCHIVE INTERFERENCE DETECTED</b>
                  <small>Unregistered observer scan in progress</small>
                </span>
                <i aria-hidden="true">CONTINUE</i>
              </button>
            ) : (
              <div className="case-hint">
                Review the remaining records. The archive will not resolve an
                incomplete sequence.
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

function SelectionScreen({
  reviewed,
  soundEnabled,
  onAccept,
}: {
  reviewed: EvidenceId[];
  soundEnabled: boolean;
  onAccept: () => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const observation = deriveSelectionObservation(reviewed);

  const accept = () => {
    if (accepting) return;
    setAccepting(true);
    ringFeedback("confirm", { sound: soundEnabled });
    window.setTimeout(onAccept, 900);
  };

  return (
    <section
      className={`screen screen--selection ${accepting ? "screen--accepting" : ""}`}
      onPointerMove={(event) => {
        if (accepting) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 22;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
        event.currentTarget.style.setProperty("--ring-x", `${x.toFixed(2)}px`);
        event.currentTarget.style.setProperty("--ring-y", `${y.toFixed(2)}px`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--ring-x", "0px");
        event.currentTarget.style.setProperty("--ring-y", "0px");
      }}
    >
      <div className="selection-noise" aria-hidden="true" />
      <div className="selection-copy selection-copy--top">
        ARCHIVE CONNECTION TERMINATED
      </div>

      <div className="ring-approach" aria-hidden="true">
        <span className="ring-halo ring-halo--outer" />
        <span className="ring-halo ring-halo--middle" />
        <span className="ring-halo ring-halo--inner" />
        <PowerRingArtifact />
      </div>

      <div className="selection-dialogue">
        <div className="selection-system">UNREGISTERED SENTIENT DETECTED</div>

        <div className="selection-receipts" aria-label="observer activity">
          <span>
            <small>FIRST INQUIRY</small>
            <b>{observation.firstInquiry}</b>
          </span>
          <span>
            <small>RECORDS REVIEWED</small>
            <b>{String(reviewed.length).padStart(2, "0")} / 03</b>
          </span>
          <span>
            <small>CASE ABANDONED</small>
            <b>NO</b>
          </span>
        </div>

        <div className="selection-origin">
          <span>
            ORIGIN <b>EARTH</b>
          </span>
          <span>
            SECTOR <b>2814</b>
          </span>
        </div>
        <div className="selection-observation">{observation.persistence}</div>
        <h2 data-phase-heading tabIndex={-1}>Human of Earth.</h2>
        <p>You have the ability to overcome great fear.</p>
        <div className="selection-verdict">SELECTION CRITERIA SATISFIED</div>
        <button
          className="accept-ring"
          type="button"
          disabled={accepting}
          onClick={accept}
        >
          <span>{accepting ? "RING LINK ESTABLISHING" : "PUT ON THE RING"}</span>
        </button>
      </div>
    </section>
  );
}

function LanternScreen({
  lanternName,
  ringSerial,
  correlated,
  contactScanned,
  selectedAt,
  constructsBuilt,
  reviewed,
  soundEnabled,
  onSetName,
  onCorrelate,
  onScanContact,
  onBuildConstruct,
  onToggleSound,
  onReset,
}: {
  lanternName: string;
  ringSerial: string;
  correlated: boolean;
  contactScanned: boolean;
  selectedAt: string;
  constructsBuilt: ConstructKind[];
  reviewed: EvidenceId[];
  soundEnabled: boolean;
  onSetName: (name: string) => void;
  onCorrelate: () => void;
  onScanContact: () => void;
  onBuildConstruct: (kind: ConstructKind) => void;
  onToggleSound: () => void;
  onReset: () => void;
}) {
  const [draftName, setDraftName] = useState(lanternName);
  const [system, setSystem] = useState<RingSystem>("record");
  const [construct, setConstruct] = useState<ConstructKind>("shield");
  const [constructPulse, setConstructPulse] = useState(0);
  const [archiveRecord, setArchiveRecord] = useState<ArchiveRecordId>("prior");
  const [sectorNode, setSectorNode] = useState<SectorNodeId>("sol");
  const [shareState, setShareState] = useState<
    "idle" | "copied" | "shared" | "failed"
  >("idle");
  const [announcement, setAnnouncement] = useState("");
  const [resetArmed, setResetArmed] = useState(false);
  const hasName = lanternName.trim().length > 0;
  const selectedLabel = selectedAt
    ? new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(new Date(selectedAt))
        .toUpperCase()
    : "DATE PENDING";

  const activeArchive =
    archiveRecord === "prior"
      ? {
          label: "PRIOR CONTACT // NEW CLEARANCE",
          title: "Record 2814-Δ/19",
          summary:
            "The same waveform was logged before either current Earth Lantern entered Corps service.",
          detail: [
            "Original Lantern assignment remains sealed.",
            "Waveform correlation with current scene: 91.4%.",
            "Incident location is not Earth.",
            "Guardian seal was applied after the field report was filed.",
            "The final 88% of this record remains inaccessible.",
          ],
          access: "UNSEALED 12%",
          origin: ORIGINS.u1218Original,
        }
      : (() => {
          const item = evidence.find((entry) => entry.id === archiveRecord) ?? evidence[0];
          return {
            label: item.label,
            title: item.title,
            summary: item.summary,
            detail: item.detail,
            access: item.status === "restricted" ? "PARTIAL" : "OPEN",
            origin: item.origin,
          };
        })();

  const activeSector =
    sectorNodes.find((node) => node.id === sectorNode) ?? sectorNodes[0];

  const caseIntel = deriveCaseIntelligence({
    reviewed,
    correlated,
    contactScanned,
  });

  const feedback = (kind: "soft" | "confirm" | "alert") =>
    ringFeedback(kind, { sound: soundEnabled });

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>(
        "[data-system-heading]",
      );
      heading?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [system]);


  const openSystem = (next: RingSystem) => {
    feedback(next === "construct" ? "confirm" : "soft");
    setSystem(next);
  };

  const runConstruct = (next: ConstructKind) => {
    setConstruct(next);
    setConstructPulse((value) => value + 1);
    onBuildConstruct(next);
    setAnnouncement(`${constructPrograms[next].name} registered in your training record.`);
    feedback("confirm");
  };

  const requestReset = () => {
    if (resetArmed) {
      onReset();
      return;
    }

    setResetArmed(true);
    setAnnouncement(
      "Reset armed. Activate reset again to erase this local Lantern record.",
    );
    window.setTimeout(() => setResetArmed(false), 5000);
  };

  const shareRingRecord = async () => {
    const displayName = hasName ? lanternName.toUpperCase() : "UNREGISTERED LANTERN";
    const text = `${displayName} // LANTERN ${ringSerial} // SECTOR 2814 // U1218`;
    const shareData = {
      title: "Green Lantern Corps service record",
      text: `${text}\nThe ring chose me. See if it chooses you.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState("shared");
        setAnnouncement("Ring record transmitted.");
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        setShareState("copied");
        setAnnouncement("Ring record copied.");
      }
      feedback("soft");
      window.setTimeout(() => setShareState("idle"), 2600);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareState("failed");
      setAnnouncement("Ring record could not be shared on this device.");
      window.setTimeout(() => setShareState("idle"), 2600);
    }
  };

  return (
    <section className="screen screen--lantern">
      <div className="lantern-shell">
        <header className="lantern-header">
          <div className="archive-brand">
            <LanternMark compact />
            <span>
              <b>GREEN LANTERN CORPS</b>
              <small>ACTIVE RING LINK // SECTOR 2814</small>
            </span>
          </div>
          <div className="lantern-header__status">
            <button
              className="ring-audio-toggle"
              type="button"
              onClick={() => {
                onToggleSound();
                setAnnouncement(
                  `Ring audio ${soundEnabled ? "disabled" : "enabled"}.`,
                );
              }}
              aria-pressed={soundEnabled}
            >
              AUDIO // {soundEnabled ? "ON" : "OFF"}
            </button>
            <Classification value="RING LINK ACTIVE" />
          </div>
        </header>

        <main className="ring-system">
          {system === "record" && (
            <div className="lantern-main">
              <section className="identity-panel">
                <div className="identity-sigil" aria-hidden="true">
                  <span className="identity-sigil__ring" />
                  <LanternMark />
                </div>

                <div className="identity-copy">
                  <div className="eyebrow">CORPS SERVICE RECORD</div>
                  <h1 data-phase-heading data-system-heading tabIndex={-1}>
                    {hasName ? lanternName.toUpperCase() : "IDENTITY PENDING"}
                  </h1>
                  <div className="lantern-id-line">
                    <span>
                      <p className="lantern-number">LANTERN {ringSerial}</p>
                      <small>SELECTED // {selectedLabel}</small>
                    </span>
                    <button type="button" onClick={shareRingRecord}>
                      {shareState === "copied"
                        ? "RECORD COPIED"
                        : shareState === "shared"
                          ? "TRANSMISSION SENT"
                          : shareState === "failed"
                            ? "SHARE FAILED"
                            : "SHARE RING RECORD"}
                    </button>
                  </div>

                  {!hasName ? (
                    <form
                      className="identity-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const next = draftName.trim();
                        if (next) {
                          onSetName(next);
                          feedback("confirm");
                        }
                      }}
                    >
                      <label htmlFor="lantern-name">
                        Corps identification
                        <small>
                          Your name stays in this browser in the current prototype.
                        </small>
                      </label>
                      <div>
                        <input
                          id="lantern-name"
                          value={draftName}
                          onChange={(event) => setDraftName(event.target.value)}
                          autoComplete="name"
                          maxLength={64}
                          placeholder="Enter your name"
                        />
                        <button type="submit">CONFIRM</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="record-grid">
                        <span><small>SPECIES</small><b>HUMAN</b></span>
                        <span><small>HOMEWORLD</small><b>EARTH</b></span>
                        <span><small>SECTOR</small><b>2814</b></span>
                        <span><small>STATUS</small><b>ACTIVE</b></span>
                        <span><small>ASSIGNMENTS</small><b>01</b></span>
                        <span><small>CONSTRUCTS</small><b>{String(constructsBuilt.length).padStart(2, "0")}</b></span>
                      </div>
                      {correlated ? (
                        <div className="service-log">
                          <div className="eyebrow">SERVICE LOG // FIELD RECORD</div>
                          <div>
                            <span>
                              <small>CASE</small>
                              <b>2814-E/001</b>
                            </span>
                            <span>
                              <small>ACTION</small>
                              <b>WAVEFORM CORRELATION</b>
                            </span>
                            <span>
                              <small>RESULT</small>
                              <b>91.4% MATCH // OFF-WORLD ORIGIN</b>
                            </span>
                            {contactScanned ? (
                              <>
                                <span>
                                  <small>CASE</small>
                                  <b>2814-E/001</b>
                                </span>
                                <span>
                                  <small>ACTION</small>
                                  <b>REMOTE CONTACT SCAN</b>
                                </span>
                                <span>
                                  <small>RESULT</small>
                                  <b>MULTIPLE ORIGINS // SINGLE SIGNATURE</b>
                                </span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </section>

              <section className="assignment-panel">
                <div className="assignment-panel__heading">
                  <span>
                    <small>CURRENT ASSIGNMENT</small>
                    <b>2814-E/001</b>
                  </span>
                  <Classification value={caseIntel.status} />
                </div>

                <div className="assignment-panel__body">
                  <div>
                    <span className="assignment-pulse" aria-hidden="true" />
                    <p>
                      The ring reopened the case from the evidence you reviewed.
                      Your findings now change what the archive asks next.
                    </p>
                  </div>
                  <dl>
                    <div><dt>OBJECTIVE</dt><dd>{caseIntel.objective}</dd></div>
                    <div><dt>CASE STAGE</dt><dd>{caseIntel.stage.toUpperCase()}</dd></div>
                    <div><dt>RING STATUS</dt><dd>99.7% charge.</dd></div>
                  </dl>
                  <div className="finding-strip" aria-label="current case findings">
                    {caseIntel.findings.slice(-3).map((finding) => (
                      <span key={finding.id}>
                        <small>{finding.confidence}</small>
                        <b>{finding.label}</b>
                      </span>
                    ))}
                  </div>
                  <button className="system-link" type="button" onClick={() => openSystem("case")}>
                    OPEN FIELD ASSIGNMENT <span>→</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {system === "case" && (
            <section className="system-panel">
              <div className="system-panel__header">
                <span>
                  <div className="eyebrow">FIELD ASSIGNMENT</div>
                  <h2 data-system-heading tabIndex={-1}>{CASE_META.id}</h2>
                </span>
                <Classification value={caseIntel.status} />
              </div>
              <div className="field-case-grid">
                <article>
                  <small>PRIMARY QUESTION</small>
                  <h3>{caseIntel.question}</h3>
                  <p>
                    This question is derived from the evidence currently in your
                    record. It changes as the case changes.
                  </p>
                </article>
                <dl>
                  <div><dt>JORDAN, H.</dt><dd>Active field assignment. Position withheld.</dd></div>
                  <div><dt>STEWART, J.</dt><dd>Active field assignment. Earth-local.</dd></div>
                  <div><dt>PRIOR CONTACT</dt><dd>Guardian seal remains partially enforced.</dd></div>
                  <div>
                    <dt>NEXT ACTION</dt>
                    <dd>
                      {caseIntel.nextAction}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className={`waveform-console ${correlated ? "waveform-console--matched" : ""}`}>
                <div className="waveform-console__header">
                  <span>
                    <small>CURRENT TRACE</small>
                    <b>2814-E/001 // 02:13:41.811</b>
                  </span>
                  <span>
                    <small>HISTORIC TRACE</small>
                    <b>2814-Δ/19 // DATE SEALED</b>
                  </span>
                </div>
                <figure className="waveform-figure">
                  <div className="waveform-plot" aria-hidden="true">
                    <span className="waveform waveform--current" />
                    <span className="waveform waveform--historic" />
                    <i className="waveform-marker waveform-marker--a" />
                    <i className="waveform-marker waveform-marker--b" />
                    <i className="waveform-marker waveform-marker--c" />
                  </div>
                  <figcaption className="sr-only">
                    Waveform comparison between the current Rushville trace and
                    sealed record 2814 delta 19. A completed analysis shows a
                    91.4 percent harmonic correlation.
                  </figcaption>
                </figure>
                <div className="waveform-console__result">
                  {correlated ? (
                    <>
                      <span><small>CORRELATION</small><b>91.4%</b></span>
                      <p>
                        The two emissions share a non-random harmonic structure.
                        The historic event did not occur on Earth.
                      </p>
                    </>
                  ) : (
                    <p>
                      Two records are available. The ring has not compared them.
                    </p>
                  )}
                </div>
              </div>

              {!correlated ? (
                <button
                  className="system-link"
                  type="button"
                  onClick={() => {
                    onCorrelate();
                    setAnnouncement(
                      "Waveform correlation complete. Match: 91.4 percent. Historical origin is off-world.",
                    );
                    feedback("confirm");
                  }}
                >
                  RUN WAVEFORM CORRELATION <span>→</span>
                </button>
              ) : !contactScanned ? (
                <button
                  className="system-link"
                  type="button"
                  onClick={() => {
                    setSectorNode("dark");
                    openSystem("sector");
                  }}
                >
                  TRACE MATCHING SIGNAL IN SECTOR 2814 <span>→</span>
                </button>
              ) : (
                <div className="case-next-locked">
                  <span>NEXT ANALYSIS</span>
                  <b>PHASE-OFFSET COMPARISON</b>
                  <small>
                    Not implemented in this vertical slice. The case stops here
                    rather than pretending the next tool exists.
                  </small>
                </div>
              )}
            </section>
          )}

          {system === "archive" && (
            <section className="system-panel">
              <div className="system-panel__header">
                <span>
                  <div className="eyebrow">RING ARCHIVE</div>
                  <h2 data-system-heading tabIndex={-1}>Partial clearance.</h2>
                </span>
                <Classification value="LANTERN ACCESS" />
              </div>
              <div className="archive-workspace">
                <div className="archive-records">
                  {evidence.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setArchiveRecord(item.id);
                        feedback("soft");
                      }}
                      className={`archive-record ${archiveRecord === item.id ? "archive-record--active" : ""}`}
                    >
                      <span>{item.index}</span>
                      <div>
                        <small>{item.label}</small>
                        <b>{item.title}</b>
                        <p>{item.summary}</p>
                      </div>
                      <i>{item.status === "restricted" ? "PARTIAL" : "OPEN"}</i>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setArchiveRecord("prior");
                      feedback("confirm");
                    }}
                    className={`archive-record archive-record--new ${archiveRecord === "prior" ? "archive-record--active" : ""}`}
                  >
                    <span>04</span>
                    <div>
                      <small>PRIOR CONTACT // NEW CLEARANCE</small>
                      <b>Record 2814-Δ/19</b>
                      <p>
                        The same waveform was logged before either current Earth
                        Lantern entered Corps service.
                      </p>
                    </div>
                    <i>UNSEALED 12%</i>
                  </button>
                </div>

                <aside className="archive-inspector">
                  <div className="eyebrow">{activeArchive.label}</div>
                  <h3>{activeArchive.title}</h3>
                  <p>{activeArchive.summary}</p>
                  <ul>
                    {activeArchive.detail.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  <div className="archive-inspector__authority">
                    <RecordOriginBadge origin={activeArchive.origin} />
                    <Classification value={activeArchive.access} />
                  </div>
                  {activeArchive.origin.sourceLabel ? (
                    <small className="source-note">
                      Source basis: {activeArchive.origin.sourceLabel}
                    </small>
                  ) : null}
                </aside>
              </div>
            </section>
          )}

          {system === "sector" && (
            <section className="system-panel system-panel--sector">
              <div className="system-panel__header">
                <span>
                  <div className="eyebrow">SECTOR NAVIGATION</div>
                  <h2 data-system-heading tabIndex={-1}>Sector 2814.</h2>
                </span>
                <Classification value="LIVE MAP" />
              </div>
              <div className="sector-field">
                <div className="sector-radar" aria-hidden="true">
                  <span className="sector-ring sector-ring--a" />
                  <span className="sector-ring sector-ring--b" />
                  <span className="sector-ring sector-ring--c" />
                  <span className="sector-axis sector-axis--x" />
                  <span className="sector-axis sector-axis--y" />
                  <i className="sector-point sector-point--earth" />
                  <i className="sector-point sector-point--relay" />
                  <i className="sector-point sector-point--unknown" />
                </div>
                <div className="sector-node-stack">
                  <div className="sector-node-list">
                    {sectorNodes.map((node) => (
                      <button
                        type="button"
                        key={node.id}
                        className={sectorNode === node.id ? "active" : ""}
                        onClick={() => {
                          setSectorNode(node.id as SectorNodeId);
                          feedback(node.id === "dark" ? "alert" : "soft");
                        }}
                      >
                        <span>
                          <b>{node.name}</b>
                          <small>{node.detail}</small>
                        </span>
                        <i>{node.id === "dark" && contactScanned ? "ECHO DETECTED" : node.status}</i>
                      </button>
                    ))}
                  </div>
                  <div className="sector-inspector">
                    <small>SELECTED CONTACT</small>
                    <b>{activeSector.name}</b>
                    <p>{activeSector.detail}</p>
                    <span>
                      {activeSector.id === "dark" && contactScanned
                        ? "ECHO DETECTED"
                        : activeSector.status}
                    </span>
                    <RecordOriginBadge origin={activeSector.origin} />
                    {activeSector.id === "dark" ? (
                      <>
                        <em>
                          {contactScanned
                            ? "The same signature is arriving from three incompatible coordinates. The ring classifies the contact as an echo, not a single object."
                            : "Bearing remains fixed while distance changes. The ring cannot reconcile the contact with known local motion."}
                        </em>
                        {correlated && !contactScanned ? (
                          <button
                            type="button"
                            className="system-link sector-scan-action"
                            onClick={() => {
                              onScanContact();
                              setAnnouncement(
                                "Contact scan complete. One signature is resolving from three incompatible coordinates.",
                              );
                              feedback("alert");
                            }}
                          >
                            SCAN UNRESOLVED CONTACT <span>→</span>
                          </button>
                        ) : null}
                        {contactScanned ? (
                          <div className="sector-scan-result">
                            <span><small>CONTACT TYPE</small><b>SPATIAL ECHO</b></span>
                            <span><small>ORIGINS</small><b>03</b></span>
                            <span><small>SIGNATURE</small><b>91.4% MATCH</b></span>
                          </div>
                        ) : null}
                      </>
                    ) : activeSector.id === "oa" ? (
                      <em>
                        Direct route data is withheld at the current ring clearance.
                        Corps relay remains available.
                      </em>
                    ) : activeSector.id === "relay" ? (
                      <em>
                        Relay 2814-04 is carrying the archive session and your
                        new ring identity.
                      </em>
                    ) : (
                      <em>
                        Earth is the current origin point for your ring link and
                        Incident 2814-E/001.
                      </em>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {system === "construct" && (
            <section className="system-panel system-panel--construct">
              <div className="system-panel__header">
                <span>
                  <div className="eyebrow">CONSTRUCT TRAINING // BASIC FORM</div>
                  <h2 data-system-heading tabIndex={-1}>Build the load path first.</h2>
                </span>
                <Classification value="TRAINING" />
              </div>

              <div className="construct-layout">
                <div className="construct-stage" key={constructPulse + construct}>
                  <div className={`construct construct--${construct}`} aria-hidden="true">
                    <span className="construct-part construct-part--one" />
                    <span className="construct-part construct-part--two" />
                    <span className="construct-part construct-part--three" />
                    <span className="construct-part construct-part--four" />
                  </div>
                  <div className="construct-readout">
                    <span><small>PROGRAM</small><b>{constructPrograms[construct].name}</b></span>
                    <span><small>STABILITY</small><b>{construct === "bridge" ? "84.2%" : "98.6%"}</b></span>
                    <span><small>DRAW</small><b>{construct === "beacon" ? "LOW" : "NOMINAL"}</b></span>
                  </div>
                </div>

                <div className="construct-controls">
                  <div>
                    <small>PURPOSE</small>
                    <p>{constructPrograms[construct].purpose}</p>
                  </div>
                  <div>
                    <small>RING ASSESSMENT</small>
                    <p>{constructPrograms[construct].note}</p>
                  </div>
                  <div>
                    <small>ASSEMBLY ORDER</small>
                    <ol className="construct-order">
                      {constructPrograms[construct].buildOrder.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <RecordOriginBadge origin={constructPrograms[construct].origin} />
                  <div className="construct-programs">
                    {(Object.keys(constructPrograms) as ConstructKind[]).map((kind) => (
                      <button
                        type="button"
                        key={kind}
                        className={[
                          kind === construct ? "active" : "",
                          constructsBuilt.includes(kind) ? "registered" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => runConstruct(kind)}
                      >
                        <span>{constructPrograms[kind].name}</span>
                        <i>{constructsBuilt.includes(kind) ? "REGISTERED" : "BUILD"}</i>
                      </button>
                    ))}
                  </div>
                  <button className="system-link" type="button" onClick={() => runConstruct(construct)}>
                    REBUILD CONSTRUCT <span>↻</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>

        <div className="sr-only" role="status" aria-live="polite">
          {announcement}
        </div>

        <nav className="ring-dock" aria-label="Lantern systems">
          <button
            type="button"
            className={`ring-dock__item ${system === "case" ? "ring-dock__item--active" : ""}`}
            onClick={() => openSystem("case")}
          >
            <i>01</i><b>CASE</b>
          </button>
          <button
            type="button"
            className={`ring-dock__item ${system === "archive" ? "ring-dock__item--active" : ""}`}
            onClick={() => openSystem("archive")}
          >
            <i>02</i><b>ARCHIVE</b>
          </button>
          <button
            type="button"
            className={`ring-dock__core ${system === "record" ? "ring-dock__core--active" : ""}`}
            onClick={() => openSystem("record")}
            aria-label="Open Lantern service record"
          >
            <LanternMark compact />
          </button>
          <button
            type="button"
            className={`ring-dock__item ${system === "sector" ? "ring-dock__item--active" : ""}`}
            onClick={() => openSystem("sector")}
          >
            <i>03</i><b>SECTOR</b>
          </button>
          <button
            type="button"
            className={`ring-dock__item ${system === "construct" ? "ring-dock__item--active" : ""}`}
            onClick={() => openSystem("construct")}
          >
            <i>04</i><b>CONSTRUCT</b>
          </button>
        </nav>

        <button
          className={`prototype-reset ${resetArmed ? "prototype-reset--armed" : ""}`}
          type="button"
          onClick={requestReset}
        >
          {resetArmed ? "CONFIRM LOCAL RESET" : "RESET LOCAL RECORD"}
        </button>
      </div>
    </section>
  );
}

export function LanternExperience() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [reviewed, setReviewed] = useState<EvidenceId[]>([]);
  const [activeId, setActiveId] = useState<EvidenceId>("scene");
  const [lanternName, setLanternName] = useState("");
  const [ringSerial, setRingSerial] = useState(PLACEHOLDER_SERIAL);
  const [correlated, setCorrelated] = useState(false);
  const [contactScanned, setContactScanned] = useState(false);
  const [selectedAt, setSelectedAt] = useState("");
  const [constructsBuilt, setConstructsBuilt] = useState<ConstructKind[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // This mount effect intentionally hydrates React state from the external
  // browser storage system. It is kept isolated from ordinary render logic.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const parsed = loadPersistedState();

    if (parsed) {
      const persistedPhase = isPhase(parsed.phase) ? parsed.phase : "boot";
      const persistedContactScanned = parsed.contactScanned === true;
      const persistedCorrelated =
        parsed.correlated === true || persistedContactScanned;
      const persistedReviewed = Array.isArray(parsed.reviewed)
        ? Array.from(new Set(parsed.reviewed.filter(isEvidenceId)))
        : [];

      setPhase(persistedPhase);
      setReviewed(persistedReviewed);

      if (isEvidenceId(parsed.activeEvidenceId)) {
        setActiveId(parsed.activeEvidenceId);
      } else if (persistedReviewed.length > 0) {
        setActiveId(persistedReviewed[persistedReviewed.length - 1]);
      }

      if (typeof parsed.lanternName === "string") {
        setLanternName(parsed.lanternName.slice(0, 64));
      }

      if (
        typeof parsed.ringSerial === "string" &&
        /^2814-\d{8}$/.test(parsed.ringSerial)
      ) {
        setRingSerial(parsed.ringSerial);
      } else if (persistedPhase === "lantern") {
        setRingSerial(createRingSerial());
      }

      setCorrelated(persistedCorrelated);
      setContactScanned(persistedContactScanned);
      setSoundEnabled(parsed.soundEnabled !== false);

      if (
        typeof parsed.selectedAt === "string" &&
        !Number.isNaN(Date.parse(parsed.selectedAt))
      ) {
        setSelectedAt(parsed.selectedAt);
      } else if (persistedPhase === "lantern") {
        setSelectedAt(new Date().toISOString());
      }

      if (Array.isArray(parsed.constructsBuilt)) {
        setConstructsBuilt(
          Array.from(new Set(parsed.constructsBuilt.filter(isConstructKind))),
        );
      }
    }

    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const state: PersistedState = {
      phase,
      reviewed,
      lanternName,
      ringSerial,
      correlated,
      contactScanned,
      selectedAt,
      constructsBuilt,
      activeEvidenceId: activeId,
      soundEnabled,
    };
    savePersistedState(state);
  }, [
    activeId,
    contactScanned,
    constructsBuilt,
    correlated,
    hydrated,
    lanternName,
    phase,
    reviewed,
    ringSerial,
    selectedAt,
    soundEnabled,
  ]);

  useEffect(() => {
    if (!hydrated) return;

    const frame = window.requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>("[data-phase-heading]");
      heading?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [hydrated, phase]);

  const openEvidence = (id: EvidenceId) => {
    setActiveId(id);
    setReviewed((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const acceptRing = () => {
    if (ringSerial === PLACEHOLDER_SERIAL) {
      setRingSerial(createRingSerial());
    }
    if (!selectedAt) {
      setSelectedAt(new Date().toISOString());
    }
    setPhase("lantern");
  };

  const resetPrototype = () => {
    clearPersistedState();
    setReviewed([]);
    setActiveId("scene");
    setLanternName("");
    setRingSerial(PLACEHOLDER_SERIAL);
    setCorrelated(false);
    setContactScanned(false);
    setSelectedAt("");
    setConstructsBuilt([]);
    setSoundEnabled(true);
    setPhase("boot");
  };

  if (!hydrated) {
    return (
      <main className="experience experience--loading">
        <LanternMark />
      </main>
    );
  }

  return (
    <main className="experience">
      {phase === "boot" && <BootScreen onEnter={() => setPhase("archive")} />}
      {phase === "archive" && <ArchiveScreen onOpen={() => setPhase("case")} />}
      {phase === "case" && (
        <CaseScreen
          reviewed={reviewed}
          activeId={activeId}
          onOpenEvidence={openEvidence}
          onInterrupt={() => {
            ringFeedback("alert", { sound: soundEnabled });
            setPhase("selection");
          }}
        />
      )}
      {phase === "selection" && (
        <SelectionScreen
          reviewed={reviewed}
          soundEnabled={soundEnabled}
          onAccept={acceptRing}
        />
      )}
      {phase === "lantern" && (
        <LanternScreen
          lanternName={lanternName}
          ringSerial={ringSerial}
          correlated={correlated}
          contactScanned={contactScanned}
          selectedAt={selectedAt}
          constructsBuilt={constructsBuilt}
          reviewed={reviewed}
          soundEnabled={soundEnabled}
          onSetName={setLanternName}
          onCorrelate={() => setCorrelated(true)}
          onScanContact={() => setContactScanned(true)}
          onBuildConstruct={(kind) =>
            setConstructsBuilt((current) =>
              current.includes(kind) ? current : [...current, kind],
            )
          }
          onToggleSound={() => setSoundEnabled((current) => !current)}
          onReset={resetPrototype}
        />
      )}

      <div className="fan-disclaimer">
        UNOFFICIAL FAN PROJECT // UNIVERSE-1218 // NOT AFFILIATED WITH OR
        LICENSED BY DC OR WARNER BROS. DISCOVERY
      </div>
    </main>
  );
}
