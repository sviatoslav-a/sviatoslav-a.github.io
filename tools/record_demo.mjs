// Record the actual UI. npm run build && npm run demo
// Requires Chromium (`npx playwright install chromium`) and ffmpeg on PATH.
import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = 'docs/demo';
await mkdir(output, { recursive: true });
const raw = await mkdtemp(join(tmpdir(), 'portfolio-video-'));
const port = 4336;
const server = spawn('npx', ['astro', 'preview', '--port', String(port), '--ignore-lock'], { stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { ready = (await fetch(`http://localhost:${port}/`)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  if (!ready) throw new Error('Preview server did not start');
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 },
    colorScheme: 'dark', deviceScaleFactor: 1,
    recordVideo: { dir: raw, size: { width: 1440, height: 900 } } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const pause = ms => page.waitForTimeout(ms);
  const caption = async text => page.evaluate(text => {
    let el = document.querySelector('[data-demo-caption]');
    if (!el) {
      el = document.createElement('div'); el.setAttribute('data-demo-caption', '');
      el.style.cssText = 'position:fixed;bottom:20px;left:24px;z-index:9999;padding:10px 16px;border:1px solid #343a44;border-radius:12px;background:#0b0c0eea;color:#eef1f4;font:13px ui-monospace,monospace;pointer-events:none;box-shadow:0 6px 24px #0005';
      document.body.append(el);
    }
    el.textContent = text;
  }, text);
  await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await caption('01 / AI engineer · Projects, evidence and interactive demos');
  await pause(5500);
  await page.locator('[data-demo-caption]').evaluate(el => el.style.visibility = 'hidden');
  await page.screenshot({ path: `${output}/portfolio-demo.png` });
  await page.locator('[data-demo-caption]').evaluate(el => el.style.visibility = 'visible');

  await page.locator('#fit').scrollIntoViewIfNeeded(); await pause(800);
  await page.locator('[data-fit-tab="rag"]').click();
  await caption('02 / Every role requirement links to project evidence'); await pause(3000);
  await page.locator('[data-fit-panel="rag"] [data-open-case="atlas"]').click();
  await pause(700); await caption('03 / Case studies: problem → implementation → result'); await pause(3000);

  await page.locator('#pilots').scrollIntoViewIfNeeded(); await pause(700);
  await page.locator('[data-pilot-panel="search"] [data-preset="1"]').click();
  await caption('04 / ERP assistant prototype · synthetic data, visible sources');
  await page.waitForFunction(() => document.querySelector('[data-pilot-panel="search"]')?.getAttribute('data-done') === '1');
  await pause(2000);
  await page.locator('[data-pilot-tab="segments"]').click();
  await caption('05 / Real in-browser k-means · 600 synthetic guests');
  await page.locator('[data-k="3"]').click(); await pause(3000);
  await page.locator('[data-pilot-tab="kitchen"]').click();
  await caption('06 / Kitchen capacity: change staffing, see the risk change'); await pause(1500);
  await page.locator('[data-cooks]').fill('8'); await pause(2200);

  await page.locator('[data-search-open]').click();
  await page.locator('[data-search-input]').pressSequentially('telegram бот', { delay: 100 });
  await caption('07 / Bilingual BM25 search · no external API'); await pause(2300);
  await page.keyboard.press('Escape');
  await page.locator('[data-lang-switch]').click();
  await caption('08 / RU + EN · light + dark · desktop + mobile'); await pause(2500);
  await page.locator('[data-theme-toggle]').click(); await pause(2500);
  const video = page.video();
  await context.close();
  if (errors.length) throw new Error(errors.join('\n'));
  const path = await video.path();
  const ffmpeg = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
  ffmpeg(['-ss', '0.5', '-i', path, '-an', '-vf', 'fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', `${output}/portfolio-demo.mp4`]);
  // Match pii-gateway's readable 1200px/10fps/no-dither settings. Keep the GIF
  // excerpt short rather than reducing resolution; the MP4 has the full tour.
  ffmpeg(['-i', `${output}/portfolio-demo.mp4`, '-t', '18', '-filter_complex', '[0:v]fps=10,scale=1200:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=none', '-loop', '0', `${output}/portfolio-demo.gif`]);
  console.log(`Demo: ${output}/portfolio-demo.mp4 (and GIF/PNG preview)`);
} finally {
  await browser?.close();
  server.kill();
  await rm(raw, { recursive: true, force: true });
}
