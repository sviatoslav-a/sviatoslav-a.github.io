import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 900;

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

for (const path of ['/', '/en/']) {
  test(`${path} loads clean, no horizontal overflow, all sections present`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    for (const id of ['fit', 'cases', 'pilots', 'process', 'path', 'contact']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(sw).toBeLessThanOrEqual(iw);
    // scroll through the whole page so lazy images and observers fire
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);
    expect(errors).toEqual([]);
  });

  for (const scheme of ['light', 'dark'] as const) test(`${path} has no serious accessibility violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: scheme });
    await page.goto(path);
    const res = await new AxeBuilder({ page }).disableRules(['region']).analyze();
    const serious = res.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
  });
}

test('hero agent trace runs to done and counters land on real numbers', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-trace-status]')).toHaveText(/done/, { timeout: 8000 });
  await expect(page.locator('[data-trace-line].on')).toHaveCount(6);
  await expect(page.locator('[data-count="8000"]')).toHaveText(/8\s?000/, { timeout: 5000 });
});

test('role fit: clicking a requirement shows its evidence and links to a case', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-fit-tab="rag"]');
  await expect(page.locator('[data-fit-tab="rag"]')).toHaveAttribute('aria-selected', 'true');
  const panel = page.locator('[data-fit-panel="rag"]');
  await expect(panel).toBeVisible();
  await expect(page.locator('[data-fit-panel="find"]')).toBeHidden();
  await panel.locator('[data-open-case="atlas"]').click();
  await expect(page.locator('#case-atlas')).toHaveAttribute('open', '');
  await expect(page.locator('#case-atlas .c-body')).toBeInViewport();
});

test('role fit: arrow keys move between requirements', async ({ page }) => {
  await page.goto('/');
  await page.focus('[data-fit-tab="find"]');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-fit-tab="agents"]')).toBeFocused();
  await expect(page.locator('[data-fit-panel="agents"]')).toBeVisible();
});

test('cases: filter narrows the list and expanding shows details', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-filter="documents"]');
  await expect(page.locator('details[data-tags]:visible')).toHaveCount(1);
  await expect(page.locator('#case-slip')).toBeVisible();
  await page.locator('#case-slip summary').click();
  await expect(page.locator('#case-slip img').first()).toBeVisible();
  await page.click('[data-filter="all"]');
  await expect(page.locator('details[data-tags]:visible')).toHaveCount(8);
});

test('search: ⌘K opens, finds by meaning across languages, Enter navigates', async ({ page }) => {
  await page.goto('/');
  if (isMobile(page)) await page.click('[data-search-open]');
  else await page.keyboard.press('ControlOrMeta+k');
  const dlg = page.locator('[data-search]');
  await expect(dlg).toBeVisible();
  await page.fill('[data-search-input]', 'telegram бот');
  const first = page.locator('[data-search-results] a').first();
  await expect(first).toContainText(/Telegram|бот/i);
  const href = (await first.getAttribute('href'))!;
  await page.keyboard.press('Enter');
  await expect(dlg).toBeHidden();
  await expect(page).toHaveURL(new RegExp(href + '$'));
  await expect(page.locator(href)).toBeInViewport();
  // a case result opens its details
  await page.click('[data-search-open]');
  await page.fill('[data-search-input]', 'распознавание чеков OCR');
  await page.locator('[data-search-results] a[href="#case-slip"]').click();
  await expect(page.locator('#case-slip')).toHaveAttribute('open', '');
});

test('search: nonsense query shows the empty state', async ({ page }) => {
  await page.goto('/en/');
  await page.click('[data-search-open]');
  await page.fill('[data-search-input]', 'qwzxqwzx');
  await expect(page.locator('.r-empty')).toContainText('Nothing found');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-search]')).toBeHidden();
});

test('pilot 1: smart ERP search answers each preset with sources', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#pilots').scrollIntoViewIfNeeded();
  const panel = page.locator('[data-pilot-panel="search"]');
  for (const i of [1, 2, 0]) {
    await panel.locator(`[data-preset="${i}"]`).click();
    await expect(panel).toHaveAttribute('data-done', String(i));
    await expect(panel.locator('[data-ask-answer]')).toBeVisible();
    await expect(panel.locator('[data-ask-src]')).not.toBeEmpty();
    await expect(panel.locator('[data-ask-trace] li').last()).toContainText('check');
  }
});

test('pilot 2: k-means converges with the chosen number of segments', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.click('[data-pilot-tab="segments"]');
  const panel = page.locator('[data-pilot-panel="segments"]');
  await expect(panel).toHaveAttribute('data-converged', '4');
  await expect(panel.locator('[data-seg-list] li')).toHaveCount(4);
  await panel.locator('[data-k="3"]').click();
  await expect(panel).toHaveAttribute('data-converged', '3');
  await expect(panel.locator('[data-seg-list] li')).toHaveCount(3);
  await expect(panel.locator('[data-seg-iter]')).toContainText('converged');
  const total = await panel.locator('[data-seg-list] .sn small').allTextContents();
  expect(total.reduce((a, t) => a + parseInt(t), 0)).toBe(600);
});

test('pilot 3: adding cooks clears the kitchen alert', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-pilot-tab="kitchen"]');
  const panel = page.locator('[data-pilot-panel="kitchen"]');
  await expect(panel.locator('.alert:not(.ok)')).toBeVisible();
  expect(Number(await panel.getAttribute('data-risks'))).toBeGreaterThan(0);
  await panel.locator('[data-cooks]').fill('8');
  await expect(panel.locator('.alert.ok')).toBeVisible();
  await expect(panel).toHaveAttribute('data-risks', '0');
  await expect(panel.locator('[data-cooks-val]')).toHaveText('8');
});

test('pilot tabs support arrow keys', async ({ page }) => {
  await page.goto('/');
  await page.focus('[data-pilot-tab="search"]');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-pilot-tab="segments"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-pilot-panel="segments"]')).toBeVisible();
});

test('theme toggle switches and persists across reloads', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const dark = await bg();
  await page.click('[data-theme-toggle]');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bg()).not.toBe(dark);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('language switch goes RU → EN and back', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.click('[data-lang-switch]');
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('working systems');
  await page.click('[data-lang-switch]');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
});

test('navigation: desktop nav or mobile menu reaches every section', async ({ page }) => {
  await page.goto('/');
  for (const id of ['fit', 'cases', 'pilots', 'process', 'path']) {
    if (isMobile(page)) {
      await page.click('[data-menu-toggle]');
      await page.locator(`[data-mnav] a[href="#${id}"]`).click();
      await expect(page.locator('[data-mnav]')).toBeHidden();
    } else {
      await page.locator(`.nav a[href="#${id}"]`).click();
    }
    await expect(page.locator(`#${id} h2`).first()).toBeInViewport();
  }
});

test('contact links point to real profiles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#contact a[href="https://t.me/zotho"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href="https://github.com/zotho"]')).toHaveCount(1);
  await expect(page.locator('#contact a[href^="mailto:"]')).toHaveCount(1);
});

test('llms.txt is generated from the same content', async ({ request }) => {
  const r = await request.get('/llms.txt');
  expect(r.ok()).toBeTruthy();
  const t = await r.text();
  expect(t).toContain('# Sviatoslav Alekseev');
  expect(t).toContain('Vacancy requirements');
  expect(t).toContain('154 of 154');
  expect(t).not.toMatch(/[–—]/); // writing rule: no en/em dashes
});

test('no em or en dashes anywhere in visible copy', async ({ page }) => {
  for (const p of ['/', '/en/']) {
    await page.goto(p);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/[–—]/);
  }
});

test('unknown route serves the 404 page', async ({ page }) => {
  const r = await page.goto('/nope');
  expect(r?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Такой страницы нет');
});
