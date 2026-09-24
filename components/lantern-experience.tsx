"use client";

import { useEffect, useMemo, useState } from "react";

type Phase = "boot" | "archive" | "case" | "selection" | "lantern";
type EvidenceId = "scene" | "witness" | "record";

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
  return (
    <section className="screen screen--selection">
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
        <button className="accept-ring" type="button" onClick={onAccept}>
          <span>PUT ON THE RING</span>
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
  const hasName = lanternName.trim().length > 0;

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

        <main className="lantern-main">
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
                    if (next) onSetName(next);
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
                  <span>
                    <small>SPECIES</small>
                    <b>HUMAN</b>
                  </span>
                  <span>
                    <small>HOMEWORLD</small>
                    <b>EARTH</b>
                  </span>
                  <span>
                    <small>SECTOR</small>
                    <b>2814</b>
                  </span>
                  <span>
                    <small>STATUS</small>
                    <b>PROBATIONARY</b>
                  </span>
                  <span>
                    <small>ASSIGNMENTS</small>
                    <b>01</b>
                  </span>
                  <span>
                    <small>OPEN CASES</small>
                    <b>01</b>
                  </span>
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
                <div>
                  <dt>OBJECTIVE</dt>
                  <dd>Determine why the Oan record was restricted.</dd>
                </div>
                <div>
                  <dt>AUTHORITY</dt>
                  <dd>Field access granted.</dd>
                </div>
                <div>
                  <dt>RING STATUS</dt>
                  <dd>99.7% charge.</dd>
                </div>
              </dl>
            </div>
          </section>
        </main>

        <nav className="ring-dock" aria-label="Lantern systems">
          <span className="ring-dock__item ring-dock__item--active">
            <i>01</i>
            <b>CASE</b>
          </span>
          <span className="ring-dock__item">
            <i>02</i>
            <b>ARCHIVE</b>
          </span>
          <span className="ring-dock__core" aria-hidden="true">
            <LanternMark compact />
          </span>
          <span className="ring-dock__item ring-dock__item--locked">
            <i>03</i>
            <b>SECTOR</b>
          </span>
          <span className="ring-dock__item ring-dock__item--locked">
            <i>04</i>
            <b>CONSTRUCT</b>
          </span>
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
  const [ringSerial, setRingSerial] = useState("2814-000000");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.phase) setPhase(parsed.phase);
        if (Array.isArray(parsed.reviewed)) setReviewed(parsed.reviewed);
        if (typeof parsed.lanternName === "string") {
          setLanternName(parsed.lanternName);
        }
        if (typeof parsed.ringSerial === "string") {
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

  const generatedSerial = useMemo(() => {
    if (ringSerial !== "2814-000000") return ringSerial;
    const seed =
      typeof window === "undefined"
        ? 1218
        : Math.abs(
            Array.from(window.navigator.userAgent).reduce(
              (sum, char, index) => sum + char.charCodeAt(0) * (index + 1),
              1218,
            ),
          );
    return `2814-${String(seed % 1000000).padStart(6, "0")}`;
  }, [ringSerial]);

  const openEvidence = (id: EvidenceId) => {
    setActiveId(id);
    setReviewed((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const acceptRing = () => {
    setRingSerial(generatedSerial);
    setPhase("lantern");
  };

  const resetPrototype = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setReviewed([]);
    setActiveId("scene");
    setLanternName("");
    setRingSerial("2814-000000");
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
          onInterrupt={() => setPhase("selection")}
        />
      )}
      {phase === "selection" && <SelectionScreen onAccept={acceptRing} />}
      {phase === "lantern" && (
        <LanternScreen
          lanternName={lanternName}
          ringSerial={generatedSerial}
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
