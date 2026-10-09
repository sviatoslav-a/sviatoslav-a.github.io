import { initSearch, type Doc } from './search';
import { initPilots } from './pilots';

type Lang = 'ru' | 'en';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lang = (document.documentElement.lang as Lang) || 'ru';
const docs: Doc[] = JSON.parse(document.getElementById('search-index')?.textContent ?? '[]');

/* theme */
function initTheme() {
  const btn = document.querySelector('[data-theme-toggle]');
  btn?.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    document.dispatchEvent(new Event('site:theme'));
  });
}

/* topbar, progress, active nav */
function initScroll() {
  const bar = document.querySelector<HTMLElement>('[data-topbar]');
  const prog = document.querySelector<HTMLElement>('[data-progress]');
  const onScroll = () => {
    const h = document.documentElement;
    bar?.classList.toggle('scrolled', h.scrollTop > 8);
    prog?.style.setProperty('--p', String(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const links = new Map([...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')].map((a) => [a.dataset.nav!, a]));
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) {
      links.forEach((a) => a.classList.remove('active'));
      links.get(e.target.id)?.classList.add('active');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

/* mobile menu */
function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('[data-mnav]');
  if (!btn || !nav) return;
  const set = (open: boolean) => { nav.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(nav.hidden));
  nav.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}

/* reveal on scroll */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (reduced) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px' });
  els.forEach((e) => io.observe(e));
}

/* hero headline: split into words, highlight "AI" */
function initSplit() {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((h) => {
    const words = h.textContent!.trim().split(/\s+/);
    h.innerHTML = words.map((w, i) => `<span class="w${/^AI$/i.test(w) ? ' hl' : ''}" style="--d:${i}">${w}</span>`).join(' ');
  });
}

/* counters */
function initCounters() {
  const fmt = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US');
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) {
      const el = e.target as HTMLElement;
      io.unobserve(el);
      const to = Number(el.dataset.count);
      if (reduced) continue;
      const t0 = performance.now(), dur = 1400;
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        el.textContent = fmt.format(Math.round(to * (1 - (1 - k) ** 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((e) => io.observe(e));
}

/* hero agent trace */
function initTrace() {
  const box = document.querySelector<HTMLElement>('[data-trace]');
  if (!box) return;
  const lines = [...box.querySelectorAll<HTMLElement>('[data-trace-line]')];
  const status = box.querySelector<HTMLElement>('[data-trace-status]');
  let i = 0;
  const next = () => {
    if (i < lines.length) { lines[i++].classList.add('on'); setTimeout(next, reduced ? 0 : 520); }
    else if (status) { status.textContent = 'done ✓'; status.classList.add('done'); }
  };
  setTimeout(next, reduced ? 0 : 700);
}

/* pixel field: a grid of squares that light up near the cursor and drift */
function initPixels() {
  const c = document.querySelector<HTMLCanvasElement>('[data-pixels]');
  if (!c) return;
  const ctx = c.getContext('2d')!;
  let w = 0, h = 0, mx = -999, my = -999, raf = 0, until = 0;
  const S = 22;
  const resize = () => {
    const r = c.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    w = r.width; h = r.height;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const color = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
  let acc = color();
  document.addEventListener('site:theme', () => { acc = color(); });
  const frame = (t: number) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = acc;
    for (let x = 0; x < w; x += S) for (let y = 0; y < h; y += S) {
      const d = Math.hypot(x - mx, y - my);
      const wave = 0.5 + 0.5 * Math.sin(x * 0.012 + y * 0.018 + t * 0.0008);
      let a = wave * 0.06 * Math.max(0, 1 - y / h) + Math.max(0, 1 - d / 180) * 0.55;
      if (a < 0.015) continue;
      ctx.globalAlpha = Math.min(0.6, a);
      const s = 3 + Math.max(0, 1 - d / 180) * 7;
      ctx.fillRect(x + (S - s) / 2, y + (S - s) / 2, s, s);
    }
    ctx.globalAlpha = 1;
    if (t < until && !reduced) raf = requestAnimationFrame(frame);
    else raf = 0;
  };
  const kick = () => { until = performance.now() + 1200; if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener('resize', () => { resize(); kick(); });
  c.parentElement!.addEventListener('pointermove', (e) => {
    const r = c.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    kick();
  });
  c.parentElement!.addEventListener('pointerleave', () => { mx = my = -999; kick(); });
  document.addEventListener('site:theme', kick);
  resize();
  raf = requestAnimationFrame(frame);
}

/* role-fit tabs */
function initFit() {
  const root = document.querySelector<HTMLElement>('[data-fit]');
  if (!root) return;
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-fit-tab]')];
  const show = (id: string, scroll = false) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.fitTab === id)));
    root.querySelectorAll<HTMLElement>('[data-fit-panel]').forEach((p) => (p.hidden = p.dataset.fitPanel !== id));
    if (scroll && innerWidth <= 900) root.querySelector(`[data-fit-panel="${id}"]`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t.dataset.fitTab!, true));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (d) { e.preventDefault(); const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); show(n.dataset.fitTab!); }
    });
  });
  document.addEventListener('site:goto', (e) => {
    const id = (e as CustomEvent<string>).detail;
    if (id.startsWith('fit-')) show(id.slice(4));
  });
}

/* cases: filters + open on navigation */
function initCases() {
  const btns = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const cards = [...document.querySelectorAll<HTMLDetailsElement>('details[data-tags]')];
  btns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.filter!;
    btns.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    cards.forEach((c) => {
      c.hidden = f !== 'all' && !c.dataset.tags!.split(' ').includes(f);
      if (!c.hidden) c.classList.add('in');
    });
  }));
  const openCase = (id: string) => {
    const el = document.getElementById(id);
    if (el instanceof HTMLDetailsElement) {
      if (el.hidden) btns[0]?.click();
      el.open = true;
      el.classList.add('in');
    }
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-open-case]').forEach((a) => a.addEventListener('click', () => openCase(`case-${a.dataset.openCase}`)));
  document.addEventListener('site:goto', (e) => openCase((e as CustomEvent<string>).detail));
  if (location.hash.startsWith('#case-')) openCase(location.hash.slice(1));
}

/* process loop: highlight the step in view */
function initProcess() {
  const nodes = document.querySelectorAll<SVGGElement>('[data-node]');
  const steps = document.querySelectorAll<HTMLElement>('[data-step]');
  const set = (i: number) => {
    nodes.forEach((n) => n.classList.toggle('on', n.dataset.node === String(i)));
    steps.forEach((s) => s.classList.toggle('on', s.dataset.step === String(i)));
  };
  steps.forEach((s) => s.addEventListener('pointerenter', () => set(Number(s.dataset.step))));
  const io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) set(Number((e.target as HTMLElement).dataset.step));
  }, { rootMargin: '-40% 0px -55% 0px' });
  steps.forEach((s) => io.observe(s));
}

/* site:goto → scroll after state updates */
document.addEventListener('site:goto', (e) => {
  const id = (e as CustomEvent<string>).detail;
  requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
    if (el instanceof HTMLButtonElement) el.focus({ preventScroll: true });
  });
});

initTheme();
initScroll();
initMenu();
initSplit();
initReveal();
initCounters();
initTrace();
initPixels();
initFit();
initCases();
initProcess();
initSearch(docs);
initPilots(lang);
