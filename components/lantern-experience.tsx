"use client";

import { useEffect, useState } from "react";

type Phase = "boot" | "archive" | "case" | "selection" | "lantern";
type EvidenceId = "scene" | "witness" | "record";
type RingSystem = "record" | "case" | "archive" | "sector" | "construct";
type ConstructKind = "shield" | "bridge" | "beacon";
type ArchiveRecordId = EvidenceId | "prior";
type SectorNodeId = "sol" | "oa" | "relay" | "dark";

type Evidence = {
  id: EvidenceId;
  index: string;
  label: string;
  title: string;
  summary: string;
  detail: string[];
  status: "verified" | "conflict" | "restricted";
};

type PersistedState = {
  phase: Phase;
  reviewed: EvidenceId[];
  lanternName?: string;
  ringSerial?: string;
};

const STORAGE_KEY = "u1218-lantern-state-v1";
const PLACEHOLDER_SERIAL = "2814-00000000";
const VALID_PHASES: Phase[] = ["boot", "archive", "case", "selection", "lantern"];
const VALID_EVIDENCE_IDS: EvidenceId[] = ["scene", "witness", "record"];

function isPhase(value: unknown): value is Phase {
  return typeof value === "string" && VALID_PHASES.includes(value as Phase);
}

function isEvidenceId(value: unknown): value is EvidenceId {
  return (
    typeof value === "string" &&
    VALID_EVIDENCE_IDS.includes(value as EvidenceId)
  );
}

function createRingSerial() {
  const random = new Uint32Array(1);
  window.crypto.getRandomValues(random);
  return `2814-${String(random[0] % 100000000).padStart(8, "0")}`;
}

const sectorNodes = [
  { id: "sol", name: "SOL", detail: "LOCAL SYSTEM // EARTH", status: "ACTIVE" },
  { id: "oa", name: "OA", detail: "CORPS CENTRAL // ROUTE CLASSIFIED", status: "LINKED" },
  { id: "relay", name: "RELAY 2814-04", detail: "DEEP-SPACE ARCHIVE RELAY", status: "ONLINE" },
  { id: "dark", name: "UNKNOWN CONTACT", detail: "BEARING 044.18 // DISTANCE UNRESOLVED", status: "UNRESOLVED" },
] as const;

const constructPrograms: Record<ConstructKind, { name: string; purpose: string; note: string }> = {
  shield: {
    name: "DEFENSIVE SHIELD",
    purpose: "Disperse frontal impact across a continuous energy surface.",
    note: "Stable. Low complexity. Suitable for first-form training.",
  },
  bridge: {
    name: "LOAD-BEARING BRIDGE",
    purpose: "Carry distributed weight across an unsupported span.",
    note: "Structural members must resolve load before the surface is filled.",
  },
  beacon: {
    name: "DISTRESS BEACON",
    purpose: "Broadcast a Corps-recognizable emergency signature.",
    note: "Non-combat construct. High persistence, low energy demand.",
  },
};

function ringFeedback(kind: "soft" | "confirm" | "alert") {
  if (typeof window === "undefined") return;

  if ("vibrate" in navigator) {
    navigator.vibrate(
      kind === "alert" ? [18, 32, 26] : kind === "confirm" ? [12, 18, 22] : 8,
    );
  }

  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const now = audio.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      kind === "alert" ? 180 : kind === "confirm" ? 420 : 320,
      now,
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      kind === "alert" ? 92 : kind === "confirm" ? 720 : 410,
      now + 0.16,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(kind === "confirm" ? 0.055 : 0.03, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
    oscillator.addEventListener("ended", () => {
      void audio.close();
    });
  } catch {
    // Sound is enhancement only; browser policy or device support may block it.
  }
}

const evidence: Evidence[] = [
  {
    id: "scene",
    index: "01",
    label: "SCENE TELEMETRY",
    title: "Energy trace",
    summary:
      "A 0.8 second emission was recorded four minutes before the body was discovered.",
    detail: [
      "Origin: 11.7 meters north of the victim.",
      "Duration: 0.81 seconds.",
      "Known Earth technology match: none.",
      "Known Green Lantern ring signature match: none.",
      "The trace ends without a corresponding departure vector.",
    ],
    status: "verified",
  },
  {
    id: "witness",
    index: "02",
    label: "WITNESS STATEMENT",
    title: "The light came first",
    summary:
      "A nearby witness places the anomalous light before the documented power failure.",
    detail: [
      "Witness reports a green-white flash at approximately 02:14.",
      "Municipal grid records place the outage at 02:17.",
      "Street camera metadata begins corrupting three minutes before the outage.",
      "The witness could not identify a vehicle, aircraft, or person entering the scene.",
      "The sequence conflicts with the official incident timeline.",
    ],
    status: "conflict",
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
  },
];

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

