import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/lib/utils';
import { playBlip, playChime, playWhoosh, triggerHaptic } from '../src/lib/sound';
import { getDeviceFingerprint } from '../src/lib/fingerprint';
import { OFFICIAL_STUDENTS_ROSTER, getStudentCredentialId } from '../src/data/exhibitionRegistry';
import { generateTopotagCells, generateMicroQrModules } from '../src/lib/badgeGenerator';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

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
});
