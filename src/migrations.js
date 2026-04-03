import { VERSION } from './data.js';

function versionToParts(version) {
  return String(version || '1.0.0').split('.').map(part => Number(part) || 0);
}

function isVersionLessThan(a, b) {
  const pa = versionToParts(a);
  const pb = versionToParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i += 1) {
    const av = pa[i] || 0;
    const bv = pb[i] || 0;
    if (av < bv) return true;
    if (av > bv) return false;
  }
  return false;
}

function cloneRaw(raw) {
  try {
    return JSON.parse(JSON.stringify(raw || {}));
  } catch {
    return {};
  }
}

function migrateTo200(raw) {
  const next = cloneRaw(raw);
  next.upgrades = { ...(next.upgrades || {}) };

  if (Number.isFinite(next.upgrades.so) && !Number.isFinite(next.upgrades.stack)) {
    next.upgrades.stack = next.upgrades.so;
  }
  delete next.upgrades.so;

  if (Number.isFinite(next.upgrades.ex6) && !Number.isFinite(next.upgrades.expansion6)) {
    next.upgrades.expansion6 = next.upgrades.ex6;
  }
  if (Number.isFinite(next.upgrades.ex7) && !Number.isFinite(next.upgrades.expansion7)) {
    next.upgrades.expansion7 = next.upgrades.ex7;
  }
  delete next.upgrades.ex6;
  delete next.upgrades.ex7;

  if (!Array.isArray(next.goals)) next.goals = [];
  if (!Array.isArray(next.contracts)) next.contracts = [];
  if (!next.settings) next.settings = {};
  if (!Number.isFinite(next.prestige)) next.prestige = 0;
  if (!Number.isFinite(next.reputation)) next.reputation = 0;
  if (!Number.isFinite(next.stats?.goalsClaimed)) {
    next.stats = { ...(next.stats || {}), goalsClaimed: 0 };
  }

  next.version = '2.0.0';
  return next;
}

function migrateTo210(raw) {
  const next = cloneRaw(raw);
  next.settings = { ...(next.settings || {}) };
  if (!Number.isFinite(next.settings.volume)) next.settings.volume = 0.75;
  if (typeof next.settings.language !== 'string') next.settings.language = 'pt-BR';
  if (typeof next.settings.pauseOnBlur !== 'boolean') next.settings.pauseOnBlur = true;
  if (!Number.isFinite(next.lastEconomyReliefAt)) next.lastEconomyReliefAt = 0;
  if (!Number.isFinite(next.tutorialStep)) next.tutorialStep = 0;
  if (!Number.isFinite(next.qaVersion)) next.qaVersion = 1;
  next.version = '2.1.0';
  return next;
}

export function migrateState(raw) {
  let migrated = cloneRaw(raw);
  const currentVersion = migrated.version || '1.0.0';

  if (isVersionLessThan(currentVersion, '2.0.0')) {
    migrated = migrateTo200(migrated);
  }
  if (isVersionLessThan(migrated.version || currentVersion, '2.1.0')) {
    migrated = migrateTo210(migrated);
  }

  migrated.version = VERSION;
  return migrated;
}
