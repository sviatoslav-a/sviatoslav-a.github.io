// Scripted agent runs for the "smart ERP search" demo. All numbers are synthetic.
import type { Lang } from './content';

export type Step = { kind: 'plan' | 'tool' | 'rows' | 'check'; text: string };
export type Scenario = { keys: string[]; steps: Step[]; answer: string; sources: string[] };

export const scenarios: Record<Lang, Scenario[]> = {
  ru: [
    {
      keys: ['фудкост', 'себестоимость', 'вырос', 'малышева', 'food', 'cost'],
      steps: [
        { kind: 'plan', text: 'Нужны: фудкост по точке за 2 недели, движение цен закупки, списания.' },
        { kind: 'tool', text: 'erp.sql("SELECT week, food_cost_pct FROM venue_kpi WHERE venue=\'Малышева 5\'")' },
        { kind: 'rows', text: 'нед. 39: 31.2%  ·  нед. 40: 34.8%  (+3.6 п.п.)' },
        { kind: 'tool', text: 'erp.sql("закупки: изменение цены по SKU, топ-5")' },
        { kind: 'rows', text: 'лосось охл.: +18%  ·  авокадо: +9%  ·  сливочный сыр: +4%' },
        { kind: 'tool', text: 'erp.sql("списания по точке за нед. 40")' },
        { kind: 'rows', text: 'лосось: 6.2 кг списано (норма 2.5 кг)' },
        { kind: 'check', text: 'Сумма вкладов объясняет 3.3 из 3.6 п.п. Ответ подтверждён данными.' },
      ],
      answer: 'Фудкост на Малышева вырос с 31.2% до 34.8%. Главная причина: лосось подорожал на 18% у поставщика, и одновременно списали 6.2 кг лосося при норме 2.5 кг. Предлагаю: проверить хранение лосося на точке и запросить цену у второго поставщика.',
      sources: ['venue_kpi · нед. 39-40', 'purchases · price_delta', 'writeoffs · Малышева 5'],
    },
    {
      keys: ['отчёт', 'отчет', 'списания', 'списаний', 'где найти', 'сентябрь', 'report'],
      steps: [
        { kind: 'plan', text: 'Это навигационный вопрос: найти раздел ERP и инструкцию.' },
        { kind: 'tool', text: 'kb.search("отчёт по списаниям", top_k=3)' },
        { kind: 'rows', text: '0.91 · Справка: Склад → Отчёты → Списания  ·  0.74 · Регламент инвентаризации' },
        { kind: 'tool', text: 'erp.link(report="writeoffs", period="2026-09")' },
        { kind: 'check', text: 'Ссылка открывается, у пользователя есть права на раздел "Склад".' },
      ],
      answer: 'Отчёт лежит в разделе Склад → Отчёты → Списания. Я уже подставил период: сентябрь 2026, вот прямая ссылка. Если нужен разрез по причинам списания, включите группировку "Причина".',
      sources: ['База знаний: Склад / Отчёты', 'erp.link · writeoffs?period=2026-09'],
    },
    {
      keys: ['возвращают', 'возврат', 'блюда', 'жалобы', 'return', 'dishes'],
      steps: [
        { kind: 'plan', text: 'Возвраты + отзывы гостей за 30 дней, сгруппировать по блюду и причине.' },
        { kind: 'tool', text: 'erp.sql("SELECT dish, count(*) FROM order_returns WHERE ts > now()-30d GROUP BY dish")' },
        { kind: 'rows', text: 'Филадельфия: 41  ·  Рамен с курицей: 23  ·  Пицца 4 сыра: 17' },
        { kind: 'tool', text: 'llm.classify(отзывы, причины=[остыло, не тот состав, долго, вкус])' },
        { kind: 'rows', text: 'Филадельфия: "не тот состав" 61%  ·  Рамен: "остыло" 70%' },
        { kind: 'check', text: 'Проверил выборку из 20 отзывов вручную: классификация совпала в 18.' },
      ],
      answer: 'Чаще всего возвращают Филадельфию (41 раз за 30 дней), и в 61% случаев гости пишут про состав: похоже, на одной из кухонь кладут меньше лосося. Рамен возвращают, потому что он остывает в доставке: стоит проверить упаковку.',
      sources: ['order_returns · 30 дней', 'отзывы гостей · LLM-классификация (18/20 сверено)'],
    },
  ],
  en: [
    {
      keys: ['food', 'cost', 'rise', 'malysheva', 'margin'],
      steps: [
        { kind: 'plan', text: 'Need: venue food cost for 2 weeks, purchase price changes, write-offs.' },
        { kind: 'tool', text: 'erp.sql("SELECT week, food_cost_pct FROM venue_kpi WHERE venue=\'Malysheva 5\'")' },
        { kind: 'rows', text: 'wk 39: 31.2%  ·  wk 40: 34.8%  (+3.6 pp)' },
        { kind: 'tool', text: 'erp.sql("purchases: price change by SKU, top 5")' },
        { kind: 'rows', text: 'chilled salmon: +18%  ·  avocado: +9%  ·  cream cheese: +4%' },
        { kind: 'tool', text: 'erp.sql("venue write-offs, wk 40")' },
        { kind: 'rows', text: 'salmon: 6.2 kg written off (norm 2.5 kg)' },
        { kind: 'check', text: 'Contributions explain 3.3 of 3.6 pp. Answer is backed by data.' },
      ],
      answer: 'Food cost at Malysheva went from 31.2% to 34.8%. Main cause: the supplier raised salmon prices by 18%, and at the same time 6.2 kg of salmon was written off against a 2.5 kg norm. Suggestion: check salmon storage at the venue and request a quote from a second supplier.',
      sources: ['venue_kpi · wk 39-40', 'purchases · price_delta', 'writeoffs · Malysheva 5'],
    },
    {
      keys: ['report', 'write-off', 'writeoff', 'where', 'september', 'find'],
      steps: [
        { kind: 'plan', text: 'Navigation question: find the ERP section and the help article.' },
        { kind: 'tool', text: 'kb.search("write-off report", top_k=3)' },
        { kind: 'rows', text: '0.91 · Help: Stock → Reports → Write-offs  ·  0.74 · Stocktaking policy' },
        { kind: 'tool', text: 'erp.link(report="writeoffs", period="2026-09")' },
        { kind: 'check', text: 'Link resolves, user has access to the "Stock" section.' },
      ],
      answer: 'The report is under Stock → Reports → Write-offs. I pre-filled the period with September 2026, here is a direct link. If you need a breakdown by reason, turn on the "Reason" grouping.',
      sources: ['Knowledge base: Stock / Reports', 'erp.link · writeoffs?period=2026-09'],
    },
    {
      keys: ['returned', 'return', 'dishes', 'complaints', 'most'],
      steps: [
        { kind: 'plan', text: 'Returns + guest reviews for 30 days, grouped by dish and reason.' },
        { kind: 'tool', text: 'erp.sql("SELECT dish, count(*) FROM order_returns WHERE ts > now()-30d GROUP BY dish")' },
        { kind: 'rows', text: 'Philadelphia roll: 41  ·  Chicken ramen: 23  ·  Four-cheese pizza: 17' },
        { kind: 'tool', text: 'llm.classify(reviews, reasons=[cold, wrong filling, late, taste])' },
        { kind: 'rows', text: 'Philadelphia: "wrong filling" 61%  ·  Ramen: "cold" 70%' },
        { kind: 'check', text: 'Hand-checked a sample of 20 reviews: classification matched on 18.' },
      ],
      answer: 'The Philadelphia roll is returned most (41 times in 30 days), and 61% of guests mention the filling: one kitchen probably uses less salmon. Ramen comes back because it gets cold in delivery, so the packaging is worth checking.',
      sources: ['order_returns · 30 days', 'guest reviews · LLM classification (18/20 verified)'],
    },
  ],
};
