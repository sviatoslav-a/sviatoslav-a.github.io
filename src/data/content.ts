// All site copy lives here, in both languages. Components pick `ru` or `en`.
// Writing rules: no em/en dashes, straight quotes, short and concrete.

export type Lang = 'ru' | 'en';
export type L = { ru: string; en: string };
export const pick = (l: L, lang: Lang) => l[lang];

export const person = {
  name: { ru: 'Святослав Алексеев', en: 'Sviatoslav Alekseev' },
  role: { ru: 'AI engineer / AI Automation', en: 'AI engineer / AI Automation' },
  city: { ru: 'Екатеринбург', en: 'Yekaterinburg' },
  telegram: 'zotho',
  github: 'zotho',
  linkedin: 'zotho',
  email: 'sviatoslav.alekseev@proton.me',
};

export const ui = {
  nav: {
    fit: { ru: 'Под вакансию', en: 'Role fit' },
    cases: { ru: 'Проекты', en: 'Projects' },
    pilots: { ru: 'Пилоты для ERP', en: 'ERP pilots' },
    process: { ru: 'Как работаю', en: 'How I work' },
    path: { ru: 'Опыт', en: 'Experience' },
    contact: { ru: 'Связаться', en: 'Contact' },
  },
  search: {
    open: { ru: 'Поиск', en: 'Search' },
    placeholder: { ru: 'Спросите: "RAG", "Telegram-бот", "метрики", "Rust"...', en: 'Ask: "RAG", "Telegram bot", "metrics", "Rust"...' },
    hint: {
      ru: 'Поиск по сайту работает прямо в браузере: индекс BM25 и словарь синонимов, без сервера и без LLM. Тот же retrieval-слой, что в RAG.',
      en: 'Site search runs in your browser: a BM25 index plus a synonym map, no server and no LLM. The same retrieval layer a RAG system uses.',
    },
    empty: { ru: 'Ничего не нашлось. Попробуйте "агенты" или "SQL".', en: 'Nothing found. Try "agents" or "SQL".' },
  },
  theme: { ru: 'Тема', en: 'Theme' },
  langSwitch: { ru: 'EN', en: 'RU' },
  skip: { ru: 'К содержанию', en: 'Skip to content' },
  demoBadge: { ru: 'демо · синтетические данные', en: 'demo · synthetic data' },
};

export const hero = {
  eyebrow: { ru: 'AI engineer · Python · Rust · TypeScript · Екатеринбург', en: 'AI engineer · Python · Rust · TypeScript · Yekaterinburg' },
  title: {
    ru: 'Превращаю AI из чата в работающие системы',
    en: 'I turn AI from a chat window into working systems',
  },
  lead: {
    ru: '8+ лет в разработке. Последние годы строю LLM-агентов, интеграции и автоматизацию в продуктах с реальными пользователями и деньгами. Сам нахожу процесс, проектирую решение, довожу до продакшна и меряю эффект.',
    en: '8+ years in engineering. Lately I build LLM agents, integrations and automation in products with real users and real money. I find the process, design the solution, ship it and measure the effect.',
  },
  ctaPrimary: { ru: 'Написать в Telegram', en: 'Message on Telegram' },
  ctaSecondary: { ru: 'Как я закрываю вакансию', en: 'How I match the role' },
  stats: [
    { value: 8000, suffix: '', label: { ru: 'пользователей у продукта с моим агентом и оркестратором', en: 'users of the product with my agent and orchestrator' } },
    { value: 600, prefix: '$', suffix: 'k', label: { ru: 'AUM, которыми управляет оркестратор', en: 'AUM routed by the orchestrator' } },
    { value: 154, suffix: '/154', label: { ru: 'сценария совпали после AI-переписывания сервиса', en: 'scenarios matched after an AI-led service rewrite' } },
    { value: 3604, suffix: '', label: { ru: 'вакансии собрал мой собственный пайплайн', en: 'vacancies collected by my own pipeline' } },
  ],
  trace: {
    ru: [
      ['goal', 'усилить fast-track команду Goulash.tech'],
      ['read', 'вакансия hh.ru/vacancy/137989678'],
      ['tool', 'match(требования, опыт) -> 14 пунктов'],
      ['tool', 'plan(пилоты: поиск, сегменты, кухня)'],
      ['check', 'факты сверены с репозиториями и CV'],
      ['done', 'готов к интервью с собственником'],
    ],
    en: [
      ['goal', 'strengthen the Goulash.tech fast-track team'],
      ['read', 'vacancy hh.ru/vacancy/137989678'],
      ['tool', 'match(requirements, experience) -> 14 items'],
      ['tool', 'plan(pilots: search, segments, kitchen)'],
      ['check', 'facts verified against repos and CV'],
      ['done', 'ready for the founder interview'],
    ],
  },
};

export type Level = 'prod' | 'project' | 'growing';
export const levels: Record<Level, L> = {
  prod: { ru: 'в продакшне', en: 'in production' },
  project: { ru: 'в проектах', en: 'in projects' },
  growing: { ru: 'закрываю', en: 'closing the gap' },
};

