# DPS Indirapuram Tech & Innovation Exhibition 2026 - Best-in-Class Elevation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the exhibition website into an award-winning, interactive experience with procedural Web Audio feedback, an interactive 3D guided walkthrough tour, a downloadable canvas delegate pass & voter certificate, and enhanced global search & keyboard shortcuts.

**Architecture:** Add a zero-dependency Web Audio synthesizer sound system (`src/lib/sound.ts`), create a 3D camera waypoints tour system integrated into `useExhibitionStore` and Drei's `CameraControls`, build a high-resolution canvas badge generator for visitor delegate passes (`src/components/ui/DelegatePassModal.tsx`), and polish global hotkeys (`Cmd+K`) and mobile touch ergonomics.

**Tech Stack:** Next.js 16 (App Router), React 19, Three.js, React Three Fiber, React Three Drei, Tailwind CSS v4, Lucide Icons, Web Audio API, HTML5 Canvas API.

**Spec:** Transform the existing exhibition site into a premier showcase matching Awwwards/FWA standards with sound design, virtual tour automation, and attendee recognition.

## Global Constraints

- Zero external sound asset downloads (use procedural Web Audio API synthesis for instant zero-latency playback).
- Zero heavy 3D asset downloads (preserve procedural geometry and high-performance WebGL rendering).
- Retain all 35 project positions, IDs, and booth codes (`P01-P12`, `D01-D12`, `B01-B07`, `ST01-ST08`, `R01-R02`).
- 100% mobile-responsive with touch ergonomics and haptic vibration support.
- Fully compatible with both Light Showroom and Dark Cosmic theme modes.

## Review Focus

1. Sound synthesis must not throw in browsers that restrict AudioContext before user gesture (lazy init on first interaction).
2. 3D Guided Tour must gracefully yield control if the user drags or zooms the camera.
3. Canvas Delegate Pass must render sharply on both Retina and standard mobile screens (using device pixel ratio).
4. `Cmd+K` / `Ctrl+K` must not intercept native input shortcuts when user is focused inside form fields.
5. Production Next.js build must pass with zero TypeScript errors and static export compatibility.

---

### Task 1: Procedural Web Audio Sound System (`src/lib/sound.ts`)

**Files:**
- Create: `src/lib/sound.ts`
- Modify: `src/store/useExhibitionStore.ts`
- Modify: `src/components/ui/TopNavHUD.tsx`

- [ ] Create `src/lib/sound.ts` with Web Audio API synthesizer for clean sound effects:
  - `playBlip(freq)`: subtle UI hover/select sound.
  - `playChime()`: celebratory two-tone major third harmonic for voting and success.
  - `playWhoosh()`: soft filtered noise sweep for camera transitions and drawer open.
  - `playClick()`: mechanical tactile click for toggles.
  - Global `isSoundMuted()` / `toggleSound()` with persistence in `localStorage`.
- [ ] Add sound toggle controls to `TopNavHUD.tsx` with speaker icon (`Volume2` / `VolumeX`).
- [ ] Wire sounds into booth click in `BoothMesh.tsx` and vote buttons.
- [ ] Test sound playback in browser environment without autoplay policy crashes.

---

### Task 2: Interactive 3D Guided Virtual Tour (`src/components/canvas/GuidedTour.tsx`)

**Files:**
- Create: `src/components/canvas/GuidedTour.tsx`
- Modify: `src/store/useExhibitionStore.ts`
- Modify: `src/components/ui/TopNavHUD.tsx`
- Modify: `src/components/ui/MobileBottomDock.tsx`
- Modify: `src/components/canvas/ExhibitionCanvas.tsx`

- [ ] Define 6 scenic tour stops with camera positions, targets, titles, and descriptive subtitles in `GuidedTour.tsx`:
  1. *Grand Concourse*: Panoramic city skyline entrance and check-in desks.
  2. *Summit Keynote Stage*: Central 16:9 presentation board and speaker podium.
  3. *Physical Tech Aisle*: Hardware, IoT, and embedded prototypes (P01-P12).
  4. *Digital Solutions Aisle*: AI systems, web platforms, and mobile apps (D01-D12).
  5. *Business Ventures Aisle*: Startup pitches, business models, and enterprise tools (B01-B07).
  6. *Robotics Speedway & Stadium*: Autonomous race circuit & soccer pitch (Zone 3).
- [ ] Add `isTourActive`, `tourStepIndex`, `startTour()`, `stopTour()`, `nextTourStep()` to `useExhibitionStore.ts`.
- [ ] Create an overlay HUD in `GuidedTour.tsx` showing current stop progress, stop title, explanation, and `Next Stop` / `Exit Tour` buttons.
- [ ] Add "Guided Tour" button with Play icon in `TopNavHUD.tsx` and `MobileBottomDock.tsx`.

---

### Task 3: Digital Innovation Delegate Pass & Voting Certificate (`src/components/ui/DelegatePassModal.tsx`)

**Files:**
- Create: `src/components/ui/DelegatePassModal.tsx`
- Modify: `src/store/useExhibitionStore.ts`
- Modify: `src/components/ui/ProjectDetailDrawer.tsx`
- Modify: `src/app/page.tsx`

- [ ] Build `DelegatePassModal.tsx` utilizing HTML5 Canvas to generate an authentic digital pass:
  - High-res card background with custom dark/light metallic gradients.
  - Official DPS Indirapuram Tech Expo 2026 header and verification hologram badge.
  - Delegate Name, Attendee ID, timestamp, and QR pattern.
  - "Verified Voter" digital wax stamp if user has cast at least 1 vote.
  - List of voted project booth codes (`P03, D07, ...`).
- [ ] Implement "Download Pass (.png)" button using `canvas.toBlob()` / `canvas.toDataURL()`.
- [ ] Add Web Share API trigger (`navigator.share`) for instant mobile sharing to WhatsApp, Twitter/X, and Instagram.
- [ ] Add button to view/generate pass in the landing page header and in the ProjectDetailDrawer after voting.

---

### Task 4: Global Quick Search (`Cmd+K`) & Mobile Touch Polish

**Files:**
- Modify: `src/components/ui/SearchModal.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/ui/TopNavHUD.tsx`

- [ ] Implement global `keydown` listener for `Cmd+K` and `Ctrl+K` to open the search modal from any page.
- [ ] Add ArrowUp, ArrowDown, and Enter key navigation inside search results.
- [ ] Add tech stack tag filters (e.g. `Python`, `Arduino`, `AI`, `Next.js`) with one-click filtering.
- [ ] Add native vibration (`navigator.vibrate?.(15)`) on mobile vote submission and tab changes for tactile haptics.

---

### Task 5: Build Verification, Deployment & End-to-End Validation

**Files:**
- All updated files

- [ ] Run `npx tsc --noEmit` and verify TypeScript compilation.
- [ ] Run `npm run build` and ensure Next.js static site export compiles with 0 errors.
- [ ] Deploy to Cloudflare Pages via `wrangler pages deploy out --project-name=dpsiexibition`.
- [ ] Verify live HTTP 200 response on `https://dpsiexibition.pages.dev` and `https://dpsiexibition.pages.dev/expo`.
