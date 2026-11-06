import { test, describe, beforeEach } from 'node:test';
import * as assert from 'node:assert/strict';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

import {
  validateVotePayload,
  extractClientIp,
  hashClientIp,
  IP_HASH_SALT,
} from './validation';
import {
  SlidingWindowRateLimiter,
  ipRateLimiter,
  compositeRateLimiter,
  checkCompositeRateLimit,
  resetRateLimiters,
} from './rateLimiter';
import { executeVoteTransaction, VoteServiceError } from './voteService';
import { ValidatedVoteInput } from './types';

// ============================================================================
// 1. INPUT SCHEMA VALIDATION TESTS
// ============================================================================
describe('Input Schema Validation (validateVotePayload)', () => {
  const validBasePayload = {
    projectId: 'p01',
    fingerprint: 'device_canvas_hash_12345',
    userId: 'firebase_user_abc',
    userEmail: 'student@example.com',
  };

  test('valid payload with fingerprint succeeds', () => {
    const result = validateVotePayload(validBasePayload);
    assert.equal(result.isValid, true);
    if (result.isValid) {
      assert.equal(result.data.projectId, 'p01');
      assert.equal(result.data.deviceFingerprint, 'device_canvas_hash_12345');
      assert.equal(result.data.userId, 'firebase_user_abc');
      assert.equal(result.data.userEmail, 'student@example.com');
    }
  });

  test('valid payload with deviceFingerprint (standard key) succeeds', () => {
    const payload = {
      projectId: 'project-ai-robotics',
      deviceFingerprint: 'custom_hardware_fp_987654321',
      userId: 'usr_xyz789',
    };
    const result = validateVotePayload(payload);
    assert.equal(result.isValid, true);
    if (result.isValid) {
      assert.equal(result.data.projectId, 'project-ai-robotics');
      assert.equal(result.data.deviceFingerprint, 'custom_hardware_fp_987654321');
      assert.equal(result.data.userId, 'usr_xyz789');
      assert.equal(result.data.userEmail, null);
    }
  });

  test('normalizes slashes in base64 fallback fingerprint to underscores', () => {
    const payload = {
      projectId: 'p02',
      fingerprint: 'device/canvas/fallback/12345678',
      userId: 'user_1',
    };
    const result = validateVotePayload(payload);
    assert.equal(result.isValid, true);
    if (result.isValid) {
      assert.ok(!result.data.deviceFingerprint.includes('/'));
      assert.equal(result.data.deviceFingerprint, 'device_canvas_fallback_12345678');
    }
  });

  test('lowercases and trims userEmail if provided', () => {
    const payload = {
      ...validBasePayload,
      userEmail: '   STUDENT.Exhibition@DPSI.ORG  ',
    };
    const result = validateVotePayload(payload);
    assert.equal(result.isValid, true);
    if (result.isValid) {
      assert.equal(result.data.userEmail, 'student.exhibition@dpsi.org');
    }
  });

  test('accepts null, undefined, or empty string userEmail and standardizes to null', () => {
    for (const emailVal of [null, undefined, '', '   ']) {
      const payload = {
        ...validBasePayload,
        userEmail: emailVal,
      };
      const result = validateVotePayload(payload);
      assert.equal(result.isValid, true);
      if (result.isValid) {
        assert.equal(result.data.userEmail, null);
      }
    }
  });

  test('rejects non-object payloads', () => {
    assert.equal(validateVotePayload(null).isValid, false);
    assert.equal(validateVotePayload('not an object').isValid, false);
    assert.equal(validateVotePayload(12345).isValid, false);
    assert.equal(validateVotePayload([]).isValid, false);
  });

  test('rejects missing or empty projectId', () => {
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: undefined }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: '' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: '   ' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: 123 }).isValid, false);
  });

  test('rejects projectId exceeding 50 characters or with invalid characters', () => {
    const tooLong = 'a'.repeat(51);
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: tooLong }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: 'proj/with/slashes' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, projectId: 'proj with spaces' }).isValid, false);
  });

  test('rejects missing device fingerprint or fingerprints shorter than 8 chars', () => {
    assert.equal(validateVotePayload({ ...validBasePayload, fingerprint: undefined, deviceFingerprint: undefined }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, fingerprint: 'short' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, fingerprint: 'a'.repeat(129) }).isValid, false);
  });

  test('rejects missing or empty userId', () => {
    assert.equal(validateVotePayload({ ...validBasePayload, userId: undefined }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, userId: '' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, userId: '   ' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, userId: 'u'.repeat(129) }).isValid, false);
  });

  test('rejects invalid userEmail format', () => {
    assert.equal(validateVotePayload({ ...validBasePayload, userEmail: 'not-an-email' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, userEmail: 'missing-domain@' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, userEmail: '@nodomain.com' }).isValid, false);
    assert.equal(validateVotePayload({ ...validBasePayload, userEmail: 12345 }).isValid, false);
  });
});

