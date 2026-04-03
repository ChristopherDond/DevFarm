const SAVE_PREFIX = 'devfarm.save.';
const META_KEY = 'devfarm.meta';

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function slotKey(slot) {
  return `${SAVE_PREFIX}${slot}`;
}

function normalizeMeta(meta) {
  return Array.isArray(meta) ? meta.filter(item => item && Number.isFinite(item.slot)) : [];
}

function updateMeta(meta) {
  writeJson(META_KEY, normalizeMeta(meta));
}

export function buildSlotSnapshot(state) {
  return {
    version: state.version,
    savedAt: Date.now(),
    state,
  };
}

export function saveSlot(slot, state) {
  const payload = buildSlotSnapshot(state);
  writeJson(slotKey(slot), payload);
  const meta = listMeta();
  const found = meta.find(item => item.slot === slot);
  const next = {
    slot,
    version: state.version,
    savedAt: payload.savedAt,
    level: state.level,
    tokens: state.tokens,
    prestige: state.prestige,
    language: state.settings?.language || 'pt-BR',
  };
  if (found) {
    Object.assign(found, next);
  } else {
    meta.push(next);
  }
  updateMeta(meta);
  return payload;
}

export function loadSlot(slot, normalize) {
  const raw = readJson(slotKey(slot));
  if (!raw) return null;
  const state = normalize(raw.state ?? raw);
  return {
    slot,
    savedAt: raw.savedAt || Date.now(),
    version: raw.version || state.version,
    state,
  };
}

export function deleteSlot(slot) {
  localStorage.removeItem(slotKey(slot));
  const meta = listMeta().filter(item => item.slot !== slot);
  updateMeta(meta);
}

export function listMeta() {
  return normalizeMeta(readJson(META_KEY));
}

export function listSlots(normalize) {
  return [1, 2, 3].map(slot => loadSlot(slot, normalize));
}

export function exportSave(state) {
  return JSON.stringify(buildSlotSnapshot(state), null, 2);
}

export function importSave(rawText, normalize) {
  const parsed = JSON.parse(rawText);
  const state = normalize(parsed.state ?? parsed);
  return {
    version: parsed.version || state.version,
    savedAt: parsed.savedAt || Date.now(),
    state,
  };
}

export function clearAllSaves() {
  [1, 2, 3].forEach(slot => localStorage.removeItem(slotKey(slot)));
  localStorage.removeItem(META_KEY);
}
