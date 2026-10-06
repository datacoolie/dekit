#!/usr/bin/env node

/**
 * Fetch a bounded documentation entry from Context7 or an explicit llms.txt
 * URL. Query parsing is kept as a compatibility fallback; explicit inputs are
 * preferred because they cannot silently select the wrong library.
 */

const https = require('https');
const { loadEnv } = require('./utils/env-loader');
const { detectTopic, extractLibrary, normalizeLibrary, normalizeTopic } = require('./detect-topic');

const CONTEXT7_ORIGIN = 'https://context7.com';
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 3;

class DocsSeekerError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'DocsSeekerError';
    this.code = code;
    Object.assign(this, details);
  }
}

function positiveNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function config() {
  const env = loadEnv();
  return {
    apiKey: env.CONTEXT7_API_KEY || '',
    timeoutMs: positiveNumber(env.DOCS_SEEKER_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    maxBytes: positiveNumber(env.DOCS_SEEKER_MAX_BYTES, DEFAULT_MAX_BYTES),
    maxRedirects: positiveNumber(env.DOCS_SEEKER_MAX_REDIRECTS, DEFAULT_MAX_REDIRECTS),
    debug: env.DEBUG === 'true',
  };
}

function validateUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch (error) {
    throw new DocsSeekerError('invalid-url', `Invalid documentation URL: ${value}`);
  }
  if (parsed.protocol !== 'https:') {
    throw new DocsSeekerError('unsupported-url', 'Documentation URLs must use HTTPS.');
  }
  return parsed;
}

