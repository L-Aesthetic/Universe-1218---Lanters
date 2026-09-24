"use client";

import { useEffect, useState } from "react";

import {
  PLACEHOLDER_SERIAL,
  STORAGE_KEY,
  VALID_CONSTRUCTS,
  VALID_EVIDENCE_IDS,
  VALID_PHASES,
  constructPrograms,
  evidence,
  sectorNodes,
} from "../lib/lanterns/data";
import { createRingSerial, ringFeedback } from "../lib/lanterns/device";
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
        <h1>OAN CENTRAL ARCHIVE</h1>
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
              <small>SECTOR 2814 // EARTH</small>
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
            <div className="eyebrow">ACTIVE INCIDENT // 2814-E/001</div>
            <h2>One death.<br />One impossible trace.</h2>
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
                <dd>EARTH // AMERICAN HEARTLAND</dd>
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
          <span>GUARDIAN OVERSIGHT ACTIVE</span>
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
              <b>CASE 2814-E/001</b>
              <small>ACTIVE INVESTIGATION</small>
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
              <Classification
                value={
                  active.status === "verified"
                    ? "CORPS VERIFIED"
                    : active.status === "conflict"
                      ? "TIMELINE CONFLICT"
                      : "PARTIAL ACCESS"
                }
              />
            </div>

            <div className="forensic-field" aria-hidden="true">
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
  onAccept,
}: {
  reviewed: EvidenceId[];
  onAccept: () => void;
}) {
  const [accepting, setAccepting] = useState(false);
  const firstReviewed = evidence.find((item) => item.id === reviewed[0]) ?? evidence[0];
  const firstAction =
    firstReviewed.id === "witness"
      ? "WITNESS TESTIMONY"
      : firstReviewed.id === "record"
        ? "RESTRICTED OAN RECORD"
        : "PHYSICAL TELEMETRY";

  const accept = () => {
    if (accepting) return;
    setAccepting(true);
    ringFeedback("confirm");
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
        <span className="power-ring">
          <span className="power-ring__face">
            <LanternMark compact />
          </span>
          <span className="power-ring__band" />
        </span>
      </div>

      <div className="selection-dialogue">
        <div className="selection-system">UNREGISTERED SENTIENT DETECTED</div>

        <div className="selection-receipts" aria-label="observer activity">
          <span>
            <small>FIRST INQUIRY</small>
            <b>{firstAction}</b>
          </span>
          <span>
            <small>TIMELINE CONFLICT PURSUED</small>
            <b>YES</b>
          </span>
          <span>
            <small>OFFICIAL SEQUENCE ACCEPTED</small>
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
        <h2>Human of Earth.</h2>
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
  onSetName,
  onCorrelate,
  onScanContact,
  onBuildConstruct,
  onReset,
}: {
  lanternName: string;
  ringSerial: string;
  correlated: boolean;
  contactScanned: boolean;
  selectedAt: string;
  constructsBuilt: ConstructKind[];
  onSetName: (name: string) => void;
  onCorrelate: () => void;
  onScanContact: () => void;
  onBuildConstruct: (kind: ConstructKind) => void;
  onReset: () => void;
}) {
  const [draftName, setDraftName] = useState(lanternName);
  const [system, setSystem] = useState<RingSystem>("record");
  const [construct, setConstruct] = useState<ConstructKind>("shield");
  const [constructPulse, setConstructPulse] = useState(0);
  const [archiveRecord, setArchiveRecord] = useState<ArchiveRecordId>("prior");
  const [sectorNode, setSectorNode] = useState<SectorNodeId>("sol");
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
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
        }
      : (() => {
          const item = evidence.find((entry) => entry.id === archiveRecord) ?? evidence[0];
          return {
            label: item.label,
            title: item.title,
            summary: item.summary,
            detail: item.detail,
            access: item.status === "restricted" ? "PARTIAL" : "VERIFIED",
          };
        })();

  const activeSector =
    sectorNodes.find((node) => node.id === sectorNode) ?? sectorNodes[0];

  const missionStatus = contactScanned
    ? "ESCALATED"
    : correlated
      ? "CORRELATION FOUND"
      : "REOPENED";

  const missionObjective = contactScanned
    ? "Determine why one signature is arriving from three incompatible origins."
    : correlated
      ? "Trace the matching off-world signal through Sector 2814."
      : "Determine why the prior-contact record was sealed.";

  const missionQuestion = contactScanned
    ? "How can one signal come from three places?"
    : correlated
      ? "Where did the matching signal originate?"
      : "Why was the prior-contact record sealed?";

  const openSystem = (next: RingSystem) => {
    ringFeedback(next === "construct" ? "confirm" : "soft");
    setSystem(next);
  };

  const runConstruct = (next: ConstructKind) => {
    setConstruct(next);
    setConstructPulse((value) => value + 1);
    onBuildConstruct(next);
    ringFeedback("confirm");
  };

  const shareRingRecord = async () => {
    const displayName = hasName ? lanternName.toUpperCase() : "UNREGISTERED LANTERN";
    const text = `${displayName} // LANTERN ${ringSerial} // SECTOR 2814 // PROBATIONARY`;
    const shareData = {
      title: "Green Lantern Corps service record",
      text: `${text}\nThe ring chose me. See if it chooses you.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareState("shared");
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        );
        setShareState("copied");
      }
      ringFeedback("soft");
      window.setTimeout(() => setShareState("idle"), 2600);
    } catch {
      // Closing the native share sheet is not an application error.
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
          <Classification value="PROBATIONARY" />
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
                  <h1>{hasName ? lanternName.toUpperCase() : "IDENTITY PENDING"}</h1>
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
                          ringFeedback("confirm");
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
                        <span><small>STATUS</small><b>PROBATIONARY</b></span>
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
                  <Classification value={missionStatus} />
                </div>

                <div className="assignment-panel__body">
                  <div>
                    <span className="assignment-pulse" aria-hidden="true" />
                    <p>
                      Your archive activity has been attached to the active
                      investigation.
                    </p>
                  </div>
                  <dl>
                    <div><dt>OBJECTIVE</dt><dd>{missionObjective}</dd></div>
                    <div><dt>AUTHORITY</dt><dd>Field access granted.</dd></div>
                    <div><dt>RING STATUS</dt><dd>99.7% charge.</dd></div>
                  </dl>
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
                  <h2>2814-E/001</h2>
                </span>
                <Classification value={missionStatus} />
              </div>
              <div className="field-case-grid">
                <article>
                  <small>PRIMARY QUESTION</small>
                  <h3>{missionQuestion}</h3>
                  <p>
                    Your access changed the moment the archive identified you.
                    The anomaly is still unclassified, but the earlier record is no
                    longer completely dark.
                  </p>
                </article>
                <dl>
                  <div><dt>JORDAN, H.</dt><dd>Active field assignment. Position withheld.</dd></div>
                  <div><dt>STEWART, J.</dt><dd>Active field assignment. Earth-local.</dd></div>
                  <div><dt>PRIOR CONTACT</dt><dd>Guardian seal remains partially enforced.</dd></div>
                  <div>
                    <dt>NEXT ACTION</dt>
                    <dd>
                      {contactScanned
                        ? "Resolve the three-origin spatial echo."
                        : correlated
                          ? "Trace the matching signal beyond Earth."
                          : "Compare historic waveform against current scene trace."}
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
                <div className="waveform-plot" aria-label="waveform comparison">
                  <span className="waveform waveform--current" />
                  <span className="waveform waveform--historic" />
                  <i className="waveform-marker waveform-marker--a" />
                  <i className="waveform-marker waveform-marker--b" />
                  <i className="waveform-marker waveform-marker--c" />
                </div>
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
                    ringFeedback("confirm");
                  }}
                >
                  RUN WAVEFORM CORRELATION <span>→</span>
                </button>
              ) : (
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
              )}
            </section>
          )}

          {system === "archive" && (
            <section className="system-panel">
              <div className="system-panel__header">
                <span>
                  <div className="eyebrow">RING ARCHIVE</div>
                  <h2>Partial clearance.</h2>
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
                        ringFeedback("soft");
                      }}
                      className={`archive-record ${archiveRecord === item.id ? "archive-record--active" : ""}`}
                    >
                      <span>{item.index}</span>
                      <div>
                        <small>{item.label}</small>
                        <b>{item.title}</b>
                        <p>{item.summary}</p>
                      </div>
                      <i>{item.status === "restricted" ? "PARTIAL" : "VERIFIED"}</i>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setArchiveRecord("prior");
                      ringFeedback("confirm");
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
                  <Classification value={activeArchive.access} />
                </aside>
              </div>
            </section>
          )}

          {system === "sector" && (
            <section className="system-panel system-panel--sector">
              <div className="system-panel__header">
                <span>
                  <div className="eyebrow">SECTOR NAVIGATION</div>
                  <h2>2814 is larger than Earth.</h2>
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
                          ringFeedback(node.id === "dark" ? "alert" : "soft");
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
                              ringFeedback("alert");
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
                        Direct route data is withheld from probationary Lantern
                        clearance. Corps relay remains available.
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
                  <h2>Intent is not structure.</h2>
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

        <button className="prototype-reset" type="button" onClick={onReset}>
          RESET PROTOTYPE
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (isPhase(parsed.phase)) setPhase(parsed.phase);
        if (Array.isArray(parsed.reviewed)) {
          setReviewed(parsed.reviewed.filter(isEvidenceId));
        }
        if (typeof parsed.lanternName === "string") {
          setLanternName(parsed.lanternName.slice(0, 64));
        }
        if (
          typeof parsed.ringSerial === "string" &&
          /^2814-\d{8}$/.test(parsed.ringSerial)
        ) {
          setRingSerial(parsed.ringSerial);
        }
        if (typeof parsed.correlated === "boolean") {
          setCorrelated(parsed.correlated);
        }
        if (typeof parsed.contactScanned === "boolean") {
          setContactScanned(parsed.contactScanned);
        }
        if (
          typeof parsed.selectedAt === "string" &&
          !Number.isNaN(Date.parse(parsed.selectedAt))
        ) {
          setSelectedAt(parsed.selectedAt);
        }
        if (Array.isArray(parsed.constructsBuilt)) {
          setConstructsBuilt(parsed.constructsBuilt.filter(isConstructKind));
        }
      }
    } catch {
      // A corrupt local prototype state should never block entry.
    } finally {
      setHydrated(true);
    }
  }, []);

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
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    contactScanned,
    constructsBuilt,
    correlated,
    hydrated,
    lanternName,
    phase,
    reviewed,
    ringSerial,
    selectedAt,
  ]);

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
    window.localStorage.removeItem(STORAGE_KEY);
    setReviewed([]);
    setActiveId("scene");
    setLanternName("");
    setRingSerial(PLACEHOLDER_SERIAL);
    setCorrelated(false);
    setContactScanned(false);
    setSelectedAt("");
    setConstructsBuilt([]);
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
            ringFeedback("alert");
            setPhase("selection");
          }}
        />
      )}
      {phase === "selection" && (
        <SelectionScreen reviewed={reviewed} onAccept={acceptRing} />
      )}
      {phase === "lantern" && (
        <LanternScreen
          lanternName={lanternName}
          ringSerial={ringSerial}
          correlated={correlated}
          contactScanned={contactScanned}
          selectedAt={selectedAt}
          constructsBuilt={constructsBuilt}
          onSetName={setLanternName}
          onCorrelate={() => setCorrelated(true)}
          onScanContact={() => setContactScanned(true)}
          onBuildConstruct={(kind) =>
            setConstructsBuilt((current) =>
              current.includes(kind) ? current : [...current, kind],
            )
          }
          onReset={resetPrototype}
        />
      )}

      <div className="fan-disclaimer">
        UNOFFICIAL, NON-COMMERCIAL FAN EXPERIENCE // GREEN LANTERN AND RELATED
        CHARACTERS ARE PROPERTY OF DC
      </div>
    </main>
  );
}
