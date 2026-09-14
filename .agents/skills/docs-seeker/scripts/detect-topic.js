#!/usr/bin/env node

/**
 * Parse the small amount of query syntax kept for backwards compatibility.
 * New callers should pass library/topic explicitly to fetch-docs.js.
 */

const { loadEnv } = require('./utils/env-loader');

const DEBUG = loadEnv().DEBUG === 'true';

// Keep this list deliberately small. A heuristic must not turn an arbitrary
// word in a request into a provider/library identifier.
const LIBRARY_ALIASES = [
  ['better auth', 'better-auth'],
  ['react query', 'react-query'],
  ['shadcn/ui', 'shadcn/ui'],
  ['next.js', 'next.js'],
  ['nextjs', 'next.js'],
  ['tailwind css', 'tailwindcss'],
  ['tailwindcss', 'tailwindcss'],
  ['pyspark', 'pyspark'],
  ['sqlalchemy', 'sqlalchemy'],
  ['fastapi', 'fastapi'],
  ['django', 'django'],
  ['prisma', 'prisma'],
  ['shadcn', 'shadcn/ui'],
  ['remix', 'remix'],
  ['astro', 'astro'],
  ['react', 'react'],
  ['vue', 'vue'],
  ['svelte', 'svelte'],
  ['angular', 'angular'],
  ['express', 'express'],
  ['vite', 'vite'],
  ['webpack', 'webpack'],
  ['spark', 'spark'],
];

const GENERAL_CUES = /\b(?:documentation|docs|guide|tutorial|api\s+reference|overview|basics|getting\s+started|quick\s*start|introduction)\b/i;
const TOPIC_CUES = /\b(?:strategies|patterns|techniques|methods|approaches|setup|implementation|configuration|configuring|caching|routing|authentication|oauth)\b/i;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTopic(topic) {
  return String(topic || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-$/, '');
}

function normalizeLibrary(library) {
  return String(library || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-\/.@_]/g, '')
    .replace(/\s+/g, '-');
}

function findKnownLibrary(query) {
  const candidates = findKnownLibraries(query);
  return candidates[0] || null;
}

function findKnownLibraries(query) {
  const candidates = [];
  for (const [alias, library] of LIBRARY_ALIASES) {
    const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(alias)}(?=$|[^a-z0-9])`, 'i');
    const match = query.match(pattern);
    if (match) {
      candidates.push({
        alias,
        library,
        index: match.index + match[1].length,
        end: match.index + match[0].length,
      });
    }
  }
  candidates.sort((left, right) => {
    if (left.index !== right.index) return left.index - right.index;
    return right.alias.length - left.alias.length;
  });
  return candidates.filter((candidate) => !candidates.some((other) => (
    other !== candidate
    && other.index <= candidate.index
    && other.end >= candidate.end
    && other.alias.length > candidate.alias.length
  )));
}

function cleanFragment(value) {
  return String(value || '')
    .trim()
    .replace(/^[,;:!?]+|[,;:!?]+$/g, '')
    .trim();
}

function generalQuery(query, libraryMatch) {
  const before = query.slice(0, libraryMatch.index).trim();
  const after = query.slice(libraryMatch.end).trim();
  if (!after && GENERAL_CUES.test(query)) return true;
  if (GENERAL_CUES.test(after) || /^(?:docs?|documentation|guide|tutorial)$/i.test(after)) return true;
  if (/^(?:documentation|docs?|guide|tutorial)\s+for$/i.test(before)) return true;
  if (/^(?:how\s+(?:do\s+i|can\s+i|to)\s+use|learn|use)\s*$/i.test(before) && !after) return true;
  return false;
}

function topicFromLibraryContext(query, libraryMatch) {
  const before = cleanFragment(query.slice(0, libraryMatch.index));
  const after = cleanFragment(query.slice(libraryMatch.end));

  if (generalQuery(query, libraryMatch)) return null;

  // "Library topic strategies" / "Library topic setup".
  let match = after.match(/^(.+?)\s+(?:strategies|patterns|techniques|methods|approaches|setup|implementation|configuration|configuring)$/i);
  if (match) return cleanFragment(match[1]);

  // "How do I use topic in Library", "Using topic with Library", and
  // "Implement topic in Library".
  match = before.match(/^(?:how\s+(?:do\s+i|can\s+i|to)\s+)?(?:use|implement|implementing|add|setup|configure)\s+(?:the\s+)?(.+?)\s+(?:in|with|for|using)$/i);
  if (match) return cleanFragment(match[1]);
  match = before.match(/^using\s+(.+?)\s+(?:in|with|for)$/i);
  if (match) return cleanFragment(match[1]);

  // "How do I configure Prisma for PostgreSQL" keeps the library before
  // the preposition, so the topic is on the right-hand side.
  match = after.match(/^(?:in|with|for|using)\s+(.+)$/i);
  if (match && /\b(?:how|use|implement|add|setup|configure|configuration)\b/i.test(before)) {
    return cleanFragment(match[1]);
  }

  return null;
}

/**
 * Detect a topic only when a known library gives the query an unambiguous
 * anchor. General library queries continue to return null for compatibility.
 */
function detectTopic(query) {
  if (!query || typeof query !== 'string') return null;
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return null;

  const libraryMatch = findKnownLibrary(trimmedQuery);
  if (!libraryMatch) {
    if (TOPIC_CUES.test(trimmedQuery) && DEBUG) {
      console.error('[DEBUG] Topic cue found but no known library; caller must supply --library');
    }
    return null;
  }
  const distinctLibraries = new Set(findKnownLibraries(trimmedQuery).map((item) => item.library));
  if (distinctLibraries.size > 1) return null;

  const topic = normalizeTopic(topicFromLibraryContext(trimmedQuery, libraryMatch));
  if (!topic) return null;

  const result = {
    query: trimmedQuery,
    topic,
    library: libraryMatch.library,
    isTopicSpecific: true,
    source: 'heuristic',
  };

  if (DEBUG) {
    console.error('[DEBUG] Topic:', result.topic);
    console.error('[DEBUG] Library:', result.library);
  }
  return result;
}

function extractLibrary(query) {
  if (!query || typeof query !== 'string') return null;
  const matches = findKnownLibraries(query.trim());
  const distinctLibraries = [...new Set(matches.map((item) => item.library))];
  return distinctLibraries.length === 1 ? distinctLibraries[0] : null;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node detect-topic.js "<user query>"');
    process.exit(1);
  }

  const result = detectTopic(args.join(' '));
  console.log(JSON.stringify(result || { isTopicSpecific: false }, null, 2));
}

if (require.main === module) main();

module.exports = {
  detectTopic,
  extractLibrary,
  findKnownLibrary,
  findKnownLibraries,
  normalizeTopic,
  normalizeLibrary,
};
