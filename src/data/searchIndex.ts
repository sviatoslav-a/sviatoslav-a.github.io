import { cases, fit, path, pilots, process, stack, ui, type Lang } from './content';

export type Doc = { id: string; section: string; title: string; text: string; href: string };

// Flattens site content into small documents for the in-browser BM25 search.
export function buildIndex(lang: Lang): Doc[] {
  const docs: Doc[] = [];
  for (const it of fit.items) {
    docs.push({
      id: `fit-${it.id}`,
      section: ui.nav.fit[lang],
      title: it.label[lang],
      text: it.evidence.map((e) => e[lang]).join(' '),
      href: `#fit-${it.id}`,
    });
  }
  for (const c of cases) {
    docs.push({
      id: `case-${c.id}`,
      section: ui.nav.cases[lang],
      title: c.title[lang],
      text: [c.kicker[lang], c.problem[lang], ...c.built.map((b) => b[lang]), c.result[lang], c.stack.join(' ')].join(' '),
      href: `#case-${c.id}`,
    });
  }
  for (const key of ['search', 'segments', 'kitchen'] as const) {
    docs.push({
      id: `pilot-${key}`,
      section: ui.nav.pilots[lang],
      title: pilots.tabs[key][lang],
      text: `${pilots[key].intro[lang]} ${pilots[key].measure[lang]}`,
      href: `#pilot-${key}`,
    });
  }
  process.steps.forEach((s, i) => {
    docs.push({ id: `process-${i}`, section: ui.nav.process[lang], title: s.title[lang], text: s.text[lang], href: '#process' });
  });
  for (const p of path.items) {
    docs.push({ id: `path-${p.company}`, section: ui.nav.path[lang], title: `${p.company} · ${p.years}`, text: `${p.role[lang]} ${p.text[lang]}`, href: '#path' });
  }
  for (const g of stack.groups) {
    docs.push({ id: `stack-${g.name.en}`, section: stack.title[lang], title: g.name[lang], text: g.items.join(' '), href: '#path' });
  }
  return docs;
}
