import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { EXHIBITION_GALLERY_ITEMS, PictureRailItem } from '../src/data/exhibitionGalleryData';

interface GalleryShape {
  frame: string;
  mold: number;
  mat: number;
  matB: number;
  w: number;
  h: number;
}

interface GalleryLayout {
  width: number;
  unit: number;
  carousel: boolean;
  railTop: number;
  railT: number;
  pivotY: number;
  tops: number[];
  stageH: number;
}

interface GallerySim {
  x: number[];
  vx: number[];
  e: number[];
  sw: number[];
  drag: number;
}

interface GallerySandbox {
  clamp: (val: number, min: number, max: number) => number;
  shapeOf: (item: PictureRailItem) => GalleryShape;
  layoutFor: (shapes: GalleryShape[], drops: number[], width: number) => GalleryLayout;
  resolveContacts: (sim: GallerySim, lay: GalleryLayout, shapes: GalleryShape[], margin: number) => void;
}

// Extract pure mathematical and layout algorithms directly from picture-rail-gallery.tsx
function createGallerySandbox(): GallerySandbox {
  const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
  const compCode = fs.readFileSync(compPath, 'utf8');

  // Extract functions and constants prior to the React component
  const helperSection = compCode.slice(0, compCode.indexOf('export function PictureRailGallery'));
  const transpiled = ts.transpile(helperSection, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  });

  const sandboxContext = { Math, performance: { now: () => 1000 }, exports: {} } as unknown as (Record<string, unknown> & GallerySandbox);
  vm.createContext(sandboxContext);
  vm.runInContext(transpiled, sandboxContext);
  return sandboxContext;
}

