// Agent-readable version of the site, generated from the same content as the pages.
import type { APIRoute } from 'astro';
import { cases, fit, hero, levels, path, person, pilots, process, stack } from '../data/content';

export const GET: APIRoute = () => {
  const L = 'en' as const;
  const out: string[] = [
    `# ${person.name.en} - AI engineer / AI Automation`,
    '',
    `> ${hero.lead.en}`,
    '',
    `Contacts: Telegram @${person.telegram} · ${person.email} · github.com/${person.github} · ${person.city.en}`,
    'Russian version of the site: /  ·  English: /en/',
    '',
    '## Vacancy requirements → evidence (hh.ru/vacancy/137989678)',
    ...fit.items.map((i) => `- **${i.label[L]}** [${levels[i.level][L]}]: ${i.evidence.map((e) => e[L]).join(' ')}`),
    '',
    '## Projects',
  ];
  for (const c of cases) {
    out.push(
      '',
      `### ${c.title[L]} (${c.kicker[L]}, ${c.year})`,
      `- Problem: ${c.problem[L]}`,
      ...c.built.map((b) => `- Built: ${b[L]}`),
      `- Result: ${c.result[L]}`,
      `- Stack: ${c.stack.join(', ')}`,
      ...(c.link ? [`- Link: ${c.link.href}`] : []),
    );
  }
  out.push('', '## Pilots proposed for the Goulash ERP (synthetic demos on the site)');
  for (const k of ['search', 'segments', 'kitchen'] as const) out.push(`- ${pilots.tabs[k][L]}: ${pilots[k].intro[L]} ${pilots[k].measure[L]}`);
  out.push('', '## How I work', ...process.steps.map((s, i) => `${i + 1}. ${s.title[L]}: ${s.text[L]}`));
  out.push('', '## Experience', ...path.items.map((p) => `- ${p.years} · ${p.company} · ${p.role[L]}: ${p.text[L]}`), `- ${path.edu[L]}`, `- ${path.oss[L]}`);
  out.push('', '## Stack', ...stack.groups.map((g) => `- ${g.name[L]}: ${g.items.join(', ')}`), '');
  return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
