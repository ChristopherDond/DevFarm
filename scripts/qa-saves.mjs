import { readFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import { VERSION } from '../src/data.js';
import { normalizeState } from '../src/game.js';
import { migrateState } from '../src/migrations.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function readFixture(name) {
  const filePath = path.join(root, 'qa', 'saves', name);
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function validateCommonState(state, label) {
  assert.equal(state.version, VERSION, `${label}: version mismatch`);
  assert.ok(Array.isArray(state.plots), `${label}: plots should be array`);
  assert.ok(state.plots.length === state.farmSize, `${label}: plots length must match farmSize`);
  assert.ok(state.tokens >= 0 || Number.isFinite(state.tokens), `${label}: tokens invalid`);
  assert.ok(Number.isFinite(state.level) && state.level >= 1, `${label}: level invalid`);
  assert.ok(state.settings && typeof state.settings.language === 'string', `${label}: language missing`);
  assert.ok(state.upgrades && typeof state.upgrades === 'object', `${label}: upgrades missing`);
  assert.ok(state.inv && typeof state.inv === 'object', `${label}: inv missing`);
}

async function run() {
  const fixtures = ['legacy-v1.json', 'legacy-v2.json', 'broken-save.json'];

  for (const fixture of fixtures) {
    const source = await readFixture(fixture);
    const migrated = migrateState(source);
    const normalized = normalizeState(migrated);
    validateCommonState(normalized, fixture);
  }

  console.log('qa:saves OK - migration and normalization passed for all fixtures.');
}

run().catch(error => {
  console.error('qa:saves FAILED');
  console.error(error);
  process.exit(1);
});