export const fit = {
  title: { ru: 'Вакансия → доказательства', en: 'Vacancy → evidence' },
  lead: {
    ru: 'Каждое требование из вашей вакансии и конкретное место, где я это уже делал. Нажмите на пункт. Где опыта меньше, так и написано.',
    en: 'Every requirement from your vacancy and the concrete place I already did it. Click an item. Where my experience is thinner, it says so.',
  },
  coverage: { ru: 'покрытие требований', en: 'requirements covered' },
  seeCase: { ru: 'Открыть проект', en: 'Open project' },
  items: [
    {
      id: 'find', group: 'duty', level: 'prod' as Level,
      label: { ru: 'Находить процессы для AI-автоматизации', en: 'Find processes worth automating with AI' },
      evidence: [
        { ru: 'В Askloyal увидел, что клиенты вручную двигают свободные USDC между протоколами, и превратил это в автоматический оркестратор.', en: 'At Askloyal I saw customers moving idle USDC between protocols by hand and turned it into an automatic orchestrator.' },
        { ru: 'Свой поиск работы превратил в пайплайн: расширение Chrome, Google Sheets API, скоринг и виджет на рабочем столе.', en: 'Turned my own job search into a pipeline: a Chrome extension, Google Sheets API, scoring and a desktop widget.' },
      ],
      cases: ['askloyal', 'pipeline'],
    },
    {
      id: 'agents', group: 'duty', level: 'prod' as Level,
      label: { ru: 'Ассистенты, агенты, чат-боты', en: 'Assistants, agents, chatbots' },
      evidence: [
        { ru: 'Финансовый LLM-агент с гардрейлами: предлагает действия, но не может сам выполнить небезопасные.', en: 'A finance LLM agent with guardrails: it proposes actions but cannot execute unsafe ones itself.' },
        { ru: 'Бот ежедневных саммари для финансовых Telegram-чатов с голосованием пользователей.', en: 'A daily summary bot for finance Telegram chats with user voting.' },
        { ru: 'Пишу собственный агентный харнесс на Rust (pi-rs): провайдеры, инструменты, компакция контекста.', en: 'Writing my own agent harness in Rust (pi-rs): providers, tools, context compaction.' },
      ],
      cases: ['askloyal', 'digest', 'harness'],
    },
    {
      id: 'integrations', group: 'duty', level: 'prod' as Level,
      label: { ru: 'Интеграции с внутренними системами и API', en: 'Integrations with internal systems and APIs' },
      evidence: [
        { ru: 'B2B-интеграции Askloyal с партнёрами, RPC и DeFi-протоколы, Telegram Bot API.', en: 'Askloyal B2B partner integrations, RPC and DeFi protocols, Telegram Bot API.' },
        { ru: 'Google Sheets API с атомарной записью и проверкой чтением, Chrome native messaging.', en: 'Google Sheets API with atomic writes and read-back checks, Chrome native messaging.' },
      ],
      cases: ['askloyal', 'pipeline', 'relay'],
    },
    {
      id: 'tools', group: 'duty', level: 'prod' as Level,
      label: { ru: 'Внедрять и адаптировать готовые AI-инструменты', en: 'Adopt and adapt off-the-shelf AI tools' },
      evidence: [
        { ru: 'Каждый день работаю с Codex, Claude Code и Pi; настраиваю их под проекты через AGENTS.md, скиллы и MCP-серверы.', en: 'Daily work with Codex, Claude Code and Pi; I tune them per project with AGENTS.md, skills and MCP servers.' },
        { ru: 'Сделал виджет для macOS, который следит за лимитами Codex и Claude по нескольким аккаунтам.', en: 'Built a macOS widget that tracks Codex and Claude limits across several accounts.' },
      ],
      cases: ['harness'],
    },
    {
      id: 'pilots', group: 'duty', level: 'prod' as Level,
      label: { ru: 'Запускать и проверять пилоты', en: 'Run and validate pilots' },
      evidence: [
        { ru: 'Переписывание планировщика с Rust на Go силами агентов проверил харнессом: фикстуры, одноразовый PostgreSQL, мутационные проверки. 154/154 сценария совпали.', en: 'An agent-led Rust to Go planner rewrite was checked with a harness: fixtures, disposable PostgreSQL, mutation controls. 154/154 scenarios matched.' },
      ],
      cases: ['parity'],
    },
    {
      id: 'measure', group: 'duty', level: 'prod' as Level,
      label: { ru: 'Оценивать результат внедрения', en: 'Measure the impact' },
      evidence: [
        { ru: 'После релиза смотрю метрики и регрессии; алерты ClickStack приходят в Telegram с дедупликацией.', en: 'After a release I watch metrics and regressions; ClickStack alerts reach Telegram with deduplication.' },
        { ru: 'В боте саммари качество меряют сами пользователи голосами, и промпт меняется по этим данным.', en: 'In the summary bot users vote on quality, and the prompt changes based on that data.' },
      ],
      cases: ['relay', 'digest'],
    },
    {
      id: 'teach', group: 'duty', level: 'project' as Level,
      label: { ru: 'Обучать команды работе с AI', en: 'Teach teams to use AI' },
      evidence: [
        { ru: 'В QF Network был AI Practices Evangelist: вёл контекст проекта для LLM-агентов всей команды.', en: 'At QF Network I was the AI Practices Evangelist: I maintained the project context for the whole team\'s LLM agents.' },
        { ru: 'Пишу AGENTS.md и правила для агентов в репозиториях, чтобы команда получала одинаково хороший результат.', en: 'I write AGENTS.md files and agent rules in repos so the whole team gets consistent results.' },
      ],
      cases: ['harness'],
    },
    {
      id: 'arch', group: 'must', level: 'prod' as Level,
      label: { ru: 'Сам проектирую архитектуру и довожу до запуска', en: 'Own the architecture through launch' },
      evidence: [
        { ru: 'Оркестратор депозитов: воркеры, ретраи, идемпотентность, сверка, мониторинг. Запуск в июле, 2000 пользователей за первую неделю.', en: 'Deposit orchestrator: workers, retries, idempotency, reconciliation, monitoring. Launched in July, 2000 users in the first week.' },
      ],
      cases: ['askloyal'],
    },
    {
      id: 'python', group: 'must', level: 'prod' as Level,
      label: { ru: 'Python', en: 'Python' },
      evidence: [
        { ru: '7+ лет: Django/DRF в RingCentral, сканер уязвимостей в Scalescan, бэкенд аналитики дорог, FastAPI-сервисы, пайплайн вакансий.', en: '7+ years: Django/DRF at RingCentral, a vulnerability scanner at Scalescan, a road analytics backend, FastAPI services, the vacancy pipeline.' },
      ],
      cases: ['pipeline', 'atlas'],
    },
    {
      id: 'sql', group: 'must', level: 'prod' as Level,
      label: { ru: 'SQL', en: 'SQL' },
      evidence: [
        { ru: 'PostgreSQL, PostGIS, TimescaleDB. Мой метод заливки полигонов на PostGIS взяли в АИС. Очередь задач на Postgres, одноразовые БД в тестах.', en: 'PostgreSQL, PostGIS, TimescaleDB. My PostGIS polygon-filling method was adopted by an AIS system. A job queue on Postgres, disposable databases in tests.' },
      ],
      cases: ['parity', 'askloyal'],
    },
    {
      id: 'llm', group: 'must', level: 'prod' as Level,
      label: { ru: 'LLM в продукте', en: 'LLMs in a product' },
      evidence: [
        { ru: 'LLM-агент и LLM-саммари в продукте с 8000 пользователями. Локальные модели через Ollama и llama.cpp для приватных данных.', en: 'An LLM agent and LLM summaries in a product with 8000 users. Local models via Ollama and llama.cpp for private data.' },
      ],
      cases: ['askloyal', 'digest', 'atlas'],
    },
    {
      id: 'rag', group: 'must', level: 'project' as Level,
      label: { ru: 'RAG и поиск по базе знаний', en: 'RAG and knowledge-base search' },
      evidence: [
        { ru: 'Эмбеддинги Qwen3 и кластеризация 3600 вакансий; ранжирование по сходству с прошлыми откликами.', en: 'Qwen3 embeddings and clustering of 3600 vacancies; ranking by similarity to past applications.' },
        { ru: 'Поиск на этом сайте (⌘K) работает как retrieval-слой RAG прямо в браузере.', en: 'The search on this site (⌘K) works as a RAG retrieval layer right in the browser.' },
      ],
      cases: ['atlas'],
    },
    {
      id: 'mcp', group: 'plus', level: 'project' as Level,
      label: { ru: 'MCP', en: 'MCP' },
      evidence: [
        { ru: 'Подключаю MCP-серверы к агентам в работе: трекер задач, транскрипты созвонов, общий поиск по истории команды.', en: 'I connect MCP servers to agents at work: the task tracker, call transcripts, shared search over team history.' },
        { ru: 'Во второй части тестового отдаю данные о поставщиках через MCP-сервер, чтобы ими мог пользоваться любой агент.', en: 'In part two of the test task I expose the supplier data through an MCP server so any agent can use it.' },
      ],
      cases: ['harness'],
    },
    {
      id: 'langgraph', group: 'plus', level: 'growing' as Level,
      label: { ru: 'LangChain / LangGraph', en: 'LangChain / LangGraph' },
      evidence: [
        { ru: 'Агентные циклы пишу сам: состояние, инструменты, чекпоинты, ретраи. Это та же модель, что граф состояний в LangGraph, поэтому перейти на ваш стек быстро.', en: 'I write agent loops myself: state, tools, checkpoints, retries. That is the same model as a LangGraph state graph, so moving to your stack is quick.' },
      ],
      cases: ['harness', 'askloyal'],
    },
    {
      id: 'vectordb', group: 'plus', level: 'growing' as Level,
      label: { ru: 'Векторные БД', en: 'Vector databases' },
      evidence: [
        { ru: 'Эмбеддинги, поиск соседей и кластеризацию делал в своих проектах. Отдельную векторную БД (pgvector) ставлю в демо поставщиков из второй части тестового.', en: 'I have done embeddings, nearest-neighbour search and clustering in my own projects. A dedicated vector DB (pgvector) goes into the supplier demo in part two.' },
      ],
      cases: ['atlas'],
    },
    {
      id: 'docs', group: 'plus', level: 'project' as Level,
      label: { ru: 'Обработка документов: чеки, накладные', en: 'Document processing: receipts, waybills' },
      evidence: [
        { ru: 'Офлайн-приложение Slip: фото чека → OCR на русском и английском → ручная проверка → отчёты. E2E-тесты на эмуляторе.', en: 'The offline Slip app: receipt photo → Russian and English OCR → human review → reports. E2E tests on an emulator.' },
      ],
      cases: ['slip'],
    },
  ],
};

