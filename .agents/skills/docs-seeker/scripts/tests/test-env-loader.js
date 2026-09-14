#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { loadEnv, parseEnvFile } = require('../utils/env-loader');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-seeker-env-'));
try {
  const low = path.join(root, 'low.env');
  const high = path.join(root, 'high.env');
  fs.writeFileSync(low, 'VALUE=low\nONLY_LOW=yes\n');
  fs.writeFileSync(high, 'VALUE=high\nONLY_HIGH=yes\n');
  const parsed = parseEnvFile('A="quoted"\nB=plain\n# comment\n');
  assert.deepStrictEqual(parsed, { A: 'quoted', B: 'plain' });
  const loaded = loadEnv({ paths: [low, high], processEnv: { VALUE: 'process', ONLY_PROCESS: 'yes' } });
  assert.deepStrictEqual(loaded, {
    VALUE: 'process',
    ONLY_LOW: 'yes',
    ONLY_HIGH: 'yes',
    ONLY_PROCESS: 'yes',
  });
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
console.log('env-loader tests passed');
