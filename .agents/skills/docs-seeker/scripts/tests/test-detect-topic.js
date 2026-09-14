#!/usr/bin/env node

const assert = require('assert');
const {
  detectTopic,
  extractLibrary,
  normalizeLibrary,
  normalizeTopic,
} = require('../detect-topic');

function run() {
  assert.strictEqual(normalizeTopic('date picker'), 'date-picker');
  assert.strictEqual(normalizeTopic('Server-Side Rendering'), 'server-side-rendering');
  assert.strictEqual(normalizeLibrary('Better Auth'), 'better-auth');
  assert.strictEqual(normalizeLibrary('shadcn/ui'), 'shadcn/ui');
  assert.strictEqual(normalizeLibrary('@scope/package'), '@scope/package');

  const cases = [
    ['Better Auth OAuth setup', 'oauth', 'better-auth'],
    ['React Query caching strategies', 'caching', 'react-query'],
    ['How do I configure Prisma for PostgreSQL?', 'postgresql', 'prisma'],
    ['How do I use date picker in shadcn/ui?', 'date-picker', 'shadcn/ui'],
    ['Using authentication with Better Auth', 'authentication', 'better-auth'],
    ['Implement routing in Next.js', 'routing', 'next.js'],
  ];
  for (const [query, topic, library] of cases) {
    const result = detectTopic(query);
    assert(result && result.isTopicSpecific, `detects topic: ${query}`);
    assert.strictEqual(result.topic, topic);
    assert.strictEqual(result.library, library);
  }

  for (const query of ['Documentation for Next.js', 'Next.js docs', 'How to use Better Auth', 'Random text without pattern', '']) {
    assert.strictEqual(detectTopic(query), null, `keeps general/unknown query unclassified: ${query || '<empty>'}`);
  }
  assert.strictEqual(extractLibrary('Documentation for Next.js'), 'next.js');
  assert.strictEqual(extractLibrary('Unknown framework docs'), null);
  assert.strictEqual(extractLibrary('Compare React and Vue docs'), null);
}

run();
console.log('detect-topic tests passed');
