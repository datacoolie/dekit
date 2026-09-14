#!/usr/bin/env node

/** Analyze an llms.txt payload without fetching or mutating anything. */

const PRIORITY_KEYWORDS = {
  critical: [
    'getting-started', 'quick-start', 'quickstart', 'introduction', 'intro', 'overview',
    'installation', 'install', 'setup', 'basics', 'core-concepts', 'fundamentals',
  ],
  supplementary: [
    'advanced', 'internals', 'migration', 'migrate', 'troubleshooting', 'troubleshoot',
    'faq', 'frequently-asked', 'changelog', 'contributing', 'contribute',
  ],
  important: [
    'guide', 'tutorial', 'example', 'api-reference', 'api', 'reference',
    'configuration', 'config', 'routing', 'route', 'data-fetching', 'authentication', 'auth',
  ],
};

function categorizeUrl(url) {
  const urlLower = String(url || '').toLowerCase();
  for (const priority of ['critical', 'supplementary', 'important']) {
    if (PRIORITY_KEYWORDS[priority].some((keyword) => urlLower.includes(keyword))) return priority;
  }
  return 'important';
}

function parseUrls(content) {
  if (!content || typeof content !== 'string') return [];

  const urls = [];
  const seen = new Set();
  const markdownPattern = /\[[^\]]*\]\(\s*(https?:\/\/[^\s)<>]+)\s*\)/gi;
  const plainPattern = /https?:\/\/[^\s<>"')\]]+/gi;
  const add = (value) => {
    const cleaned = value.replace(/[.,;:!?]+$/, '');
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      urls.push(cleaned);
    }
  };

  for (const match of content.matchAll(markdownPattern)) add(match[1]);
  for (const match of content.matchAll(plainPattern)) add(match[0]);
  return urls;
}

function groupByPriority(urls) {
  const groups = { critical: [], important: [], supplementary: [] };
  for (const url of urls || []) groups[categorizeUrl(url)].push(url);
  return groups;
}

/**
 * Return a bounded concurrency hint. It is deliberately a hint: provider
 * limits and task dependencies belong to the caller, not this parser.
 */
function suggestWorkDistribution(urlCount, maxWorkers = 4) {
  const count = Math.max(0, Number(urlCount) || 0);
  const boundedMax = Math.max(1, Math.floor(Number(maxWorkers) || 4));
  if (count <= 3) {
    return {
      workerCount: 1,
      strategy: 'single',
      urlsPerWorker: count,
      bounded: true,
      description: 'Single worker can handle all URLs; the caller controls concurrency.',
    };
  }
  const workers = Math.min(boundedMax, Math.max(1, Math.ceil(count / 4)));
  return {
    workerCount: workers,
    strategy: 'parallel',
    urlsPerWorker: Math.ceil(count / workers),
    bounded: true,
    description: `Bounded suggestion for ${workers} workers; adjust to provider limits and task dependencies.`,
  };
}

function analyzeLlmsTxt(content) {
  const urls = parseUrls(content);
  const grouped = groupByPriority(urls);
  return {
    totalUrls: urls.length,
    urls,
    grouped,
    distribution: suggestWorkDistribution(urls.length),
    summary: {
      critical: grouped.critical.length,
      important: grouped.important.length,
      supplementary: grouped.supplementary.length,
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node analyze-llms-txt.js <content-file-or-stdin>');
    console.error('Or pass - and pipe llms.txt content on stdin.');
    process.exit(1);
  }
  const fs = require('fs');
  try {
    const content = args[0] === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(args[0], 'utf8');
    console.log(JSON.stringify(analyzeLlmsTxt(content), null, 2));
  } catch (error) {
    console.error(`Error: unable to read llms.txt input (${error.code || error.message}).`);
    process.exit(1);
  }
}

if (require.main === module) main();

module.exports = {
  analyzeLlmsTxt,
  parseUrls,
  groupByPriority,
  categorizeUrl,
  suggestWorkDistribution,
};