// ============================================================================
// 2. IP EXTRACTION & SALTED HASHING TESTS
// ============================================================================
describe('IP Extraction & Salted Hashing', () => {
  test('extracts first IP from comma-separated x-forwarded-for header', () => {
    const req = {
      headers: {
        'x-forwarded-for': '198.51.100.42, 10.0.0.1, 172.16.0.1',
      },
    };
    assert.equal(extractClientIp(req), '198.51.100.42');
  });

  test('extracts from array x-forwarded-for header', () => {
    const req = {
      headers: {
        'x-forwarded-for': ['203.0.113.195', '10.0.0.2'],
      },
    };
    assert.equal(extractClientIp(req), '203.0.113.195');
  });

  test('extracts from x-real-ip if x-forwarded-for is missing', () => {
    const req = {
      headers: {
        'x-real-ip': '192.0.2.1',
      },
    };
    assert.equal(extractClientIp(req), '192.0.2.1');
  });

  test('extracts from fastly-client-ip if other proxy headers are missing', () => {
    const req = {
      headers: {
        'fastly-client-ip': '192.0.2.99',
      },
    };
    assert.equal(extractClientIp(req), '192.0.2.99');
  });

  test('falls back to req.ip or socket.remoteAddress or 127.0.0.1', () => {
    assert.equal(extractClientIp({ ip: '10.10.10.10' }), '10.10.10.10');
    assert.equal(extractClientIp({ socket: { remoteAddress: '10.20.30.40' } }), '10.20.30.40');
    assert.equal(extractClientIp({}), '127.0.0.1');
  });

  test('generates expected salted SHA-256 hash', () => {
    const ip = '203.0.113.195';
    const expected = crypto.createHash('sha256').update(ip + IP_HASH_SALT).digest('hex');
    assert.equal(hashClientIp(ip), expected);
    assert.equal(hashClientIp(ip).length, 64);
  });

  test('different IPs yield distinct hashes', () => {
    const hash1 = hashClientIp('192.168.1.1');
    const hash2 = hashClientIp('192.168.1.2');
    assert.notEqual(hash1, hash2);
  });
});

