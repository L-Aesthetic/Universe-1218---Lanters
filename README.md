# Universe-1218 — Lanterns

An unofficial, non-commercial Green Lantern fan experience built as an in-universe archive and Corps field interface rather than a conventional fan site.

## Continuity

**Universe-1218 is a fan continuity.** It uses verified Green Lantern concepts and selected premises from *Lanterns* as reference material, then clearly separates those from Universe-1218 adaptations and original case material.

The project does not treat every line in the archive as official DC canon. Lore-bearing records carry one of these source authorities:

- `DC_OFFICIAL_REFERENCE`
- `LANTERNS_2026`
- `U1218_ADAPTATION`
- `U1218_ORIGINAL`

See [CANON.md](./CANON.md) for the source policy.

## Current playable vertical slice

The persistent first-session loop is:

1. Enter the Oan archive as an unregistered observer.
2. Open Incident `2814-E/001`, located in Rushville, Nebraska, Earth, Sector 2814.
3. Review scene telemetry, witness testimony, and a restricted record.
4. Trigger an observer scan after pursuing the unresolved evidence.
5. Be selected by a power ring.
6. Receive a unique local Lantern number and persistent selection date.
7. Add a local Corps identity.
8. Operate through Case, Archive, Sector, Service Record, and Construct systems.
9. Run a waveform correlation between the current incident and an older sealed record.
10. Trace the 91.4% match off-world.
11. Scan the unresolved Sector contact and discover a three-origin spatial echo.
12. Build and register shield, bridge, and distress-beacon training constructs.
13. Share the Lantern service record through the native share sheet or clipboard fallback where supported.

The case engine derives its current question, objective, next action, findings, and recommended subsystem from the evidence and actions actually stored in the user's record. The interface stops at unimplemented investigation steps instead of presenting fake controls.

Mission findings, ring identity, selection date, active evidence, sound preference, evidence history, and construct training persist in browser storage.

## Interaction principles

- No account wall before the fiction begins.
- Selection responds to actions inside the investigation, not a personality quiz or hidden psychological score.
- Observation, interpretation, and lore provenance are separate concepts.
- Green is energy/system activity; the physical current-series-inspired ring uses dark metal, gold-tone face material, and green enamel rather than being painted neon green.
- Case findings change later objectives and service history.
- Controls must do something real.
- No XP system or arbitrary grind.
- No runtime LLM, fake multiplayer, or simulated social network in the current slice.
- If a system is not built, the interface says so instead of pretending it exists.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- `next/font` typography
- CSS-generated interface geometry and motion
- Browser Web Audio + optional device vibration for original interface feedback
- Local storage for the first persistent prototype
- Vitest unit tests
- Playwright browser-flow tests
- axe accessibility checks inside Playwright
- ESLint and TypeScript verification

There is currently no account backend, LLM, analytics layer, multiplayer simulation, or copied DC media dependency.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Verify

```bash
npm run lint
npm run test
npm run typecheck
npm run build
npm run test:e2e
npm audit --omit=dev --audit-level=high
```

The repository does not yet have a committed npm lockfile. Until one is generated from a normal npm-connected environment, CI uses `npm install` rather than claiming reproducible `npm ci` installs.

## Next systems

The next meaningful milestones are:

- protected Vercel preview and visual/device QA
- a real WebGL/3D ring approach after the 2D material study is approved
- a forensic reconstruction where known, inferred, disputed, and unknown evidence have different visual semantics
- server-backed Lantern identity only after selection
- structured canon/case storage
- grounded Ring retrieval over that source store
- Lantern-to-Lantern assistance only once identity and case authority are server-backed

## Fan project and rights notice

**Universe-1218 — Lanterns** is an unofficial, non-commercial fan-made interactive prototype inspired by DC's Green Lantern mythology and the *Lanterns* television series.

This project is not affiliated with, sponsored by, endorsed by, approved by, or licensed by DC, Warner Bros. Discovery, DC Studios, HBO, or their affiliates.

GREEN LANTERN, GREEN LANTERN CORPS, LANTERNS, Hal Jordan, John Stewart, Oa, Sector 2814, associated symbols, characters, settings, and other protected franchise elements belong to their respective rights holders.

The repository does not distribute official television footage, production audio, soundtrack recordings, episode stills, or scraped DC/HBO promotional artwork. Visual interface elements and sound feedback are implemented inside the project.

Some narrative records, case identifiers, archive terminology, sector-relay details, user ring numbers, and interactive scenarios are original to the Universe-1218 fan continuity and are not presented as official DC canon.
