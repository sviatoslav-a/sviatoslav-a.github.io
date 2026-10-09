// Interactive pilot demos. All data is synthetic and generated in the browser.
import type { Scenario } from '../data/pilotData';

type Lang = 'ru' | 'en';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

// Seeded PRNG so the demo is reproducible (and testable).
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());

/* ---------- tabs ---------- */
function initTabs(root: HTMLElement, onShow: (id: string) => void) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-pilot-tab]')];
  const show = (id: string, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.pilotTab === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    root.querySelectorAll<HTMLElement>('[data-pilot-panel]').forEach((p) => (p.hidden = p.dataset.pilotPanel !== id));
    onShow(id);
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t.dataset.pilotTab!));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); show(tabs[(i + d + tabs.length) % tabs.length].dataset.pilotTab!, true); }
    });
  });
  return show;
}

/* ---------- 1. smart search ---------- */
export function pickScenario(q: string, scenarios: Scenario[]): Scenario {
  const ql = q.toLowerCase();
  let best = scenarios[0], score = -1;
  for (const s of scenarios) {
    const sc = s.keys.reduce((a, k) => a + (ql.includes(k) ? 1 : 0), 0);
    if (sc > score) { score = sc; best = s; }
  }
  return best;
}

function initAsk(panel: HTMLElement) {
  const form = panel.querySelector<HTMLFormElement>('[data-ask]')!;
  const input = panel.querySelector<HTMLInputElement>('[data-ask-input]')!;
  const trace = panel.querySelector<HTMLOListElement>('[data-ask-trace]')!;
  const ans = panel.querySelector<HTMLElement>('[data-ask-answer]')!;
  const scenarios: Scenario[] = JSON.parse(panel.querySelector('[data-scenarios]')!.textContent!);
  const presets = [...panel.querySelectorAll<HTMLButtonElement>('[data-preset]')];
  let run = 0;

  const ask = async (q: string) => {
    const my = ++run;
    const sc = pickScenario(q, scenarios);
    trace.innerHTML = '';
    ans.hidden = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, reduced() ? 0 : ms));
    for (const st of sc.steps) {
      await wait(st.kind === 'tool' ? 520 : 300);
      if (my !== run) return;
      const li = document.createElement('li');
      li.innerHTML = `<span class="k k-${st.kind}">${st.kind}</span><span>${esc(st.text)}</span>`;
      trace.append(li);
    }
    await wait(300);
    if (my !== run) return;
    ans.querySelector('[data-ask-text]')!.textContent = sc.answer;
    ans.querySelector('[data-ask-src]')!.textContent = sc.sources.join(' · ');
    ans.hidden = false;
    panel.dataset.done = String(scenarios.indexOf(sc));
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });
  presets.forEach((b) => b.addEventListener('click', () => { input.value = b.textContent!.trim(); ask(input.value); }));
  return () => { if (!trace.childElementCount) ask(input.value); };
}

/* ---------- 2. k-means segmentation ---------- */
type P = { x: number; y: number; c: number };
export function makeGuests(n: number, seed = 7): P[] {
  const r = rng(seed);
  // [orders per month, avg check ₽, share]
  const blobs: [number, number, number, number, number][] = [
    [1.2, 900, 0.32, 0.5, 220], // rare, cheap
    [3.5, 1400, 0.28, 0.9, 260], // regulars
    [1.8, 2900, 0.18, 0.6, 420], // rare big orders (families / offices)
    [7.5, 1700, 0.12, 1.4, 300], // super fans
    [0.6, 2000, 0.10, 0.3, 500], // sleeping
  ];
  const pts: P[] = [];
  for (const [mx, my, share, sx, sy] of blobs) {
    const m = Math.round(n * share);
    for (let i = 0; i < m; i++) pts.push({ x: Math.max(0.2, mx + gauss(r) * sx), y: Math.max(300, my + gauss(r) * sy), c: -1 });
  }
  return pts;
}

