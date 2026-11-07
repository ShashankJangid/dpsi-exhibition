import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cn } from '../src/lib/utils';
import { playBlip, playChime, playWhoosh, triggerHaptic } from '../src/lib/sound';
import { getDeviceFingerprint } from '../src/lib/fingerprint';

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
});
