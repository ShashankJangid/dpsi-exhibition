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
    // Graceful fallback hardware signature based on screen and user agent
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown_client';
    const screenRes = typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : '1920x1080';
    const tz = new Date().getTimezoneOffset();
    const fallback = `${userAgent}_${screenRes}_${tz}`;
    const base64Str = typeof btoa !== 'undefined' ? btoa(fallback) : Buffer.from(fallback).toString('base64');
    cachedFingerprint = base64Str.replace(/[/+=]/g, '_').substring(0, 32);
    if (cachedFingerprint.length < 8) {
      cachedFingerprint = 'fallback_dpsi_device_fp';
    }
    return cachedFingerprint;
  }
}
