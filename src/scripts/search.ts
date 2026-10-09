// In-browser retrieval: tokenizer with light RU/EN stemming, a synonym map,
// and BM25 ranking. No server, no LLM. Exported pieces are unit-tested.

export type Doc = { id: string; section: string; title: string; text: string; href: string };

const SYNONYMS: Record<string, string[]> = {
  rag: ['retriev', 'эмбеддинг', 'embedd', 'поиск', 'search', 'баз', 'знани', 'knowledg'],
  агент: ['agent', 'harness', 'харнесс', 'оркестратор', 'orchestr'],
  agent: ['агент', 'harness', 'orchestr'],
  бот: ['bot', 'telegram', 'чат'],
  bot: ['бот', 'telegram', 'chat'],
  метрик: ['metric', 'измер', 'measur', 'a/b', 'мониторинг', 'monitor'],
  metric: ['метрик', 'measur', 'monitor'],
  sql: ['postgresql', 'postgis', 'timescaledb', 'sqlite', 'запрос'],
  python: ['django', 'fastapi', 'питон'],
  питон: ['python'],
  документ: ['ocr', 'чек', 'накладн', 'receipt', 'waybill'],
  document: ['ocr', 'receipt', 'waybill'],
  mcp: ['model', 'context', 'protocol', 'инструмент', 'tool'],
  llm: ['модел', 'model', 'gpt', 'qwen', 'ollama', 'промпт', 'prompt'],
  интеграц: ['api', 'integr', 'партнер', 'партнёр'],
  integr: ['api', 'интеграц', 'partner'],
};

const STOP = new Set(['и', 'в', 'на', 'с', 'по', 'а', 'не', 'что', 'как', 'the', 'a', 'an', 'of', 'to', 'in', 'and', 'or', 'for', 'is', 'it', 'i', 'я']);

export function stem(w: string): string {
  // Truncation stemming: good enough for Russian inflection and English suffixes.
  if (/^[a-z0-9/+.#-]+$/.test(w)) {
    return w.replace(/(ing|ed|es|s|ion|ions)$/, '').slice(0, 7) || w;
  }
  return w.length > 5 ? w.slice(0, Math.max(5, w.length - 3)).slice(0, 7) : w;
}

export function tokenize(s: string): string[] {
  return (s.toLowerCase().replace(/ё/g, 'е').match(/[\p{L}\p{N}/+#.]+/gu) ?? [])
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

export function expand(tokens: string[]): Map<string, number> {
  const q = new Map<string, number>();
  for (const t of tokens) {
    q.set(t, Math.max(q.get(t) ?? 0, 1));
    for (const [k, syns] of Object.entries(SYNONYMS)) {
      if (t.startsWith(k) || k.startsWith(t)) for (const s of syns) {
        const st = stem(s);
        q.set(st, Math.max(q.get(st) ?? 0, 0.5));
      }
    }
  }
  return q;
}

export class Index {
  private docs: Doc[];
  private tf: Map<string, number>[] = [];
  private len: number[] = [];
  private df = new Map<string, number>();
  private avg = 0;
  constructor(docs: Doc[]) {
    this.docs = docs;
    for (const d of docs) {
      const toks = [...tokenize(d.title), ...tokenize(d.title), ...tokenize(d.text)];
      const m = new Map<string, number>();
      for (const t of toks) m.set(t, (m.get(t) ?? 0) + 1);
      for (const t of m.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
      this.tf.push(m);
      this.len.push(toks.length);
    }
    this.avg = this.len.reduce((a, b) => a + b, 0) / Math.max(1, docs.length);
  }
  search(query: string, k = 8): { doc: Doc; score: number }[] {
    const q = expand(tokenize(query));
    if (!q.size) return [];
    const N = this.docs.length, k1 = 1.4, b = 0.75;
    const out: { doc: Doc; score: number }[] = [];
    this.docs.forEach((doc, i) => {
      let s = 0;
      for (const [term, w] of q) {
        // prefix match lets "агент" hit "агентн", "agent" hit "agents"
        let f = 0, df = 0;
        for (const [t, c] of this.tf[i]) if (t.startsWith(term) || (term.length > 4 && term.startsWith(t))) { f += c; df = Math.max(df, this.df.get(t) ?? 0); }
        if (!f) continue;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        s += w * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * this.len[i]) / this.avg)));
      }
      if (s > 0) out.push({ doc, score: s });
    });
    return out.sort((a, b) => b.score - a.score).slice(0, k);
  }
}

export function snippet(text: string, query: string, max = 140): string {
  const terms = tokenize(query);
  const words = text.split(/\s+/);
  let at = words.findIndex((w) => terms.some((t) => stem(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')).startsWith(t)));
  if (at < 0) at = 0;
  const start = Math.max(0, at - 6);
  let s = words.slice(start).join(' ');
  if (s.length > max) s = s.slice(0, max).replace(/\s\S*$/, '') + '…';
  return (start > 0 ? '…' : '') + s;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function highlight(s: string, query: string): string {
  const terms = tokenize(query).filter((t) => t.length > 1);
  return s.split(/(\s+)/).map((w) => {
    const n = stem(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''));
    return n && terms.some((t) => n.startsWith(t)) ? `<mark>${esc(w)}</mark>` : esc(w);
  }).join('');
}

export function initSearch(docs: Doc[]) {
  const dlg = document.querySelector<HTMLDialogElement>('[data-search]');
  const input = document.querySelector<HTMLInputElement>('[data-search-input]');
  const list = document.querySelector<HTMLUListElement>('[data-search-results]');
  const emptyTpl = document.querySelector<HTMLTemplateElement>('[data-search-empty]');
  if (!dlg || !input || !list) return;
  const index = new Index(docs);
  let sel = 0;

  const render = () => {
    const q = input.value.trim();
    const res = q ? index.search(q) : docs.filter((d) => d.id.startsWith('case-')).map((doc) => ({ doc, score: 0 }));
    sel = 0;
    if (!res.length) {
      list.innerHTML = `<li class="r-empty">${esc(emptyTpl?.innerHTML ?? '')}</li>`;
      return;
    }
    list.innerHTML = res.map((r, i) => `<li><a href="${r.doc.href}" role="option" aria-selected="${i === 0}" data-i="${i}">
      <span class="r-sec">${esc(r.doc.section)}</span>
      <span class="r-title">${highlight(r.doc.title, q)}</span>
      <span class="r-snip">${highlight(snippet(r.doc.text, q), q)}</span></a></li>`).join('');
  };
  const items = () => [...list.querySelectorAll<HTMLAnchorElement>('a')];
  const move = (d: number) => {
    const it = items();
    if (!it.length) return;
    it[sel]?.setAttribute('aria-selected', 'false');
    sel = (sel + d + it.length) % it.length;
    it[sel].setAttribute('aria-selected', 'true');
    it[sel].scrollIntoView({ block: 'nearest' });
  };
  const open = () => { if (!dlg.open) { dlg.showModal(); input.select(); render(); } };
  const go = (a: HTMLAnchorElement) => {
    dlg.close();
    const id = a.getAttribute('href')!.slice(1);
    document.dispatchEvent(new CustomEvent('site:goto', { detail: id }));
  };

  document.querySelectorAll('[data-search-open]').forEach((b) => b.addEventListener('click', open));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open(); }
    else if (e.key === '/' && !dlg.open && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); open(); }
  });
  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Escape') { e.preventDefault(); dlg.close(); }
    else if (e.key === 'Enter') { const a = items()[sel]; if (a) { e.preventDefault(); go(a); } }
  });
  list.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a');
    if (a) { e.preventDefault(); go(a); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}