export function kmeansStep(pts: P[], cents: { x: number; y: number }[], sx: number, sy: number) {
  let moved = 0;
  for (const p of pts) {
    let best = 0, bd = Infinity;
    cents.forEach((c, i) => {
      const d = ((p.x - c.x) / sx) ** 2 + ((p.y - c.y) / sy) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    if (p.c !== best) { moved++; p.c = best; }
  }
  const next = cents.map((c, i) => {
    const m = pts.filter((p) => p.c === i);
    return m.length ? { x: m.reduce((a, p) => a + p.x, 0) / m.length, y: m.reduce((a, p) => a + p.y, 0) / m.length } : c;
  });
  return { moved, cents: next };
}

const SEG_COLORS = ['#19f0e6', '#ff5b3a', '#ffc94a', '#7be38b', '#b48cff'];

export function nameSegment(c: { x: number; y: number }, lang: Lang) {
  const freq = c.x >= 5 ? 'hi' : c.x >= 2.5 ? 'mid' : c.x < 1 ? 'sleep' : 'low';
  const big = c.y >= 2200;
  const T = {
    ru: {
      hi: ['Фанаты', 'Ранний доступ к новинкам и кешбэк за серию заказов'],
      mid: ['Постоянные гости', 'Персональный комбо из любимых блюд по их истории'],
      low: ['Редкие гости', 'Напоминание в обед + бесплатная доставка'],
      sleep: ['Уснувшие', 'Реактивация: "давно не виделись", скидка 20% на 7 дней'],
      big: ['Большие заказы', 'Сеты для компании и офиса, доставка ко времени'],
    },
    en: {
      hi: ['Super fans', 'Early access to new dishes and cashback for order streaks'],
      mid: ['Regulars', 'A personal combo of their favourite dishes from history'],
      low: ['Occasional guests', 'Lunchtime nudge + free delivery'],
      sleep: ['Dormant', 'Win-back: "long time no see", 20% off for 7 days'],
      big: ['Big orders', 'Party and office sets, delivery on time'],
    },
  }[lang];
  return big && freq !== 'hi' && freq !== 'sleep' ? T.big : T[freq];
}

function initSegments(panel: HTMLElement, lang: Lang) {
  const canvas = panel.querySelector<HTMLCanvasElement>('[data-seg-canvas]')!;
  const list = panel.querySelector<HTMLUListElement>('[data-seg-list]')!;
  const iterEl = panel.querySelector<HTMLElement>('[data-seg-iter]')!;
  const ctx = canvas.getContext('2d')!;
  const pts = makeGuests(600);
  const X = [0, 10], Y = [200, 4200];
  let k = 4, cents: { x: number; y: number }[] = [], seed = 1, timer = 0;

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.max(1, r.width * dpr);
    canvas.height = Math.max(1, r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const draw = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight, pad = 28;
    const sx = (x: number) => pad + ((x - X[0]) / (X[1] - X[0])) * (w - pad * 2);
    const sy = (y: number) => h - pad - ((y - Y[0]) / (Y[1] - Y[0])) * (h - pad * 2);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = css('--line');
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const gx = pad + (i / 5) * (w - pad * 2), gy = pad + (i / 5) * (h - pad * 2);
      ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, h - pad); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(w - pad, gy); ctx.stroke();
    }
    for (const p of pts) {
      ctx.fillStyle = p.c < 0 ? css('--muted') : SEG_COLORS[p.c];
      ctx.globalAlpha = 0.75;
      ctx.fillRect(sx(p.x) - 2, sy(p.y) - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
    cents.forEach((c, i) => {
      ctx.fillStyle = SEG_COLORS[i];
      ctx.strokeStyle = css('--bg');
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(sx(c.x), sy(c.y), 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    });
  };
  const renderList = () => {
    const counts = cents.map((_, i) => pts.filter((p) => p.c === i).length);
    const order = cents.map((_, i) => i).sort((a, b) => counts[b] - counts[a]);
    list.innerHTML = order.map((i) => {
      const [name, offer] = nameSegment(cents[i], lang);
      const c = cents[i];
      return `<li style="--c:${SEG_COLORS[i]}"><div class="sn">${esc(name)} <small>${counts[i]} · ${c.x.toFixed(1)}/${lang === 'ru' ? 'мес' : 'mo'} · ${Math.round(c.y)} ₽</small></div><div class="so">→ ${esc(offer)}</div></li>`;
    }).join('');
  };
  const run = () => {
    clearTimeout(timer);
    const r = rng(seed++);
    pts.forEach((p) => (p.c = -1));
    // k-means++ style init: spread starting centroids
    cents = [pts[Math.floor(r() * pts.length)]].map((p) => ({ x: p.x, y: p.y }));
    while (cents.length < k) {
      const d = pts.map((p) => Math.min(...cents.map((c) => ((p.x - c.x) / 10) ** 2 + ((p.y - c.y) / 4000) ** 2)));
      const sum = d.reduce((a, b) => a + b, 0);
      let t = r() * sum, i = 0;
      while ((t -= d[i]) > 0 && i < d.length - 1) i++;
      cents.push({ x: pts[i].x, y: pts[i].y });
    }
    let it = 0;
    list.innerHTML = '';
    const tick = () => {
      const res = kmeansStep(pts, cents, 2.5, 900);
      cents = res.cents;
      it++;
      iterEl.textContent = `k-means · iter ${it} · moved ${res.moved}`;
      draw();
      if (res.moved > 0 && it < 30) timer = window.setTimeout(tick, reduced() ? 0 : 380);
      else { iterEl.textContent += ' · converged ✓'; renderList(); panel.dataset.converged = String(k); }
    };
    draw();
    timer = window.setTimeout(tick, reduced() ? 0 : 300);
  };
  panel.querySelectorAll<HTMLButtonElement>('[data-k]').forEach((b) => b.addEventListener('click', () => {
    k = Number(b.dataset.k);
    panel.querySelectorAll('[data-k]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    run();
  }));
  panel.querySelector('[data-seg-rerun]')!.addEventListener('click', run);
  new ResizeObserver(() => { size(); draw(); }).observe(canvas);
  document.addEventListener('site:theme', draw);
  let started = false;
  return () => { if (!started) { started = true; size(); run(); } };
}

/* ---------- 3. kitchen load ---------- */
export const HOURS = Array.from({ length: 13 }, (_, i) => 10 + i); // 10:00..22:00
export function forecast(): number[] {
  const r = rng(42);
  return HOURS.map((h) => {
    const lunch = 30 * Math.exp(-((h - 13) ** 2) / 2.2);
    const dinner = 46 * Math.exp(-((h - 19.3) ** 2) / 3);
    return Math.round(8 + lunch + dinner + r() * 4);
  });
}
export const PER_COOK = 9; // orders per cook per hour
export function risks(fc: number[], cooks: number) {
  const cap = cooks * PER_COOK;
  return fc.map((v, i) => ({ h: HOURS[i], v, load: v / cap })).filter((x) => x.load > 1);
}

// Groups sorted hours into contiguous [from, to] windows: [13,18,19,20] -> [[13,13],[18,20]].
export function windows(hours: number[]): [number, number][] {
  const out: [number, number][] = [];
  for (const h of hours) {
    const last = out[out.length - 1];
    if (last && h === last[1] + 1) last[1] = h;
    else out.push([h, h]);
  }
  return out;
}

function initKitchen(panel: HTMLElement, lang: Lang) {
  const chart = panel.querySelector<HTMLElement>('[data-kit-chart]')!;
  const alert = panel.querySelector<HTMLElement>('[data-kit-alert]')!;
  const slider = panel.querySelector<HTMLInputElement>('[data-cooks]')!;
  const val = panel.querySelector<HTMLElement>('[data-cooks-val]')!;
  const fc = forecast();
  const okText = panel.closest('[data-pilots]')!.getAttribute('data-kitchen-ok') ?? '';
  const loadWord = panel.closest('[data-pilots]')!.getAttribute('data-kitchen-load') ?? 'load';

  const render = () => {
    const cooks = Number(slider.value);
    val.textContent = String(cooks);
    const cap = cooks * PER_COOK;
    const W = 760, H = 260, pl = 34, pb = 26, pt = 14;
    const max = Math.max(...fc, cap) * 1.1;
    const bw = (W - pl) / fc.length;
    const y = (v: number) => H - pb - (v / max) * (H - pb - pt);
    const bars = fc.map((v, i) => {
      const over = v > cap;
      const x = pl + i * bw + 5;
      return `<g><rect x="${x}" y="${y(v)}" width="${bw - 10}" height="${H - pb - y(v)}" rx="5" fill="${over ? 'var(--hot)' : 'var(--accent)'}" opacity="${over ? 0.95 : 0.55}"><title>${HOURS[i]}:00 · ${v} · ${Math.round((v / cap) * 100)}%</title></rect>
        <text x="${x + (bw - 10) / 2}" y="${H - 8}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--mono)">${HOURS[i]}</text>
        ${over ? `<text x="${x + (bw - 10) / 2}" y="${y(v) - 6}" text-anchor="middle" font-size="10.5" fill="var(--hot)" font-family="var(--mono)" font-weight="700">${Math.round((v / cap) * 100)}%</text>` : ''}</g>`;
    }).join('');
    const cy = y(cap);
    chart.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${loadWord}: ${cooks} × ${PER_COOK}/h">
      ${[0, 0.25, 0.5, 0.75, 1].map((f) => `<line x1="${pl}" x2="${W}" y1="${y(max * f)}" y2="${y(max * f)}" stroke="var(--line)" />`).join('')}
      ${bars}
      <line x1="${pl}" x2="${W}" y1="${cy}" y2="${cy}" stroke="var(--ink)" stroke-dasharray="6 5" stroke-width="1.5" />
      <text x="${W - 4}" y="${cy - 6}" text-anchor="end" font-size="11.5" fill="var(--ink)" font-family="var(--mono)">${lang === 'ru' ? 'мощность' : 'capacity'} ${cap}/${lang === 'ru' ? 'ч' : 'h'}</text>
    </svg>`;
    const rk = risks(fc, cooks);
    if (!rk.length) {
      alert.innerHTML = `<div class="alert ok"><b>✓ ok</b><span>${esc(okText)}</span></div>`;
    } else {
      const when = windows(rk.map((r) => r.h)).map(([a, b]) => `${a}:00-${b + 1}:00`).join(lang === 'ru' ? ' и ' : ' and ');
      const peak = rk.reduce((a, b) => (b.load > a.load ? b : a));
      const need = Math.ceil(Math.max(...fc) / PER_COOK);
      const msg = lang === 'ru'
        ? `Сегодня ${when} прогноз до ${peak.v} заказов/ч при мощности ${cap}: загрузка до ${Math.round(peak.load * 100)}%. Нужно ${need} поваров вместо ${cooks}, или на эти часы ограничить радиус доставки и поднять время ожидания в приложении до 60 мин.`
        : `Today ${when} the forecast reaches ${peak.v} orders/h against capacity ${cap}: up to ${Math.round(peak.load * 100)}% load. You need ${need} cooks instead of ${cooks}, or for those hours shrink the delivery radius and raise the in-app ETA to 60 min.`;
      alert.innerHTML = `<div class="alert"><b>⚠ ${lang === 'ru' ? 'алерт управляющему' : 'alert to manager'}</b><span>${esc(msg)}</span></div>`;
    }
    panel.dataset.risks = String(rk.length);
  };
  slider.addEventListener('input', render);
  render();
}

export function initPilots(lang: Lang) {
  const root = document.querySelector<HTMLElement>('[data-pilots]');
  if (!root) return;
  const startAsk = initAsk(root.querySelector('[data-pilot-panel="search"]')!);
  const startSeg = initSegments(root.querySelector('[data-pilot-panel="segments"]')!, lang);
  initKitchen(root.querySelector('[data-pilot-panel="kitchen"]')!, lang);
  initTabs(root, (id) => { if (id === 'segments') startSeg(); if (id === 'search') startAsk(); });
  // Run the first demo when it scrolls into view.
  new IntersectionObserver((es, ob) => {
    if (es.some((e) => e.isIntersecting)) { startAsk(); ob.disconnect(); }
  }, { threshold: 0.3 }).observe(root);
  document.addEventListener('site:goto', (e) => {
    const id = (e as CustomEvent<string>).detail;
    const m = id.match(/^pilot-(search|segments|kitchen)$/);
    if (m) (root.querySelector(`[data-pilot-tab="${m[1]}"]`) as HTMLButtonElement)?.click();
  });
}
