# DPSI Tech & Innovation Exhibition 2026 — Maintainer PR Review Policy

This repository powers the **DPS Indirapuram (DPSI) Tech & Innovation Exhibition 2026 Platform**, featuring:
1. **Photorealistic 3D Virtual Floor Plan** (`/expo`, Three.js, React Three Fiber, Drei, procedural canvas textures, and spatial audio).
2. **Anti-Cheat Live Voting Engine** (4-layer defense: hardware fingerprinting, rate limiting, path traversal protection, and atomic Firestore transactions).
3. **Official Delegate Credential Suite** (CR100 horizontal pass generator, authentic 18-bit Butterfly TopoTag, and Micro-QR).
4. **Hero Landing Page** (`/`, ReactBits animations, custom magnetic cursor, ambient background shards, and theme controls).

---

## The Policy: Core Stability & Guarded Subsystems

Every pull request is reviewed with respect to our core architectural invariants:

| Category / Subsystem | Criteria & Acceptance Policy | Verdict |
|---|---|---|
| **Landing Page (`src/app/page.tsx`, `globals.css`, `AmbientBackground.tsx`, `CustomCursor.tsx`)** | **STRICTLY PROTECTED**. The landing page aesthetics, micro-interactions, and visual fidelity are frozen. PRs must **not** modify landing page files unless explicitly assigned by repository maintainers. | `rework` / `close` |
| **Voting Engine & Security (`firebase-functions/*`, `src/app/api/vote/*`)** | **CRITICAL SECURITY ZONE**. Must strictly uphold anti-cheat protections (composite rate limiter, device fingerprint bounds `[8, 128]`, alphanumeric `projectId`, zero path traversal). Any change that weakens validation or touches secrets is held. | `hold` |
| **3D Canvas & Expo Hall (`src/components/canvas/*`, `src/lib/screenTextures.ts`)** | Must preserve smooth celestial atmosphere (`milkyway_smooth.jpg`), inverted sky dome geometry (`scale={[-1, 1, 1]}` with `BackSide`), anisotropic filtering (`anisotropy = 16`), and keynote telemetry screen. | `merge` / `merge-with-fix` |
| **Sound & Audio (`src/lib/sound.ts`)** | `soundEnabled` in `src/lib/sound.ts` must remain `true` so interactive UI audio functions. 3D spatial drone silencing on entry is handled strictly via `isSoundMuted: true` in `useExhibitionStore.ts`. | `merge-with-fix` |
| **UI Components & HUD (`src/components/ui/*`)** | Clean, accessible, TypeScript strict (`noEmit` clean), and responsive. Radar minimap defaults to collapsed state (`isMinimapOpen: false`). | `merge` / `merge-with-fix` |
| **Bug Fixes & Refactors** | Clean TypeScript, passing unit tests (`npm test`), 0 build warnings. | `merge` |
| **CI Workflows (`.github/workflows/*`)** | Maintainer-only review. | `hold` |

---

## Verdict Definitions

- **`merge`**: Fully compliant, tests pass, strictly scoped, zero regressions on landing page or security.
- **`merge-with-fix`**: Minor mechanical fix needed (e.g., reverting an unintended boolean flag, removing a stray file, or fixing a lint warning). The bot specifies the exact one-line fix.
- **`rework`**: Out of scope, conflicting with main, breaking tests, or modifying landing page files without mandate.
- **`close`**: Duplicate, superseded, abusive, or violating foundational project guidelines.
- **`hold`**: Requires explicit maintainer human decision (security changes, database schema migrations, or workflow permissions).

---

## Quality Checks Required for Every PR
1. **TypeScript Typing**: `npx tsc --noEmit` must pass with 0 errors.
2. **Automated Test Suites**: `npm run test` (including Firebase functions security test suite) must pass 100%.
3. **Build Integrity**: `npm run build` must compile cleanly with Turbopack.
4. **Clean Git Diff**: No stray artifacts, `.DS_Store`, or uncommitted scratch files.

---

## Tone & Comment Style
Maintainer-bot comments must be concise, objective, encouraging, and human. Always acknowledge the author's effort, specify positive contributions first, and provide actionable, exact diffs for any requested change.
