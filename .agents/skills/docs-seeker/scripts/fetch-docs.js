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

/**
 * Resolve a URL with timeout, redirect, and response-size bounds.
 * The returned object is intentionally transport-shaped so tests can inject a
 * deterministic transport without contacting the provider.
 */
function requestUrl(url, options = {}) {
  const settings = {
    ...config(),
    ...options,
  };
  settings.timeoutMs = positiveNumber(settings.timeoutMs, DEFAULT_TIMEOUT_MS);
  settings.maxBytes = positiveNumber(settings.maxBytes, DEFAULT_MAX_BYTES);
  settings.maxRedirects = Math.floor(positiveNumber(settings.maxRedirects, DEFAULT_MAX_REDIRECTS));
  const redirectCount = options.redirectCount || 0;
  const parsed = validateUrl(url);
  const requestGet = settings.requestGet || https.get;

  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    const request = requestGet(
      parsed,
      { headers: headersFor(parsed.href, settings.apiKey) },
      (response) => {
        const statusCode = response.statusCode || 0;
        const location = response.headers.location;
        if (statusCode >= 300 && statusCode < 400 && location) {
          response.resume();
          if (redirectCount >= settings.maxRedirects) {
            fail(new DocsSeekerError('redirect-limit', `Too many redirects while fetching ${url}.`));
            return;
          }
          const nextUrl = new URL(location, parsed).href;
          requestUrl(nextUrl, { ...settings, redirectCount: redirectCount + 1 })
            .then(resolve)
            .catch(fail);
          return;
        }

        const chunks = [];
        let size = 0;
        response.on('data', (chunk) => {
          size += chunk.length;
          if (size > settings.maxBytes) {
            request.destroy();
            fail(new DocsSeekerError('response-too-large', `Response exceeded ${settings.maxBytes} bytes.`));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          if (settled) return;
          settled = true;
          resolve({
            statusCode,
            headers: response.headers,
            body: Buffer.concat(chunks).toString('utf8'),
            url: parsed.href,
          });
        });
        response.on('error', fail);
      },
    );

    request.setTimeout(settings.timeoutMs, () => {
      request.destroy();
      fail(new DocsSeekerError('timeout', `Request timed out after ${settings.timeoutMs} ms.`));
    });
    request.on('error', (error) => {
      if (error instanceof DocsSeekerError) fail(error);
      else fail(new DocsSeekerError('network-error', error.message));
    });
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
  const transport = options.transport || request.transport;
  const errors = [];
  for (const url of urls) {
    try {
      const response = transport
        ? await transport(url, { ...settings, headers: headersFor(url, settings.apiKey) })
        : await requestUrl(url, settings);
      const normalizedResponse = typeof response === 'string'
        ? { statusCode: 200, body: response, url }
        : { ...response, url: response.url || url };
      if (normalizedResponse.statusCode === 200 && normalizedResponse.body) {
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
      const code = error.code || 'network-error';
      errors.push({ url, code, statusCode: error.statusCode || statusCode(code) || undefined, message: error.message });
      if (settings.debug) console.error(`[DEBUG] Failed to fetch ${url}: ${error.message}`);
    }
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
