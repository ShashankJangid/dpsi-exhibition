import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { POST, OPTIONS } from '../src/app/api/vote/route';
import { NextRequest } from 'next/server';

function createMockPostRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  const url = 'http://localhost:3000/api/vote';
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('Vote API Security: Payload Validation & Anti-Cheat', () => {
  test('OPTIONS preflight returns 204 with CORS headers', async () => {
    const res = await OPTIONS();
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
    assert.equal(res.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
    assert.ok(res.headers.get('Access-Control-Allow-Headers')?.includes('Content-Type'));
  });

  test('rejects non-object or malformed JSON payloads with 400', async () => {
    // String body instead of object
    const req1 = new NextRequest('http://localhost:3000/api/vote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'invalid-json-payload',
    });
    const res1 = await POST(req1);
    assert.equal(res1.status, 400);
    const data1 = await res1.json();
    assert.equal(data1.success, false);

    // Number primitive
    const req2 = createMockPostRequest(12345);
    const res2 = await POST(req2);
    assert.equal(res2.status, 400);
  });

  test('strictly rejects path traversal and control characters in projectId', async () => {
    const attackVectors = [
      '../etc/passwd',
      '..\\windows\\system32',
      'p01/../../malicious',
      'p01\x00nullbyte',
      'p01<script>alert(1)</script>',
      'p01;DROP TABLE votes;--',
      'p 01 whitespace',
    ];

    for (const badId of attackVectors) {
      const req = createMockPostRequest({
        projectId: badId,
        deviceFingerprint: 'valid_fingerprint_12345',
        userId: 'test_user_1',
      });
      const res = await POST(req);
      assert.equal(
        res.status,
        400,
        `Expected 400 rejection for malicious projectId "${badId}", got ${res.status}`
      );
      const data = await res.json();
      assert.equal(data.success, false);
    }
  });

  test('validates projectId length constraints (1-50 chars)', async () => {
    // 51 characters
    const tooLongId = 'a'.repeat(51);
    const req1 = createMockPostRequest({
      projectId: tooLongId,
      deviceFingerprint: 'valid_fingerprint_12345',
      userId: 'test_user_1',
    });
    const res1 = await POST(req1);
    assert.equal(res1.status, 400);

    // Empty string
    const req2 = createMockPostRequest({
      projectId: '   ',
      deviceFingerprint: 'valid_fingerprint_12345',
      userId: 'test_user_1',
    });
    const res2 = await POST(req2);
    assert.equal(res2.status, 400);
  });

  test('strictly validates device fingerprint format and bounds (8-128 chars)', async () => {
    // Too short (7 chars)
    const reqShort = createMockPostRequest({
      projectId: 'p01',
      deviceFingerprint: 'short7x',
      userId: 'test_user_1',
    });
    const resShort = await POST(reqShort);
    assert.equal(resShort.status, 400);

    // Too long (129 chars)
    const reqLong = createMockPostRequest({
      projectId: 'p01',
      deviceFingerprint: 'a'.repeat(129),
      userId: 'test_user_1',
    });
    const resLong = await POST(reqLong);
    assert.equal(resLong.status, 400);

    // Unsafe characters in fingerprint
    const reqUnsafe = createMockPostRequest({
      projectId: 'p01',
      deviceFingerprint: 'bad$fingerprint;DROP',
      userId: 'test_user_1',
    });
    const resUnsafe = await POST(reqUnsafe);
    assert.equal(resUnsafe.status, 400);
  });

  test('validates email format if provided', async () => {
    const reqInvalidEmail = createMockPostRequest({
      projectId: 'p01',
      deviceFingerprint: 'fingerprint_email_test',
      userId: 'test_user_email',
      userEmail: 'not-an-email',
    });
    const res = await POST(reqInvalidEmail);
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.message, 'Invalid userEmail format.');
  });

  test('successfully accepts a valid vote and enforces dual-layer collision rejection', async () => {
    const testProjectId = 'sec_p99';
    const deviceFp = 'fp_hardware_collision_test_99';
    const testUserId = 'uid_collision_test_99';

    // Vote 1: First valid vote succeeds
    const req1 = createMockPostRequest(
      {
        projectId: testProjectId,
        deviceFingerprint: deviceFp,
        userId: testUserId,
        userEmail: 'student@dpsites.org',
      },
      { 'x-forwarded-for': '198.51.100.42' }
    );
    const res1 = await POST(req1);
    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.success, true);

    // Vote 2: Hardware Device Collision Attempt (Same device, different user)
    const req2 = createMockPostRequest(
      {
        projectId: testProjectId,
        deviceFingerprint: deviceFp, // Same device!
        userId: 'different_user_attacker',
      },
      { 'x-forwarded-for': '198.51.100.42' }
    );
    const res2 = await POST(req2);
    assert.equal(res2.status, 409, 'Expected 409 for duplicate device fingerprint');
    const data2 = await res2.json();
    assert.equal(data2.alreadyVoted, true);
    assert.ok(data2.message.includes('Hardware fingerprint collision'));

    // Vote 3: User Identity Collision Attempt (Different device, same user)
    const req3 = createMockPostRequest(
      {
        projectId: testProjectId,
        deviceFingerprint: 'different_device_fp_9999', // Different device!
        userId: testUserId, // Same user!
      },
      { 'x-forwarded-for': '198.51.100.42' }
    );
    const res3 = await POST(req3);
    assert.equal(res3.status, 409, 'Expected 409 for duplicate user identity');
    const data3 = await res3.json();
    assert.equal(data3.alreadyVoted, true);
    assert.ok(data3.message.includes('user identity has already voted'));
  });

  test('composite rate limiter throttles burst attacks per device (10 req/min)', async () => {
    const burstIp = '203.0.113.88';
    const burstFp = 'burst_device_fingerprint_test_88';

    // Submit 10 rapid votes across different project IDs
    for (let i = 0; i < 10; i++) {
      const req = createMockPostRequest(
        {
          projectId: `burst_proj_${i}`,
          deviceFingerprint: burstFp,
          userId: `burst_user_${i}`,
        },
        { 'x-forwarded-for': burstIp }
      );
      const res = await POST(req);
      assert.equal(res.status, 200, `Request ${i + 1} should be within limit`);
    }

    // 11th request must be throttled with 429 Too Many Requests
    const reqThrottled = createMockPostRequest(
      {
        projectId: 'burst_proj_11',
        deviceFingerprint: burstFp,
        userId: 'burst_user_11',
      },
      { 'x-forwarded-for': burstIp }
    );
    const resThrottled = await POST(reqThrottled);
    assert.equal(resThrottled.status, 429, 'Expected 429 for exceeding device rate limit');
    assert.ok(resThrottled.headers.get('Retry-After'), 'Expected Retry-After header');
    const data = await resThrottled.json();
    assert.equal(data.success, false);
    assert.ok(data.message.includes('Too many requests from this device'));
  });
});
