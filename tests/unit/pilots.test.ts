import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forecast, risks, windows, makeGuests, kmeansStep, nameSegment, pickScenario, rng, PER_COOK } from '../../src/scripts/pilots.ts';
import { scenarios } from '../../src/data/pilotData.ts';

test('seeded rng is deterministic', () => {
  const a = rng(1), b = rng(1);
  assert.equal(a(), b());
});

test('kitchen: more cooks never adds risk; enough cooks removes it', () => {
  const fc = forecast();
  let prev = Infinity;
  for (let c = 3; c <= 8; c++) {
    const n = risks(fc, c).length;
    assert.ok(n <= prev);
    prev = n;
  }
  assert.equal(risks(fc, Math.ceil(Math.max(...fc) / PER_COOK)).length, 0);
  assert.ok(risks(fc, 4).length > 0, 'default slider shows an alert');
});

test('kitchen: risk hours group into contiguous windows', () => {
  assert.deepEqual(windows([13, 18, 19, 20]), [[13, 13], [18, 20]]);
  assert.deepEqual(windows([]), []);
});

test('k-means converges and every guest gets a segment', () => {
  const pts = makeGuests(600);
  let cents = [{ x: 1, y: 900 }, { x: 4, y: 1400 }, { x: 2, y: 2900 }, { x: 8, y: 1700 }];
  let moved = 1, it = 0;
  while (moved && it++ < 50) ({ moved, cents } = kmeansStep(pts, cents, 2.5, 900));
  assert.equal(moved, 0);
  assert.ok(pts.every((p) => p.c >= 0 && p.c < 4));
});

test('segment names cover the main personas', () => {
  assert.equal(nameSegment({ x: 8, y: 1600 }, 'en')[0], 'Super fans');
  assert.equal(nameSegment({ x: 1.6, y: 2800 }, 'ru')[0], 'Большие заказы');
  assert.equal(nameSegment({ x: 0.5, y: 2000 }, 'en')[0], 'Dormant');
});

test('smart search routes each preset to its own scenario', () => {
  for (const lang of ['ru', 'en'] as const) {
    const qs = lang === 'ru'
      ? ['Почему вырос фудкост на Малышева?', 'Где найти отчёт по списаниям?', 'Какие блюда чаще всего возвращают?']
      : ['Why did food cost rise?', 'Where is the write-off report?', 'Which dishes get returned most?'];
    qs.forEach((q, i) => assert.equal(pickScenario(q, scenarios[lang]), scenarios[lang][i], `${lang}: ${q}`));
  }
});
