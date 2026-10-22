import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';

test('modified ciphertext, wrong secret, different room and plain SDP are rejected', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => !!window.VDONinjaSDK);
  const result = await page.evaluate(async () => {
    const { privateSDK } = await import('/secure-sdk.js');
    const secret = 'ac'.repeat(32);
    const a = privateSDK(secret, 'room-a');
    const b = privateSDK(secret, 'room-a');
    const wrong = privateSDK('bd'.repeat(32), 'room-a');
    const otherRoom = privateSDK(secret, 'room-b');
    let remoteDescriptions = 0;
    const original = RTCPeerConnection.prototype.setRemoteDescription;
    RTCPeerConnection.prototype.setRemoteDescription = function(...args) { remoteDescriptions++; return original.apply(this, args); };
    const message = JSON.stringify({ type: 'offer', sdp: 'v=0\r\na=fingerprint:sha-256 test\r\n' });
    const [cipher, iv] = await a._encryptMessage(message);
    const opened = await b._decryptMessage(cipher, iv);
    const rejected = [];
    for (const attempt of [
      () => wrong._decryptMessage(cipher, iv),
      () => otherRoom._decryptMessage(cipher, iv),
      () => b._decryptMessage((cipher.startsWith('00') ? '01' : '00') + cipher.slice(2), iv),
      () => a._handleSDP({ UUID: 'attacker', description: JSON.parse(message) }),
      () => a._handleAnswerSDP({ UUID: 'attacker', description: { type: 'answer', sdp: 'untrusted' } })
    ]) { try { await attempt(); rejected.push(false); } catch { rejected.push(true); } }
    return { opened: opened === message, rejected, remoteDescriptions };
  });
  expect(result).toEqual({ opened: true, rejected: [true, true, true, true, true], remoteDescriptions: 0 });
});

test('forced TURN call decodes media and DTLS certificates belong to the two clients', async ({ browser, browserName, baseURL }, info) => {
  test.skip(browserName === 'webkit', 'Real media uses Chromium synthetic devices.');
  const contexts = await Promise.all([browser.newContext({ permissions: ['camera', 'microphone'] }), browser.newContext({ permissions: ['camera', 'microphone'] })]);
  const pages = await Promise.all(contexts.map(c => c.newPage()));
  const path = '/?relay=1#v1.' + randomBytes(18).toString('hex') + '.' + randomBytes(32).toString('hex');
  try {
    for (const page of pages) {
      await page.addInitScript(() => {
        window.pcs = []; const Base = RTCPeerConnection;
        window.RTCPeerConnection = class extends Base { constructor(...args) { super(...args); pcs.push(this); } };
      });
      await page.goto(baseURL + path);
      await expect(page.locator('body')).toHaveAttribute('data-connected', 'true');
    }
    const snapshot = () => Promise.all(pages.map(p => p.evaluate(async () => {
      const result = { audio: 0, frames: 0, transports: [] };
      for (const pc of pcs) {
        const stats = await pc.getStats();
        for (const s of stats.values()) {
          if (s.type === 'inbound-rtp') { result.audio += s.kind === 'audio' ? s.bytesReceived || 0 : 0; result.frames += s.framesDecoded || 0; }
          if (s.type === 'transport' && s.selectedCandidatePairId) {
            const pair = stats.get(s.selectedCandidatePairId);
            const dtls = [...pc.getSenders(), ...pc.getReceivers()].map(r => r.transport).find(t => t?.state === 'connected');
            const cert = dtls?.getRemoteCertificates?.()[0];
            const remote = cert ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', cert)), b => b.toString(16).padStart(2, '0')).join(':').toUpperCase() : stats.get(s.remoteCertificateId)?.fingerprint;
            result.transports.push({ local: stats.get(s.localCertificateId)?.fingerprint, remote, candidate: stats.get(pair.localCandidateId)?.candidateType, dtls: s.dtlsState });
          }
        }
      } return result;
    })));
    await expect.poll(async () => (await snapshot()).every(s => s.audio > 100 && s.frames > 5), { timeout: 45000 }).toBe(true);
    const stats = await snapshot();
    for (let i = 0; i < 2; i++) {
      expect(stats[i].transports.length).toBeGreaterThan(0);
      for (const t of stats[i].transports) {
        expect(t.candidate).toBe('relay'); expect(t.dtls).toBe('connected');
        expect(t.remote).toBeTruthy(); expect(stats[1-i].transports.some(o => o.local === t.remote)).toBe(true);
      }
    }
    await info.attach('encrypted-relay-evidence', { body: JSON.stringify(stats), contentType: 'application/json' });
  } finally { await Promise.all(contexts.map(c => c.close())); }
});
