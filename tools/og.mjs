// Renders public/og.png (1200x630) from the built hero. Run after `npm run build`.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const port = 4331;
const server = spawn('npx', ['astro', 'preview', '--port', String(port), '--ignore-lock'], { stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://localhost:${port}/`)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'dark', reducedMotion: 'reduce' });
  await p.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.topbar{display:none} .hero{padding-top:56px} .stats,.cta{display:none} h1{font-size:64px!important}' });
  await p.waitForTimeout(500);
  await p.screenshot({ path: 'public/og.png' });
  await b.close();
} finally {
  server.kill();
}
