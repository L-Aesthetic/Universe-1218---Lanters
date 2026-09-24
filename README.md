# Universe-1218 — Lanterns

An unofficial, non-commercial Green Lantern fan experience built as an in-universe Oan archive rather than a traditional fan site.

## Current vertical slice

The first build focuses on one complete fantasy loop:

1. Enter the Oan Central Archive as an unregistered observer.
2. Open Incident 2814-E/001.
3. Review contradictory evidence.
4. Trigger an unexpected observer scan.
5. Be selected by a power ring.
6. Receive a persistent probationary Lantern service record.

The prototype stores progress locally in the browser. There is no account system, backend, AI generation, analytics, or external DC media in this first slice.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- CSS-only motion and interface geometry for the first vertical slice

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build

```bash
npm run typecheck
npm run build
```

## Project direction

The site is designed to become a persistent Corps experience: cases, Lantern service history, sector navigation, ring queries, constructs, Lantern-to-Lantern assistance, and larger shared events. Those systems should be added only after the core selection experience is polished.

## Fan project notice

This repository is an unofficial, non-commercial fan project. Green Lantern and related characters, names, and marks are the property of DC and their respective rights holders. No affiliation or endorsement is claimed.