export type CaseItem = {
  id: string;
  tags: string[];
  year: string;
  title: L;
  kicker: L;
  problem: L;
  built: L[];
  stack: string[];
  result: L;
  metrics: { value: string; label: L }[];
  link?: { href: string; label: L };
  image?: string;
  diagram?: string[];
  note?: L;
};

export const cases: CaseItem[] = [
  {
    id: 'askloyal',
    tags: ['agents', 'integrations', 'prod'],
    year: '2026',
    title: { ru: 'Финансовый AI-агент и оркестратор депозитов', en: 'Finance AI agent and deposit orchestrator' },
    kicker: { ru: 'Askloyal · B2C → B2B', en: 'Askloyal · B2C → B2B' },
    problem: {
      ru: 'Пользователи держали доллары на счетах и сами решали, куда их переложить ради процента. Это медленно, рискованно и не масштабируется на B2B-партнёров.',
      en: 'Users kept dollars idle and decided by hand where to move them for yield. Slow, risky, and it does not scale to B2B partners.',
    },
    built: [
      { ru: 'Оркестратор, который распределяет депозиты между пулами и ищет лучшую доходность: до 17% годовых против 7% в обычном банке, без валютного риска.', en: 'An orchestrator that spreads deposits across pools for the best yield: up to 17% APY versus 7% in a regular bank, with no FX risk.' },
      { ru: 'LLM-агент, который предлагает финансовые действия. Гардрейлы: сам он выполняет только то, что мы признали безопасным, остальное идёт на подтверждение.', en: 'An LLM agent that proposes financial actions. Guardrails: it executes only what we marked safe, everything else needs confirmation.' },
      { ru: 'Надёжность: воркеры, ретраи, идемпотентность, ежедневная сверка, алерты.', en: 'Reliability: workers, retries, idempotency, daily reconciliation, alerts.' },
      { ru: 'Интеграции с B2B-партнёрами, которые приводят своих клиентов.', en: 'Integrations with B2B partners who bring their own customers.' },
    ],
    stack: ['Rust', 'Go', 'TypeScript', 'PostgreSQL', 'ClickStack', 'LLM agent', 'Solana'],
    result: {
      ru: 'Запуск в июле, 2000 пользователей за первую неделю, сейчас 8000 пользователей и $600k AUM. Код открыт на GitHub.',
      en: 'Launched in July, 2000 users in the first week, now 8000 users and $600k AUM. The code is open on GitHub.',
    },
    metrics: [
      { value: '8000', label: { ru: 'пользователей', en: 'users' } },
      { value: '$600k', label: { ru: 'AUM', en: 'AUM' } },
      { value: '17%', label: { ru: 'годовых макс.', en: 'APY max' } },
    ],
    link: { href: 'https://github.com/loyal-labs/loyal-app', label: { ru: 'loyal-labs/loyal-app', en: 'loyal-labs/loyal-app' } },
    diagram: ['deposit', 'planner', 'guardrails', 'execute', 'reconcile'],
  },
  {
    id: 'digest',
    tags: ['agents', 'llm', 'prod'],
    year: '2026',
    title: { ru: 'Саммари Telegram-чатов, которые учатся на голосах', en: 'Telegram chat summaries that learn from votes' },
    kicker: { ru: 'Askloyal · LLM в продукте', en: 'Askloyal · LLM in the product' },
    problem: {
      ru: 'В финансовых чатах за день сотни сообщений. Люди пропускают важное, а ручной дайджест никто писать не будет.',
      en: 'Finance chats get hundreds of messages a day. People miss what matters, and nobody will write a digest by hand.',
    },
    built: [
      { ru: 'Бот раз в день или в неделю пишет в каждый чат саммари, с картинкой.', en: 'A bot posts a daily or weekly summary into each chat, with an image.' },
      { ru: 'Участники голосуют за и против саммари. Голоса становятся датасетом, по нему меняется промпт: цикл как у авто-ресерча.', en: 'Members vote summaries up or down. Votes become a dataset that drives prompt changes: an auto-research loop.' },
    ],
    stack: ['TypeScript', 'Telegram Bot API', 'LLM', 'image generation'],
    result: {
      ru: 'Это прямой аналог ваших задач: регулярные дайджесты, отчёты и персонализированные рассылки с обратной связью.',
      en: 'This maps directly to your needs: regular digests, reports and personalized messaging with a feedback loop.',
    },
    metrics: [
      { value: '1/day', label: { ru: 'саммари в каждый чат', en: 'summary per chat' } },
      { value: '👍/👎', label: { ru: 'метрика качества', en: 'quality metric' } },
    ],
    diagram: ['messages', 'summarize', 'post', 'votes', 'prompt v+1'],
  },
  {
    id: 'parity',
    tags: ['pilots', 'verification', 'prod'],
    year: '2026',
    title: { ru: 'Переписал сервис руками агентов и доказал, что ничего не сломал', en: 'Rewrote a service with agents and proved nothing broke' },
    kicker: { ru: 'Askloyal · Rust → Go', en: 'Askloyal · Rust → Go' },
    problem: {
      ru: 'Планировщик и ревалидатор нужно было перенести с Rust на Go. Код пишут агенты, значит нужна проверка, которой можно верить, а не "вроде работает".',
      en: 'The planner and revalidator had to move from Rust to Go. Agents write the code, so we needed a check we can trust, not "seems to work".',
    },
    built: [
      { ru: 'Старая Rust-реализация стала эталоном. Обе версии получают одинаковые входы и сравниваются по точному выводу.', en: 'The old Rust code became the reference. Both versions get the same inputs and are compared on exact output.' },
      { ru: 'Фикстуры, одноразовый PostgreSQL, мутационные проверки: харнесс ловит пропущенные, дублированные и выдуманные "успехи" агента.', en: 'Fixtures, disposable PostgreSQL, mutation controls: the harness catches skipped, duplicated and fabricated agent "successes".' },
    ],
    stack: ['Go', 'Rust', 'PostgreSQL', 'differential testing'],
    result: {
      ru: '154 из 154 сценариев совпали. Так же я предлагаю запускать AI-пилоты у вас: сначала критерий успеха, потом код.',
      en: '154 of 154 scenarios matched. This is how I would run AI pilots for you: success criteria first, code second.',
    },
    metrics: [
      { value: '154/154', label: { ru: 'сценариев совпали', en: 'scenarios matched' } },
      { value: '0', label: { ru: 'ручных проверок "на глаз"', en: 'eyeball-only checks' } },
    ],
    diagram: ['fixtures', 'rust ref', 'go new', 'diff', 'mutants'],
  },
  {
    id: 'pipeline',
    tags: ['automation', 'integrations', 'python'],
    year: '2026',
    title: { ru: 'Автоматизировал свой поиск работы', en: 'Automated my own job search' },
    kicker: { ru: 'Личный проект · end-to-end', en: 'Personal project · end to end' },
    problem: {
      ru: 'Вакансии на HH, Habr Career, LinkedIn и Himalayas, отклики, переписки, статусы. Вручную это часы в день, и важное теряется.',
      en: 'Vacancies on HH, Habr Career, LinkedIn and Himalayas, applications, chats, statuses. By hand that is hours a day, and things get lost.',
    },
    built: [
      { ru: 'Расширение Chrome (MV3) собирает вакансии и переписки в моём профиле браузера, с паузами, чтобы не нагружать сайты.', en: 'A Chrome extension (MV3) collects vacancies and chats in my own browser profile, paced so it never hammers the sites.' },
      { ru: 'Native messaging → Python → Google Sheets API: одна атомарная запись, проверка конкурентных правок, проверка чтением.', en: 'Native messaging → Python → Google Sheets API: one atomic write, a concurrent-edit check, read-back verification.' },
      { ru: 'Скоринг по профилю, HTML-дашборд и виджет macOS: одна кнопка запускает весь прогон.', en: 'Profile-based scoring, an HTML dashboard and a macOS widget: one button runs the whole thing.' },
      { ru: 'Гардрейлы: никогда не отправляет отклики сам и останавливается на капче.', en: 'Guardrails: it never submits applications by itself and stops at any captcha.' },
    ],
    stack: ['Python', 'Chrome MV3', 'Google Sheets API', 'Swift / WidgetKit', 'Codex', 'Pi'],
    result: {
      ru: '3604 вакансии собраны и отранжированы автоматически. Именно так нашлась ваша вакансия.',
      en: '3604 vacancies collected and ranked automatically. That is how I found your vacancy.',
    },
    metrics: [
      { value: '3604', label: { ru: 'вакансий', en: 'vacancies' } },
      { value: '4', label: { ru: 'источника', en: 'sources' } },
      { value: '1', label: { ru: 'кнопка', en: 'button' } },
    ],
    diagram: ['extension', 'native host', 'runner', 'Sheets', 'dashboard'],
  },
  {
    id: 'atlas',
    tags: ['rag', 'embeddings', 'python'],
    year: '2026',
    title: { ru: 'Семантическая карта вакансий', en: 'Semantic vacancy atlas' },
    kicker: { ru: 'Эмбеддинги · локальные модели', en: 'Embeddings · local models' },
    problem: {
      ru: 'Ключевые слова плохо отличают "AI engineer" от "AI-маркетолога". Нужен поиск по смыслу.',
      en: 'Keywords can\'t tell "AI engineer" from "AI marketer". You need search by meaning.',
    },
    built: [
      { ru: 'Эмбеддинги Qwen3 через Ollama локально, без отправки данных наружу.', en: 'Qwen3 embeddings via Ollama, run locally with no data leaving the machine.' },
      { ru: 'UMAP и HDBSCAN раскладывают вакансии на 3D-карту кластеров.', en: 'UMAP and HDBSCAN lay out vacancies on a 3D cluster map.' },
      { ru: 'Итоговый скор: 60% правил профиля и 40% сходства с вакансиями, на которые я уже откликался.', en: 'Final score: 60% profile rules plus 40% similarity to vacancies I already applied to.' },
    ],
    stack: ['Python', 'Ollama', 'Qwen3 embeddings', 'UMAP', 'HDBSCAN'],
    result: {
      ru: 'Тот же приём подходит для умного поиска по вашей ERP: смысл, а не точное совпадение слов.',
      en: 'The same approach works for smart search in your ERP: meaning, not exact word match.',
    },
    metrics: [
      { value: '60/40', label: { ru: 'правила / сходство', en: 'rules / similarity' } },
      { value: '0', label: { ru: 'данных в облако', en: 'data sent to the cloud' } },
    ],
    diagram: ['vacancies', 'embed', 'cluster', 'score', 'rank'],
  },
  {
    id: 'slip',
    tags: ['documents', 'ocr'],
    year: '2026',
    title: { ru: 'Slip: распознавание чеков', en: 'Slip: receipt recognition' },
    kicker: { ru: 'Android · офлайн', en: 'Android · offline' },
    problem: {
      ru: 'Чеки и накладные приходят фотографиями. Перепечатывать позиции руками долго, а ошибки портят отчёты.',
      en: 'Receipts and waybills arrive as photos. Retyping line items is slow and errors break the reports.',
    },
    built: [
      { ru: 'Фото → OCR на русском и английском → экран проверки, где человек правит позиции → SQLite.', en: 'Photo → Russian and English OCR → a review screen where a person fixes items → SQLite.' },
      { ru: 'Дедупликация по SHA-256, отчёты по неделям, месяцам и категориям, экспорт.', en: 'SHA-256 dedup, weekly, monthly and category reports, export.' },
      { ru: 'Собрано агентом за день, с E2E-тестами на эмуляторе.', en: 'Built by an agent in a day, with E2E tests on an emulator.' },
    ],
    stack: ['Android', 'ML Kit', 'Tesseract', 'SQLite', 'E2E tests'],
    result: {
      ru: 'Шаблон для обработки ваших счетов и накладных: распознать, дать человеку проверить, сохранить структуру.',
      en: 'A template for your invoices and waybills: recognize, let a person verify, store the structure.',
    },
    metrics: [
      { value: 'RU+EN', label: { ru: 'OCR', en: 'OCR' } },
      { value: '100%', label: { ru: 'офлайн', en: 'offline' } },
    ],
    image: 'slip',
  },
  {
    id: 'harness',
    tags: ['agents', 'tools', 'rust'],
    year: '2026',
    title: { ru: 'Свои инструменты для агентов', en: 'My own tools for agents' },
    kicker: { ru: 'pi-rs · Pi Remote · виджет лимитов', en: 'pi-rs · Pi Remote · usage widget' },
    problem: {
      ru: 'Готовые агенты хороши, но под конкретный проект их нужно настраивать, а иногда переписывать.',
      en: 'Off-the-shelf agents are good, but each project needs them tuned, and sometimes rewritten.',
    },
    built: [
      { ru: 'pi-rs: агентный харнесс на Rust, провайдеры моделей, инструменты, компакция контекста, TUI.', en: 'pi-rs: an agent harness in Rust with model providers, tools, context compaction and a TUI.' },
      { ru: 'Pi Remote: Android-клиент, который управляет агентами на нескольких машинах, со сквозным шифрованием.', en: 'Pi Remote: an Android client that drives agents on several machines, with end-to-end encryption.' },
      { ru: 'Виджет macOS, который показывает остаток лимитов Codex и Claude по аккаунтам.', en: 'A macOS widget that shows remaining Codex and Claude limits per account.' },
    ],
    stack: ['Rust', 'TypeScript', 'Python', 'Android', 'Swift', 'MCP'],
    result: {
      ru: 'Понимаю агентов изнутри: почему они теряют контекст, как ограничивать инструменты и как проверять их работу.',
      en: 'I understand agents from the inside: why they lose context, how to restrict tools and how to check their work.',
    },
    metrics: [
      { value: '54', label: { ru: 'коммита в pi-rs за 2 дня', en: 'pi-rs commits in 2 days' } },
    ],
    image: 'widget',
  },
  {
    id: 'relay',
    tags: ['integrations', 'monitoring'],
    year: '2026',
    title: { ru: 'Алерты в Telegram без шума', en: 'Noise-free alerts in Telegram' },
    kicker: { ru: 'Askloyal · внутренний инструмент', en: 'Askloyal · internal tool' },
    problem: {
      ru: 'Алерты мониторинга либо теряются, либо заваливают чат дублями.',
      en: 'Monitoring alerts either get lost or flood the chat with duplicates.',
    },
    built: [
      { ru: 'Релей ClickStack → Telegram: дедупликация по eventId и часовой кулдаун.', en: 'A ClickStack → Telegram relay: dedup by eventId and a one-hour cooldown.' },
    ],
    stack: ['TypeScript', 'ClickStack', 'Telegram Bot API'],
    result: {
      ru: 'Команда видит каждый инцидент один раз и сразу.',
      en: 'The team sees every incident once, right away.',
    },
    metrics: [{ value: '60 min', label: { ru: 'кулдаун', en: 'cooldown' } }],
  },
];

