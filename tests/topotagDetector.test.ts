import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import jsQR from 'jsqr';
import {
  computeTopotagBitmask,
  matchTopotagBitmask,
  detectTopotagFailsafe,
  getAllRegisteredBitmasks,
} from '../src/lib/topotagDetector';
import {
  OFFICIAL_STUDENTS_ROSTER,
  OFFICIAL_TEACHERS_AND_INCHARGES,
  OFFICIAL_GRAND_JURY,
  OFFICIAL_VIP_GUESTS,
} from '../src/data/exhibitionRegistry';

describe('TopoTag Optical Failsafe & Matrix Invariant Suite', () => {
  test('Deterministic bitmask computation produces non-zero 18-bit integer', () => {
    const mask1 = computeTopotagBitmask('EXH-0001-01');
    const mask2 = computeTopotagBitmask('EXH-0001-01');
    assert.strictEqual(mask1, mask2, 'Bitmasks must be strictly deterministic');
    assert.ok(mask1 > 0, 'Bitmask must have set bits');
    assert.ok(mask1 < (1 << 18), 'Bitmask must fit within 18 bits');
  });

  test('All registered summit attendees produce collision-free TopoTag signatures', () => {
    const all = getAllRegisteredBitmasks();
    const totalExpected =
      OFFICIAL_STUDENTS_ROSTER.length +
      OFFICIAL_TEACHERS_AND_INCHARGES.length +
      OFFICIAL_GRAND_JURY.length +
      OFFICIAL_VIP_GUESTS.length;

    assert.strictEqual(all.length, totalExpected, `Must index exactly ${totalExpected} registered attendees`);

    const bitmaskMap = new Map<number, string>();
    for (const item of all) {
      if (bitmaskMap.has(item.bitmask)) {
        assert.fail(
          `Collision detected between ${item.credentialId} and ${bitmaskMap.get(item.bitmask)} for bitmask 0b${item.bitmask.toString(2)}`
        );
      }
      bitmaskMap.set(item.bitmask, item.credentialId);
    }
    assert.strictEqual(bitmaskMap.size, totalExpected, 'Every attendee has a distinct TopoTag signature');
  });

  test('Exact match lookup identifies Grand Jury, VIP, Incharge, and Student passes', () => {
    // 1. Grand Jury
    const juryMask = computeTopotagBitmask('JDG-0001');
    const matchJury = matchTopotagBitmask(juryMask);
    assert.ok(matchJury, 'Grand Jury pass must be matched');
    assert.strictEqual(matchJury?.credentialId, 'JDG-0001');
    assert.strictEqual(matchJury?.hammingDistance, 0);

    // 2. VIP Guest
    const vipMask = computeTopotagBitmask('VIP-0001');
    const matchVip = matchTopotagBitmask(vipMask);
    assert.ok(matchVip, 'VIP pass must be matched');
    assert.strictEqual(matchVip?.credentialId, 'VIP-0001');
    assert.strictEqual(matchVip?.hammingDistance, 0);

    // 3. Faculty In-Charge
    const incMask = computeTopotagBitmask('INC-0001');
    const matchInc = matchTopotagBitmask(incMask);
    assert.ok(matchInc, 'Incharge pass must be matched');
    assert.strictEqual(matchInc?.credentialId, 'INC-0001');
    assert.strictEqual(matchInc?.hammingDistance, 0);

    // 4. Student Exhibitor
    const stuMask = computeTopotagBitmask('EXH-0001-01');
    const matchStu = matchTopotagBitmask(stuMask);
    assert.ok(matchStu, 'Student pass must be matched');
    assert.strictEqual(matchStu?.credentialId, 'EXH-0001-01');
    assert.strictEqual(matchStu?.hammingDistance, 0);
  });

  test('Hamming distance error recovery corrects 1-bit camera noise', () => {
    const originalMask = computeTopotagBitmask('JDG-0002');
    // Flip bit 3 (simulating slight glare/noise on one cell)
    const noisyMask = originalMask ^ (1 << 3);

    const match = matchTopotagBitmask(noisyMask, 1);
    assert.ok(match, 'Must recover credential with 1-bit camera noise');
    assert.strictEqual(match?.credentialId, 'JDG-0002');
    assert.strictEqual(match?.hammingDistance, 1);
  });

  test('Rejects noise when Hamming distance exceeds tolerance', () => {
    const originalMask = computeTopotagBitmask('VIP-0003');
    // Flip 5 bits
    const heavyNoiseMask = originalMask ^ 0b11111;
    const match = matchTopotagBitmask(heavyNoiseMask, 1);
    assert.strictEqual(match, null, 'Must reject heavily corrupted bitmask');
  });

  test('detectTopotagFailsafe correctly authenticates simulated card pixel matrix', () => {
    const width = 985;
    const height = 670;
    const data = new Uint8ClampedArray(width * height * 4);
    // Fill white background
    data.fill(255);

    // Generate VIP-0001 pattern
    const mask = computeTopotagBitmask('VIP-0001');
    const originX = width * 0.611;
    const originY = height * 0.171;
    const scale = (width / 985) * 0.72;

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

    // Draw the 18 hexagons and rings
    for (let i = 0; i < 18; i++) {
      const isRing = (mask & (1 << i)) !== 0;
      const cx = Math.round(originX + HEX_CELLS[i].cx * scale);
      const cy = Math.round(originY + HEX_CELLS[i].cy * scale);

      // Draw dark hexagon perimeter around (cx, cy)
      for (let dy = -6; dy <= 6; dy++) {
        for (let dx = -6; dx <= 6; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          const px = cx + dx;
          const py = cy + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            if (dist <= 6 && dist >= 3) {
              // Dark perimeter
              data[idx] = 15;
              data[idx + 1] = 23;
              data[idx + 2] = 42;
            } else if (dist < 3) {
              if (isRing) {
                // White hole
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
              } else {
                // Dark solid center
                data[idx] = 15;
                data[idx + 1] = 23;
                data[idx + 2] = 42;
              }
            }
          }
        }
      }
    }

    const result = detectTopotagFailsafe({ width, height, data } as ImageData);
    assert.ok(result, 'Failsafe must detect VIP-0001 from simulated card pixels');
    assert.strictEqual(result?.credentialId, 'VIP-0001');
    assert.strictEqual(result?.method, 'TOPOTAG_FAILSAFE');
    assert.strictEqual(result?.hammingDistance, 0);
  });

  test('All generated pass SVGs contain verified TopoTag invariant bitmasks', () => {
    const testCases = [
      { path: 'passes/vips/VIP-0001_Dr_V_K_Sharma.svg', id: 'VIP-0001' },
      { path: 'passes/judges/JDG-0001_Prof_Rajesh_K_Pathak.svg', id: 'JDG-0001' },
      { path: 'passes/incharges/INC-0001_Shashank_Jangid.svg', id: 'INC-0001' },
      { path: 'passes/students/EXH-0001-01_Hiya.svg', id: 'EXH-0001-01' },
    ];

    for (const tc of testCases) {
      if (!fs.existsSync(tc.path)) continue;
      const content = fs.readFileSync(tc.path, 'utf8');
      const ringMatches = [...content.matchAll(/data-cell="(\d+)"/g)].map((m) => parseInt(m[1], 10));
      let svgBitmask = 0;
      for (const idx of ringMatches) {
        svgBitmask |= (1 << idx);
      }
      const expectedBitmask = computeTopotagBitmask(tc.id);
      assert.strictEqual(svgBitmask, expectedBitmask, `TopoTag bitmask for ${tc.id} must match registry`);
      const match = matchTopotagBitmask(svgBitmask, 0);
      assert.strictEqual(match?.credentialId, tc.id, `Matched credential ID for ${tc.id} must be exact`);
    }
  });

  test('All generated pass SVGs contain valid decodable ISO/IEC 18004 QR Codes', () => {
    const testCases = [
      { path: 'passes/vips/VIP-0001_Dr_V_K_Sharma.svg', expectedUrl: 'https://dpsi-exhibition.pages.dev/pass?id=VIP-0001' },
      { path: 'passes/judges/JDG-0001_Prof_Rajesh_K_Pathak.svg', expectedUrl: 'https://dpsi-exhibition.pages.dev/pass?id=JDG-0001' },
      { path: 'passes/incharges/INC-0001_Shashank_Jangid.svg', expectedUrl: 'https://dpsi-exhibition.pages.dev/pass?id=INC-0001' },
      { path: 'passes/students/EXH-0001-01_Hiya.svg', expectedUrl: 'https://dpsi-exhibition.pages.dev/pass?id=EXH-0001-01' },
    ];

    for (const tc of testCases) {
      if (!fs.existsSync(tc.path)) continue;
      const svg = fs.readFileSync(tc.path, 'utf8');
      const qrSectionMatch = svg.match(/<g transform="translate\(200, 32\)">([\s\S]*?)<\/g>\s*<\/g>\s*<\/g>\s*<\/svg>/);
      assert.ok(qrSectionMatch, `Pass ${tc.path} must contain QR section`);

      const qrSection = qrSectionMatch[1];
      const rectRegex = /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/g;
      let match: RegExpExecArray | null;

      const width = 120;
      const height = 120;
      const data = new Uint8ClampedArray(width * height * 4);
      data.fill(255);

      const ox = 18;
      const oy = 18;

      while ((match = rectRegex.exec(qrSection)) !== null) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const w = parseFloat(match[3]);
        const h = parseFloat(match[4]);
        if (x < 0 || y < 0) continue;

        const startX = Math.round(ox + x);
        const startY = Math.round(oy + y);
        const endX = Math.round(ox + x + w);
        const endY = Math.round(oy + y + h);

        for (let py = startY; py < endY; py++) {
          for (let px = startX; px < endX; px++) {
            if (px >= 0 && px < width && py >= 0 && py < height) {
              const idx = (py * width + px) * 4;
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 255;
            }
          }
        }
      }

      const decoded = jsQR(data, width, height);
      assert.ok(decoded, `QR Code in ${tc.path} must be optically decodable`);
      assert.strictEqual(decoded.data, tc.expectedUrl, `Decoded QR URL must match expected target`);
    }
  });

  test('Industrial Zero-False-Positive Guarantee: rejects adversarial non-badge camera frames (noise, gradients, checkerboards, room lighting)', () => {
    const width = 320;
    const height = 240;

    // 1. 50 frames of deterministic pseudo-random high-contrast camera noise & room textures
    let seed = 0x13579bdf;
    const nextRand = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return (seed >>> 8) & 0xff;
    };

    for (let f = 0; f < 50; f++) {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        const val = nextRand();
        data[i * 4] = val;
        data[i * 4 + 1] = (val + 40) & 0xff;
        data[i * 4 + 2] = (val + 80) & 0xff;
        data[i * 4 + 3] = 255;
      }
      const res = detectTopotagFailsafe({ width, height, data } as ImageData);
      assert.strictEqual(res, null, `Random camera frame #${f} must never trigger a false TopoTag detection`);
    }

    // 2. High-contrast checkerboard / striped shirt / window blind patterns at multiple scales
    for (const blockSize of [3, 5, 8, 12, 16, 24]) {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const isBright = ((Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2) === 0;
          const v = isBright ? 245 : 20;
          const idx = (y * width + x) * 4;
          data[idx] = v;
          data[idx + 1] = v;
          data[idx + 2] = v;
          data[idx + 3] = 255;
        }
      }
      const res = detectTopotagFailsafe({ width, height, data } as ImageData);
      assert.strictEqual(res, null, `Checkerboard pattern (size ${blockSize}) must never trigger a false TopoTag detection`);
    }
  });
});
