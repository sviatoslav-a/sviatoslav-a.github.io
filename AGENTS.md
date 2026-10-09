# AGENTS.md

Portfolio landing for the Goulash.tech "AI engineer / AI Automation Specialist" test task (part 1).

## Commands

```sh
npm run dev            # astro dev (use `astro dev --background` from agents)
npm run build          # static build into dist/
npm run test:unit      # node --test: BM25 search, k-means, kitchen risk logic
npm run test:e2e       # Playwright: desktop + Pixel 7, axe a11y in both themes
npm test               # all of the above
npm run og             # re-render public/og.png from the built hero
```

`astro preview` in Astro 7 uses a lock file; pass `--ignore-lock` when a second instance is needed.

## Where things live

- All copy, RU and EN: `src/data/content.ts`. Change facts there, never in components.
- Demo scenarios (synthetic): `src/data/pilotData.ts`.
- Client logic: `src/scripts/` (`main.ts` wiring, `search.ts` retrieval, `pilots.ts` demos).
- `/llms.txt` is generated from `content.ts` by `src/pages/llms.txt.ts`.

## Rules

- Writing: no em/en dashes (an E2E test enforces it), straight quotes, short and concrete.
  "Askloyal", "AUM". Do not invent facts; every claim must trace to the CV, repos or call notes.
- Demos must stay labelled as synthetic data.
- Progressive enhancement: cases use details/summary; reveal animations apply only once JS runs.