function SelectionScreen({ onAccept }: { onAccept: () => void }) {
  const [accepting, setAccepting] = useState(false);

  const accept = () => {
    if (accepting) return;
    setAccepting(true);
    ringFeedback("confirm");
    window.setTimeout(onAccept, 900);
  };

  return (
    <section className={`screen screen--selection ${accepting ? "screen--accepting" : ""}`}>
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
            <small>OFFICIAL SEQUENCE ACCEPTED</small>
            <b>NO</b>
          </span>
          <span>
            <small>TIMELINE CONFLICT PURSUED</small>
            <b>YES</b>
          </span>
          <span>
            <small>RESTRICTED RECORD EXAMINED</small>
            <b>YES</b>
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
  onSetName,
  onReset,
}: {
  lanternName: string;
  ringSerial: string;
  onSetName: (name: string) => void;
  onReset: () => void;
}) {
  const [draftName, setDraftName] = useState(lanternName);
  const [system, setSystem] = useState<RingSystem>("record");
  const [construct, setConstruct] = useState<ConstructKind>("shield");
  const [constructPulse, setConstructPulse] = useState(0);
  const [archiveRecord, setArchiveRecord] = useState<ArchiveRecordId>("prior");
  const [sectorNode, setSectorNode] = useState<SectorNodeId>("sol");
  const hasName = lanternName.trim().length > 0;

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

  const openSystem = (next: RingSystem) => {
    ringFeedback(next === "construct" ? "confirm" : "soft");
    setSystem(next);
  };

  const runConstruct = (next: ConstructKind) => {
    setConstruct(next);
    setConstructPulse((value) => value + 1);
    ringFeedback("confirm");
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
                  <p className="lantern-number">LANTERN {ringSerial}</p>

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
                    <div className="record-grid">
                      <span><small>SPECIES</small><b>HUMAN</b></span>
                      <span><small>HOMEWORLD</small><b>EARTH</b></span>
                      <span><small>SECTOR</small><b>2814</b></span>
                      <span><small>STATUS</small><b>PROBATIONARY</b></span>
                      <span><small>ASSIGNMENTS</small><b>01</b></span>
                      <span><small>OPEN CASES</small><b>01</b></span>
                    </div>
                  )}
                </div>
              </section>

              <section className="assignment-panel">
                <div className="assignment-panel__heading">
                  <span>
                    <small>CURRENT ASSIGNMENT</small>
                    <b>2814-E/001</b>
                  </span>
                  <Classification value="REOPENED" />
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
                    <div><dt>OBJECTIVE</dt><dd>Determine why the Oan record was restricted.</dd></div>
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
                <Classification value="REOPENED" />
              </div>
              <div className="field-case-grid">
                <article>
                  <small>PRIMARY QUESTION</small>
                  <h3>Why was the prior-contact record sealed?</h3>
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
                  <div><dt>NEXT ACTION</dt><dd>Compare historic waveform against current scene trace.</dd></div>
                </dl>
              </div>
              <button className="system-link" type="button" onClick={() => openSystem("archive")}>
                ACCESS PRIOR-CONTACT ARCHIVE <span>→</span>
              </button>
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
                        <i>{node.status}</i>
                      </button>
                    ))}
                  </div>
                  <div className="sector-inspector">
                    <small>SELECTED CONTACT</small>
                    <b>{activeSector.name}</b>
                    <p>{activeSector.detail}</p>
                    <span>{activeSector.status}</span>
                    {activeSector.id === "dark" ? (
                      <em>
                        Bearing remains fixed while distance changes. The ring
                        cannot reconcile the contact with known local motion.
                      </em>
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
                        className={kind === construct ? "active" : ""}
                        onClick={() => runConstruct(kind)}
                      >
                        {constructPrograms[kind].name}
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
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, lanternName, phase, reviewed, ringSerial]);

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
    setPhase("lantern");
  };

  const resetPrototype = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setReviewed([]);
    setActiveId("scene");
    setLanternName("");
    setRingSerial(PLACEHOLDER_SERIAL);
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
      {phase === "selection" && <SelectionScreen onAccept={acceptRing} />}
      {phase === "lantern" && (
        <LanternScreen
          lanternName={lanternName}
          ringSerial={ringSerial}
          onSetName={setLanternName}
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