export const pilots = {
  title: { ru: 'Три пилота для вашей ERP', en: 'Three pilots for your ERP' },
  lead: {
    ru: 'На HR-интервью я узнал, что владельцы ресторанов просят умный поиск, рекомендации вместо отчётов и подсветку рисков на кухне, а первый фокус команды: маркетинг и производительность кухни. Вот как я бы начал. Всё ниже работает в браузере на синтетических данных.',
    en: 'On the HR call I learned that restaurant owners ask for smart search, recommendations instead of reports and kitchen risk alerts, and that the team starts with marketing and kitchen performance. Here is how I would start. Everything below runs in your browser on synthetic data.',
  },
  tabs: {
    search: { ru: 'Умный поиск по ERP', en: 'Smart ERP search' },
    segments: { ru: 'Автосегментация гостей', en: 'Guest auto-segmentation' },
    kitchen: { ru: 'Риски загрузки кухни', en: 'Kitchen load risks' },
  },
  search: {
    intro: {
      ru: 'Владелец пишет вопрос обычными словами. Агент выбирает инструменты, ходит в данные ERP и отвечает со ссылками на источники.',
      en: 'The owner asks in plain words. The agent picks tools, queries ERP data and answers with sources.',
    },
    run: { ru: 'Спросить', en: 'Ask' },
    presets: [
      { ru: 'Почему вырос фудкост на Малышева на прошлой неделе?', en: 'Why did food cost rise at Malysheva last week?' },
      { ru: 'Где найти отчёт по списаниям за сентябрь?', en: 'Where is the September write-off report?' },
      { ru: 'Какие блюда чаще всего возвращают?', en: 'Which dishes get returned most?' },
    ],
    measure: {
      ru: 'Как мерить: доля вопросов, закрытых без звонка в поддержку; время до ответа; 👍/👎 под каждым ответом. Пилот: 5 заведений, 2 недели.',
      en: 'How to measure: share of questions answered without a support call; time to answer; 👍/👎 under every answer. Pilot: 5 venues, 2 weeks.',
    },
  },
  segments: {
    intro: {
      ru: 'K-means прямо здесь кластеризует 600 синтетических гостей по частоте заказов и среднему чеку. LLM потом даёт сегментам имена и пишет персональный оффер.',
      en: 'K-means runs right here on 600 synthetic guests by order frequency and average check. An LLM then names segments and writes a personal offer.',
    },
    k: { ru: 'Сегментов', en: 'Segments' },
    rerun: { ru: 'Пересчитать', en: 'Re-run' },
    xAxis: { ru: 'заказов в месяц', en: 'orders per month' },
    yAxis: { ru: 'средний чек, ₽', en: 'average check, ₽' },
    measure: {
      ru: 'Как мерить: A/B против текущей рассылки, конверсия в заказ и выручка на получателя. Контрольная группа 10%.',
      en: 'How to measure: A/B against the current campaign, conversion to order and revenue per recipient. 10% holdout.',
    },
  },
  kitchen: {
    intro: {
      ru: 'Прогноз заказов по часам против мощности кухни. Двигайте ползунок поваров: часы с перегрузом подсвечиваются, агент пишет алерт управляющему.',
      en: 'Hourly order forecast against kitchen capacity. Move the cooks slider: overloaded hours light up and the agent writes an alert for the manager.',
    },
    cooks: { ru: 'Поваров на смене', en: 'Cooks on shift' },
    load: { ru: 'загрузка', en: 'load' },
    ok: { ru: 'Перегрузов нет. Кухня справится с прогнозом.', en: 'No overload. The kitchen can handle the forecast.' },
    measure: {
      ru: 'Как мерить: опоздания заказов и время отдачи в часы, где сработал алерт, против похожих часов без алерта.',
      en: 'How to measure: late orders and ticket time in hours where the alert fired versus similar hours without it.',
    },
  },
};

