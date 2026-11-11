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

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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
    const rawId = credentialId || 'CR100-0001';
    const qr = QRCode.create(rawId, {
      errorCorrectionLevel: 'M',
    });
    const size = qr.modules.size;
    const moduleSize = 84.0 / size;
    const rects: string[] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (qr.modules.get(r, c)) {
          rects.push(
            `        <rect x="${(c * moduleSize).toFixed(2)}" y="${(r * moduleSize).toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="#0F172A" shape-rendering="crispEdges"/>`
          );
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
  const nameUpper = escapeXml(rawName);
  const secUpper = escapeXml((data.classSection || 'EXPO 2026').trim().toUpperCase());
  const idUpper = escapeXml((data.credentialId || 'CR100-0001').trim().toUpperCase());
  const domainText = escapeXml(data.projectDomain || 'STEM & Autonomous Robotics');
  const venueText = escapeXml(data.venueLocation || 'Maker Lab • Booth 01 (Hall A)');

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
    /(<g transform="translate\(54, 236\)">[\s\S]*?<text x="0" y="44" [^>]*font-size=")([^"]+)("[^>]*>)([\s\S]*?)(<\/text>)/,
    (_m, p1, _p2, p3, _p4, p5) => {
      const cleanP3 = p3.replace(/^"/, '').replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${p1}${nameFontSize}"${nameLengthAttr}${cleanP3}${nameUpper}${p5}`;
    }
  );

  // 2. Class & Section cardlet
  svg = svg.replace(
    /(CLASS &amp; SECTION<\/text>\s*<text [^>]*>)([\s\S]*?)(<\/text>)/,
    (_m, p1, _p2, p3) => `${p1}${secUpper}${p3}`
  );

  // 3. Credential ID cardlet with dynamic scaling for member-indexed IDs (e.g. EXH-0036-01)
  const credFontSize = idUpper.length > 10 ? '24' : idUpper.length > 8 ? '26' : '30';
  const credLetterSpacing = idUpper.length > 10 ? '0.4' : '1';
  svg = svg.replace(
    /(CREDENTIAL ID<\/text>\s*<text [^>]*)font-size="[^"]*"([^>]*)letter-spacing="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/,
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
    /(PROJECT DOMAIN<\/text>[\s\S]*?<text [^>]*)font-size="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/,
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
    /(EXHIBITION VENUE<\/text>[\s\S]*?<text [^>]*)font-size="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/,
    (_m, p1, p2, _p3, p4) => {
      const cleanP1 = p1.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      const cleanP2 = p2.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${cleanP1}font-size="${venueFontSize}"${venueLengthAttr}${cleanP2}${venueText}${p4}`;
    }
  );

  // 7. Micro-QR cardlet ID with responsive sizing
  const qrCredFontSize = idUpper.length > 10 ? '14' : '16';
  svg = svg.replace(
    /(<g transform="translate\(24, 48\)">[\s\S]*?<text x="0" y="24" [^>]*font-size=")([^"]+)("[^>]*>)([\s\S]*?)(<\/text>)/,
    (_m, p1, _p2, p3, _p4, p5) => `${p1}${qrCredFontSize}${p3}${idUpper}${p5}`
  );

  // 8. Micro-QR cardlet Name & Section with responsive sizing and width containment (< 160px)
  const qrNameSec = `${nameUpper} &#8226; ${secUpper}`;
  const qrNameFontSize = qrNameSec.length > 26 ? '7.5' : qrNameSec.length > 20 ? '8.5' : '9';
  const qrNameLengthAttr = qrNameSec.length > 30 ? ' textLength="160" lengthAdjust="spacingAndGlyphs"' : '';
  svg = svg.replace(
    /(<text x="0" y="44" class="font-mono" [^>]*)font-size="[^"]*"([^>]*>)([\s\S]*?)(<\/text>)/,
    (_m, p1, p2, _p3, p4) => {
      const cleanP1 = p1.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      const cleanP2 = p2.replace(/\s*textLength="[^"]*"/g, '').replace(/\s*lengthAdjust="[^"]*"/g, '');
      return `${cleanP1}font-size="${qrNameFontSize}"${qrNameLengthAttr}${cleanP2}${qrNameSec}${p4}`;
    }
  );

  // 9. Butterfly TopoTags Replacement (Unique per Credential ID)
  const dynamicTopotags = generateTopotagCells(data.credentialId);
  svg = svg.replace(
    /<!-- 18 Topological Invariant Code Hexagons[\s\S]*?(?=\s*<\/g>\s*<\/g>\s*<\/g>\s*<!-- 2\. BOTTOM-RIGHT)/,
    () => dynamicTopotags
  );

  // 10. Micro-QR Code Matrix Replacement (Unique per Credential ID & Student Name)
  const qrPayload = data.qrPayload || (data.name
    ? `https://dpsiexibition.pages.dev/pass?id=${idUpper}&name=${encodeURIComponent(rawName)}`
    : idUpper);
  const dynamicMicroQr = generateMicroQrModules(qrPayload);
  svg = svg.replace(
    /(<g transform="translate\(200, 32\)">\s*<rect x="-8" y="-8" [^>]*\/>)[\s\S]*?(<\/g>\s*<\/g>\s*<\/g>\s*<\/svg>)/,
    (_m, p1, p2) => `${p1}\n${dynamicMicroQr}\n      ${p2}`
  );

  return svg;
}