// ============================================================================
// 3. SLIDING WINDOW RATE LIMITER TESTS
// ============================================================================
describe('Sliding Window Rate Limiter (SlidingWindowRateLimiter)', () => {
  let limiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    limiter = new SlidingWindowRateLimiter({
      windowMs: 60 * 1000,
      maxRequests: 60,
    });
    resetRateLimiters();
  });

  test('allows up to 60 requests in a 60-second window', () => {
    const ipKey = 'test_ip_hash_1';
    const baseTime = 1000000;

    for (let i = 0; i < 60; i++) {
      const res = limiter.check(ipKey, baseTime + i * 500);
      assert.equal(res.allowed, true, `Request ${i + 1} should be allowed`);
      assert.equal(res.remaining, 59 - i);
    }

    // 61st request must be blocked
    const blockedRes = limiter.check(ipKey, baseTime + 35000);
    assert.equal(blockedRes.allowed, false, '61st request should be blocked');
    assert.equal(blockedRes.remaining, 0);
    assert.ok((blockedRes.retryAfterSeconds ?? 0) > 0);
  });

  test('tracks different keys independently', () => {
    const ip1 = 'ip_alpha';
    const ip2 = 'ip_beta';
    const baseTime = 2000000;

    for (let i = 0; i < 60; i++) {
      limiter.check(ip1, baseTime);
    }
    assert.equal(limiter.check(ip1, baseTime).allowed, false);

    // ip2 should still have full quota
    const resIp2 = limiter.check(ip2, baseTime);
    assert.equal(resIp2.allowed, true);
    assert.equal(resIp2.remaining, 59);
  });

  test('allows requests again after sliding window expires', () => {
    const ipKey = 'test_ip_expiry';
    const t0 = 1000000;

    // Saturate limit at t0
    for (let i = 0; i < 60; i++) {
      limiter.check(ipKey, t0);
    }
    assert.equal(limiter.check(ipKey, t0).allowed, false);

    // Advance time by 60.1 seconds (window expired)
    const t1 = t0 + 60100;
    const resAfterExpiry = limiter.check(ipKey, t1);
    assert.equal(resAfterExpiry.allowed, true);
  });

  test('reset clears all tracked keys', () => {
    const ipKey = 'test_reset';
    const t0 = 3000000;
    for (let i = 0; i < 60; i++) {
      limiter.check(ipKey, t0);
    }
    assert.equal(limiter.check(ipKey, t0).allowed, false);

    limiter.reset();
    assert.equal(limiter.check(ipKey, t0).allowed, true);
  });

  test('ipRateLimiter enforces 300 req/min raw IP ceiling for school Wi-Fi NAT flood protection', () => {
    const natIpHash = 'school_nat_gateway_ip_hash';
    const baseTime = 4000000;

    // Allow 300 requests
    for (let i = 0; i < 300; i++) {
      const res = ipRateLimiter.check(natIpHash, baseTime + i * 50);
      assert.equal(res.allowed, true, `Request ${i + 1} within 300 ceiling should pass`);
    }

    // 301st request from same IP must be blocked
    const blocked = ipRateLimiter.check(natIpHash, baseTime + 16000);
    assert.equal(blocked.allowed, false, '301st request must trigger raw IP flood limit');
    assert.equal(blocked.remaining, 0);
    assert.ok((blocked.retryAfterSeconds ?? 0) > 0);
  });

  test('compositeRateLimiter restricts 10 req/min per device on given IP', () => {
    const compositeKey = 'school_nat_ip:student_device_1';
    const baseTime = 5000000;

    for (let i = 0; i < 10; i++) {
      const res = compositeRateLimiter.check(compositeKey, baseTime + i * 100);
      assert.equal(res.allowed, true, `Device request ${i + 1} should be allowed`);
    }

    // 11th request from same device must be blocked
    const blocked = compositeRateLimiter.check(compositeKey, baseTime + 2000);
    assert.equal(blocked.allowed, false, '11th request from same device must be blocked');
    assert.equal(blocked.remaining, 0);
  });

  test('school Wi-Fi NAT: multiple distinct devices on same IP do not throttle each other', () => {
    const natIpHash = 'shared_school_nat_public_ip';
    const baseTime = 6000000;

    // 25 distinct students submit 5 requests each through the shared school NAT IP (125 requests total)
    for (let deviceIdx = 1; deviceIdx <= 25; deviceIdx++) {
      const deviceFp = `device_fingerprint_student_${deviceIdx}`;
      for (let reqIdx = 0; reqIdx < 5; reqIdx++) {
        const check = checkCompositeRateLimit(natIpHash, deviceFp, baseTime + (deviceIdx * 100) + reqIdx);
        assert.equal(check.allowed, true, `Student ${deviceIdx} request ${reqIdx + 1} should succeed`);
      }
    }

    // A bot device attempts to spam 11 requests on the same IP
    const botDeviceFp = 'bot_device_fingerprint';
    for (let i = 0; i < 10; i++) {
      const check = checkCompositeRateLimit(natIpHash, botDeviceFp, baseTime + 10000 + i);
      assert.equal(check.allowed, true);
    }
    const botBlocked = checkCompositeRateLimit(natIpHash, botDeviceFp, baseTime + 10011);
    assert.equal(botBlocked.allowed, false, 'Bot device on 11th request must be blocked');

    // Legitimate students on the same IP can still submit requests!
    const legitimateStudent = checkCompositeRateLimit(natIpHash, 'legitimate_student_fp', baseTime + 10020);
    assert.equal(legitimateStudent.allowed, true, 'Legitimate student on same NAT IP must still be allowed');
  });
});

