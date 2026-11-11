/**
 * DPS Indirapuram Tech & Innovation Summit 2026
 * Apple Card CR-100 Badge Generator
 * Replaces dynamic fields, unique Butterfly TopoTags, and Micro-QR codes
 * based on the participant Credential ID.
 */

import QRCode from 'qrcode';

export interface BadgeData {
  name: string;
  classSection: string;
  credentialId: string;
  projectDomain?: string;
  venueLocation?: string;
  qrPayload?: string;
}

/**
 * Strips XML 1.0 disallowed control characters, Unicode bidi override vectors,
 * and normalizes excess whitespace to guarantee well-formed, injection-safe SVG.
 */
export function sanitizeInput(str: unknown, maxLength = 120): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function escapeXml(str: unknown, maxLength = 120): string {
  return sanitizeInput(str, maxLength)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Sanitizes QR code payload strings to prevent malicious URI schemes or injection.
 */
export function sanitizeQrPayload(payload: unknown, maxLength = 500): string {
  const sanitized = sanitizeInput(payload, maxLength);
  if (/^(javascript|data|vbscript):/i.test(sanitized)) {
    return 'https://dpsiexhibition.pages.dev';
  }
  return sanitized;
}

// Pre-compiled high-performance regular expressions for badge field injection
const RE_PARTICIPANT_NAME = /(<g transform="translate\(54, 236\)">[\s\S]*?<text x="0" y="44" [^>]*font-size=")([^"]+)("[^>]*>)([\s\S]*?)(<\/text>)/;
const RE_CLASS_SECTION = /(CLASS &amp; SECTION<\/text>\s*<text [^>]*>)([\s\S]*?)(<\/text>)/;
const RE_CREDENTIAL_ID = /(CREDENTIAL ID<\/text>\s*<text [^>]*)font-size="[^"]*"([^>]*)letter-spacing="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/;
const RE_PROJECT_DOMAIN = /(PROJECT DOMAIN<\/text>[\s\S]*?<text [^>]*)font-size="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/;
const RE_EXHIBITION_VENUE = /(EXHIBITION VENUE<\/text>[\s\S]*?<text [^>]*)font-size="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/;
const RE_QR_CRED_ID = /(<g transform="translate\(24, 48\)">[\s\S]*?<text x="0" y="24" [^>]*font-size=")([^"]+)("[^>]*>)([\s\S]*?)(<\/text>)/;
const RE_QR_NAME_SEC = /(<text x="0" y="44" class="font-mono" [^>]*)font-size="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/;
const RE_TOPOTAGS = /<!-- 18 Topological Invariant Code Hexagons[\s\S]*?(?=\s*<\/g>\s*<\/g>\s*<\/g>\s*<!-- 2\. BOTTOM-RIGHT)/;
const RE_MICRO_QR = /(<g transform="translate\(200, 32\)">\s*<rect\s+[^>]*\/>)[\s\S]*?(<\/g>\s*<\/g>\s*<\/g>\s*<\/svg>)/;

function hashString(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const HEX_CELLS = [
  { cx: 111.0, cy: 146.0 },
  { cx: 143.0, cy: 146.0 },
  { cx: 175.0, cy: 146.0 },
  { cx: 111.0, cy: 178.0 },
  { cx: 143.0, cy: 178.0 },
  { cx: 175.0, cy: 178.0 },
  { cx: 111.0, cy: 212.0 },
  { cx: 143.0, cy: 212.0 },
  { cx: 175.0, cy: 212.0 },
  { cx: 247.0, cy: 146.0 },
  { cx: 281.0, cy: 146.0 },
  { cx: 315.0, cy: 146.0 },
  { cx: 247.0, cy: 178.0 },
  { cx: 281.0, cy: 178.0 },
  { cx: 315.0, cy: 178.0 },
  { cx: 247.0, cy: 212.0 },
  { cx: 281.0, cy: 212.0 },
  { cx: 315.0, cy: 212.0 },
];

/**
 * Deterministically generates the 18 topological invariant hexagonal cells
 * of the butterfly optical security tag keyed to the Credential ID.
 */
export function generateTopotagCells(credentialId: string): string {
  const rng = mulberry32(hashString(credentialId || 'CR100-0001'));
  const indices = Array.from({ length: 18 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const ringCount = 5 + Math.floor(rng() * 3); // 5 to 7 genus-1 rings
  const ringSet = new Set(indices.slice(0, ringCount));

  const cells = HEX_CELLS.map((cell, idx) => {
    const { cx, cy } = cell;
    const hexD = `M ${(cx + 11.43).toFixed(2)},${(cy + 6.6).toFixed(2)} L ${cx.toFixed(2)},${(cy + 13.2).toFixed(2)} L ${(cx - 11.43).toFixed(2)},${(cy + 6.6).toFixed(2)} L ${(cx - 11.43).toFixed(2)},${(cy - 6.6).toFixed(2)} L ${cx.toFixed(2)},${(cy - 13.2).toFixed(2)} L ${(cx + 11.43).toFixed(2)},${(cy - 6.6).toFixed(2)} Z`;
    if (ringSet.has(idx)) {
      return `        <g class="genus-1-ring" data-cell="${idx}">\n            <path d="${hexD}" fill="#0F172A" shape-rendering="geometricPrecision"/>\n            <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="4.8" fill="#FFFFFF"/>\n        </g>`;
    }
    return `        <path d="${hexD}" fill="#0F172A" shape-rendering="geometricPrecision"/>`;
  });

  return `<!-- 18 Topological Invariant Code Hexagons (Encoded ID: ${escapeXml(credentialId)}) -->\n${cells.join('\n')}`;
}

/**
 * Deterministically generates standard ISO/IEC 18004 QR Code modules
 * keyed to the Credential ID, optically scannable by camera and phone readers.
 */
export function generateMicroQrModules(credentialId: string): string {
  try {
    const rawId = sanitizeInput(credentialId || 'CR100-0001', 500);
    const qr = QRCode.create(rawId, {
      errorCorrectionLevel: 'M',
    });
    const size = qr.modules.size;
    const moduleSize = 84.0 / size;
    const rects: string[] = [];

    // Optimize DOM size: coalesce contiguous horizontal dark modules into single rects
    for (let r = 0; r < size; r++) {
      let runStart = -1;
      for (let c = 0; c <= size; c++) {
        const isDark = c < size && qr.modules.get(r, c);
        if (isDark) {
          if (runStart === -1) runStart = c;
        } else if (runStart !== -1) {
          const runLength = c - runStart;
          const x = (runStart * moduleSize).toFixed(2);
          const y = (r * moduleSize).toFixed(2);
          const w = (runLength * moduleSize).toFixed(2);
          const h = moduleSize.toFixed(2);
          rects.push(
            `        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0F172A" shape-rendering="crispEdges"/>`
          );
          runStart = -1;
        }
      }
    }
    return rects.join('\n');
  } catch (err) {
    console.error('Failed to generate standard QR code modules:', err);
    return '';
  }
}

/**
 * Injects dynamic participant details, unique Butterfly TopoTags,
 * and Micro-QR codes into the approved Apple Card CR-100 SVG template.
 */
export function generateAppleCardSvg(
  templateSvg: string,
  data: BadgeData
): string {
  let svg = templateSvg;
  const rawName = (data.name || 'OFFICIAL DELEGATE').trim().toUpperCase();
  const nameUpper = escapeXml(rawName, 60);
  const secUpper = escapeXml((data.classSection || 'EXPO 2026').trim().toUpperCase(), 30);
  const idUpper = escapeXml((data.credentialId || 'CR100-0001').trim().toUpperCase(), 20);
  const domainText = escapeXml(data.projectDomain || 'STEM & Autonomous Robotics', 100);
  const venueText = escapeXml(data.venueLocation || 'Maker Lab • Booth 01 (Hall A)', 100);

  // Dynamic font sizing for long participant names to prevent clipping
  let nameFontSize = '46';
  let nameLengthAttr = '';
  if (rawName.length > 25) {
    nameFontSize = '26';
    nameLengthAttr = ' textLength="460" lengthAdjust="spacingAndGlyphs"';
  } else if (rawName.length > 18) {
    nameFontSize = '32';
  } else if (rawName.length > 13) {
    nameFontSize = '38';
  }

  // 1. Primary participant name
  svg = svg.replace(
    RE_PARTICIPANT_NAME,
    (_m, p1, _p2, p3, _p4, p5) => {
      const cleanP3 = p3.replace(/^"/, '').replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${p1}${nameFontSize}"${nameLengthAttr}${cleanP3}${nameUpper}${p5}`;
    }
  );

  // 2. Class & Section cardlet
  svg = svg.replace(
    RE_CLASS_SECTION,
    (_m, p1, _p2, p3) => `${p1}${secUpper}${p3}`
  );

  // 3. Credential ID cardlet with dynamic scaling for member-indexed IDs (e.g. EXH-0036-01)
  const credFontSize = idUpper.length > 10 ? '24' : idUpper.length > 8 ? '26' : '30';
  const credLetterSpacing = idUpper.length > 10 ? '0.4' : '1';
  svg = svg.replace(
    RE_CREDENTIAL_ID,
    (_m, p1, p2, p3, _p4, p5) => `${p1}font-size="${credFontSize}"${p2}letter-spacing="${credLetterSpacing}"${p3}${idUpper}${p5}`
  );

  // 4. Project Domain with responsive font-sizing & strict box containment (< 420px)
  let domainFontSize = '14.5';
  let domainLengthAttr = '';
  if (domainText.length > 55) {
    domainFontSize = '11';
    domainLengthAttr = ' textLength="415" lengthAdjust="spacingAndGlyphs"';
  } else if (domainText.length > 40) {
    domainFontSize = '12.5';
  } else if (domainText.length > 25) {
    domainFontSize = '13.5';
  }
  svg = svg.replace(
    RE_PROJECT_DOMAIN,
    (_m, p1, p2, _p3, p4) => {
      const cleanP1 = p1.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      const cleanP2 = p2.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${cleanP1}font-size="${domainFontSize}"${domainLengthAttr}${cleanP2}${domainText}${p4}`;
    }
  );

  // 5. Exhibition Venue with responsive font-sizing & strict box containment (< 420px)
  let venueFontSize = '13.5';
  let venueLengthAttr = '';
  if (venueText.length > 55) {
    venueFontSize = '10.5';
    venueLengthAttr = ' textLength="415" lengthAdjust="spacingAndGlyphs"';
  } else if (venueText.length > 40) {
    venueFontSize = '12';
  } else if (venueText.length > 25) {
    venueFontSize = '12.5';
  }
  svg = svg.replace(
    RE_EXHIBITION_VENUE,
    (_m, p1, p2, _p3, p4) => {
      const cleanP1 = p1.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      const cleanP2 = p2.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${cleanP1}font-size="${venueFontSize}"${venueLengthAttr}${cleanP2}${venueText}${p4}`;
    }
  );

  // 7. Micro-QR cardlet ID with responsive sizing
  const qrCredFontSize = idUpper.length > 10 ? '14' : '16';
  svg = svg.replace(
    RE_QR_CRED_ID,
    (_m, p1, _p2, p3, _p4, p5) => `${p1}${qrCredFontSize}${p3}${idUpper}${p5}`
  );

  // 8. Micro-QR cardlet Name & Section with responsive sizing and width containment (< 160px)
  const qrNameSec = secUpper ? `${nameUpper} &#8226; ${secUpper}` : nameUpper;
  const qrNameFontSize = qrNameSec.length > 26 ? '7.5' : qrNameSec.length > 20 ? '8.5' : '9';
  const qrNameLengthAttr = qrNameSec.length > 30 ? ' textLength="160" lengthAdjust="spacingAndGlyphs"' : '';
  svg = svg.replace(
    RE_QR_NAME_SEC,
    (_m, p1, p2, _p3, p4) => {
      const cleanP1 = p1.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      const cleanP2 = p2.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${cleanP1}font-size="${qrNameFontSize}"${qrNameLengthAttr}${cleanP2}${qrNameSec}${p4}`;
    }
  );

  // 9. Butterfly TopoTags Replacement (Unique per Credential ID)
  const dynamicTopotags = generateTopotagCells(data.credentialId);
  svg = svg
    .replace(/<!-- 1\. UPPER-RIGHT: AUTHENTIC BUTTERFLY TOPOTAG[^>]*-->/g, `<!-- 1. UPPER-RIGHT: AUTHENTIC BUTTERFLY TOPOTAG (ENCODED ID: ${idUpper}) -->`)
    .replace(/data-topotag-id="[^"]*"/g, `data-topotag-id="${idUpper}"`)
    .replace(
      RE_TOPOTAGS,
      () => dynamicTopotags
    );

  // 10. Micro-QR Code Matrix Replacement (Unique per Credential ID & Student Name)
  const qrPayloadRaw = data.qrPayload || (data.name
    ? `https://dpsi-exhibition.pages.dev/pass?id=${idUpper}`
    : idUpper);
  const qrPayload = sanitizeQrPayload(qrPayloadRaw);
  const dynamicMicroQr = generateMicroQrModules(qrPayload);
  svg = svg.replace(
    RE_MICRO_QR,
    (_m, p1, p2) => `${p1}\n${dynamicMicroQr}\n      ${p2}`
  );

  return svg;
}
