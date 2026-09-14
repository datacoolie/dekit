#!/usr/bin/env node

const assert = require('assert');
const {
  analyzeLlmsTxt,
  parseUrls,
  categorizeUrl,
  suggestWorkDistribution,
} = require('../analyze-llms-txt');

function run() {
  const content = [
    '# Docs',
    '[Guide](https://docs.example.test/guide).',
    'https://docs.example.test/getting-started',
    'Repeated: https://docs.example.test/guide,',
    'https://docs.example.test/api-reference',
    'https://docs.example.test/advanced',
  ].join('\n');
  assert.deepStrictEqual(parseUrls(content), [
    'https://docs.example.test/guide',
    'https://docs.example.test/getting-started',
    'https://docs.example.test/api-reference',
    'https://docs.example.test/advanced',
  ]);
  assert.strictEqual(categorizeUrl('https://docs.example.test/getting-started'), 'critical');
  assert.strictEqual(categorizeUrl('https://docs.example.test/advanced/internals'), 'supplementary');

  const small = suggestWorkDistribution(2);
  assert.strictEqual(small.workerCount, 1);
  const bounded = suggestWorkDistribution(25, 3);
  assert.strictEqual(bounded.workerCount, 3);
  assert.strictEqual(bounded.bounded, true);
  assert.notStrictEqual(bounded.workerCount, 7);

  const analysis = analyzeLlmsTxt(content);
  assert.strictEqual(analysis.totalUrls, 4);
  assert.strictEqual(analysis.summary.critical, 1);
  assert.strictEqual(analysis.distribution.bounded, true);
}

run();
console.log('analyze-llms tests passed');