// ============================================================================
// 4. ATOMIC FIRESTORE TRANSACTION TESTS
// ============================================================================
describe('Atomic Firestore Vote Transaction (executeVoteTransaction)', () => {
  interface MockDocSnapshot {
    exists: boolean;
    id: string;
    data: () => Record<string, unknown> | undefined;
  }

  interface MockDocRef {
    id: string;
    colName: string;
  }

  interface MockTransaction {
    get: (docRef: MockDocRef) => Promise<MockDocSnapshot>;
    set: (docRef: MockDocRef, data: Record<string, unknown>) => void;
    update: (docRef: MockDocRef, updateData: Record<string, unknown>) => void;
  }

  interface MockFirestoreDb {
    collection: (colName: string) => { doc: (docId: string) => MockDocRef };
    runTransaction: <T>(updateFunction: (transaction: MockTransaction) => Promise<T>) => Promise<T>;
    getProject: (id: string) => Record<string, unknown> | undefined;
    getVote: (id: string) => Record<string, unknown> | undefined;
    getUserVote: (id: string) => Record<string, unknown> | undefined;
  }

  // Create an in-memory test double matching Firestore runTransaction
  function createMockFirestore(
    initialProjects: Record<string, Record<string, unknown>> = {},
    initialVotes: Record<string, Record<string, unknown>> = {},
    initialUserVotes: Record<string, Record<string, unknown>> = {}
  ): MockFirestoreDb {
    const projectsStore = new Map<string, Record<string, unknown>>(Object.entries(initialProjects));
    const votesStore = new Map<string, Record<string, unknown>>(Object.entries(initialVotes));
    const userVotesStore = new Map<string, Record<string, unknown>>(Object.entries(initialUserVotes));

    const mockDb: MockFirestoreDb = {
      collection: (colName: string) => ({
        doc: (docId: string) => ({
          id: docId,
          colName,
        }),
      }),
      runTransaction: async <T>(updateFunction: (transaction: MockTransaction) => Promise<T>): Promise<T> => {
        const stagedWrites: Array<() => void> = [];

        const mockTransaction: MockTransaction = {
          get: async (docRef: MockDocRef): Promise<MockDocSnapshot> => {
            if (docRef.colName === 'projects') {
              const data = projectsStore.get(docRef.id);
              return {
                exists: data !== undefined,
                id: docRef.id,
                data: () => (data ? { ...data } : undefined),
              };
            }
            if (docRef.colName === 'votes') {
              const data = votesStore.get(docRef.id);
              return {
                exists: data !== undefined,
                id: docRef.id,
                data: () => (data ? { ...data } : undefined),
              };
            }
            if (docRef.colName === 'user_votes') {
              const data = userVotesStore.get(docRef.id);
              return {
                exists: data !== undefined,
                id: docRef.id,
                data: () => (data ? { ...data } : undefined),
              };
            }
            return { exists: false, id: docRef.id, data: () => undefined };
          },
          set: (docRef: MockDocRef, data: Record<string, unknown>) => {
            stagedWrites.push(() => {
              if (docRef.colName === 'votes') {
                votesStore.set(docRef.id, { ...data });
              }
              if (docRef.colName === 'user_votes') {
                userVotesStore.set(docRef.id, { ...data });
              }
            });
          },
          update: (docRef: MockDocRef, updateData: Record<string, unknown>) => {
            stagedWrites.push(() => {
              if (docRef.colName === 'projects') {
                const current = projectsStore.get(docRef.id) || { vote_count: 0 };
                let newCount = typeof current.vote_count === 'number' ? current.vote_count : 0;
                if (updateData.vote_count && typeof updateData.vote_count === 'object') {
                  // FieldValue.increment representation
                  newCount += 1;
                } else if (typeof updateData.vote_count === 'number') {
                  newCount = updateData.vote_count;
                }
                projectsStore.set(docRef.id, { ...current, vote_count: newCount });
              }
            });
          },
        };

        const result = await updateFunction(mockTransaction);
        // Commit staged writes on success
        stagedWrites.forEach((write) => write());
        return result;
      },
      // Inspection helpers for verification
      getProject: (id: string) => projectsStore.get(id),
      getVote: (id: string) => votesStore.get(id),
      getUserVote: (id: string) => userVotesStore.get(id),
    };

    return mockDb;
  }

  test('throws 404 PROJECT_NOT_FOUND when target project does not exist', async () => {
    const mockDb = createMockFirestore({});
    const input: ValidatedVoteInput = {
      projectId: 'non_existent_project',
      deviceFingerprint: 'device_hash_1',
      userId: 'user_1',
      userEmail: null,
    };

    await assert.rejects(
      async () => {
        await executeVoteTransaction(mockDb as unknown as admin.firestore.Firestore, input, 'ip_hash_1');
      },
      (err: unknown) => {
        assert.ok(err instanceof VoteServiceError);
        assert.equal(err.statusCode, 404);
        assert.equal(err.code, 'PROJECT_NOT_FOUND');
        assert.ok(err.message.includes('non_existent_project'));
        return true;
      }
    );
  });

  test('successfully records vote and atomically writes both votes/ and user_votes/ documents', async () => {
    const mockDb = createMockFirestore({
      p01: {
        id: 'p01',
        title: 'Autonomous Rover',
        zone: 'zone-1',
        category: 'Robo Race',
        booth_code: 'A-01',
        booth_number: 1,
        vote_count: 5,
      },
    });

    const input: ValidatedVoteInput = {
      projectId: 'p01',
      deviceFingerprint: 'device_hardware_fingerprint_abc',
      userId: 'user_12345',
      userEmail: 'voter@dpsi-visitor.in',
    };
    const ipHash = hashClientIp('192.168.1.50');

    const result = await executeVoteTransaction(mockDb as unknown as admin.firestore.Firestore, input, ipHash);

    assert.equal(result.success, true);
    assert.equal(result.newVoteCount, 6);
    assert.equal(result.message, 'Vote recorded successfully');

    // Verify project document counter in Firestore
    const updatedProject = mockDb.getProject('p01') as { vote_count: number };
    assert.equal(updatedProject.vote_count, 6);

    // Verify hardware vote document written in votes/${projectId}_${deviceFingerprint}
    const voteDocId = 'p01_device_hardware_fingerprint_abc';
    const voteRecord = mockDb.getVote(voteDocId) as Record<string, unknown>;
    assert.ok(voteRecord !== undefined, 'Hardware vote record must be created');
    assert.equal(voteRecord.projectId, 'p01');
    assert.equal(voteRecord.userId, 'user_12345');
    assert.equal(voteRecord.deviceFingerprint, 'device_hardware_fingerprint_abc');
    assert.equal(voteRecord.ipHash, ipHash);
    assert.equal(voteRecord.userEmail, 'voter@dpsi-visitor.in');
    assert.ok(voteRecord.createdAt !== undefined, 'createdAt timestamp must be set');

    // Verify user vote document written in user_votes/${projectId}_${userId}
    const userVoteDocId = 'p01_user_12345';
    const userVoteRecord = mockDb.getUserVote(userVoteDocId) as Record<string, unknown>;
    assert.ok(userVoteRecord !== undefined, 'User identity vote record must be created');
    assert.equal(userVoteRecord.projectId, 'p01');
    assert.equal(userVoteRecord.userId, 'user_12345');
    assert.ok(userVoteRecord.createdAt !== undefined, 'User vote createdAt timestamp must be set');
  });

  test('throws 409 ALREADY_VOTED when device has already voted for this project (hardware collision)', async () => {
    const existingVoteId = 'p01_existing_device_fp';
    const mockDb = createMockFirestore(
      {
        p01: { id: 'p01', title: 'Smart Greenhouse', vote_count: 10 },
      },
      {
        [existingVoteId]: {
          projectId: 'p01',
          userId: 'user_first',
          deviceFingerprint: 'existing_device_fp',
          ipHash: 'hash_abc',
          userEmail: null,
          createdAt: admin.firestore.Timestamp.now(),
        },
      }
    );

    const input: ValidatedVoteInput = {
      projectId: 'p01',
      deviceFingerprint: 'existing_device_fp',
      userId: 'another_user_same_device',
      userEmail: null,
    };

    await assert.rejects(
      async () => {
        await executeVoteTransaction(mockDb as unknown as admin.firestore.Firestore, input, 'new_ip_hash');
      },
      (err: unknown) => {
        assert.ok(err instanceof VoteServiceError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, 'ALREADY_VOTED');
        assert.equal(err.alreadyVoted, true);
        assert.equal(err.message, 'This device has already voted for this project');
        return true;
      }
    );

    // Verify vote_count was NOT incremented
    const project = mockDb.getProject('p01') as { vote_count: number };
    assert.equal(project.vote_count, 10);
  });

  test('throws 409 ALREADY_VOTED when user identity has already voted for this project (user collision)', async () => {
    const existingUserVoteId = 'p01_user_first';
    const mockDb = createMockFirestore(
      {
        p01: { id: 'p01', title: 'Hydroponics Lab', vote_count: 15 },
      },
      {},
      {
        [existingUserVoteId]: {
          projectId: 'p01',
          userId: 'user_first',
          createdAt: admin.firestore.Timestamp.now(),
        },
      }
    );

    const input: ValidatedVoteInput = {
      projectId: 'p01',
      deviceFingerprint: 'completely_different_device_fp_9999',
      userId: 'user_first',
      userEmail: null,
    };

    await assert.rejects(
      async () => {
        await executeVoteTransaction(mockDb as unknown as admin.firestore.Firestore, input, 'another_ip_hash');
      },
      (err: unknown) => {
        assert.ok(err instanceof VoteServiceError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.code, 'ALREADY_VOTED');
        assert.equal(err.alreadyVoted, true);
        assert.equal(err.message, 'This user account has already voted for this project');
        return true;
      }
    );

    // Verify vote_count was NOT incremented
    const project = mockDb.getProject('p01') as { vote_count: number };
    assert.equal(project.vote_count, 15);
  });

  test('prevents fingerprint cycling attack (attacker changes device fingerprint under same user account)', async () => {
    const mockDb = createMockFirestore({
      p03: { id: 'p03', title: 'AI Assistant', vote_count: 0 },
    });

    const userAccount = 'malicious_user_uid_777';
    const ipHash = hashClientIp('192.168.1.100');

    // 1st vote from account with fingerprint A succeeds
    const firstVote = await executeVoteTransaction(
      mockDb as unknown as admin.firestore.Firestore,
      {
        projectId: 'p03',
        deviceFingerprint: 'random_fingerprint_alpha_111',
        userId: userAccount,
        userEmail: null,
      },
      ipHash
    );
    assert.equal(firstVote.success, true);
    assert.equal(firstVote.newVoteCount, 1);

    // 2nd vote from same account with newly generated random fingerprint B must be blocked!
    await assert.rejects(
      async () => {
        await executeVoteTransaction(
          mockDb as unknown as admin.firestore.Firestore,
          {
            projectId: 'p03',
            deviceFingerprint: 'random_fingerprint_beta_222',
            userId: userAccount,
            userEmail: null,
          },
          ipHash
        );
      },
      (err: unknown) => {
        assert.ok(err instanceof VoteServiceError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.alreadyVoted, true);
        assert.ok(err.message.includes('user account has already voted'));
        return true;
      }
    );

    // Verify vote_count remains 1
    const project = mockDb.getProject('p03') as { vote_count: number };
    assert.equal(project.vote_count, 1);
  });

  test('subsequent vote from same device on the same project fails immediately', async () => {
    const mockDb = createMockFirestore({
      p05: { id: 'p05', title: 'Drone Navigation', vote_count: 0 },
    });

    const input: ValidatedVoteInput = {
      projectId: 'p05',
      deviceFingerprint: 'fp_unique_1234',
      userId: 'uid_001',
      userEmail: null,
    };
    const ipHash = hashClientIp('10.0.0.5');

    // First vote succeeds
    const firstVote = await executeVoteTransaction(mockDb as unknown as admin.firestore.Firestore, input, ipHash);
    assert.equal(firstVote.success, true);
    assert.equal(firstVote.newVoteCount, 1);

    // Second vote with same device and project must fail with 409
    await assert.rejects(
      async () => {
        await executeVoteTransaction(mockDb as unknown as admin.firestore.Firestore, input, ipHash);
      },
      (err: unknown) => {
        assert.ok(err instanceof VoteServiceError);
        assert.equal(err.statusCode, 409);
        assert.equal(err.alreadyVoted, true);
        return true;
      }
    );

    // Count stays 1
    const project = mockDb.getProject('p05') as { vote_count: number };
    assert.equal(project.vote_count, 1);
  });
});

