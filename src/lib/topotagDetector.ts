import {
  OFFICIAL_STUDENTS_ROSTER,
  OFFICIAL_TEACHERS_AND_INCHARGES,
  OFFICIAL_VIP_GUESTS,
  OFFICIAL_GRAND_JURY,
  getStudentCredentialId,
} from '../data/exhibitionRegistry';

/**
 * Deterministic hash and PRNG matching badgeGenerator.ts
 */
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

/**
 * 18 cell coordinates relative to the butterfly vector origin (cx, cy)
 */
export const HEX_CELL_COORDS = [
  // Left Wing (3x3 grid)
  { cx: 111.0, cy: 146.0 },
  { cx: 143.0, cy: 146.0 },
  { cx: 175.0, cy: 146.0 },
  { cx: 111.0, cy: 178.0 },
  { cx: 143.0, cy: 178.0 },
  { cx: 175.0, cy: 178.0 },
  { cx: 111.0, cy: 212.0 },
  { cx: 143.0, cy: 212.0 },
  { cx: 175.0, cy: 212.0 },
  // Right Wing (3x3 grid)
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
 * Computes the 18-bit topological invariant bitmask for a given credential ID.
 */
export function computeTopotagBitmask(credentialId: string): number {
  const rng = mulberry32(hashString(credentialId || 'CR100-0001'));
  const indices = Array.from({ length: 18 }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const ringCount = 5 + Math.floor(rng() * 3);
  let mask = 0;
  for (let i = 0; i < ringCount; i++) {
    mask |= (1 << indices[i]);
  }
  return mask;
}

export interface RegisteredTopotagEntry {
  credentialId: string;
  name: string;
  role: string;
  bitmask: number;
}

// Build precomputed directory of all 197 registered summit credentials
export const SUMMIT_TOPOTAG_REGISTRY: RegisteredTopotagEntry[] = (() => {
  const list: RegisteredTopotagEntry[] = [];

  // Students (177)
  for (const st of OFFICIAL_STUDENTS_ROSTER) {
    const credId = getStudentCredentialId(st);
    list.push({
      credentialId: credId,
      name: st.student_name,
      role: 'Student Innovator',
      bitmask: computeTopotagBitmask(credId),
    });
  }

  // Teachers / Incharges (8)
  for (const t of OFFICIAL_TEACHERS_AND_INCHARGES) {
    list.push({
      credentialId: t.credential_id,
      name: t.name,
      role: 'Faculty Incharge',
      bitmask: computeTopotagBitmask(t.credential_id),
    });
  }

  // VIP Guests (6)
  for (const v of OFFICIAL_VIP_GUESTS) {
    list.push({
      credentialId: v.credential_id,
      name: v.name,
      role: 'Distinguished VIP Guest',
      bitmask: computeTopotagBitmask(v.credential_id),
    });
  }

  // Grand Jury (6)
  for (const j of OFFICIAL_GRAND_JURY) {
    list.push({
      credentialId: j.credential_id,
      name: j.name,
      role: 'Grand Jury Evaluator',
      bitmask: computeTopotagBitmask(j.credential_id),
    });
  }

  return list;
})();

export function getAllRegisteredBitmasks(): RegisteredTopotagEntry[] {
  return SUMMIT_TOPOTAG_REGISTRY;
}

// Bitmask to Credential fast index
const BITMASK_INDEX = new Map<number, RegisteredTopotagEntry>();
for (const item of SUMMIT_TOPOTAG_REGISTRY) {
  BITMASK_INDEX.set(item.bitmask, item);
}

function hammingDistance(a: number, b: number): number {
  let diff = a ^ b;
  let count = 0;
  while (diff > 0) {
    count += diff & 1;
    diff >>= 1;
  }
  return count;
}

export interface TopotagMatchResult {
  entry: RegisteredTopotagEntry;
  credentialId: string;
  name: string;
  role: string;
  distance: number;
  hammingDistance: number;
  confidence: number;
}

/**
 * Searches the registry for the best matching credential given an observed 18-bit mask.
 * Allows up to maxHammingDistance bits of optical noise/camera blur.
 */
export function matchTopotagBitmask(
  observedMask: number,
  maxHammingDistance = 1
): TopotagMatchResult | null {
  // Fast exact match
  const exact = BITMASK_INDEX.get(observedMask);
  if (exact) {
    return {
      entry: exact,
      credentialId: exact.credentialId,
      name: exact.name,
      role: exact.role,
      distance: 0,
      hammingDistance: 0,
      confidence: 1.0,
    };
  }

  // Nearest neighbor search across 197 registered signatures
  let bestEntry: RegisteredTopotagEntry | null = null;
  let minDistance = 999;

  for (const entry of SUMMIT_TOPOTAG_REGISTRY) {
    const dist = hammingDistance(observedMask, entry.bitmask);
    if (dist < minDistance) {
      minDistance = dist;
      bestEntry = entry;
      if (dist === 0) break;
    }
  }

  if (bestEntry && minDistance <= maxHammingDistance) {
    const confidence = Math.max(0.7, 1 - (minDistance / 18));
    return {
      entry: bestEntry,
      credentialId: bestEntry.credentialId,
      name: bestEntry.name,
      role: bestEntry.role,
      distance: minDistance,
      hammingDistance: minDistance,
      confidence,
    };
  }

  return null;
}

export interface TopotagDetectionResult {
  code: string;
  credentialId: string;
  matchedName: string;
  method: 'TOPOTAG_FAILSAFE';
  distance: number;
  hammingDistance: number;
  confidence: number;
}

/**
 * Optical Failsafe Detector:
 * Scans image pixel data for topological invariant cell patterns when standard QR code
 * detection fails (e.g. angle distortion, specular glare, or damaged matrix).
 */
export function detectTopotagFailsafe(
  imageData: ImageData
): TopotagDetectionResult | null {
  const { data, width, height } = imageData;
  if (width < 40 || height < 40) return null;

  // Luminance helper
  const getLum = (x: number, y: number) => {
    const px = Math.round(Math.max(0, Math.min(width - 1, x)));
    const py = Math.round(Math.max(0, Math.min(height - 1, y)));
    const offset = (py * width + px) * 4;
    return (data[offset] * 299 + data[offset + 1] * 587 + data[offset + 2] * 114) / 1000;
  };

  // Inter-cell & wing margin white aperture fiducial coordinates (must be bright white #FFFFFF)
  const WHITE_APERTURE_COORDS = [
    // Left wing inter-cell midpoints
    { cx: 127.0, cy: 162.0 },
    { cx: 159.0, cy: 162.0 },
    { cx: 127.0, cy: 195.0 },
    { cx: 159.0, cy: 195.0 },
    // Right wing inter-cell midpoints
    { cx: 264.0, cy: 162.0 },
    { cx: 298.0, cy: 162.0 },
    { cx: 264.0, cy: 195.0 },
    { cx: 298.0, cy: 195.0 },
    // Wing top/bottom white margins around the 3x3 matrices
    { cx: 143.0, cy: 124.0 },
    { cx: 143.0, cy: 234.0 },
    { cx: 281.0, cy: 124.0 },
    { cx: 281.0, cy: 234.0 },
  ];

  // Helper to test a candidate butterfly origin and scale with strict 98-point structural verification
  const trySample = (origX: number, origY: number, sc: number): TopotagDetectionResult | null => {
    const offset = Math.max(2, Math.round(4 * (sc / 0.72)));

    // Step 1: Verify all 12 white wing aperture points between/around the hexagon cells are bright white
    let apertureSum = 0;
    for (let k = 0; k < WHITE_APERTURE_COORDS.length; k++) {
      const pt = WHITE_APERTURE_COORDS[k];
      const ax = origX + pt.cx * sc;
      const ay = origY + pt.cy * sc;
      if (ax < 0 || ax >= width || ay < 0 || ay >= height) return null;
      const aLum = getLum(ax, ay);
      if (aLum < 165) return null; // Reject immediately if background between cells is not bright white
      apertureSum += aLum;
    }
    const apertureLum = apertureSum / WHITE_APERTURE_COORDS.length;
    if (apertureLum < 180) return null;

    // Step 2: Strict tri-state classification for all 18 hexagonal cells
    let observedMask = 0;
    let ringCount = 0;
    let solidCount = 0;

    for (let i = 0; i < HEX_CELL_COORDS.length; i++) {
      const cell = HEX_CELL_COORDS[i];
      const sx = origX + cell.cx * sc;
      const sy = origY + cell.cy * sc;

      if (sx - offset < 0 || sx + offset >= width || sy - offset < 0 || sy + offset >= height) {
        return null;
      }

      const p1 = getLum(sx + offset, sy);
      const p2 = getLum(sx - offset, sy);
      const p3 = getLum(sx, sy + offset);
      const p4 = getLum(sx, sy - offset);
      const pLum = (p1 + p2 + p3 + p4) / 4;
      const pMax = Math.max(p1, p2, p3, p4);

      // Every single one of the 18 cells MUST have a dark hexagon perimeter contrasting with the white wing aperture
      if (pLum > 105 || pMax > 135 || apertureLum - pLum < 75) {
        return null;
      }

      const centerLum = getLum(sx, sy);

      // Tri-state center verification:
      // 1) Genus-1 Ring: bright white center hole inside dark hexagon perimeter
      if (centerLum >= 160 && centerLum - pLum >= 65) {
        observedMask |= (1 << i);
        ringCount++;
      } else if (centerLum <= 95 && Math.abs(centerLum - pLum) <= 35) {
        // 2) Genus-0 Solid Hexagon: dark center matching dark hexagon perimeter
        solidCount++;
      } else {
        // 3) Ambiguous / non-hexagon pixel data -> reject immediately (zero false positives)
        return null;
      }
    }

    // Step 3: Enforce topological ring count invariant (all official badges have 5, 6, or 7 rings)
    if (ringCount < 5 || ringCount > 7 || ringCount + solidCount !== 18) {
      return null;
    }

    // Step 4: Require exact 18-bit signature match (0 Hamming distance) to prevent neighbor guessing
    const match = matchTopotagBitmask(observedMask, 0);
    if (match && match.hammingDistance === 0) {
      return {
        code: match.credentialId,
        credentialId: match.credentialId,
        matchedName: match.name,
        method: 'TOPOTAG_FAILSAFE',
        distance: 0,
        hammingDistance: 0,
        confidence: 1.0,
      };
    }

    return null;
  };

  // Strategy 1: Standard Full-Card Alignment (CR-100 Badge 985x670)
  // Butterfly origin is at X = 602 (61.1%), Y = 115 (17.1%), scale = 0.72 * (width / 985)
  const baseScale = 0.72 * (width / 985);
  const baseX = width * 0.611;
  const baseY = height * 0.171;

  // Grid shift sweep around nominal position to tolerate camera angle, margins, or padding
  const xShifts = [0, -0.02, 0.02, -0.04, 0.04, -0.07, 0.07];
  const yShifts = [0, -0.02, 0.02, -0.04, 0.04];
  const scaleFactors = [1.0, 0.95, 1.05, 0.9, 1.1];

  for (const sFactor of scaleFactors) {
    const sc = baseScale * sFactor;
    for (const dy of yShifts) {
      for (const dx of xShifts) {
        const res = trySample(baseX + width * dx, baseY + height * dy, sc);
        if (res) return res;
      }
    }
  }

  // Strategy 2: Close-up Butterfly Framing (user holds camera close to the butterfly)
  const closeUpScales = [width * 0.0016, width * 0.0020, width * 0.0013, width * 0.0024];
  const closeUpOriginsX = [width * 0.20, width * 0.25, width * 0.15, width * 0.30];
  const closeUpOriginsY = [height * 0.15, height * 0.20, height * 0.25, height * 0.10];

  for (const sc of closeUpScales) {
    for (const cy of closeUpOriginsY) {
      for (const cx of closeUpOriginsX) {
        const res = trySample(cx, cy, sc);
        if (res) return res;
      }
    }
  }

  return null;
}