function headersFor(url, apiKey) {
  const headers = {};
  if (apiKey && new URL(url).origin === CONTEXT7_ORIGIN) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

function asNetworkError(error) {
  if (error instanceof DocsSeekerError) return error;
  const message = error && error.message ? error.message : String(error || 'Unknown network error.');
  return new DocsSeekerError('network-error', message);
}

function malformedRedirect(url, statusCode, location, reason) {
  const details = { url, statusCode };
  if (location !== undefined) details.location = location;
  return new DocsSeekerError(
    'malformed-redirect',
    `Malformed redirect from ${url}: ${reason}.`,
    details,
  );
}

function timeoutError(timeoutMs) {
  return new DocsSeekerError('timeout', `Request timed out after ${timeoutMs} ms.`, { timeoutMs });
}

/**
 * Resolve a URL with timeout, redirect, and response-size bounds.
 * The returned object is intentionally transport-shaped so tests can inject a
 * deterministic requestGet seam without contacting the provider.
 *
 * timeoutMs is one wall-clock budget for the complete redirect chain. The
 * deadlineAt option is internal to fetchDocs and lets fallback candidates
 * share that same budget.
 */
function requestUrl(url, options = {}) {
  const settings = {
    ...config(),
    ...options,
  };
  settings.timeoutMs = positiveNumber(settings.timeoutMs, DEFAULT_TIMEOUT_MS);
  settings.maxBytes = positiveNumber(settings.maxBytes, DEFAULT_MAX_BYTES);
  settings.maxRedirects = Math.floor(positiveNumber(settings.maxRedirects, DEFAULT_MAX_REDIRECTS));
  const initialRedirectCount = Number.isInteger(options.redirectCount) && options.redirectCount >= 0
    ? options.redirectCount
    : 0;
  const parsed = validateUrl(url);
  const requestGet = settings.requestGet || https.get;
  const configuredDeadline = Number.isFinite(options.deadlineAt) ? options.deadlineAt : null;
  const deadlineAt = configuredDeadline === null
    ? Date.now() + settings.timeoutMs
    : configuredDeadline;

  return new Promise((resolve, reject) => {
    let settled = false;
    let deadlineTimer = null;
    let activeRequest = null;

    const clearRequestTimeout = (request) => {
      if (!request || typeof request.setTimeout !== 'function') return;
      try {
        // ClientRequest has no separate clearTimeout method; zero disables its
        // socket timer. Always provide a callback for deterministic test seams.
        request.setTimeout(0, () => {});
      } catch (error) {
        // Cleanup must not replace the original request outcome.
      }
    };

    const destroyRequest = (request) => {
      if (!request || typeof request.destroy !== 'function') return;
      try {
        request.destroy();
      } catch (error) {
        // A request that is already closed is still considered cancelled.
      }
    };

    const finishError = (error, destroy = true) => {
      if (settled) return;
      settled = true;
      if (deadlineTimer !== null) {
        clearTimeout(deadlineTimer);
        deadlineTimer = null;
      }
      const request = activeRequest;
      activeRequest = null;
      clearRequestTimeout(request);
      if (destroy) destroyRequest(request);
      reject(error instanceof DocsSeekerError ? error : asNetworkError(error));
    };

    const finishSuccess = (value) => {
      if (settled) return;
      if (Date.now() >= deadlineAt) {
        finishError(timeoutError(settings.timeoutMs));
        return;
      }
      settled = true;
      if (deadlineTimer !== null) {
        clearTimeout(deadlineTimer);
        deadlineTimer = null;
      }
      const request = activeRequest;
      activeRequest = null;
      clearRequestTimeout(request);
      resolve(value);
    };

    const failTimeout = () => finishError(timeoutError(settings.timeoutMs));

    const startRequest = (currentUrl, redirectCount) => {
      if (settled) return;
      const remainingMs = deadlineAt - Date.now();
      if (remainingMs <= 0) {
        failTimeout();
        return;
      }

      let current;
      let parsedCurrent;
      try {
        parsedCurrent = validateUrl(currentUrl);
      } catch (error) {
        finishError(asNetworkError(error));
        return;
      }

      const onResponse = (response) => {
        if (settled || activeRequest !== current) {
          if (response && typeof response.resume === 'function') response.resume();
          return;
        }
        if (Date.now() >= deadlineAt) {
          if (response && typeof response.resume === 'function') response.resume();
          failTimeout();
          return;
        }

        const statusCode = Number(response && response.statusCode) || 0;
        const headers = response && response.headers ? response.headers : {};
        const location = headers.location;
        const responseError = (error) => {
          if (settled || activeRequest !== current) return;
          if (Date.now() >= deadlineAt) {
            failTimeout();
            return;
          }
          finishError(asNetworkError(error));
        };
        if (!response || typeof response.on !== 'function') {
          finishError(new DocsSeekerError('network-error', 'Documentation response was not event-capable.'));
          return;
        }
        response.on('error', responseError);

        if (statusCode >= 300 && statusCode < 400) {
          if (typeof response.resume === 'function') response.resume();
          if (typeof location !== 'string' || !location.trim()) {
            finishError(malformedRedirect(parsedCurrent.href, statusCode, location, 'the Location header is missing'));
            return;
          }
          if (redirectCount >= settings.maxRedirects) {
            finishError(new DocsSeekerError(
              'redirect-limit',
              `Too many redirects while fetching ${parsedCurrent.href}.`,
              { url: parsedCurrent.href, statusCode, location },
            ));
            return;
          }

          let nextUrl;
          try {
            nextUrl = new URL(location, parsedCurrent).href;
            validateUrl(nextUrl);
          } catch (error) {
            const reason = error && error.message ? error.message : 'the Location header is invalid';
            finishError(malformedRedirect(parsedCurrent.href, statusCode, location, reason));
            return;
          }

          if (activeRequest === current) activeRequest = null;
          clearRequestTimeout(current);
          destroyRequest(current);
          startRequest(nextUrl, redirectCount + 1);
          return;
        }

        const chunks = [];
        let size = 0;
        response.on('data', (chunk) => {
          if (settled || activeRequest !== current) return;
          if (Date.now() >= deadlineAt) {
            finishError(timeoutError(settings.timeoutMs));
            return;
          }
          const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += buffer.length;
          if (size > settings.maxBytes) {
            finishError(new DocsSeekerError('response-too-large', `Response exceeded ${settings.maxBytes} bytes.`));
            return;
          }
          chunks.push(buffer);
        });
        response.on('end', () => {
          if (settled || activeRequest !== current) return;
          finishSuccess({
            statusCode,
            headers,
            body: Buffer.concat(chunks).toString('utf8'),
            url: parsedCurrent.href,
          });
        });
        if (typeof response.on === 'function') {
          response.on('aborted', () => responseError(new Error('Documentation response was aborted.')));
        }
      };

      try {
        current = requestGet(
          parsedCurrent,
          { headers: headersFor(parsedCurrent.href, settings.apiKey) },
          onResponse,
        );
      } catch (error) {
        finishError(asNetworkError(error));
        return;
      }

      activeRequest = current;
      if (!current || typeof current.on !== 'function') {
        finishError(new DocsSeekerError('network-error', 'Documentation request was not event-capable.'));
        return;
      }
      if (typeof current.setTimeout === 'function') {
        try {
          current.setTimeout(remainingMs, () => {
            if (activeRequest === current) failTimeout();
          });
        } catch (error) {
          finishError(asNetworkError(error));
          return;
        }
      }
      current.on('error', (error) => {
        if (settled || activeRequest !== current) return;
        if (Date.now() >= deadlineAt) {
          failTimeout();
          return;
        }
        finishError(asNetworkError(error));
      });
    };

    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      failTimeout();
      return;
    }
    deadlineTimer = setTimeout(failTimeout, remainingMs);
    startRequest(parsed.href, initialRedirectCount);
  });
}

