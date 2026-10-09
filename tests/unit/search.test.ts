import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Index, tokenize, stem, snippet } from '../../src/scripts/search.ts';

const docs = [
  { id: 'a', section: 's', title: 'RAG и поиск по базе знаний', text: 'Эмбеддинги Qwen3 и кластеризация вакансий', href: '#a' },
  { id: 'b', section: 's', title: 'Финансовый AI-агент', text: 'Оркестратор депозитов с гардрейлами', href: '#b' },
  { id: 'c', section: 's', title: 'Telegram bot summaries', text: 'Users vote on summaries, prompt changes', href: '#c' },
];

test('stemming folds Russian and English inflections', () => {
  assert.equal(stem('агенты'), stem('агентов'));
  assert.equal(stem('agents'), stem('agent'));
  assert.deepEqual(tokenize('Агенты и RAG'), ['агент', 'rag']);
});

test('BM25 ranks the matching doc first', () => {
  const ix = new Index(docs);
  assert.equal(ix.search('агенты')[0].doc.id, 'b');
  assert.equal(ix.search('эмбеддинги')[0].doc.id, 'a');
});

test('synonyms bridge languages and concepts', () => {
  const ix = new Index(docs);
  assert.equal(ix.search('agent')[0].doc.id, 'b', 'english query finds russian doc');
  assert.equal(ix.search('бот')[0].doc.id, 'c', 'russian query finds english doc');
});

test('empty and junk queries return nothing', () => {
  const ix = new Index(docs);
  assert.deepEqual(ix.search(''), []);
  assert.deepEqual(ix.search('zzzzqqq'), []);
});

test('snippet centers on the matched word', () => {
  const s = snippet('one two three four five six seven eight nine ten eleven agents twelve', 'agent');
  assert.ok(s.startsWith('…') && s.includes('agents'));
});