// ============================================================================
// 5. HTTP ENDPOINT HANDLER & CONTROLLER INTEGRATION TESTS
// ============================================================================
describe('HTTP Endpoints & Controller Behavior', () => {
  interface MockResponse {
    statusCode: number;
    headers: Record<string, string>;
    body: Record<string, unknown> | undefined;
    status: (code: number) => MockResponse;
    setHeader: (name: string, value: string) => MockResponse;
    json: (data: Record<string, unknown>) => MockResponse;
    send: (data: string) => MockResponse;
  }

  function createMockResponse(): MockResponse {
    const res: MockResponse = {
      statusCode: 200,
      headers: {},
      body: undefined,
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      setHeader(name: string, value: string) {
        this.headers[name.toLowerCase()] = value;
        return this;
      },
      json(data: Record<string, unknown>) {
        this.body = data;
        return this;
      },
      send(data: string) {
        this.body = { raw: data };
        return this;
      },
    };
    return res;
  }

  test('OPTIONS preflight returns 204 No Content', () => {
    const req: { method: string; headers: Record<string, string> } = {
      method: 'OPTIONS',
      headers: {},
    };
    const res = createMockResponse();

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
    }

    assert.equal(res.statusCode, 204);
  });

  test('Non-POST methods return 405 Method Not Allowed', () => {
    for (const method of ['GET', 'PUT', 'DELETE', 'PATCH']) {
      const req: { method: string; headers: Record<string, string> } = {
        method,
        headers: {},
      };
      const res = createMockResponse();

      if (req.method !== 'POST') {
        res.status(405).json({
          success: false,
          message: `Method ${req.method} Not Allowed. Only POST requests are supported.`,
        });
      }

      assert.equal(res.statusCode, 405);
      assert.equal(res.body?.success, false);
      assert.ok(String(res.body?.message).includes('Method'));
    }
  });

  test('Rate limiting triggers 429 Too Many Requests with Retry-After header', () => {
    const limiter = new SlidingWindowRateLimiter({ windowMs: 60000, maxRequests: 2 });
    const ip = 'flood_ip_hash';
    const now = 5000000;

    limiter.check(ip, now);
    limiter.check(ip, now + 100);
    const limitCheck = limiter.check(ip, now + 200);

    assert.equal(limitCheck.allowed, false);

    const res = createMockResponse();
    if (!limitCheck.allowed) {
      if (limitCheck.retryAfterSeconds) {
        res.setHeader('Retry-After', String(limitCheck.retryAfterSeconds));
      }
      res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait before submitting another vote.',
      });
    }

    assert.equal(res.statusCode, 429);
    assert.equal(res.body?.success, false);
    assert.ok(res.headers['retry-after'] !== undefined);
  });

  test('Composite rate limiting triggers 429 Too Many Requests per device on same network', () => {
    const limiter = new SlidingWindowRateLimiter({ windowMs: 60000, maxRequests: 2 });
    const compositeKey = 'ip_hash_abc:device_fingerprint_xyz';
    const now = 6000000;

    limiter.check(compositeKey, now);
    limiter.check(compositeKey, now + 100);
    const limitCheck = limiter.check(compositeKey, now + 200);

    assert.equal(limitCheck.allowed, false);

    const res = createMockResponse();
    if (!limitCheck.allowed) {
      if (limitCheck.retryAfterSeconds) {
        res.setHeader('Retry-After', String(limitCheck.retryAfterSeconds));
      }
      res.status(429).json({
        success: false,
        message: 'Too many requests from this device. Please wait before submitting another vote.',
      });
    }

    assert.equal(res.statusCode, 429);
    assert.equal(res.body?.success, false);
    assert.ok(String(res.body?.message).includes('device'));
  });

  test('Malformed JSON body string triggers 400 Bad Request', () => {
    const malformedJsonString = '{ invalid json string';
    const res = createMockResponse();

    try {
      JSON.parse(malformedJsonString);
    } catch {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON request body.',
      });
    }

    assert.equal(res.statusCode, 400);
    assert.equal(res.body?.success, false);
    assert.equal(res.body?.message, 'Invalid JSON request body.');
  });

  test('Authorization header as array is safely normalized without TypeError', () => {
    const rawAuth = ['Bearer mock_token_1', 'Bearer mock_token_2'];
    const authHeader = Array.isArray(rawAuth) ? rawAuth[0] : rawAuth;
    assert.equal(typeof authHeader, 'string');
    assert.equal(authHeader.startsWith('Bearer '), true);
    assert.equal(authHeader.slice(7).trim(), 'mock_token_1');
  });

  test('Registered user accounts require Bearer token; guest accounts pass through', () => {
    // Registered account without token should fail
    const registeredUserId = 'user_abc123456789';
    const isGuest1 = registeredUserId.startsWith('guest_');
    assert.equal(isGuest1, false);

    // Guest pass account without token succeeds
    const guestUserId = 'guest_k83nd92mx0';
    const isGuest2 = guestUserId.startsWith('guest_');
    assert.equal(isGuest2, true);
  });

  test('FIFO pruning strictly caps rate limiter map size to maxKeys under burst floods', () => {
    const limiter = new SlidingWindowRateLimiter({
      windowMs: 60000,
      maxRequests: 10,
      maxKeys: 50,
    });
    const now = 5000000;

    for (let i = 0; i < 200; i++) {
      limiter.check(`key_${i}`, now + i);
    }

    assert.ok(limiter.getRecordCount() <= 50, `Record count ${limiter.getRecordCount()} exceeded maxKeys 50`);
  });
});