/**
 * Backwards-compatible body-only helper. Callers needing diagnostics should
 * use fetchDocs(), which preserves status/error codes in its result.
 */
async function httpsGet(url, options = {}) {
  const response = await requestUrl(url, options);
  if (response.statusCode === 200) return response.body;
  if (response.statusCode === 404) return null;
  throw new DocsSeekerError(`http-${response.statusCode}`, `HTTP ${response.statusCode} from documentation provider.`, {
    statusCode: response.statusCode,
  });
}

function safeVersion(version) {
  if (version === undefined || version === null || version === '') return '';
  const value = String(version).trim().replace(/^\/+|\/+$/g, '');
  if (!value || !/^[a-zA-Z0-9._@-]+$/.test(value)) {
    throw new DocsSeekerError('invalid-version', 'Version must contain only letters, numbers, dots, underscores, @, or hyphens.');
  }
  return value;
}

function buildContext7Url(library, topic = null, version = null) {
  const normalizedLibrary = String(library || '').trim();
  if (!normalizedLibrary) throw new DocsSeekerError('missing-library', 'A library identifier is required.');

  let basePath;
  if (normalizedLibrary.includes('/')) {
    basePath = normalizedLibrary.replace(/^\/+|\/+$/g, '');
  } else {
    const normalized = normalizeLibrary(normalizedLibrary).replace(/[^a-z0-9-]/g, '');
    basePath = `websites/${normalized}`;
  }

  const pinnedVersion = safeVersion(version);
  if (pinnedVersion) basePath = `${basePath}/${pinnedVersion}`;

  const baseUrl = `${CONTEXT7_ORIGIN}/${basePath}/llms.txt`;
  if (!topic) return baseUrl;
  const normalizedTopic = normalizeTopic(topic);
  if (!normalizedTopic) throw new DocsSeekerError('invalid-topic', 'Topic must contain letters or numbers.');
  return `${baseUrl}?topic=${encodeURIComponent(normalizedTopic)}`;
}

async function getUrlVariations(library, topic = null, version = null) {
  const knownRepos = {
    'next.js': 'vercel/next.js',
    nextjs: 'vercel/next.js',
    remix: 'remix-run/remix',
    astro: 'withastro/astro',
    shadcn: 'shadcn-ui/ui',
    'shadcn/ui': 'shadcn-ui/ui',
    'better-auth': 'better-auth/better-auth',
    'react-query': 'tanstack/query',
  };
  const normalized = String(library || '').trim().toLowerCase();
  const repo = knownRepos[normalized] || library;
  const urls = [];
  if (topic) urls.push(buildContext7Url(repo, topic, version));
  urls.push(buildContext7Url(repo, null, version));
  return [...new Set(urls)];
}

function unsupportedInput(message, extra = {}) {
  return {
    success: false,
    source: 'context7.com',
    code: 'unsupported-input',
    error: message,
    urls: [],
    suggestion: 'Pass --library <id> and optionally --topic <topic>, --version <version>, or --url <llms.txt URL>.',
    ...extra,
  };
}

