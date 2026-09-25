# Lanterns shared-backend contract

This directory contains the **schema specification** for the future shared Corps backend.

It is not a migration history yet. The only Supabase project currently connected to this ChatGPT workspace is **Still Cloud Production**, and Lanterns must not be installed into that database.

Before this schema becomes a migration:

1. Create a dedicated Lanterns Supabase project.
2. Apply this SQL iteratively with the Supabase SQL tooling.
3. Exercise the RLS policies with at least two authenticated test users.
4. Verify private Realtime topics for assistance threads and world events.
5. Run Supabase security and performance advisors.
6. Fix all relevant findings.
7. Only then create/pull the canonical migration into this repository.

## Selection → account → durable ring identity

The current browser-only prototype can generate a local ring number immediately for the selection fantasy. That number is **not** the authority model for the shared Corps.

When the dedicated backend is connected:

1. The visitor completes the three-record selection sequence.
2. The user authenticates or creates an account only after selection.
3. A server route calls `server_claim_lantern_identity` with the authenticated user id and the ordered evidence trace.
4. PostgreSQL validates that `scene`, `witness`, and `record` each occurred exactly once.
5. The database stores a server-side selection claim.
6. The database allocates the permanent `2814-########` serial.
7. The profile and selection claim are committed in the same transaction.
8. Repeating the claim for the same account returns the existing profile instead of minting a second identity.

`server_claim_lantern_identity` is `SECURITY DEFINER`, but it uses an empty search path, fully qualified object names, is revoked from `public`, `anon`, and `authenticated`, and is executable only by `service_role`. It must be called from trusted server code; the secret/service key must never reach the browser.

The browser does not receive INSERT permission on `lantern_profiles` or `lantern_selection_claims`, and it cannot choose its permanent ring serial, selection timestamp, status, or selection receipt.

## Authority model

Client code must **not** be able to award itself:

- ring serials
- selection timestamps
- service events
- assignment completion
- world-event definitions
- rank/status changes

Those are server-authoritative.

Authenticated clients may directly perform only user-owned actions protected by RLS:

- update their display name / discoverability
- request assistance for one of their own assignment instances
- respond once to another Lantern's open assistance request
- exchange transmissions inside an assistance thread they belong to
- join a visible world event
- update their own world-event participation state

## Realtime

Production channels are private. Planned topics:

- `assist:<request_uuid>`
- `event:<world_event_uuid>`

The schema includes Realtime Authorization policies using `realtime.topic()`. Public channel access must remain disabled in the Supabase Realtime settings when the real project is provisioned.

## Client keys

The future web client should use a Supabase **publishable key**, not a service-role/secret key. Server-authoritative routes may use a secret key only on the server and must never expose it through `NEXT_PUBLIC_*`.

## Current app behavior

Until that dedicated project exists, the application reports the Corps network as `LOCAL ONLY` and returns zero assistance requests / zero global events. It does not fabricate shared activity.
