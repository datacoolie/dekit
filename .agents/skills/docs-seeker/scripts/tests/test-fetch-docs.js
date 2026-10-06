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

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function responseFor(statusCode, headers = {}, body = '') {
  const response = new EventEmitter();
  response.statusCode = statusCode;
  response.headers = headers;
  response.resume = () => {};
  response.emitBody = () => {
    if (body) response.emit('data', Buffer.from(body));
    response.emit('end');
  };
  return response;
}

function requestStub() {
  const request = new EventEmitter();
  const timeoutCalls = [];
  let socketTimer = null;
  request.destroyed = false;
  request.destroy = () => {
    request.destroyed = true;
    if (socketTimer !== null) clearTimeout(socketTimer);
    socketTimer = null;
  };
  request.setTimeout = (milliseconds, handler) => {
    timeoutCalls.push(milliseconds);
    if (socketTimer !== null) clearTimeout(socketTimer);
    socketTimer = null;
    if (milliseconds > 0 && handler) socketTimer = setTimeout(handler, milliseconds);
  };
  request.timeoutCalls = timeoutCalls;
  return request;
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

  const redirectRequests = [];
  const authRedirect = await requestUrl('https://context7.com/auth-redirect', {
    apiKey: 'test-key',
    requestGet: (url, options, callback) => {
      const request = requestStub();
      redirectRequests.push({ url: url.href, options, request });
      process.nextTick(() => {
        if (redirectRequests.length === 1) {
          callback(responseFor(302, { location: 'https://docs.example.test/no-auth' }));
        } else {
          const response = responseFor(200, {}, 'external final');
          callback(response);
          response.emitBody();
        }
      });
      return request;
    },
  });
  assert.strictEqual(authRedirect.body, 'external final');
  assert.strictEqual(redirectRequests[0].options.headers.Authorization, 'Bearer test-key');
  assert.strictEqual(redirectRequests[1].options.headers.Authorization, undefined);
  assert.strictEqual(redirectRequests[0].request.destroyed, true);

  for (const headers of [
    {},
    { location: 'http://insecure.example.test/final' },
    { location: 'http://[invalid' },
  ]) {
    await assert.rejects(
      requestUrl('https://context7.com/malformed', {
        requestGet: (url, options, callback) => {
          const request = requestStub();
          process.nextTick(() => callback(responseFor(302, headers)));
          return request;
        },
      }),
      (error) => error.code === 'malformed-redirect' && error.statusCode === 302,
    );
  }

  const limitRequests = [];
  await assert.rejects(
    requestUrl('https://context7.com/hop-0', {
      maxRedirects: 1,
      requestGet: (url, options, callback) => {
        const request = requestStub();
        limitRequests.push(request);
        process.nextTick(() => callback(responseFor(302, { location: `https://context7.com/hop-${limitRequests.length}` })));
        return request;
      },
    }),
    (error) => error.code === 'redirect-limit',
  );
  assert.strictEqual(limitRequests.length, 2);
  assert.strictEqual(limitRequests[0].destroyed, true);
  assert.strictEqual(limitRequests[1].destroyed, true);

  const activeRequests = [];
  let activeDataEvents = 0;
  const activeStarted = Date.now();
  await assert.rejects(
    requestUrl('https://context7.com/active', {
      timeoutMs: 25,
      requestGet: (url, options, callback) => {
        const request = requestStub();
        activeRequests.push(request);
        process.nextTick(() => {
          const response = responseFor(200);
          callback(response);
          response.activeTimer = setInterval(() => {
            activeDataEvents += 1;
            response.emit('data', Buffer.from('x'));
          }, 2);
          const originalDestroy = request.destroy;
          request.destroy = () => {
            originalDestroy();
            clearInterval(response.activeTimer);
          };
        });
        return request;
      },
    }),
    (error) => error.code === 'timeout',
  );
  const activeElapsed = Date.now() - activeStarted;
  assert(activeElapsed < 150, `active response exceeded bounded timeout: ${activeElapsed} ms`);
  assert.strictEqual(activeRequests.length, 1);
  assert.strictEqual(activeRequests[0].destroyed, true);
  assert(activeRequests[0].timeoutCalls.includes(0), 'timeout cleanup disables the request timer');
  const activeEventsAfterTimeout = activeDataEvents;
  await sleep(15);
  assert.strictEqual(activeDataEvents, activeEventsAfterTimeout, 'destroyed active response has no late stream events');

  const redirectTimeoutRequests = [];
  await assert.rejects(
    requestUrl('https://context7.com/slow-redirect', {
      timeoutMs: 30,
      requestGet: (url, options, callback) => {
        const request = requestStub();
        redirectTimeoutRequests.push(request);
        let activeTimer = null;
        const responseTimer = setTimeout(() => {
          if (redirectTimeoutRequests.length === 1) {
            callback(responseFor(302, { location: 'https://context7.com/slow-final' }));
          } else {
            const response = responseFor(200);
            activeTimer = setInterval(() => response.emit('data', Buffer.from('still active')), 2);
            callback(response);
          }
        }, 12);
        const originalDestroy = request.destroy;
        request.destroy = () => {
          originalDestroy();
          clearTimeout(responseTimer);
          if (activeTimer !== null) clearInterval(activeTimer);
        };
        return request;
      },
    }),
    (error) => error.code === 'timeout',
  );
  assert.strictEqual(redirectTimeoutRequests.length, 2);
  assert.strictEqual(redirectTimeoutRequests[0].destroyed, true);
  assert.strictEqual(redirectTimeoutRequests[1].destroyed, true);

  const raceRequest = requestStub();
  const raced = await requestUrl('https://context7.com/race', {
    timeoutMs: 40,
    requestGet: (url, options, callback) => {
      process.nextTick(() => {
        const response = responseFor(200, {}, 'race winner');
        callback(response);
        response.emitBody();
        process.nextTick(() => {
          response.emit('error', new Error('late response error'));
          raceRequest.emit('error', new Error('late request error'));
        });
      });
      return raceRequest;
    },
  });
  assert.strictEqual(raced.body, 'race winner');
  assert.strictEqual(raceRequest.destroyed, false);
  assert(raceRequest.timeoutCalls.includes(0), 'successful completion clears the request timer');
  await sleep(10);
  assert.strictEqual(raceRequest.destroyed, false, 'late error cannot double-settle or cancel a completed request');

  const fallbackTimeouts = [];
  let secondTransportResolve;
  let secondTransportSettled = false;
  const sharedBudget = await fetchDocs({
    library: 'next.js',
    topic: 'routing',
    timeoutMs: 35,
    transport: async (url, options) => {
      fallbackTimeouts.push(options.timeoutMs);
      if (fallbackTimeouts.length === 1) {
        await sleep(12);
        return { statusCode: 404, body: '' };
      }
      return new Promise((resolve) => {
        secondTransportResolve = (value) => {
          secondTransportSettled = true;
          resolve(value);
        };
      });
    },
  });
  assert.strictEqual(sharedBudget.success, false);
  assert.strictEqual(sharedBudget.code, 'timeout');
  assert.strictEqual(fallbackTimeouts.length, 2);
  assert(fallbackTimeouts[1] < fallbackTimeouts[0], 'fallback receives only the remaining total budget');
  assert.strictEqual(secondTransportSettled, false, 'caller-owned transport remains pending after bounded return');
  secondTransportResolve({ statusCode: 200, body: 'late transport result' });
  await sleep(5);

  const ownedFallbackRequests = [];
  let ownedFallbackDataEvents = 0;
  const ownedFallback = await fetchDocs({
    library: 'next.js',
    topic: 'routing',
    timeoutMs: 35,
  }, {
    timeoutMs: 35,
    requestGet: (url, options, callback) => {
      const request = requestStub();
      ownedFallbackRequests.push(request);
      process.nextTick(() => {
        if (ownedFallbackRequests.length === 1) {
          const response = responseFor(404);
          callback(response);
          response.emitBody();
          return;
        }
        const response = responseFor(200);
        let activeTimer = setInterval(() => {
          ownedFallbackDataEvents += 1;
          response.emit('data', Buffer.from('still active'));
        }, 2);
        const originalDestroy = request.destroy;
        request.destroy = () => {
          originalDestroy();
          if (activeTimer !== null) clearInterval(activeTimer);
          activeTimer = null;
        };
        callback(response);
      });
      return request;
    },
  });
  assert.strictEqual(ownedFallback.success, false);
  assert.strictEqual(ownedFallback.code, 'timeout');
  assert.strictEqual(ownedFallbackRequests.length, 2);
  assert.strictEqual(ownedFallbackRequests[1].destroyed, true, 'active fallback request is destroyed on total timeout');
  assert(ownedFallbackRequests[1].timeoutCalls.includes(0), 'active fallback request timer is cleared');
  const ownedFallbackEventsAfterTimeout = ownedFallbackDataEvents;
  await sleep(15);
  assert.strictEqual(ownedFallbackDataEvents, ownedFallbackEventsAfterTimeout, 'destroyed fallback stream has no late events');

  const blockingStarted = Date.now();
  const lateSuccess = await fetchDocs({
    url: 'https://docs.example.test/blocking-transport',
    timeoutMs: 5,
    transport: () => {
      while (Date.now() - blockingStarted < 20) {
        // A caller-owned synchronous transport cannot be preempted, but its
        // result must still lose if it arrives after the configured deadline.
      }
      return { statusCode: 200, body: 'too late' };
    },
  });
  assert.strictEqual(lateSuccess.success, false);
  assert.strictEqual(lateSuccess.code, 'timeout');

  if (previousApiKey === undefined) delete process.env.CONTEXT7_API_KEY;
  else process.env.CONTEXT7_API_KEY = previousApiKey;
}

run().then(() => console.log('fetch-docs tests passed')).catch((error) => {
  console.error(error);
  process.exit(1);
});