function normalizeRequest(queryOrRequest, options = {}) {
  const request = typeof queryOrRequest === 'object' && queryOrRequest !== null
    ? { ...queryOrRequest }
    : { ...options, query: queryOrRequest };
  const query = typeof request.query === 'string' ? request.query.trim() : '';

  if (request.url) {
    try {
      validateUrl(request.url);
    } catch (error) {
      return { error: error instanceof DocsSeekerError ? error : new DocsSeekerError('invalid-url', error.message) };
    }
    const explicitTopic = request.topic ? normalizeTopic(request.topic) : null;
    if (request.topic && !explicitTopic) return { error: new DocsSeekerError('invalid-topic', 'Topic must contain letters or numbers.') };
    return {
      query,
      url: request.url,
      library: null,
      topic: explicitTopic,
      version: request.version || null,
      explicit: true,
      transport: request.transport,
      timeoutMs: request.timeoutMs,
      maxBytes: request.maxBytes,
      maxRedirects: request.maxRedirects,
    };
  }

  let library = request.library ? normalizeLibrary(request.library) : null;
  let topic = request.topic ? normalizeTopic(request.topic) : null;
  if (request.topic && !topic) return { error: new DocsSeekerError('invalid-topic', 'Topic must contain letters or numbers.') };
  let source = 'explicit';

  if (!library && query) {
    const detected = detectTopic(query);
    if (detected && detected.isTopicSpecific) {
      library = detected.library;
      topic = topic || detected.topic;
      source = 'heuristic';
    } else {
      library = extractLibrary(query);
      source = 'heuristic';
    }
  }

  if (!library) {
    return { error: new DocsSeekerError('unsupported-input', 'The library could not be identified without guessing.') };
  }
  return {
    query,
    library,
    topic,
    version: request.version || null,
    explicit: source === 'explicit',
    transport: request.transport,
    timeoutMs: request.timeoutMs,
    maxBytes: request.maxBytes,
    maxRedirects: request.maxRedirects,
  };
}

function statusCode(code) {
  const match = /^http-(\d+)$/.exec(code || '');
  return match ? Number(match[1]) : null;
}

function diagnosticCode(errors) {
  const codes = errors.map((error) => error.code);
  if (codes.includes('unauthorized') || codes.includes('http-401')) return 'unauthorized';
  if (codes.includes('rate-limited') || codes.includes('http-429')) return 'rate-limited';
  if (codes.includes('timeout')) return 'timeout';
  if (codes.includes('response-too-large')) return 'response-too-large';
  if (errors.length && errors.every((error) => error.code === 'not-found' || error.code === 'http-404')) return 'not-found';
  return errors[0]?.code || 'not-found';
}

function boundedTransportCall(transport, url, options, timeoutMs) {
  if (timeoutMs <= 0) return Promise.reject(timeoutError(options.timeoutMs));

  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(timeoutError(options.timeoutMs));
    }, timeoutMs);

    const settle = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (Number.isFinite(options.deadlineAt) && Date.now() >= options.deadlineAt) {
        reject(timeoutError(options.timeoutMs));
        return;
      }
      callback(value);
    };

    let result;
    try {
      result = transport(url, options);
    } catch (error) {
      settle(reject, error);
      return;
    }
    // The promise belongs to the caller that supplied transport. Once the
    // budget wins this race, its work cannot be forcibly cancelled through the
    // existing transport seam; its eventual settlement is intentionally ignored.
    Promise.resolve(result).then(
      (value) => settle(resolve, value),
      (error) => settle(reject, error),
    );
  });
}

