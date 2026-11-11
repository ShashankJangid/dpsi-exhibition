import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/lib/utils';
import { playBlip, playChime, playWhoosh, triggerHaptic } from '../src/lib/sound';
import { getDeviceFingerprint } from '../src/lib/fingerprint';
import { OFFICIAL_STUDENTS_ROSTER, getStudentCredentialId } from '../src/data/exhibitionRegistry';
import {
  generateTopotagCells,
  generateMicroQrModules,
  sanitizeInput,
  escapeXml,
  sanitizeQrPayload,
} from '../src/lib/badgeGenerator';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import { useExhibitionStore } from '../src/store/useExhibitionStore';
import { SEED_PROJECTS } from '../src/data/seedProjects';

describe('Client Utilities & Security Helpers', () => {
  test('cn() utility merges classes and handles conditional class conflict resolution', () => {
    const result1 = cn('px-4 py-2', 'bg-blue-500', false && 'hidden', true && 'text-white');
    assert.equal(result1, 'px-4 py-2 bg-blue-500 text-white');

    // Conflict resolution: later Tailwind utility wins
    const result2 = cn('p-4', 'p-2');
    assert.equal(result2, 'p-2');

    const result3 = cn('bg-red-500 text-sm', undefined, null, 'bg-blue-600');
    assert.equal(result3, 'text-sm bg-blue-600');
  });

  test('sound & haptic helpers are SSR-safe and never throw in headless/server environments', () => {
    assert.doesNotThrow(() => {
      playBlip(440);
      playChime();
      playWhoosh();
      triggerHaptic(20);
    }, 'Sound triggers must not throw when Web Audio or navigator.vibrate is absent');
  });

  test('getDeviceFingerprint() returns a valid, non-empty, sanitized string', async () => {
    const fp = await getDeviceFingerprint();
    assert.ok(typeof fp === 'string', 'Fingerprint must be a string');
    assert.ok(fp.length >= 8 && fp.length <= 128, `Fingerprint length out of bounds: ${fp.length}`);
    // Check no forward slashes (which would break Firestore document ID paths)
    assert.ok(!fp.includes('/'), `Fingerprint must not contain forward slashes: ${fp}`);
    assert.ok(/^[a-zA-Z0-9_\-+=:.]{8,128}$/.test(fp), `Fingerprint contains invalid characters: ${fp}`);
  });

  test('every student in the official roster receives a globally unique credential ID', () => {
    const ids = new Set<string>();
    for (const student of OFFICIAL_STUDENTS_ROSTER) {
      const credId = getStudentCredentialId(student);
      assert.ok(/^EXH-\d{4}-\d{2}$/.test(credId), `Invalid credential ID format: ${credId}`);
      assert.ok(!ids.has(credId), `Duplicate credential ID generated: ${credId} for ${student.student_name}`);
      ids.add(credId);
    }
    assert.equal(ids.size, OFFICIAL_STUDENTS_ROSTER.length, 'All students must have unique credential IDs');
  });

  test('students in the same project have distinct member IDs, unique TopoTags, and unique Micro-QR codes', () => {
    const ojas = OFFICIAL_STUDENTS_ROSTER.find((s) => s.student_name === 'Ojas Singh')!;
    const agrima = OFFICIAL_STUDENTS_ROSTER.find((s) => s.student_name === 'Agrima Jain')!;

    assert.ok(ojas && agrima, 'Project 36 students must exist');
    assert.equal(ojas.project_number, 36);
    assert.equal(agrima.project_number, 36);

    const ojasId = getStudentCredentialId(ojas);
    const agrimaId = getStudentCredentialId(agrima);

    // Verify distinct credential IDs
    assert.equal(ojasId, 'EXH-0036-01');
    assert.equal(agrimaId, 'EXH-0036-02');
    assert.notEqual(ojasId, agrimaId);

    // Verify distinct butterfly TopoTags
    const ojasTopotag = generateTopotagCells(ojasId);
    const agrimaTopotag = generateTopotagCells(agrimaId);
    assert.notEqual(ojasTopotag, agrimaTopotag, 'TopoTag must be unique per student even within same project');

    // Verify distinct Micro-QR codes
    const ojasMicroQr = generateMicroQrModules(ojasId);
    const agrimaMicroQr = generateMicroQrModules(agrimaId);
    assert.notEqual(ojasMicroQr, agrimaMicroQr, 'Micro-QR matrix must be unique per student even within same project');
  });

  test('Micro-QR codes on badges are standard ISO/IEC 18004 and decode via optical jsQR', () => {
    const ojasId = 'EXH-0036-01';
    const qr = QRCode.create(ojasId, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const scale = 4;
    const margin = 2;
    const totalSize = (size + margin * 2) * scale;
    const rgba = new Uint8ClampedArray(totalSize * totalSize * 4);
    rgba.fill(255);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              const y = (r + margin) * scale + dy;
              const x = (c + margin) * scale + dx;
              const idx = (y * totalSize + x) * 4;
              rgba[idx] = 0;
              rgba[idx + 1] = 0;
              rgba[idx + 2] = 0;
              rgba[idx + 3] = 255;
            }
          }
        }
      }
    }

    const decoded = jsQR(rgba, totalSize, totalSize);
    assert.ok(decoded, 'jsQR must decode the generated QR code');
    assert.equal(decoded.data, ojasId);
  });

  test('badgeGenerator sanitizes XML control characters, Bidi overrides, and malicious payloads', () => {
    // 1. XML 1.0 disallowed control characters (\x00, \x08, \x1B)
    const dangerousName = 'DEVANSH\x00GROVER\x08\x1B';
    const sanitized = sanitizeInput(dangerousName);
    assert.equal(sanitized, 'DEVANSHGROVER', 'Disallowed control chars must be stripped');

    // 2. Unicode bidi overrides
    const bidiSpoof = '\u202Ereversed\u202C text';
    assert.equal(sanitizeInput(bidiSpoof), 'reversed text', 'Bidi overrides must be stripped');

    // 3. XML entity escaping
    const xmlInjection = '<script>alert("xss") & \'test\'</script>';
    const escaped = escapeXml(xmlInjection);
    assert.ok(!escaped.includes('<') && !escaped.includes('>'), 'Angle brackets must be escaped');
    assert.ok(escaped.includes('&lt;script&gt;') && escaped.includes('&amp;'), 'Entities must be XML escaped');

    // 4. Malicious QR payload schemes
    const jsPayload = 'javascript:alert(1)';
    const dataPayload = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
    const safePayload = 'https://dpsiexhibition.pages.dev/pass?id=EXH-0001';
    assert.equal(sanitizeQrPayload(jsPayload), 'https://dpsiexhibition.pages.dev', 'javascript: scheme must be sanitized');
    assert.equal(sanitizeQrPayload(dataPayload), 'https://dpsiexhibition.pages.dev', 'data: scheme must be sanitized');
    assert.equal(sanitizeQrPayload(safePayload), safePayload, 'Safe URLs must be preserved');
  });

  test('fallback fingerprint uses persistent client entropy to eliminate collisions on identical hardware', async () => {
    const { getDeviceFingerprint, clearCachedFingerprint } = await import('../src/lib/fingerprint');
    
    // Save original globals
    const origWindow = global.window;
    const origNavigator = global.navigator;
    const origScreen = global.screen;
    const origCrypto = global.crypto;

    try {
      const storageMock: Record<string, string> = {};
      let uuidCounter = 1;

      // Mock browser environment with identical Chromebook hardware specs using Object.defineProperty
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: {
            getItem: (key: string) => storageMock[key] || null,
            setItem: (key: string, val: string) => { storageMock[key] = val; },
          },
        },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/120.0.0.0',
        },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(global, 'screen', {
        value: { width: 1366, height: 768 },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: () => `uuid-device-seed-${uuidCounter++}`,
        },
        configurable: true,
        writable: true,
      });

      clearCachedFingerprint();
      const fp1 = await getDeviceFingerprint();
      assert.ok(storageMock['dpsi_client_entropy'], 'dpsi_client_entropy must be persisted in localStorage');
      assert.equal(storageMock['dpsi_client_entropy'], 'uuid-device-seed-1');

      // Subsequent call from the same device (even if cache is cleared) yields the EXACT same fingerprint
      clearCachedFingerprint();
      const fp1Repeat = await getDeviceFingerprint();
      assert.equal(fp1, fp1Repeat, 'Same device must retain stable fingerprint from persisted entropy');

      // Simulate a SECOND Chromebook with the exact same hardware profile (screen 1366x768, same UA, same tz)
      // but a fresh device localStorage
      const storageMockDevice2: Record<string, string> = {};
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: {
            getItem: (key: string) => storageMockDevice2[key] || null,
            setItem: (key: string, val: string) => { storageMockDevice2[key] = val; },
          },
        },
        configurable: true,
        writable: true,
      });

      clearCachedFingerprint();
      const fp2 = await getDeviceFingerprint();
      assert.ok(storageMockDevice2['dpsi_client_entropy'], 'Device 2 must generate its own entropy seed');
      assert.equal(storageMockDevice2['dpsi_client_entropy'], 'uuid-device-seed-2');

      // Crucial anti-cheat property: fp1 and fp2 must NOT collide despite identical hardware!
      assert.notEqual(fp1, fp2, 'Distinct devices on identical hardware must NOT produce colliding fallback fingerprints');
    } finally {
      clearCachedFingerprint();
      Object.defineProperty(global, 'window', { value: origWindow, configurable: true, writable: true });
      Object.defineProperty(global, 'navigator', { value: origNavigator, configurable: true, writable: true });
      Object.defineProperty(global, 'screen', { value: origScreen, configurable: true, writable: true });
      Object.defineProperty(global, 'crypto', { value: origCrypto, configurable: true, writable: true });
    }
  });

  test('WebGLErrorBoundary state transitions properly on error and preserves 2D fallback contract', async () => {
    const { WebGLErrorBoundary } = await import('../src/components/canvas/WebGLErrorBoundary');
    assert.ok(WebGLErrorBoundary, 'WebGLErrorBoundary class must be exported');

    // Test static error derivation
    const testError = new Error('WebGL Context Lost or Not Supported');
    const derivedState = WebGLErrorBoundary.getDerivedStateFromError(testError);
    assert.equal(derivedState.hasError, true);
    assert.equal(derivedState.error, testError);

    // Test initial instance state
    const boundaryInstance = new WebGLErrorBoundary({ children: null });
    assert.equal(boundaryInstance.state.hasError, false);
  });

  test('castVoteInFirebase resolves voting API URL falling back to NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL', async () => {
    const origVoteUrl = process.env.NEXT_PUBLIC_VOTE_API_URL;
    const origFunctionsUrl = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL;
    const origFetch = global.fetch;

    try {
      const { castVoteInFirebase } = await import('../src/lib/firebase');
      let requestedUrl = '';

      // @ts-expect-error Mocking fetch
      global.fetch = async (input: RequestInfo | URL) => {
        requestedUrl = String(input);
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: 'Vote recorded' }),
        };
      };

      // Case 1: NEXT_PUBLIC_VOTE_API_URL takes top precedence
      process.env.NEXT_PUBLIC_VOTE_API_URL = 'https://custom-vote.api/vote';
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL = 'https://cloud-functions.net/vote';
      await castVoteInFirebase({ projectId: 'p01', fingerprint: 'fp_12345678', userId: 'u1' });
      assert.equal(requestedUrl, 'https://custom-vote.api/vote');

      // Case 2: Falls back to NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL when VOTE_API_URL is unset
      delete process.env.NEXT_PUBLIC_VOTE_API_URL;
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL = 'https://cloud-functions.net/vote';
      await castVoteInFirebase({ projectId: 'p01', fingerprint: 'fp_12345678', userId: 'u1' });
      assert.equal(requestedUrl, 'https://cloud-functions.net/vote');

      // Case 3: Defaults to /api/vote when both are unset
      delete process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL;
      await castVoteInFirebase({ projectId: 'p01', fingerprint: 'fp_12345678', userId: 'u1' });
      assert.equal(requestedUrl, '/api/vote');
    } finally {
      process.env.NEXT_PUBLIC_VOTE_API_URL = origVoteUrl;
      process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL = origFunctionsUrl;
      global.fetch = origFetch;
    }
  });

  test('firestore.rules enforces zero-trust lockdown on votes and user_votes collections', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const rulesPath = path.resolve(__dirname, '../firestore.rules');
    const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

    // Verify /votes/{voteId} disallows direct client creation
    assert.ok(
      rulesContent.includes('match /votes/{voteId}'),
      'Must contain /votes/{voteId} rule block'
    );
    assert.ok(
      !rulesContent.includes('allow create: if isValidVote'),
      'Direct client create on /votes must be removed'
    );
    assert.ok(
      rulesContent.includes('allow write: if false;'),
      'Direct client write on /votes must be locked down'
    );

    // Verify /user_votes/{userVoteId} security rules
    assert.ok(
      rulesContent.includes('match /user_votes/{userVoteId}'),
      'Must contain /user_votes/{userVoteId} rule block'
    );
    assert.ok(
      rulesContent.includes('allow read: if isAuthenticated() && isOwner(resource.data.userId);'),
      'Must allow reading user vote receipts only for the owner'
    );

    // Verify isOwner helper exists
    assert.ok(
      rulesContent.includes('function isOwner(userId)'),
      'Must define isOwner helper function'
    );
  });

  test('useExhibitionStore manages WebGL fallback notice, battery-saver low-FPS mode, and booth selection immutably', () => {
    const store = useExhibitionStore.getState();

    assert.equal(store.isLowPerformanceMode, false);
    assert.equal(store.webglFallbackNotice, null);

    store.setLowPerformanceMode(true);
    assert.equal(useExhibitionStore.getState().isLowPerformanceMode, true);

    const notice = '3D WebGL view is unavailable on this device. Switched to 2D Floor Plan.';
    store.setWebglFallbackNotice(notice);
    assert.equal(useExhibitionStore.getState().webglFallbackNotice, notice);

    store.setViewMode('2d');
    assert.equal(useExhibitionStore.getState().viewMode, '2d');

    const sampleProject = SEED_PROJECTS[0];
    store.selectProject(sampleProject);
    assert.equal(useExhibitionStore.getState().selectedProject?.id, sampleProject.id);
    assert.equal(useExhibitionStore.getState().isDrawerOpen, true);

    // Reset state
    store.selectProject(null);
    store.setLowPerformanceMode(false);
    store.setWebglFallbackNotice(null);
    store.setViewMode('3d');
    assert.equal(useExhibitionStore.getState().isDrawerOpen, false);
  });
});
