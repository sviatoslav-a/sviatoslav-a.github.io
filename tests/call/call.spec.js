import { test, expect } from '@playwright/test';
import { randomBytes } from 'node:crypto';
const room = () => '/#v1.' + randomBytes(18).toString('hex') + '.' + randomBytes(32).toString('hex');

async function showControls(page) { await page.locator('#stage').click({ position: { x: 10, y: 300 } }); }
async function grantByButtons(page) {
  await page.locator('#allow-audio').click();
  await expect(page.locator('#allow-audio')).toHaveAttribute('data-state', 'on');
  await page.locator('#allow-video').click();
  await expect(page.locator('#permissions')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-connected', 'true');
}
async function instrument(context) {
  await context.addInitScript(() => {
    const Original = window.RTCPeerConnection;
    window.__pcs = [];
    window.RTCPeerConnection = class extends Original { constructor(...args) { super(...args); window.__pcs.push(this); } };
  });
}
async function received(page) {
  return page.evaluate(async () => {
    let audio = 0, video = 0, frames = 0;
    for (const pc of window.__pcs || []) {
      if (pc.connectionState === 'closed') continue;
      for (const stat of (await pc.getStats()).values()) {
        if (stat.type === 'inbound-rtp') {
          if (stat.kind === 'audio') audio += stat.bytesReceived || 0;
          if (stat.kind === 'video') { video += stat.bytesReceived || 0; frames += stat.framesDecoded || 0; }
        }
      }
    }
    return { audio, video, frames };
  });
}

test('first visit has only microphone and camera; no prompt until a tap', async ({ page }) => {
  await page.addInitScript(() => {
    window.__permissionRequests = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = (...args) => { window.__permissionRequests++; return original(...args); };
  });
  await page.goto(room());
  await expect(page.getByRole('button', { name: 'Microphone', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Camera', exact: true })).toBeVisible();
  await expect(page.getByRole('button')).toHaveCount(2);
  expect(await page.evaluate(() => window.__permissionRequests)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('first-en.png') });
});

test('Russian system language and English fallback', async ({ browser, baseURL }) => {
  for (const [locale, mic, camera, language] of [['ru-RU', 'Микрофон', 'Камера', 'ru'], ['de-DE', 'Microphone', 'Camera', 'en']]) {
    const context = await browser.newContext({ locale, viewport: { width: 390, height: 844 } });
    const page = await context.newPage(); await page.goto(baseURL + room());
    await expect(page.getByRole('button', { name: mic, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: camera, exact: true })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    if (language === 'ru') await page.screenshot({ path: test.info().outputPath('first-ru.png') });
    await context.close();
  }
});

test('denied permission gives a readable recovery action, not a request loop', async ({ page }) => {
  await page.addInitScript(() => {
    window.__permissionRequests = 0;
    navigator.mediaDevices.getUserMedia = async () => { window.__permissionRequests++; throw new DOMException('Permission denied', 'NotAllowedError'); };
  });
  await page.goto(room());
  await page.locator('#allow-audio').click();
  await expect(page.locator('#permission-help')).toContainText('Microphone blocked');
  await expect(page.locator('#allow-audio')).toBeEnabled();
  const requests = await page.evaluate(() => window.__permissionRequests);
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => window.__permissionRequests)).toBe(requests);
  await page.screenshot({ path: test.info().outputPath('denied.png') });
});

test('two real VDO clients exchange audio/video, mute, resume, and leave', async ({ browser, browserName, baseURL }, info) => {
  test.skip(browserName === 'webkit', 'Actual Safari media permission UI requires a physical iPhone; WebKit layout and denied flow are tested separately.');
  const mobile = info.project.name.startsWith('android');
  const contexts = await Promise.all([browser.newContext({ viewport: mobile ? { width: 412, height: 915 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile }), browser.newContext()]);
  const errors = [];
  for (const ctx of contexts) await instrument(ctx);
  const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
  pages.forEach(page => page.on('pageerror', err => errors.push(err.message)));
  const path = room();
  for (const page of pages) { await page.goto(baseURL + path); await grantByButtons(page); }
  for (const page of pages) {
    await expect.poll(async () => (await received(page)).frames, { timeout: 45000 }).toBeGreaterThan(5);
    await expect.poll(async () => (await received(page)).audio).toBeGreaterThan(100);
    await expect(page.locator('#remote-grid video')).toHaveCount(1);
  }
  const before = await Promise.all(pages.map(received));
  await info.attach('received-media', { body: JSON.stringify(before, null, 2), contentType: 'application/json' });
  await pages[0].screenshot({ path: test.info().outputPath('connected.png') });
  await showControls(pages[0]);
  await pages[0].locator('#toggle-audio').click();
  await expect(pages[0].locator('#toggle-audio')).toHaveAttribute('aria-pressed', 'false');
  await pages[0].locator('#toggle-video').click();
  await expect(pages[0].locator('#toggle-video')).toHaveAttribute('aria-pressed', 'false');
  await expect(pages[1].locator('.participant')).toHaveAttribute('data-muted', 'true');
  await pages[0].locator('#toggle-video').click();
  await pages[0].locator('#toggle-audio').click();
  await expect(pages[1].locator('.participant')).toHaveAttribute('data-muted', 'false');
  await expect.poll(async () => (await received(pages[1])).frames).toBeGreaterThan(before[1].frames + 5);
  await pages[0].locator('#hangup').click();
  await expect(pages[0].locator('#ended')).toBeVisible();
  await expect(pages[1].locator('.participant')).toHaveCount(0);
  await expect.poll(() => pages[0].evaluate(() => document.querySelector('#self-video').srcObject?.getTracks().filter(t => t.readyState === 'live').length || 0)).toBe(0);
  expect(errors).toEqual([]);
  await Promise.all(contexts.map(ctx => ctx.close()));
});

test('granted permissions skip entry; idle screen is empty apart from self-view', async ({ page, context, browserName }, info) => {
  test.skip(browserName === 'webkit', 'WebKit does not expose Chromium camera permission overrides.');
  await context.grantPermissions(['camera', 'microphone']);
  await page.goto(room());
  await expect(page.locator('#permissions')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-connected', 'true');
  await expect(page.locator('#self')).toBeVisible();
  await expect(page.locator('body')).toHaveClass(/quiet/);
  await expect(page.locator('#notice')).toBeHidden();
  await page.screenshot({ path: test.info().outputPath('ready.png') });
  await page.reload();
  await expect(page.locator('#permissions')).toBeHidden();
  await expect(page.locator('body')).toHaveAttribute('data-connected', 'true');
});

test('camera failure permits an audio-only call', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Real media test uses Chromium synthetic capture devices.');
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = options => options.video ? Promise.reject(new DOMException('No camera found', 'NotFoundError')) : original(options);
  });
  await page.goto(room()); await page.locator('#allow-audio').click();
  await expect(page.locator('#allow-audio')).toHaveAttribute('data-state', 'on');
  await page.locator('#allow-video').click();
  await expect(page.locator('#permission-help')).toContainText('No camera found');
  await page.getByRole('button', { name: 'Continue without camera' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-connected', 'true');
  await expect(page.locator('#self')).toBeHidden();
});

test('invite preserves the fragment and generates distinct secrets', async ({ page, context }) => {
  const path = room(); await page.goto(path); expect(new URL(page.url()).hash).toBe(path.slice(1));
  await page.goto('/'); expect(new URL(page.url()).hash).toMatch(/^#v1\.[a-f0-9]{36}\.[a-f0-9]{64}$/);
  const first = page.url(); const other = await context.newPage(); await other.goto('/'); expect(other.url()).not.toBe(first);
});