export const process = {
  title: { ru: 'Как я работаю', en: 'How I work' },
  lead: {
    ru: 'Тот же цикл, что в моих проектах. Вы его увидите и в тестовом задании.',
    en: 'The same loop as in my projects. You will see it in the test task too.',
  },
  steps: [
    { title: { ru: 'Сходить к людям', en: 'Talk to people' }, text: { ru: 'Сначала понять, как процесс работает сейчас и где болит. На первой работе пользователи моего инструмента сидели за стенкой, и это лучший фидбек.', en: 'First understand how the process works today and where it hurts. At my first job the users of my tool sat next door, the best feedback loop there is.' } },
    { title: { ru: 'Критерий успеха', en: 'Success criteria' }, text: { ru: 'Метрика и проверка до кода: что считаем успехом, на каких данных и как заметим регрессию.', en: 'A metric and a check before code: what counts as success, on which data, and how we will notice a regression.' } },
    { title: { ru: 'Простое решение', en: 'Simple first' }, text: { ru: 'Самая простая версия, которая даёт пользу. Потом улучшаю по фидбеку, а не наоборот.', en: 'The simplest version that delivers value. Then improve based on feedback, not the other way round.' } },
    { title: { ru: 'Агенты + харнесс', en: 'Agents + harness' }, text: { ru: 'Код пишу вместе с агентами в цикле implement/verify. Харнесс отсекает выдуманные "готово".', en: 'I write code with agents in an implement/verify loop. The harness rejects fabricated "done".' } },
    { title: { ru: 'Гардрейлы', en: 'Guardrails' }, text: { ru: 'Агент может только то, что безопасно. Деньги, отправка сообщений и удаление идут через человека.', en: 'The agent can only do what is safe. Money, outgoing messages and deletions go through a person.' } },
    { title: { ru: 'Релиз и метрики', en: 'Ship and measure' }, text: { ru: 'Мониторинг, алерты, A/B. Оставляем то, что сработало, и масштабируем.', en: 'Monitoring, alerts, A/B. Keep what worked and scale it.' } },
  ],
};

