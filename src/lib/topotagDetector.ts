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

export const HEX_CELL_COORDS = [
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
    const px = Math.floor(Math.max(0, Math.min(width - 1, x)));
    const py = Math.floor(Math.max(0, Math.min(height - 1, y)));
    const offset = (py * width + px) * 4;
    return (data[offset] * 299 + data[offset + 1] * 587 + data[offset + 2] * 114) / 1000;
  };

  // Check candidate regions in the optical quadrant
  const candidateRegions = [
    { startX: width * 0.55, startY: height * 0.15, spanW: width * 0.40, spanH: height * 0.45 },
    { startX: width * 0.60, startY: height * 0.20, spanW: width * 0.35, spanH: height * 0.35 },
    { startX: width * 0.50, startY: height * 0.10, spanW: width * 0.48, spanH: height * 0.50 },
    { startX: width * 0.20, startY: height * 0.20, spanW: width * 0.60, spanH: height * 0.60 },
  ];

  for (const region of candidateRegions) {
    let observedMask = 0;
    let sampledCount = 0;

    for (let i = 0; i < HEX_CELL_COORDS.length; i++) {
      const cell = HEX_CELL_COORDS[i];
      const normX = (cell.cx - 100) / 225;
      const normY = (cell.cy - 140) / 80;

      const sampleX = region.startX + normX * region.spanW;
      const sampleY = region.startY + normY * region.spanH;

      const centerLum = getLum(sampleX, sampleY);

      const p1 = getLum(sampleX + 3, sampleY);
      const p2 = getLum(sampleX - 3, sampleY);
      const p3 = getLum(sampleX, sampleY + 3);
      const p4 = getLum(sampleX, sampleY - 3);
      const perimeterLum = (p1 + p2 + p3 + p4) / 4;

      const isRing = (centerLum > 130 && centerLum > perimeterLum + 35) || (centerLum > 175);
      if (isRing) {
        observedMask |= (1 << i);
      }
      sampledCount++;
    }

    if (sampledCount === 18 && observedMask > 0) {
      const match = matchTopotagBitmask(observedMask, 1);
      if (match && match.confidence >= 0.85) {
        return {
          code: match.credentialId,
          credentialId: match.credentialId,
          matchedName: match.name,
          method: 'TOPOTAG_FAILSAFE',
          distance: match.distance,
          hammingDistance: match.hammingDistance,
          confidence: match.confidence,
        };
      }
    }
  }

  return null;
}
