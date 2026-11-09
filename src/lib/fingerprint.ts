'use client';

let cachedFingerprint: string | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) return cachedFingerprint;

  // Safe check for server / headless environments
  if (typeof window === 'undefined') {
    cachedFingerprint = 'server_headless_device_fp';
    return cachedFingerprint;
  }

  try {
    const { getFingerprint } = await import('@thumbmarkjs/thumbmarkjs');
    const fp = await getFingerprint();
    if (fp && String(fp).trim().length >= 8) {
      cachedFingerprint = String(fp).replace(/\//g, '_').trim();
      return cachedFingerprint;
    }
    throw new Error('Thumbmark returned empty or short fingerprint');
  } catch (err) {
    console.warn('Thumbmark hardware fingerprint fallback:', err);
    // Graceful fallback hardware signature based on screen, user agent, and persistent entropy
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown_client';
    const screenRes = typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '1920x1080';
    const tz = new Date().getTimezoneOffset();

    // Generate and persist client-side UUID seed in localStorage to avoid collisions on identical hardware
    let clientEntropy = '';
    try {
      const storage = typeof window !== 'undefined' ? window.localStorage : null;
      if (storage) {
        clientEntropy = storage.getItem('dpsi_client_entropy') || '';
        if (!clientEntropy) {
          clientEntropy =
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? crypto.randomUUID()
              : `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
          storage.setItem('dpsi_client_entropy', clientEntropy);
        }
      }
    } catch {
      // In restricted private mode or sandbox
      clientEntropy =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
    }

    const fallback = `${clientEntropy}_${userAgent}_${screenRes}_${tz}`;
    let base64Str = '';
    try {
      base64Str = typeof btoa !== 'undefined' ? btoa(fallback) : Buffer.from(fallback).toString('base64');
    } catch {
      if (typeof btoa !== 'undefined') {
        base64Str = btoa(encodeURIComponent(fallback).replace(/%([0-9A-F]{2})/g, (_, p) => String.fromCharCode(parseInt(p, 16))));
      } else if (typeof Buffer !== 'undefined') {
        base64Str = Buffer.from(fallback).toString('base64');
      } else {
        base64Str = fallback;
      }
    }

    cachedFingerprint = base64Str.replace(/[/+=]/g, '_').substring(0, 32);
    if (cachedFingerprint.length < 8) {
      cachedFingerprint = 'fallback_dpsi_device_fp';
    }
    return cachedFingerprint;
  }
}

/**
 * Resets the cached fingerprint (useful for testing and simulated multi-device environments).
 */
export function clearCachedFingerprint(): void {
  cachedFingerprint = null;
}
