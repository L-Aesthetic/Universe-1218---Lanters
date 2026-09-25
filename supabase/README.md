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
