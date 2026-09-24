# Universe-1218 — Lanterns

An unofficial, non-commercial Green Lantern fan experience built as an in-universe Oan archive rather than a traditional fan site.

## Current playable vertical slice

The prototype now supports one persistent first-session loop:

1. Enter the Oan Central Archive as an unregistered observer.
2. Open Incident 2814-E/001.
3. Review scene telemetry, witness testimony, and a restricted Oan record.
4. Trigger an observer scan after pursuing the unresolved evidence.
5. Be selected by a power ring.
6. Receive a unique probationary Lantern number and persistent selection date.
7. Add a local Corps identity.
8. Move through a functional ring interface:
   - Case
   - Archive
   - Sector 2814
   - Corps service record
   - Construct training
9. Run a waveform correlation between the current incident and an older sealed record.
10. Trace the 91.4% match off-world.
11. Scan the unresolved Sector contact and discover a three-origin spatial echo.
12. Build and register shield, bridge, and distress-beacon training constructs.
13. Share the Lantern service record through the native share sheet or clipboard fallback where supported.

Mission findings, ring identity, selection date, evidence history, and construct training persist in browser storage.

## Interaction principles

- The visitor is not asked to create an account before the fiction begins.
- Selection is earned through interaction with the case, not a personality quiz.
- The ring references actions the visitor actually took inside the investigation.
- Green is treated as system activity and energy, not generic decoration.
- Case findings update the service record and later objectives.
- Controls should do something real. Placeholder social, AI, and multiplayer systems are intentionally absent.
- Progress is recorded as Corps history rather than XP or grind.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- CSS-generated interface geometry and motion
- Browser Web Audio + optional device vibration for original interface feedback
- Local storage for the first persistent prototype

There is currently no account backend, LLM, analytics layer, multiplayer simulation, or external DC media dependency.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Verify

```bash
npm run typecheck
npm run build
```

GitHub Actions runs both checks for pull requests and changes to `main`.

## Next systems

The next meaningful milestones are:

- a real preview deployment and visual QA pass
- stronger 3D ring and sector presentation
- durable user accounts after selection
- server-backed Lantern service records
- a structured case/canon store
- grounded Ring query/retrieval over that store
- Lantern-to-Lantern assistance
- larger shared Corps events

Those should build on the current interaction loop rather than replacing it with a generic dashboard.

## Fan project notice

This repository is an unofficial, non-commercial fan project. Green Lantern and related characters, names, marks, and story elements are the property of DC and their respective rights holders. No affiliation, license, sponsorship, or endorsement is claimed.

The current prototype deliberately avoids copied film/television footage, official soundtrack material, scraped DC artwork, and other external media assets.
