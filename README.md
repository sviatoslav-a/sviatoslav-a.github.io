# Святослав Алексеев · AI engineer

Лендинг-портфолио для тестового задания Goulash.tech, часть 1
(вакансия [AI engineer / AI Automation Specialist](https://hh.ru/vacancy/137989678)).

**[Открыть портфолио](https://sviatoslav-a.github.io/)** · [English](https://sviatoslav-a.github.io/en/) · [Для агентов: llms.txt](https://sviatoslav-a.github.io/llms.txt)

## Демо за 35 секунд

[![Короткая запись: портфолио, проекты и интерактивные пилоты](docs/demo/portfolio-demo.gif)](https://github.com/sviatoslav-a/sviatoslav-a.github.io/raw/refs/heads/main/docs/demo/portfolio-demo.mp4)

**[Смотреть полную запись MP4, 35 секунд](https://github.com/sviatoslav-a/sviatoslav-a.github.io/raw/refs/heads/main/docs/demo/portfolio-demo.mp4)** · [Статичное превью](docs/demo/portfolio-demo.png)

Настоящая запись браузера: требования вакансии → кейс → три ERP-пилота → поиск → язык и тема. Пилоты явно используют синтетические данные.

**Вторая часть задания:** [Scout, поиск и сравнение поставщиков](https://github.com/sviatoslav-a/food-suppliers).

## Идея

Задание просит не пересказать резюме, а показать, **почему опыт релевантен роли**. Поэтому сайт
построен вокруг вакансии, а не вокруг моей биографии:

1. **Вакансия → доказательства.** Все 16 требований из вакансии (задачи, "важно", "плюсом").
   По клику на каждое: где именно я это делал и ссылка на проект. Уровень опыта честно размечен:
   "в продакшне", "в проектах", "закрываю". Пробелы (LangGraph, векторные БД) не спрятаны,
   а отмечены как направления развития, без заявления о неподтверждённом опыте.
2. **Проекты по одной схеме:** проблема → что сделал → результат → какое требование закрывает.
   Метрики вынесены в заголовок карточки, чтобы их было видно без чтения.
3. **Три пилота для ресторанной ERP.** Мои предложения для поиска по данным, маркетинга и
   производительности кухни, не описание внутренних планов компании.
   Вместо слов "умею агентов" на сайте три работающих демо:
   - **Умный поиск по ERP:** агент планирует, вызывает инструменты (SQL, база знаний),
     проверяет себя и отвечает со ссылками на источники;
   - **Автосегментация гостей:** настоящий k-means в браузере на 600 синтетических гостях,
     сегменты получают имена и персональный оффер;
   - **Риски загрузки кухни:** прогноз заказов против мощности смены, алерт управляющему.

   У каждого пилота указано, **как мерить эффект**. Все данные синтетические и подписаны.
4. **Как я работаю:** цикл от разговора с пользователями до метрик после релиза.
5. **Сам сайт как демонстрация:** поиск ⌘K работает как retrieval-слой RAG (BM25 + синонимы,
   RU↔EN) прямо в браузере; `/llms.txt` отдаёт весь сайт агентам в текстовом виде.

## Стек и почему он

| Выбор | Почему |
|---|---|
| **Astro 7**, статическая сборка | Лендинг должен быстро открываться. HTML готов на этапе сборки, JS только для интерактива. |
| **TypeScript без фреймворка** для интерактива | Небольшие модули без React: меньше JS, проще проверять. |
| Весь текст в `src/data/content.ts` (RU + EN) | Один источник правды: из него собираются обе версии страницы, поиск и `/llms.txt`. |
| Самописный BM25 вместо внешнего поиска | Показывает, как устроен retrieval в RAG, и работает офлайн. |
| Свои токены дизайна, тёмная и светлая темы | Контраст проверен axe в обеих темах. |
| **Playwright + axe** | E2E на десктопе и Pixel 7: каждое интерактивное место, доступность, переполнение, языки, 404. |

## Структура

```
src/data/content.ts        весь текст RU/EN, факты из CV и репозиториев
src/data/pilotData.ts      сценарии демо поиска по ERP (синтетика)
src/data/searchIndex.ts    документы для поиска по сайту
src/components/            Hero, Fit, Cases, Pilots, Process, Path, Contact
src/scripts/main.ts        тема, навигация, анимации, вкладки
src/scripts/search.ts      BM25 + стемминг + синонимы, палитра ⌘K
src/scripts/pilots.ts      k-means, прогноз кухни, сценарии агента
src/pages/llms.txt.ts      версия сайта для LLM
tests/unit/                node:test для логики поиска и демо
tests/e2e/site.spec.ts     Playwright, desktop + mobile
tools/og.mjs               генерирует превью для соцсетей из hero
```

## Запуск

```sh
npm install
npx playwright install chromium
npm run dev        # http://localhost:4321
npm test           # unit + build + e2e
```

Требуется Node 22.19+. Проверено: 11 unit-тестов и 50 E2E-проверок (desktop + Pixel 7, RU/EN, обе темы, axe). Все 50 E2E также пройдены на опубликованном GitHub Pages сайте.

```sh
PLAYWRIGHT_BASE_URL=https://sviatoslav-a.github.io npm run test:e2e
```

## Фото и оформление

Фоновый портрет в hero получен из моей фотографии детерминированным halftone-фильтром: точки разного размера, монохром, две маски для тёмной и светлой темы. Лицо не перерисовывалось моделью. Фон декоративный, не перехватывает клики; на телефонах снижается контраст. Исходная фотография и её метаданные не включены в репозиторий.

Повторная обработка своего файла: `node tools/portrait.mjs /path/to/photo.jpg`. Скрипт настроен на кадрирование исходного портрета; для другой фотографии адаптируйте crop.

## Запись демо

```sh
npm run build
npm run demo       # Playwright + ffmpeg, MP4/GIF/PNG в docs/demo/
```

## GitHub Pages

Сайт публикуется из готовой статической сборки в ветке `gh-pages`, без серверного рантайма и ключей API. Исходники находятся в `main`. Это персональный Pages-репозиторий, поэтому базовый путь `/`.

```sh
gh auth switch --hostname github.com --user sviatoslav-a
npm ci
npm run deploy:pages
```

Скрипт проверяет аккаунт, собирает сайт и обновляет `gh-pages` без переключения рабочей ветки и без force push. Однократно в Settings → Pages выбрано **Deploy from a branch → gh-pages → / (root)**. Публикация изменений может занять несколько минут.

---

## English

A portfolio landing built around the vacancy rather than my biography. It maps every vacancy
requirement to evidence, presents projects as problem → built → result, and ships three working
in-browser pilots for the Goulash ERP: smart search, guest segmentation and kitchen-load risk.
The ⌘K search is a client-side BM25 retrieval layer, and `/llms.txt` exposes the whole site
to agents. Astro 7 static build, vanilla TypeScript, Playwright + axe E2E on desktop and mobile.