export const path = {
  title: { ru: 'Опыт', en: 'Experience' },
  items: [
    { years: '2024 - now', company: 'Askloyal', role: { ru: 'Senior Software Engineer, AI/ML', en: 'Senior Software Engineer, AI/ML' }, text: { ru: 'LLM-агент, оркестратор депозитов, B2B-интеграции, нагрузка, БД, мониторинг, деплой в mainnet. Open source.', en: 'LLM agent, deposit orchestrator, B2B integrations, load, databases, monitoring, mainnet deploys. Open source.' } },
    { years: '2025', company: 'QF Network', role: { ru: 'Consensus architecture, AI Practices Evangelist', en: 'Consensus architecture, AI Practices Evangelist' }, text: { ru: 'Спроектировал SPIN-консенсус: 100 мс блоки на тестнете. Вёл практики работы команды с LLM-агентами.', en: 'Designed SPIN consensus: 100 ms blocks on testnet. Led the team\'s practices for working with LLM agents.' } },
    { years: '2022 - 2024', company: 'Redsteep', role: { ru: 'Senior Blockchain Developer', en: 'Senior Blockchain Developer' }, text: { ru: 'Проекты для разных заказчиков с нуля: DEX, мост, мультисиг, LLM-инструменты, AI-ревью кода. Здесь начались агенты.', en: 'Projects for many clients from scratch: DEX, bridge, multisig, LLM tools, AI code review. This is where agents started for me.' } },
    { years: '2019 - 2022', company: 'Skyroads (Munich)', role: { ru: 'Full Stack Developer', en: 'Full Stack Developer' }, text: { ru: 'Софт для летающего такси: асинхронные сервисы, UDP, голосовая связь на Codec2, PostGIS и TimescaleDB.', en: 'Software for a flying taxi: async services, UDP, Codec2 voice links, PostGIS and TimescaleDB.' } },
    { years: '2016 - 2021', company: 'RingCentral · Scalescan · Road Consulting', role: { ru: 'Python backend / full stack', en: 'Python backend / full stack' }, text: { ru: 'Django и Kubernetes в RingCentral, SaaS-сканер уязвимостей, внутренняя аналитика дорог в Екатеринбурге: панорамы, разметка, PostGIS.', en: 'Django and Kubernetes at RingCentral, a SaaS vulnerability scanner, internal road analytics in Yekaterinburg: panoramas, markings, PostGIS.' } },
  ],
  edu: { ru: 'МГТУ им. Баумана, мехатроника и робототехника, 2016-2020 · Технопарк Mail.ru, C/C++', en: 'Bauman Moscow State Technical University, Mechatronics and Robotics, 2016-2020 · Technopark Mail.ru, C/C++' },
  oss: { ru: 'Open source: ebur128 (производительность), dotenv-linter, der-parser, macroquad', en: 'Open source: ebur128 (performance), dotenv-linter, der-parser, macroquad' },
};