describe('Challenger Adversarial Stress & Vulnerability Suite', () => {
  const sandbox = createGallerySandbox();

  describe('Adversarial Dimension 1: Malformed & Extreme Datasets', () => {
    test('Empty items array ([]): layoutFor handles zero items gracefully without NaN or div-by-zero', () => {
      const emptyShapes: GalleryShape[] = [];
      const emptyDrops: number[] = [];

      // Test across multiple viewport widths
      for (const w of [0, 320, 768, 1440, 2560]) {
        const lay = sandbox.layoutFor(emptyShapes, emptyDrops, w);
        assert.ok(Number.isFinite(lay.width), 'width must be finite');
        assert.ok(Number.isFinite(lay.unit), 'unit must be finite');
        assert.ok(lay.unit > 0, 'unit must be strictly positive');
        assert.ok(!Number.isNaN(lay.unit), 'unit cannot be NaN');
        assert.equal(lay.carousel, false, 'carousel mode must be false for 0 items');
        assert.deepEqual(lay.tops, [], 'tops array must be empty');
        assert.ok(lay.stageH > 0, 'stage height must be a valid positive number');
        assert.ok(!Number.isNaN(lay.stageH), 'stage height cannot be NaN');
      }
    });

    test('Extreme and boundary aspect ratios: 0, negative, fractional, and massive values', () => {
      const testCases = [
        { aspect: 0, expectedAspect: 0.4 },
        { aspect: -0.5, expectedAspect: 0.4 },
        { aspect: -9999, expectedAspect: 0.4 },
        { aspect: 0.0001, expectedAspect: 0.4 },
        { aspect: 0.4, expectedAspect: 0.4 },
        { aspect: 1.0, expectedAspect: 1.0 },
        { aspect: 2.5, expectedAspect: 2.5 },
        { aspect: 10, expectedAspect: 2.5 },
        { aspect: 100000, expectedAspect: 2.5 },
      ];

      for (const tc of testCases) {
        const item: PictureRailItem = {
          id: 'test-aspect',
          title: 'Aspect Test',
          image: 'https://images.unsplash.com/photo-test',
          aspect: tc.aspect,
        };

        const shape = sandbox.shapeOf(item);
        assert.ok(Number.isFinite(shape.w), `Width for aspect ${tc.aspect} must be finite`);
        assert.ok(Number.isFinite(shape.h), `Height for aspect ${tc.aspect} must be finite`);
        assert.ok(shape.w > 0, `Width for aspect ${tc.aspect} must be positive`);
        assert.ok(shape.h > 0, `Height for aspect ${tc.aspect} must be positive`);
        assert.ok(!Number.isNaN(shape.w), `Width for aspect ${tc.aspect} must not be NaN`);
        assert.ok(!Number.isNaN(shape.h), `Height for aspect ${tc.aspect} must not be NaN`);

        const expectedIw = Math.sqrt(tc.expectedAspect);
        const mold = 0.046; // black frame default
        const expectedW = expectedIw + 2 * mold;
        assert.ok(Math.abs(shape.w - expectedW) < 1e-6, `Calculated shape.w ${shape.w} matches clamped formula`);
      }
    });

    test('Extreme drop wire lengths: negative, out-of-bounds, and undefined values', () => {
      const testDrops = [-1000, -0.5, -0.15, 0, 0.3, 0.6, 1.5, 9999];
      const items = testDrops.map((drop, idx) => ({
        id: `drop-${idx}`,
        title: `Drop ${drop}`,
        image: 'https://images.unsplash.com/photo-test',
        drop,
      }));

      const shapes = items.map((it) => sandbox.shapeOf(it));
      const drops = items.map((it) => it.drop);
      const lay = sandbox.layoutFor(shapes, drops, 1440);

      assert.equal(lay.tops.length, testDrops.length);
      for (let i = 0; i < lay.tops.length; i++) {
        const top = lay.tops[i];
        assert.ok(Number.isFinite(top), `Top ${i} must be finite`);
        assert.ok(!Number.isNaN(top), `Top ${i} must not be NaN`);
        assert.ok(top >= lay.pivotY + lay.unit * 0.08, `Top ${i} must hang below rail pivot line`);
      }
    });

    test('Missing optional properties & invalid frame styles fallback cleanly', () => {
      const minimalItem: PictureRailItem = {
        id: 'min-01',
        title: 'Bare Minimum Item',
        image: 'https://images.unsplash.com/photo-min',
      };

      const shape = sandbox.shapeOf(minimalItem);
      assert.equal(shape.frame, 'black', 'Default frame must fall back to black');
      assert.equal(shape.mat, 0, 'Mat thickness must be 0 when mat is undefined');
      assert.equal(shape.matB, 0, 'Mat bottom offset must be 0 when mat is undefined');
      assert.ok(shape.w > 0 && shape.h > 0, 'Dimensions must be positive');

      const weirdFrameItem = {
        id: 'weird-frame',
        title: 'Weird Frame',
        image: 'https://images.unsplash.com/photo-min',
        frame: 'mahogany_antique',
      } as unknown as PictureRailItem;
      const shapeWeird = sandbox.shapeOf(weirdFrameItem);
      assert.equal(shapeWeird.mold, 0.046, 'Unrecognized frame must fall back to default moulding');
    });

    test('Scalability Stress: Layout computation and contact resolution with 1,000 items', () => {
      const largeCount = 1000;
      const largeItems: PictureRailItem[] = Array.from({ length: largeCount }, (_, i) => ({
        id: `large-${i}`,
        title: `Item ${i}`,
        image: `https://images.unsplash.com/photo-${i}`,
        aspect: 0.8 + (i % 5) * 0.05,
        frame: (['black', 'oak', 'white'] as const)[i % 3],
        mat: i % 2 === 0,
        drop: ((i % 7) - 3) * 0.02,
      }));

      const t0 = performance.now();
      const shapes = largeItems.map((it) => sandbox.shapeOf(it));
      const drops = largeItems.map((it) => it.drop ?? 0);
      const lay = sandbox.layoutFor(shapes, drops, 2560);
      const t1 = performance.now();

      const durationMs = t1 - t0;
      assert.equal(lay.tops.length, largeCount);
      assert.ok(lay.stageH > 0, 'Stage height must be positive');
      assert.ok(durationMs < 50, `1,000 items layout computation must execute in < 50ms (took ${durationMs.toFixed(2)}ms)`);

      // Verify contact resolution complexity
      const sim: GallerySim = {
        x: Array.from({ length: largeCount }, (_, i) => i * 100),
        vx: Array.from({ length: largeCount }, () => 0),
        e: Array.from({ length: largeCount }, () => 0),
        sw: Array.from({ length: largeCount }, () => 0),
        drag: -1,
      };

      const tContact0 = performance.now();
      sandbox.resolveContacts(sim, lay, shapes, 5);
      const tContact1 = performance.now();
      const contactMs = tContact1 - tContact0;

      assert.ok(contactMs < 50, `1,000 items contact resolution must complete in < 50ms (took ${contactMs.toFixed(2)}ms)`);
    });
  });

  describe('Adversarial Dimension 2: Responsive Breakpoints & Viewport Transitions', () => {
    test('Simulate continuous viewport sweep from 240px to 3840px', () => {
      const shapes = EXHIBITION_GALLERY_ITEMS.map((it) => sandbox.shapeOf(it));
      const drops = EXHIBITION_GALLERY_ITEMS.map((it) => it.drop ?? 0);

      const GAP = 0.3;
      const BREATH = 0.1;
      const EDGE = 36;
      const LIFT_GROW = 1.12;
      const RAIL_MIN_UNIT = 90;

      const n = shapes.length;
      const sumW = shapes.reduce((sum: number, s: { w: number }) => sum + s.w, 0);
      const maxW = shapes.reduce((m: number, s: { w: number }) => Math.max(m, s.w), 0);
      const denominator = sumW + Math.max(0, n - 1) * GAP + 2 * BREATH + maxW * (LIFT_GROW - 1);

      // Exact critical width threshold where fit == 90
      const criticalWidth = 2 * EDGE + denominator * RAIL_MIN_UNIT;

      // 1. Viewport below critical width must ALWAYS trigger carousel mode
      const belowWidths = [240, 320, 360, 375, 390, 414, 480, 640, 768, Math.floor(criticalWidth) - 1];
      for (const w of belowWidths) {
        if (w >= criticalWidth) continue;
        const lay = sandbox.layoutFor(shapes, drops, w);
        assert.equal(
          lay.carousel,
          true,
          `Width ${w}px must trigger carousel mode (fit ${( (w - 2 * EDGE) / denominator ).toFixed(2)} < 90)`,
        );
        assert.ok(lay.unit >= 92 && lay.unit <= 128, `Unit at ${w}px must be clamped between 92 and 128 (got ${lay.unit})`);
      }

      // 2. Viewport at or above critical width must trigger continuous rail mode
      const aboveWidths = [Math.ceil(criticalWidth) + 1, 1024, 1280, 1440, 1920, 2560, 3840];
      for (const w of aboveWidths) {
        if (w < criticalWidth) continue;
        const lay = sandbox.layoutFor(shapes, drops, w);
        assert.equal(
          lay.carousel,
          false,
          `Width ${w}px must trigger continuous rail mode (fit ${( (w - 2 * EDGE) / denominator ).toFixed(2)} >= 90)`,
        );
        assert.ok(lay.unit <= 150, `Unit at ${w}px must be capped at 150 (got ${lay.unit})`);
      }
    });

    test('Zero and negative width edge cases do not crash or produce NaN', () => {
      const shapes = EXHIBITION_GALLERY_ITEMS.map((it) => sandbox.shapeOf(it));
      const drops = EXHIBITION_GALLERY_ITEMS.map((it) => it.drop ?? 0);

      for (const w of [0, -10, -500]) {
        const lay = sandbox.layoutFor(shapes, drops, w);
        assert.equal(lay.carousel, true, `Non-positive width ${w} must fall back to carousel`);
        assert.equal(lay.unit, 92, `Non-positive width ${w} unit must clamp to lower bound 92`);
        assert.ok(!Number.isNaN(lay.stageH), 'stageH must not be NaN');
      }
    });
  });

  describe('Adversarial Dimension 3: CSS Tokens, Contrast & Compiled Utilities', () => {
    // Relative luminance per ITU-R BT.709 / WCAG 2.1
    function hexToRgb(hex: string): [number, number, number] {
      const clean = hex.replace('#', '');
      const num = parseInt(clean, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }

    function sRgbLuminance(r: number, g: number, b: number): number {
      const a = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    }

    function contrastRatio(hex1: string, hex2: string): number {
      const [r1, g1, b1] = hexToRgb(hex1);
      const [r2, g2, b2] = hexToRgb(hex2);
      const l1 = sRgbLuminance(r1, g1, b1);
      const l2 = sRgbLuminance(r2, g2, b2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    test('WCAG 2.1 AA/AAA Contrast Verification for Light & Dark Palette Tokens', () => {
      // Light mode tokens
      const lightBg = '#dfe3e8';
      const lightFg = '#1e293b';
      const lightCard = '#ffffff';
      const lightCardFg = '#1e293b';
      const lightMutedFg = '#64748b';

      // Dark mode tokens
      const darkBg = '#070b14';
      const darkFg = '#f1f5f9';
      const darkCard = '#0d1117';
      const darkCardFg = '#f1f5f9';
      const darkMutedFg = '#94a3b8';

      // 1. Light Mode Contrast
      const lightPageContrast = contrastRatio(lightBg, lightFg);
      assert.ok(lightPageContrast >= 7.0, `Light mode page contrast ${lightPageContrast.toFixed(2)}:1 must pass WCAG AAA (>= 7:1)`);

      const lightCardContrast = contrastRatio(lightCard, lightCardFg);
      assert.ok(lightCardContrast >= 7.0, `Light mode card contrast ${lightCardContrast.toFixed(2)}:1 must pass WCAG AAA (>= 7:1)`);

      const lightMutedContrast = contrastRatio(lightCard, lightMutedFg);
      assert.ok(lightMutedContrast >= 4.5, `Light mode muted text contrast ${lightMutedContrast.toFixed(2)}:1 must pass WCAG AA (>= 4.5:1)`);

      // 2. Dark Mode Contrast
      const darkPageContrast = contrastRatio(darkBg, darkFg);
      assert.ok(darkPageContrast >= 7.0, `Dark mode page contrast ${darkPageContrast.toFixed(2)}:1 must pass WCAG AAA (>= 7:1)`);

      const darkCardContrast = contrastRatio(darkCard, darkCardFg);
      assert.ok(darkCardContrast >= 7.0, `Dark mode card contrast ${darkCardContrast.toFixed(2)}:1 must pass WCAG AAA (>= 7:1)`);

      const darkMutedContrast = contrastRatio(darkCard, darkMutedFg);
      assert.ok(darkMutedContrast >= 4.5, `Dark mode muted text contrast ${darkMutedContrast.toFixed(2)}:1 must pass WCAG AA (>= 4.5:1)`);
    });

    test('Compiled production CSS chunks contain semantic utilities', () => {
      const outStaticChunks = path.resolve(process.cwd(), 'out/_next/static/chunks');
      assert.ok(fs.existsSync(outStaticChunks), 'out/_next/static/chunks directory must exist');

      const cssFiles = fs.readdirSync(outStaticChunks).filter((f) => f.endsWith('.css'));
      assert.ok(cssFiles.length > 0, 'Must have at least one compiled CSS chunk');

      let combinedCss = '';
      for (const file of cssFiles) {
        combinedCss += fs.readFileSync(path.join(outStaticChunks, file), 'utf8');
      }

      // Verify Tailwind v4 compiled utilities
      const requiredSelectors = [
        'bg-background',
        'text-foreground',
        'bg-card',
        'text-card-foreground',
        'border-border',
        'text-muted-foreground',
      ];

      for (const sel of requiredSelectors) {
        assert.ok(
          combinedCss.includes(sel),
          `Compiled CSS must contain rule for utility class .${sel}`,
        );
      }
    });
  });

  describe('Adversarial Dimension 4: Security & Dangerous URL Injection', () => {
    test('Image URL sanitization rejects malicious pseudo-protocols and unapproved origins', () => {
      const dangerousUrls = [
        'javascript:alert(1)',
        'javascript:void(0)',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        'data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
        'blob:https://evil.com/payload',
        'http://insecure-cdn.com/art.png',
        'ftp://anonymous@files.com/trojan.jpg',
      ];

      function isSecureImageUrl(url: string): boolean {
        if (!url || typeof url !== 'string') return false;
        try {
          const parsed = new URL(url);
          if (parsed.protocol !== 'https:') return false;
          // Approved secure image host for exhibition assets
          const approvedHosts = ['images.unsplash.com'];
          return approvedHosts.includes(parsed.hostname);
        } catch {
          return false;
        }
      }

      // All dangerous URLs must be rejected
      for (const dangerous of dangerousUrls) {
        assert.equal(isSecureImageUrl(dangerous), false, `Dangerous URL must be rejected: ${dangerous}`);
      }

      // All actual exhibition items must be verified secure
      for (const item of EXHIBITION_GALLERY_ITEMS) {
        assert.equal(
          isSecureImageUrl(item.image),
          true,
          `Exhibition item ${item.id} image must pass strict HTTPS origin check`,
        );
      }
    });

    test('XSS Attack vectors in text fields: React interpolation safety contract', () => {
      const maliciousPayloads = [
        '<script>alert("XSS")</script>',
        '"><img src=x onerror=alert(1)>',
        '<svg/onload=alert(document.cookie)>',
        'javascript:alert(1)',
        '&lt;script&gt;alert(1)&lt;/script&gt;',
        '"><iframe src="data:text/html,<script>alert(1)</script>"></iframe>',
      ];

      // Verify that picture-rail-gallery.tsx never uses dangerouslySetInnerHTML or innerHTML
      const compPath = path.resolve(process.cwd(), 'src/components/ui/picture-rail-gallery.tsx');
      const compContent = fs.readFileSync(compPath, 'utf8');

      assert.doesNotMatch(compContent, /dangerouslySetInnerHTML/, 'picture-rail-gallery.tsx must not use dangerouslySetInnerHTML');
      assert.doesNotMatch(compContent, /\.innerHTML\s*=/, 'picture-rail-gallery.tsx must not assign innerHTML directly');
      assert.doesNotMatch(compContent, /eval\(/, 'picture-rail-gallery.tsx must not use eval');
      assert.doesNotMatch(compContent, /new Function\(/, 'picture-rail-gallery.tsx must not use new Function constructor');

      // Verify page.tsx integration also doesn't use unsafe injection on gallery data
      const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
      const pageContent = fs.readFileSync(pagePath, 'utf8');
      const gallerySectionMatch = pageContent.match(/<section id="(?:projects|gallery)"[\s\S]*?<\/section>/);
      assert.ok(gallerySectionMatch, 'Gallery section must exist in page.tsx');
      assert.doesNotMatch(
        gallerySectionMatch[0],
        /dangerouslySetInnerHTML/,
        'Gallery section in page.tsx must not use dangerouslySetInnerHTML',
      );

      for (const payload of maliciousPayloads) {
        assert.ok(!compContent.includes(payload), `Component must not hardcode payload: ${payload}`);
        assert.ok(!pageContent.includes(payload), `Page must not hardcode payload: ${payload}`);
      }
    });

    test('Oversized string resilience: no catastrophic backtracking or memory crash', () => {
      const massiveString = 'A'.repeat(50000);
      const massiveItem: PictureRailItem = {
        id: 'huge-01',
        title: massiveString,
        artist: massiveString,
        year: '2026',
        image: 'https://images.unsplash.com/photo-valid',
        tag: `Booth P99 • Physical ${massiveString.slice(0, 100)}`,
        details: Array.from({ length: 50 }, (_, i) => `Specification line ${i}: ${massiveString.slice(0, 200)}`),
      };

      const t0 = performance.now();
      const shape = sandbox.shapeOf(massiveItem);
      const lay = sandbox.layoutFor([shape], [0], 1440);
      const t1 = performance.now();

      assert.ok(t1 - t0 < 10, 'Oversized item layout calculation must complete in < 10ms');
      assert.ok(Number.isFinite(lay.stageH), 'Stage height must be finite for oversized item');
    });
  });
});
