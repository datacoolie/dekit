#!/usr/bin/env node

const assert = require('assert');
const { EventEmitter } = require('events');
const {
  fetchDocs,
  buildContext7Url,
  getUrlVariations,
  normalizeRequest,
  requestUrl,
} = require('../fetch-docs');

function fakeGetFactory(responses) {
  return (url, options, callback) => {
    const request = new EventEmitter();
    const next = responses.shift() || { statusCode: 404, body: '' };
    request.destroy = () => {};
    request.setTimeout = (timeoutMs, handler) => {
      if (next.timeout) process.nextTick(handler);
    };
    const response = new EventEmitter();
    response.statusCode = next.statusCode;
    response.headers = next.headers || {};
    response.resume = () => {};
    if (!next.timeout) {
      process.nextTick(() => {
        callback(response);
        if (next.body) response.emit('data', Buffer.from(next.body));
        response.emit('end');
      });
    }
    return request;
  };
}

async function run() {
  const previousApiKey = process.env.CONTEXT7_API_KEY;
  process.env.CONTEXT7_API_KEY = 'test-key';
  assert.strictEqual(buildContext7Url('vercel/next.js'), 'https://context7.com/vercel/next.js/llms.txt');
  assert.strictEqual(
    buildContext7Url('vercel/next.js', 'date picker', 'v15.1.8'),
    'https://context7.com/vercel/next.js/v15.1.8/llms.txt?topic=date-picker',
  );
  const variations = await getUrlVariations('next.js', 'cache');
  assert.deepStrictEqual(variations, [
    'https://context7.com/vercel/next.js/llms.txt?topic=cache',
    'https://context7.com/vercel/next.js/llms.txt',
  ]);

  const explicit = normalizeRequest({ library: 'next.js', topic: 'date picker', version: 'v15.1.8' });
  assert.deepStrictEqual(
    { library: explicit.library, topic: explicit.topic, version: explicit.version, explicit: explicit.explicit },
    { library: 'next.js', topic: 'date-picker', version: 'v15.1.8', explicit: true },
  );
  assert.strictEqual(normalizeRequest('unknown framework docs').error.code, 'unsupported-input');

  const calls = [];
  const success = await fetchDocs({
    library: 'next.js',
    topic: 'routing',
    transport: async (url, options) => {
      calls.push({ url, options });
      return { statusCode: 200, body: '# routing docs', url };
    },
  });
  assert.strictEqual(success.success, true);
  assert.strictEqual(success.topicSpecific, true);
  assert.strictEqual(success.content, '# routing docs');
  assert.strictEqual(calls[0].options.headers.Authorization, 'Bearer test-key');

  let attempt = 0;
  const fallback = await fetchDocs({
    library: 'next.js',
    topic: 'routing',
    transport: async (url) => {
      attempt += 1;
      return attempt === 1 ? { statusCode: 404, body: '' } : { statusCode: 200, body: 'base docs', url };
    },
  });
  assert.strictEqual(fallback.success, true);
  assert.strictEqual(attempt, 2);

  const limited = await fetchDocs({
    library: 'next.js',
    transport: async () => ({ statusCode: 429, body: 'do not expose' }),
  });
  assert.strictEqual(limited.success, false);
  assert.strictEqual(limited.code, 'rate-limited');
  assert(!JSON.stringify(limited).includes('do not expose'));

  const unauthorized = await fetchDocs({
    url: 'https://docs.example.test/llms.txt',
    transport: async (url, options) => {
      assert.strictEqual(options.headers.Authorization, undefined);
      return { statusCode: 401, body: '' };
    },
  });
  assert.strictEqual(unauthorized.code, 'unauthorized');

  const invalid = await fetchDocs({ url: 'http://docs.example.test/llms.txt' });
  assert.strictEqual(invalid.code, 'unsupported-url');

  await assert.rejects(
    requestUrl('https://context7.com/large', {
      maxBytes: 3,
      requestGet: fakeGetFactory([{ statusCode: 200, body: 'large' }]),
    }),
    (error) => error.code === 'response-too-large',
  );
  await assert.rejects(
    requestUrl('https://context7.com/slow', {
      timeoutMs: 1,
      requestGet: fakeGetFactory([{ timeout: true }]),
    }),
    (error) => error.code === 'timeout',
  );
  const redirected = await requestUrl('https://context7.com/redirect', {
    requestGet: fakeGetFactory([
      { statusCode: 302, headers: { location: 'https://docs.example.test/final' } },
      { statusCode: 200, body: 'final' },
    ]),
  });
  assert.strictEqual(redirected.body, 'final');
  if (previousApiKey === undefined) delete process.env.CONTEXT7_API_KEY;
  else process.env.CONTEXT7_API_KEY = previousApiKey;
}

run().then(() => console.log('fetch-docs tests passed')).catch((error) => {
  console.error(error);
  process.exit(1);
});
