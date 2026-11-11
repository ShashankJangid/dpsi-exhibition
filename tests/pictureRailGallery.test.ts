import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { EXHIBITION_GALLERY_ITEMS } from '../src/data/exhibitionGalleryData';

describe('PictureRailGallery & Photo View Integration Suite', () => {
  describe('R1: Component Integration & Styling Suite', () => {
    test('EXHIBITION_GALLERY_ITEMS contains exact curated prints with valid schema & technical specs', () => {
      assert.ok(Array.isArray(EXHIBITION_GALLERY_ITEMS), 'Must be an array');
      assert.equal(EXHIBITION_GALLERY_ITEMS.length, 7, 'Must contain exactly 7 curated student exhibits');

      const expectedIds = ['p01', 'p02', 'p04', 'p06', 'p08', 'p10', 'p14'];
      const actualIds = EXHIBITION_GALLERY_ITEMS.map((item) => item.id);
      assert.deepEqual(actualIds, expectedIds, 'Exhibit IDs must match expected curated roster');

      const seenIds = new Set<string>();
      for (const item of EXHIBITION_GALLERY_ITEMS) {
        assert.ok(item.id && typeof item.id === 'string', 'Item ID must be non-empty string');
        assert.match(item.id, /^p\d{2}$/, `Item ID ${item.id} must conform to pXX pattern`);
        assert.ok(!seenIds.has(item.id), `Duplicate item ID detected: ${item.id}`);
        seenIds.add(item.id);

        assert.ok(item.title && typeof item.title === 'string', `Item ${item.id} missing valid title`);
        assert.ok(item.artist && typeof item.artist === 'string', `Item ${item.id} missing artist credit`);
        assert.equal(item.year, '2026', `Item ${item.id} must be marked year 2026`);

        // Aspect ratio validity (allowable range [0.4, 2.5])
        const aspect = item.aspect ?? 0.8;
        assert.ok(aspect >= 0.4 && aspect <= 2.5, `Item ${item.id} aspect ratio ${aspect} out of bounds`);

        // Frame moulding validity
        const frame = item.frame ?? 'black';
        assert.ok(['black', 'oak', 'white'].includes(frame), `Item ${item.id} has invalid frame style: ${frame}`);

        // Mat board flag
        assert.equal(typeof item.mat, 'boolean', `Item ${item.id} mat property must be a boolean`);

        // Drop wire length bounds
        const drop = item.drop ?? 0;
        assert.ok(Number.isFinite(drop) && drop >= -0.2 && drop <= 0.6, `Item ${item.id} drop ${drop} out of bounds`);

        // Tag format
        assert.ok(item.tag && typeof item.tag === 'string', `Item ${item.id} missing tag`);
        assert.match(item.tag, /^Booth [PDB]\d{2} • (Physical|Digital|Business)$/, `Item ${item.id} tag must conform to booth pattern`);

        // Details specs array
        assert.ok(Array.isArray(item.details) && item.details.length >= 4, `Item ${item.id} must have at least 4 detail specifications`);
        for (const line of item.details) {
          assert.ok(typeof line === 'string' && line.trim().length > 0, `Item ${item.id} detail line cannot be empty`);
        }
      }
    });

    test('src/components/ui/demo.tsx re-exports curated dataset and exports PictureRailGalleryDemo', () => {
      const demoPath = path.resolve(process.cwd(), 'src/components/ui/demo.tsx');
      assert.ok(fs.existsSync(demoPath), 'src/components/ui/demo.tsx must exist');
      const demoContent = fs.readFileSync(demoPath, 'utf8');

      assert.ok(demoContent.includes('"use client"'), 'demo.tsx must have use client directive');
      assert.ok(demoContent.includes('export function PictureRailGalleryDemo'), 'demo.tsx must export PictureRailGalleryDemo named');
      assert.ok(demoContent.includes('export default PictureRailGalleryDemo'), 'demo.tsx must export PictureRailGalleryDemo default');
      assert.ok(demoContent.includes('export { EXHIBITION_GALLERY_ITEMS'), 'demo.tsx must re-export EXHIBITION_GALLERY_ITEMS');
      assert.ok(demoContent.includes('type PictureRailItem'), 'demo.tsx must re-export PictureRailItem type');
      assert.ok(demoContent.includes('<PictureRailGallery'), 'demo.tsx must render <PictureRailGallery');
      assert.ok(demoContent.includes('items={EXHIBITION_GALLERY_ITEMS}'), 'demo.tsx must pass EXHIBITION_GALLERY_ITEMS to gallery');
    });

    test('src/app/globals.css defines required CSS color tokens in :root and html.dark with contrast separation', () => {
      const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
      assert.ok(fs.existsSync(cssPath), 'globals.css must exist');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      assert.ok(cssContent.includes('@custom-variant dark'), 'globals.css must configure @custom-variant dark');
      assert.ok(cssContent.includes('@theme'), 'globals.css must define @theme block');

      const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
      assert.ok(rootMatch, ':root block must be defined in globals.css');
      const rootBlock = rootMatch[1];

      const darkMatch = cssContent.match(/html\.dark\s*\{([^}]+)\}/);
      assert.ok(darkMatch, 'html.dark block must be defined in globals.css');
      const darkBlock = darkMatch[1];

      const requiredTokens = [
        '--background',
        '--foreground',
        '--color-background',
        '--color-foreground',
        '--color-card',
        '--color-card-foreground',
        '--color-muted',
        '--color-muted-foreground',
        '--color-border',
        '--color-ring',
        '--wash',
      ];

      for (const token of requiredTokens) {
        assert.ok(rootBlock.includes(token), `:root must define ${token}`);
        assert.ok(darkBlock.includes(token), `html.dark must define ${token}`);
      }

      assert.ok(rootBlock.includes('#ffffff'), 'Light theme card token must be bright/white');
      assert.ok(darkBlock.includes('#0d1117'), 'Dark theme card token must be deep slate surface');
      assert.notEqual(
        rootBlock.match(/--wash:\s*([^;]+);/)?.[1],
        darkBlock.match(/--wash:\s*([^;]+);/)?.[1],
        'Light and dark wash tokens must have distinct surface alpha levels',
      );
    });

    test('src/app/page.tsx integrates dedicated #gallery section with responsive layout and navigation', () => {
      const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
      assert.ok(fs.existsSync(pagePath), 'src/app/page.tsx must exist');
      const pageContent = fs.readFileSync(pagePath, 'utf8');

      assert.ok(pageContent.includes('id="gallery"'), 'page.tsx must contain section id="gallery"');
      assert.ok(pageContent.includes('scroll-mt-16'), 'page.tsx gallery section must have scroll-mt-16 for navbar offset');
      assert.ok(pageContent.includes('PHOTO VIEW GALLERY'), 'page.tsx gallery section must render photo view eyebrow');
      assert.ok(pageContent.includes('Innovation Picture Rail'), 'page.tsx gallery section must render section heading');
      assert.ok(pageContent.includes('<PictureRailGallery'), 'page.tsx must render <PictureRailGallery');
      assert.ok(pageContent.includes('items={EXHIBITION_GALLERY_ITEMS}'), 'page.tsx must pass EXHIBITION_GALLERY_ITEMS');
      assert.ok(pageContent.includes('max-w-7xl'), 'page.tsx must wrap gallery in max-w-7xl responsive container');
      assert.ok(pageContent.includes('px-4 sm:px-8'), 'page.tsx must use responsive horizontal padding (px-4 sm:px-8)');
      assert.ok(pageContent.includes('href="#projects"'), 'page.tsx gallery section must include link back to #projects');
      assert.ok(pageContent.includes('directoryView'), 'page.tsx must manage directoryView state');
      assert.ok(pageContent.includes('aria-label="Picture rail gallery view"'), 'page.tsx must provide accessible picture rail toggle button');
      assert.ok(
        pageContent.includes("{ href: '#gallery', label: 'Photo View' }"),
        'page.tsx must include Photo View in header navigation items array',
      );
      assert.ok(
        pageContent.includes('href="#gallery"'),
        'page.tsx must include anchor link to #gallery in footer quick links',
      );
    });
  });

  describe('R2: Component Architecture, Math & Interactions Suite', () => {
    test('Component Exports & Type Interface Compliance in picture-rail-gallery.tsx', () => {
      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      assert.ok(fs.existsSync(compPath), 'picture-rail-gallery.tsx must exist');
      const compContent = fs.readFileSync(compPath, 'utf8');

      assert.ok(compContent.includes('"use client"'), 'Must have use client directive');
      assert.ok(compContent.includes('export function PictureRailGallery'), 'Must export PictureRailGallery named function');
      assert.ok(compContent.includes('export default PictureRailGallery'), 'Must export PictureRailGallery default');
      assert.ok(compContent.includes('export type PictureFrameStyle = "black" | "oak" | "white";'), 'Must export PictureFrameStyle union');
      assert.ok(compContent.includes('export interface PictureRailItem'), 'Must export PictureRailItem interface');
      assert.ok(compContent.includes('export interface PictureRailGalleryLabels'), 'Must export PictureRailGalleryLabels interface');
      assert.ok(compContent.includes('export interface PictureRailGalleryProps'), 'Must export PictureRailGalleryProps interface');

      assert.ok(compContent.includes('DEFAULT_LABELS'), 'Must declare DEFAULT_LABELS');
      assert.ok(compContent.includes('front: "Front"'), 'DEFAULT_LABELS must define front');
      assert.ok(compContent.includes('back: "Back"'), 'DEFAULT_LABELS must define back');
      assert.ok(compContent.includes('close: "Close"'), 'DEFAULT_LABELS must define close');
      assert.ok(compContent.includes('open: "Lift to view"'), 'DEFAULT_LABELS must define open');
    });

    test('A11y & ARIA landmark compliance in picture-rail-gallery.tsx', () => {
      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      const compContent = fs.readFileSync(compPath, 'utf8');

      assert.ok(compContent.includes('data-slot="picture-rail-gallery"'), 'Section must have data-slot="picture-rail-gallery"');
      assert.ok(compContent.includes('aria-roledescription="picture rail gallery"'), 'Section must declare aria-roledescription="picture rail gallery"');
      assert.ok(compContent.includes('role="group"'), 'Hanging rail stage must declare role="group"');
      assert.ok(compContent.includes('role="dialog"'), 'Detail view must declare role="dialog"');
      assert.ok(compContent.includes('aria-modal="true"'), 'Detail view must declare aria-modal="true"');
      assert.ok(compContent.includes('aria-live="polite"'), 'Must include aria-live="polite" region for screen readers');
      assert.ok(compContent.includes('aria-pressed='), 'Front/back flip controls must declare aria-pressed state');
      assert.ok(compContent.includes('{labels.close}'), 'Close button must use accessible label prop');
    });

    test('Physics constants, layout math and responsive carousel threshold', () => {
      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      const compContent = fs.readFileSync(compPath, 'utf8');

      assert.ok(compContent.includes('RAIL_MIN_UNIT = 90'), 'RAIL_MIN_UNIT constant must be 90');
      assert.ok(compContent.includes('RAIL_MAX_UNIT = 150'), 'RAIL_MAX_UNIT constant must be 150');
      assert.ok(compContent.includes('CAROUSEL_MAX_UNIT = 128'), 'CAROUSEL_MAX_UNIT constant must be 128');
      assert.ok(compContent.includes('SWING_MAX = 14'), 'SWING_MAX constant must be 14');
      assert.ok(compContent.includes('SWING_DAMP = 2.2'), 'SWING_DAMP constant must be 2.2');
      assert.ok(compContent.includes('SWING_G = 3900'), 'SWING_G constant must be 3900');
      assert.ok(compContent.includes('SWING_COUPLING = 0.08'), 'SWING_COUPLING constant must be 0.08');
      assert.ok(compContent.includes('DRAG_COUPLING = 0.16'), 'DRAG_COUPLING constant must be 0.16');

      // Verify mathematical responsive layout behavior
      function clamp(val: number, min: number, max: number) {
        return Math.max(min, Math.min(max, val));
      }
      function shapeOf(aspect: number, frame: string, mat: boolean) {
        const a = clamp(aspect, 0.4, 2.5);
        const mold = frame === 'oak' ? 0.068 : frame === 'white' ? 0.058 : 0.046;
        const m = mat ? 0.11 : 0;
        const mB = mat ? 0.022 : 0;
        const iw = Math.sqrt(a);
        return { w: iw + 2 * (mold + m), h: 1 / iw + 2 * (mold + m) + mB };
      }

      const shapes = EXHIBITION_GALLERY_ITEMS.map((item) =>
        shapeOf(item.aspect ?? 0.8, item.frame ?? 'black', item.mat ?? false),
      );
      const GAP = 0.3;
      const BREATH = 0.1;
      const EDGE = 36;
      const LIFT_GROW = 1.12;

      function calcFit(shapesList: { w: number; h: number }[], width: number) {
        const n = shapesList.length;
        const sumW = shapesList.reduce((sum, s) => sum + s.w, 0);
        const maxW = shapesList.reduce((m, s) => Math.max(m, s.w), 0);
        return (width - 2 * EDGE) / (sumW + Math.max(0, n - 1) * GAP + 2 * BREATH + maxW * (LIFT_GROW - 1));
      }

      // Narrow mobile viewport (375px)
      const mobileFit = calcFit(shapes, 375);
      assert.ok(mobileFit < 90, 'Mobile screen fit must be below RAIL_MIN_UNIT (90) to trigger responsive carousel mode');

      // Desktop viewport (1440px)
      const desktopFit = calcFit(shapes, 1440);
      assert.ok(desktopFit >= 90, 'Desktop screen fit must exceed RAIL_MIN_UNIT (90) for continuous rail hanging mode');
    });

    test('Keyboard controls, pointer event handlers and 3D card flip interaction', () => {
      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      const compContent = fs.readFileSync(compPath, 'utf8');

      assert.ok(compContent.includes('event.key === "Escape"'), 'Must handle Escape key to dismiss modal');
      assert.ok(compContent.includes('event.key === "ArrowLeft"'), 'Must handle ArrowLeft key for flip or navigation');
      assert.ok(compContent.includes('event.key === "ArrowRight"'), 'Must handle ArrowRight key for flip or navigation');
      assert.ok(compContent.includes('event.key === "Tab"'), 'Must trap modal focus with Tab cycling');

      assert.ok(compContent.includes('onPointerDown='), 'Must attach onPointerDown handler for physics drag');
      assert.ok(compContent.includes('onPointerMove='), 'Must attach onPointerMove handler for physics drag');
      assert.ok(compContent.includes('onPointerUp='), 'Must attach onPointerUp handler');
      assert.ok(compContent.includes('onPointerCancel='), 'Must attach onPointerCancel handler');

      assert.ok(compContent.includes('rotateY(180deg)'), 'Must implement 3D rotateY(180deg) transform for card flip');
      assert.ok(compContent.includes('[backface-visibility:hidden]'), 'Must hide backface during 3D card flip');
    });
  });

  describe('R3: Security, Static Export & Production Readiness Suite', () => {
    test('Security: Image URLs strictly use HTTPS, trusted domains and safe URI schemes', () => {
      for (const item of EXHIBITION_GALLERY_ITEMS) {
        assert.ok(item.image.startsWith('https://'), `Item ${item.id} image must use HTTPS: ${item.image}`);
        const parsedUrl = new URL(item.image);
        assert.equal(parsedUrl.protocol, 'https:', `Item ${item.id} protocol must be https`);
        assert.equal(parsedUrl.hostname, 'images.unsplash.com', `Item ${item.id} image must be hosted on images.unsplash.com`);
        assert.doesNotMatch(item.image, /^(javascript:|data:|blob:|file:)/i, `Item ${item.id} contains unsafe URI scheme`);
        assert.ok(item.image.includes('auto=format'), `Item ${item.id} image must specify auto=format`);
        assert.ok(item.image.includes('fit=crop'), `Item ${item.id} image must specify fit=crop`);
      }
    });

    test('Security: Deep XSS sanitization and anti-injection across all dataset fields', () => {
      for (const item of EXHIBITION_GALLERY_ITEMS) {
        const stringsToCheck = [
          item.id,
          item.title,
          item.artist ?? '',
          item.year ?? '',
          item.tag ?? '',
          ...(item.details ?? []),
        ];

        for (const str of stringsToCheck) {
          assert.doesNotMatch(str, /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, `Script tag detected in item ${item.id}`);
          assert.doesNotMatch(str, /<\/?(iframe|object|embed|svg|img|link|style|meta)\b/gi, `Unsafe HTML element in item ${item.id}`);
          assert.doesNotMatch(str, /\bon\w+\s*=/gi, `Inline event handler detected in item ${item.id}`);
          assert.doesNotMatch(str, /javascript:/gi, `JavaScript pseudo-protocol detected in item ${item.id}`);
          assert.doesNotMatch(str, /data:text\/html/gi, `Data URI HTML payload detected in item ${item.id}`);
        }
      }

      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      const compContent = fs.readFileSync(compPath, 'utf8');
      assert.doesNotMatch(compContent, /dangerouslySetInnerHTML/, 'picture-rail-gallery.tsx must never use dangerouslySetInnerHTML');
    });

    test('Static export configuration (output: export) and SSR hydration safety', () => {
      const configPath = path.resolve(process.cwd(), 'next.config.ts');
      assert.ok(fs.existsSync(configPath), 'next.config.ts must exist');
      const configContent = fs.readFileSync(configPath, 'utf8');

      assert.ok(
        configContent.includes('output: "export"') || configContent.includes("output: 'export'"),
        'next.config.ts must set output: export',
      );
      assert.ok(configContent.includes('unoptimized: true'), 'next.config.ts must set images.unoptimized: true');

      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      const compContent = fs.readFileSync(compPath, 'utf8');

      assert.ok(compContent.includes('"use client"'), 'Component must declare use client directive');
      assert.ok(compContent.includes('createPortal('), 'Modal must use createPortal for client-side mounting');
      assert.ok(compContent.includes('cancelAnimationFrame'), 'Component must clean up requestAnimationFrame on unmount');
      assert.ok(compContent.includes('removeEventListener'), 'Component must clean up event listeners on unmount');
      assert.ok(compContent.includes('decoding="async"'), 'Images must use async decoding for non-blocking rendering');
    });
  });
});
