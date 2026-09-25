import type {
  CorpsAssignment,
  SharedCorpsSnapshot,
} from "../lib/corps/domain";
import { describeCorpsNetwork } from "../lib/corps/network";

export function CorpsNetworkPanel({
  snapshot,
  assignment,
  ringSerial,
}: {
  snapshot: SharedCorpsSnapshot;
  assignment?: CorpsAssignment;
  ringSerial: string;
}) {
  const status = describeCorpsNetwork(snapshot);

  return (
    <section className="system-panel system-panel--corps">
      <div className="system-panel__header">
        <span>
          <div className="eyebrow">CORPS NETWORK</div>
          <h2 data-system-heading tabIndex={-1}>
            {status.state === "CONNECTED" ? "The Corps is listening." : "Local ring only."}
          </h2>
        </span>
        <span className="classification">
          {status.state.replace("_", " ")}
        </span>
      </div>

      <div className="corps-network-grid">
        <article className="corps-network-status">
          <small>
            NETWORK STATE // {status.state.replace("_", " ")}
          </small>
          <p>{status.headline}</p>
          <span>{status.detail}</span>

          <dl>
            <div>
              <dt>RING</dt>
              <dd>{ringSerial}</dd>
            </div>
            <div>
              <dt>ASSISTANCE TRAFFIC</dt>
              <dd>{snapshot.openAssistanceRequests.length}</dd>
            </div>
            <div>
              <dt>WORLD EVENTS</dt>
              <dd>{snapshot.activeWorldEvents.length}</dd>
            </div>
          </dl>
        </article>

        <div className="corps-network-columns">
          <section className="corps-network-section">
            <div className="corps-network-section__heading">
              <span>
                <small>LANTERN ASSISTANCE</small>
                <b>Request another ring.</b>
              </span>
              <i>{snapshot.networkBound ? "AVAILABLE" : "NETWORK REQUIRED"}</i>
            </div>

            {snapshot.openAssistanceRequests.length > 0 ? (
              <ol>
                {snapshot.openAssistanceRequests.map((request) => (
                  <li key={request.id}>
                    <span>
                      <small>{request.sector}</small>
                      <b>{request.summary}</b>
                    </span>
                    <i>{request.status}</i>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="corps-network-empty">
                No assistance request is being shown because this build has no
                shared Corps connection.
              </p>
            )}

            <button
              type="button"
              className="system-link"
              disabled={!snapshot.networkBound || !assignment}
              title={
                snapshot.networkBound
                  ? undefined
                  : "A dedicated Lanterns backend must be connected first."
              }
            >
              REQUEST LANTERN ASSISTANCE <span>→</span>
            </button>
          </section>

          <section className="corps-network-section">
            <div className="corps-network-section__heading">
              <span>
                <small>CORPS-WIDE EVENTS</small>
                <b>Shared history, when it is real.</b>
              </span>
              <i>{snapshot.networkBound ? "CONNECTED" : "NETWORK REQUIRED"}</i>
            </div>

            {snapshot.activeWorldEvents.length > 0 ? (
              <ol>
                {snapshot.activeWorldEvents.map((event) => (
                  <li key={event.id}>
                    <span>
                      <small>{event.scope}</small>
                      <b>{event.title}</b>
                    </span>
                    <i>{event.status}</i>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="corps-network-empty">
                No global event is fabricated for the local prototype. When the
                shared backend is bound, real scheduled and active events appear
                here.
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
