import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/lib/utils';
import { playBlip, playChime, playWhoosh, triggerHaptic } from '../src/lib/sound';
import { getDeviceFingerprint } from '../src/lib/fingerprint';
import { OFFICIAL_STUDENTS_ROSTER, getStudentCredentialId } from '../src/data/exhibitionRegistry';
import { generateTopotagCells, generateMicroQrModules } from '../src/lib/badgeGenerator';

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
    const shanaya = OFFICIAL_STUDENTS_ROSTER.find((s) => s.student_name === 'Shanaya Yadav')!;

    assert.ok(ojas && agrima && shanaya, 'Project 36 students must exist');
    assert.equal(ojas.project_number, 36);
    assert.equal(shanaya.project_number, 36);

    const ojasId = getStudentCredentialId(ojas);
    const agrimaId = getStudentCredentialId(agrima);
    const shanayaId = getStudentCredentialId(shanaya);

    // Verify distinct credential IDs
    assert.equal(ojasId, 'EXH-0036-01');
    assert.equal(agrimaId, 'EXH-0036-02');
    assert.equal(shanayaId, 'EXH-0036-03');
    assert.notEqual(ojasId, shanayaId);

    // Verify distinct butterfly TopoTags
    const ojasTopotag = generateTopotagCells(ojasId);
    const shanayaTopotag = generateTopotagCells(shanayaId);
    assert.notEqual(ojasTopotag, shanayaTopotag, 'TopoTag must be unique per student even within same project');

    // Verify distinct Micro-QR codes
    const ojasMicroQr = generateMicroQrModules(ojasId);
    const shanayaMicroQr = generateMicroQrModules(shanayaId);
    assert.notEqual(ojasMicroQr, shanayaMicroQr, 'Micro-QR matrix must be unique per student even within same project');
  });
});
