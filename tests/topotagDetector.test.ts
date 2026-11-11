import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  computeTopotagBitmask,
  matchTopotagBitmask,
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
});