export const stack = {
  title: { ru: 'Стек', en: 'Stack' },
  groups: [
    { name: { ru: 'Языки', en: 'Languages' }, items: ['Python', 'Rust', 'TypeScript', 'Go', 'SQL'] },
    { name: { ru: 'AI', en: 'AI' }, items: ['LLM agents', 'tool calling', 'MCP', 'RAG', 'embeddings', 'Ollama', 'Codex', 'Claude Code', 'evals'] },
    { name: { ru: 'Данные', en: 'Data' }, items: ['PostgreSQL', 'PostGIS', 'TimescaleDB', 'SQLite', 'ClickStack'] },
    { name: { ru: 'Инфра', en: 'Infra' }, items: ['Docker', 'Kubernetes', 'GitHub Actions', 'AWS', 'GCP', 'Vercel'] },
  ],
};

export const contact = {
  title: { ru: 'Давайте обсудим, что автоматизировать первым', en: 'Let\'s talk about what to automate first' },
  lead: {
    ru: 'Готов прийти в офис на Куйбышева и начать с одного пилота, который можно измерить за две недели.',
    en: 'Ready to come to the Kuybysheva office and start with one pilot that can be measured in two weeks.',
  },
  colophon: {
    ru: 'Сайт собран на Astro и TypeScript вместе с агентами, проверен E2E-тестами Playwright. Есть версия для агентов: /llms.txt.',
    en: 'Built with Astro and TypeScript together with agents, verified by Playwright E2E tests. There is an agent-readable version: /llms.txt.',
  },
  repo: { ru: 'Исходники сайта', en: 'Site source' },
};
