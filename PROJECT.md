# Project: DPS Indirapuram Exhibition - PictureRailGallery Integration

## Architecture
- **Framework**: Next.js 16.4.3 (Turbopack, App Router, static export `output: 'export'`), React 19.3.0.
- **Styling**: Tailwind CSS v4 with `@custom-variant dark`, CSS Color Level 4 (`color-mix(in oklab, ...)`), dynamic CSS variables in `:root` and `html.dark`, and `@theme` semantic color tokens.
- **Component**: `PictureRailGallery` (`src/components/ui/picture-rail-gallery.tsx`) - zero-external-dependency, physics-driven interactive picture rail gallery with sub-step Euler momentum simulation, responsive carousel fallback on narrow viewports, and detail close-up modal via portal.
- **Dataset**: `EXHIBITION_GALLERY_ITEMS` (`src/components/ui/demo.tsx` & `src/data/exhibitionGalleryData.ts`) - 7 curated DPS Indirapuram student exhibits with aspect ratios, realistic mat boards, frame styles (`black`, `oak`, `white`), tags, and technical specs.
- **Main Page Flow**: `src/app/page.tsx` - Dedicated `#gallery` Photo View section plus `#projects` directory view toggle.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | PictureRailGallery Component | Physics-driven hanging picture rail with interactive swing, tilt, drag, autoplay, and detail modal | M1 | Survey 1 |
| 2 | Exhibition Gallery Demo Data | 7 curated student inventions with specs, frame styles, and secure HTTPS images | M1 | Survey 2 |
| 3 | Dedicated Photo View Section | Dedicated `#gallery` section in `src/app/page.tsx` with responsive layout and navigation integration | M1 | Survey 2 |
| 4 | CSS Variables & Theme Tokens | Configure all required CSS variables and `@theme` tokens in `src/app/globals.css` for light and dark modes | M1 | Survey 3 |
| 5 | Unit Testing & Verification | Comprehensive unit tests for gallery items, security, CSS variables, and page integration passing `npm test` | M1 | Survey 3 |
| 6 | Production Readiness | `npm run lint` and `npm run build` exit cleanly with zero errors | M1 | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Gallery Integration & Verification | Refine CSS variables in `globals.css`, finalize header nav & photo view integration in `page.tsx`, expand unit tests in `tests/pictureRailGallery.test.ts`, and verify via lint, test, build, challenger, and forensic audit | none | DONE |

## Interface Contracts
### `src/components/ui/picture-rail-gallery.tsx` ↔ `src/app/page.tsx`
- **Component**: `PictureRailGallery(props: PictureRailGalleryProps): JSX.Element`
- **Props**:
  - `items: PictureRailItem[]` (required: id, title, image; optional: artist, year, aspect, frame, mat, drop, tag, details)
  - `eyebrow?: string`, `heading?: string`, `caption?: string`, `action?: React.ReactNode`
  - `autoplay?: boolean`, `interval?: number`
- **CSS Variables Expected**:
  - `--color-foreground`, `--color-card`, `--color-muted`, `--wash`
  - Semantic Tailwind v4 tokens: `--color-background`, `--color-foreground`, `--color-card`, `--color-card-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-border`, `--color-ring`

## Code Layout
- `src/components/ui/picture-rail-gallery.tsx`: Gallery component
- `src/components/ui/demo.tsx`: Demo export & re-export of curated data
- `src/data/exhibitionGalleryData.ts`: 7 curated student exhibits dataset
- `src/app/globals.css`: Design tokens, dark mode variants, and CSS variables
- `src/app/page.tsx`: Exhibition main page containing `#gallery` photo view section
- `tests/pictureRailGallery.test.ts`: Integration & unit tests for gallery