async function fetchDocs(queryOrRequest, options = {}) {
  const request = normalizeRequest(queryOrRequest, options);
  if (request.error) return unsupportedInput(request.error.message, { code: request.error.code });

  let urls;
  let source;
  try {
    urls = request.url ? [request.url] : await getUrlVariations(request.library, request.topic, request.version);
    source = request.url ? 'custom-url' : 'context7.com';
  } catch (error) {
    return unsupportedInput(error.message, { code: error.code || 'unsupported-input' });
  }

  const settings = { ...config(), ...request, ...options };
  settings.timeoutMs = positiveNumber(settings.timeoutMs, DEFAULT_TIMEOUT_MS);
  const transport = options.transport || request.transport;
  const errors = [];
  const deadlineAt = Date.now() + settings.timeoutMs;
  let budgetExpired = false;
  for (const url of urls) {
    const remainingMs = deadlineAt - Date.now();
    if (remainingMs <= 0) {
      budgetExpired = true;
      break;
    }
    try {
      const requestSettings = {
        ...settings,
        timeoutMs: remainingMs,
        deadlineAt,
        headers: headersFor(url, settings.apiKey),
      };
      const response = transport
        ? await boundedTransportCall(transport, url, requestSettings, remainingMs)
        : await requestUrl(url, requestSettings);
      const normalizedResponse = typeof response === 'string'
        ? { statusCode: 200, body: response, url }
        : { ...(response || {}), url: response && response.url ? response.url : url };
      if (normalizedResponse.statusCode === 200 && normalizedResponse.body) {
        if (Date.now() >= deadlineAt) {
          budgetExpired = true;
          errors.push({ url, code: 'timeout', message: `Request timed out after ${settings.timeoutMs} ms.` });
          break;
        }
        return {
          success: true,
          source,
          url: normalizedResponse.url,
          content: normalizedResponse.body,
          topicSpecific: Boolean(request.topic),
          library: request.library || undefined,
          version: request.version || undefined,
        };
      }
      const code = normalizedResponse.statusCode === 404
        ? 'not-found'
        : normalizedResponse.statusCode === 401
          ? 'unauthorized'
          : normalizedResponse.statusCode === 429
            ? 'rate-limited'
            : `http-${normalizedResponse.statusCode || 0}`;
      errors.push({ url, code, statusCode: normalizedResponse.statusCode || 0 });
    } catch (error) {
      const code = error && error.code ? error.code : 'network-error';
      errors.push({
        url,
        code,
        statusCode: error && (error.statusCode || statusCode(code)) || undefined,
        message: error && error.message,
      });
      if (settings.debug) console.error(`[DEBUG] Failed to fetch ${url}: ${error && error.message}`);
    }
    if (Date.now() >= deadlineAt) {
      budgetExpired = true;
      break;
    }
  }

  if (budgetExpired && !errors.some((error) => error.code === 'timeout')) {
    errors.push({
      url: urls[Math.min(errors.length, urls.length - 1)],
      code: 'timeout',
      message: `Request timed out after ${settings.timeoutMs} ms.`,
    });
  }
  const code = diagnosticCode(errors);
  const errorMessages = errors.map((error) => `${error.url}: ${error.code}`).join('; ');
  return {
    success: false,
    source,
    code,
    error: code === 'not-found' ? 'Documentation was not found for the requested library.' : `Documentation request failed (${code}).`,
    urls,
    errors,
    details: errorMessages,
    suggestion: code === 'unsupported-input'
      ? 'Pass an explicit library identifier or documentation URL.'
      : 'Verify the library ID/version, credentials, or use the official documentation URL.',
  };
}

function parseCliArgs(args) {
  const request = { query: '' };
  const positional = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (['--library', '--topic', '--version', '--url', '--timeout-ms', '--max-bytes', '--max-redirects'].includes(arg)) {
      const value = args[index + 1];
      if (!value) return { error: `Missing value for ${arg}.` };
      index += 1;
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      if (['timeoutMs', 'maxBytes', 'maxRedirects'].includes(key)) {
        const number = Number(value);
        if (!Number.isFinite(number) || number <= 0) return { error: `${arg} must be a positive number.` };
        request[key] = number;
      } else {
        request[key] = value;
      }
    } else if (arg.startsWith('-')) {
      return { error: `Unknown option: ${arg}.` };
    } else {
      positional.push(arg);
    }
  }
  request.query = positional.join(' ');
  return request;
}

function main() {
  const parsed = parseCliArgs(process.argv.slice(2));
  if (parsed.help) {
    console.log('Usage: node fetch-docs.js [query] [--library <id>] [--topic <topic>] [--version <version>] [--url <llms.txt URL>]');
    console.log('Explicit library/topic/url inputs are preferred; query parsing is a compatibility fallback.');
    process.exit(0);
  }
  if (parsed.error || (!parsed.query && !parsed.library && !parsed.url)) {
    console.error(parsed.error || 'Provide a query, --library, or --url.');
    process.exit(1);
  }
  fetchDocs(parsed).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  }).catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
}

if (require.main === module) main();

module.exports = {
  DocsSeekerError,
  fetchDocs,
  buildContext7Url,
  getUrlVariations,
  httpsGet,
  requestUrl,
  normalizeRequest,
};
