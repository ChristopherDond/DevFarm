import { ACHIEVEMENTS, CONTRACT_POOL, CROPS, DEFAULT_SETTINGS, EVENTS, GOALS, UPGRADES, VERSION, cropDesc, cropLabel } from './data.js';
import { migrateState } from './migrations.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createPlot() {
  return { state: 'empty', crop: null, plantedAt: null, progress: 0 };
}

function emptyInventory() {
  return Object.fromEntries(Object.keys(CROPS).map(id => [id, id === 'variable' ? 6 : 0]));
}

function emptyUpgrades() {
  return Object.fromEntries(Object.keys(UPGRADES).map(id => [id, 0]));
}

function emptyStats() {
  return {
    harvested: 0,
    earned: 0,
    bugsFixed: 0,
    mlHarv: 0,
    varHarv: 0,
    planted: 0,
    hackathons: 0,
    contractsClaimed: 0,
    goalsClaimed: 0,
    prestiges: 0,
  };
}

function buildDailyContracts(dayKey) {
  const seed = hashString(dayKey);
  const pool = CONTRACT_POOL.map(item => ({ ...item }));
  let rng = seed || 1;
  const rand = () => {
    rng ^= rng << 13;
    rng ^= rng >>> 17;
    rng ^= rng << 5;
    return (rng >>> 0) / 4294967296;
  };
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3).map(contract => ({
    ...contract,
    progress: 0,
    claimed: false,
  }));
}

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getUnlockableCount(state) {
  return Object.keys(CROPS).filter(id => state.level >= CROPS[id].lv).length;
}

export function getPrestigeMultiplier(state) {
  return 1 + state.prestige * 0.12;
}

export function getReputationMultiplier(state) {
  return 1 + clamp(state.reputation || 0, 0, 25) * 0.02;
}

export function getSpeedMultiplier(state) {
  let multiplier = 1 + state.upgrades.coffee * 0.25 + state.prestige * 0.04;
  if (state.upgrades.greenhouse > 0) multiplier *= 1.05 + state.upgrades.greenhouse * 0.05;
  if (Date.now() < state.refactorUntil) multiplier *= 2;
  return multiplier;
}

export function getYieldMultiplier(state) {
  let multiplier = 1 + state.upgrades.gpu * 0.5 + state.prestige * 0.15;
  multiplier *= getReputationMultiplier(state);
  if (state.upgrades.greenhouse > 0) multiplier *= 1.08 + state.upgrades.greenhouse * 0.04;
  if (state.reviewBonus) multiplier *= 2;
  if (state.hackathonBonus) multiplier *= 1.5;
  return multiplier;
}

export function getXpMultiplier(state) {
  let multiplier = 1;
  if (state.upgrades.stack) multiplier *= 2;
  if (state.hackathonBonus) multiplier *= 3;
  if (state.prestige > 0) multiplier *= 1 + Math.min(state.prestige, 10) * 0.03;
  return multiplier;
}

export function getContractMultiplier(state) {
  return 1 + state.upgrades.network * 0.25 + state.prestige * 0.05;
}

export function getBugChance(state) {
  const shield = Date.now() < state.bugShieldUntil ? 0.03 : 0;
  return Math.max(0.01, 0.09 - state.upgrades.linter * 0.025 - shield);
}

export function createDefaultState() {
  return {
    version: VERSION,
    tokens: 20,
    level: 1,
    xp: 0,
    xpToNext: 50,
    prestige: 0,
    reputation: 0,
    farmSize: 25,
    farmCols: 5,
    selectedCrop: 'variable',
    activeTab: 'shop',
    menuOpen: true,
    menuSection: 'home',
    paused: true,
    tutorialDismissed: false,
    activeEvent: null,
    reviewBonus: false,
    hackathonBonus: false,
    refactorUntil: 0,
    bugShieldUntil: 0,
    nextEventAt: Date.now() + 40000,
    contractDay: '',
    dailyBonusClaimed: false,
    lastSeen: Date.now(),
    lastEconomyReliefAt: 0,
    tutorialStep: 0,
    qaVersion: 1,
    settings: { ...DEFAULT_SETTINGS },
    stats: emptyStats(),
    upgrades: emptyUpgrades(),
    inv: emptyInventory(),
    plots: Array.from({ length: 25 }, createPlot),
    contracts: [],
    goals: GOALS.map(goal => ({ ...goal, claimed: false, progress: 0 })),
    achievements: [],
    status: 'farm.init() -> OK',
    toastSeed: 0,
  };
}

export function normalizeState(raw) {
  const migrated = migrateState(raw);
  const base = createDefaultState();
  const state = {
    ...base,
    ...(migrated || {}),
    settings: { ...base.settings, ...(migrated?.settings || {}) },
    stats: { ...emptyStats(), ...(migrated?.stats || {}) },
    upgrades: { ...emptyUpgrades(), ...(migrated?.upgrades || {}) },
    inv: { ...emptyInventory(), ...(migrated?.inv || {}) },
    achievements: Array.isArray(migrated?.achievements) ? migrated.achievements.slice() : [],
    contracts: Array.isArray(migrated?.contracts) ? migrated.contracts.slice() : [],
    goals: Array.isArray(migrated?.goals)
      ? migrated.goals.map(goal => ({ ...goal, claimed: !!goal.claimed, progress: Number(goal.progress) || 0 }))
      : base.goals.map(goal => ({ ...goal })),
    plots: Array.isArray(migrated?.plots) ? migrated.plots.slice() : [],
  };

  state.version = VERSION;
  state.tokens = Number.isFinite(state.tokens) ? state.tokens : base.tokens;
  state.level = Number.isFinite(state.level) && state.level >= 1 ? state.level : base.level;
  state.xp = Number.isFinite(state.xp) && state.xp >= 0 ? state.xp : base.xp;
  state.xpToNext = Number.isFinite(state.xpToNext) && state.xpToNext > 0 ? state.xpToNext : base.xpToNext;
  state.prestige = Number.isFinite(state.prestige) && state.prestige >= 0 ? state.prestige : base.prestige;
  state.reputation = Number.isFinite(state.reputation) && state.reputation >= 0 ? state.reputation : base.reputation;
  state.farmCols = [5, 6, 7].includes(state.farmCols) ? state.farmCols : base.farmCols;
  state.farmSize = [25, 36, 49].includes(state.farmSize) ? state.farmSize : state.farmCols * state.farmCols;
  state.selectedCrop = CROPS[state.selectedCrop] ? state.selectedCrop : 'variable';
  state.activeTab = ['shop', 'upgrades', 'contracts', 'goals', 'stats', 'saves', 'achievements', 'tutorial'].includes(state.activeTab)
    ? state.activeTab
    : base.activeTab;
  state.menuSection = ['home', 'options', 'saves', 'prestige', 'help'].includes(state.menuSection) ? state.menuSection : base.menuSection;
  state.menuOpen = !!state.menuOpen;
  state.paused = !!state.paused;
  state.tutorialDismissed = !!state.tutorialDismissed;
  state.reviewBonus = !!state.reviewBonus;
  state.hackathonBonus = !!state.hackathonBonus;
  state.refactorUntil = Number.isFinite(state.refactorUntil) ? state.refactorUntil : 0;
  state.bugShieldUntil = Number.isFinite(state.bugShieldUntil) ? state.bugShieldUntil : 0;
  state.nextEventAt = Number.isFinite(state.nextEventAt) ? state.nextEventAt : Date.now() + 40000;
  state.contractDay = typeof state.contractDay === 'string' ? state.contractDay : '';
  state.dailyBonusClaimed = !!state.dailyBonusClaimed;
  state.lastSeen = Number.isFinite(state.lastSeen) ? state.lastSeen : Date.now();
  state.lastEconomyReliefAt = Number.isFinite(state.lastEconomyReliefAt) ? state.lastEconomyReliefAt : 0;
  state.tutorialStep = Number.isFinite(state.tutorialStep) ? state.tutorialStep : 0;
  state.qaVersion = Number.isFinite(state.qaVersion) ? state.qaVersion : 1;
  state.status = typeof state.status === 'string' ? state.status : base.status;

  const plots = state.plots.slice(0, state.farmSize).map(plot => {
    const next = { ...createPlot(), ...(plot || {}) };
    if (!['empty', 'growing', 'ready', 'bugged'].includes(next.state)) return createPlot();
    if (next.state !== 'empty' && !CROPS[next.crop]) return createPlot();
    if (next.state === 'growing' && !Number.isFinite(next.plantedAt)) next.plantedAt = Date.now();
    return next;
  });
  while (plots.length < state.farmSize) plots.push(createPlot());
  state.plots = plots;

  state.contracts = state.contracts.length ? state.contracts : buildDailyContracts(new Date(state.lastSeen).toDateString());
  state.goals = state.goals.map(goal => ({ ...goal, claimed: !!goal.claimed, progress: Number(goal.progress) || 0 }));

  refreshDerivedState(state);
  return state;
}

export function refreshDerivedState(state) {
  const day = new Date().toDateString();
  if (!state.contractDay || state.contractDay !== day || !Array.isArray(state.contracts) || state.contracts.length !== 3) {
    state.contractDay = day;
    state.contracts = buildDailyContracts(day);
    state.dailyBonusClaimed = false;
  }

  state.contracts = state.contracts.map(contract => ({
    ...contract,
    progress: Math.min(contract.goal, getContractValue(state, contract)),
    claimed: !!contract.claimed,
  }));

  state.goals = state.goals.map(goal => ({
    ...goal,
    progress: getGoalProgress(state, goal),
  }));
}

export function getGoalProgress(state, goal) {
  if (goal.key === 'unlockAll') return getUnlockableCount(state) >= Object.keys(CROPS).length ? 1 : 0;
  if (goal.key === 'prestige') return state.prestige;
  if (goal.key === 'level') return state.level;
  return Number(state.stats[goal.key] || 0);
}

export function getContractValue(state, contract) {
  if (contract.key === 'level') return state.level;
  if (contract.key === 'prestige') return state.prestige;
  return Number(state.stats[contract.key] || 0);
}

function awardXp(state, amount, deps) {
  const gained = Math.round(amount * getXpMultiplier(state));
  state.xp += gained;
  let leveled = false;
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level += 1;
    state.xpToNext = Math.round(50 * Math.pow(1.39, state.level - 1));
    leveled = true;
    deps.notify?.('ok', `Lv.${state.level}`);
    Object.values(CROPS).forEach(crop => {
      if (crop.lv === state.level) deps.notify?.('info', `${crop.emoji} ${cropLabel(crop, state.settings.language)} ${deps.t('ready') || 'unlocked'}`);
    });
  }
  if (leveled) deps.play?.('level');
}

function addTokens(state, amount) {
  state.tokens += amount;
  if (amount > 0) state.stats.earned += amount;
}

function applyReward(state, reward, deps) {
  if (!reward) return;
  if (typeof reward.tokens === 'number') addTokens(state, reward.tokens);
  if (typeof reward.xp === 'number') awardXp(state, reward.xp, deps);
  if (typeof reward.reputation === 'number') state.reputation = Math.max(0, state.reputation + reward.reputation);
  if (typeof reward.bugsFixed === 'number') state.stats.bugsFixed += reward.bugsFixed;
  if (reward.reviewBonus) state.reviewBonus = true;
  if (reward.hackathonBonus) {
    state.hackathonBonus = true;
    state.stats.hackathons += 1;
  }
  if (reward.harvestAll) state.plots.forEach((plot, index) => { if (plot.state === 'ready') harvest(state, index, deps); });
  if (typeof reward.refactorMinutes === 'number') state.refactorUntil = Date.now() + reward.refactorMinutes * 60_000;
  if (typeof reward.linterBoost === 'number') state.bugShieldUntil = Date.now() + reward.linterBoost * 5 * 60_000;
  if (typeof reward.prestige === 'number') state.prestige += reward.prestige;
}

export function plant(state, index, deps) {
  const cropId = state.selectedCrop;
  const crop = CROPS[cropId];
  if (!crop) return;
  if (state.level < crop.lv) {
    deps.notify?.('err', `${cropLabel(crop, state.settings.language)} Lv.${crop.lv}`);
    return;
  }
  if (!state.inv[cropId] || state.inv[cropId] <= 0) {
    deps.notify?.('warn', `${cropLabel(crop, state.settings.language)} x0`);
    return;
  }
  const plot = state.plots[index];
  if (!plot || plot.state !== 'empty') return;
  state.inv[cropId] -= 1;
  state.plots[index] = { state: 'growing', crop: cropId, plantedAt: Date.now(), progress: 0 };
  state.stats.planted += 1;
  if (state.tutorialStep < 1) state.tutorialStep = 1;
  state.status = `${cropLabel(crop, state.settings.language)} planted`;
  deps.play?.('plant');
}

export function harvest(state, index, deps) {
  const plot = state.plots[index];
  if (!plot || !plot.crop) return;
  const crop = CROPS[plot.crop];
  const baseYield = Math.round(crop.y * getYieldMultiplier(state));
  const baseXp = Math.round(crop.t / 5);
  addTokens(state, baseYield);
  awardXp(state, baseXp, deps);
  state.stats.harvested += 1;
  if (plot.crop === 'ml_model') state.stats.mlHarv += 1;
  if (plot.crop === 'variable') state.stats.varHarv += 1;
  if (state.tutorialStep < 2) state.tutorialStep = 2;
  state.plots[index] = createPlot();
  state.reviewBonus = false;
  state.hackathonBonus = false;
  state.status = `+${baseYield} tokens`;
  deps.play?.('harvest');
  checkAchievements(state, deps);
  refreshDerivedState(state);
}

export function fixBug(state, index, deps) {
  state.plots[index] = createPlot();
  state.stats.bugsFixed += 1;
  addTokens(state, 8);
  state.status = 'bug fixed';
  deps.play?.('bug');
  checkAchievements(state, deps);
}

export function buySeed(state, cropId, deps) {
  const crop = CROPS[cropId];
  if (!crop) return;
  if (state.level < crop.lv) {
    deps.notify?.('err', `${cropLabel(crop, state.settings.language)} Lv.${crop.lv}`);
    return;
  }
  if (state.tokens < crop.cost) {
    deps.notify?.('err', 'Not enough tokens');
    return;
  }
  state.tokens -= crop.cost;
  state.inv[cropId] = (state.inv[cropId] || 0) + 1;
  if (state.tutorialStep < 3) state.tutorialStep = 3;
  state.status = `Bought ${cropLabel(crop, state.settings.language)}`;
  deps.play?.('buy');
}

function canBuyUpgrade(state, upgradeId) {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) return false;
  return upgrade.req.every(req => (state.upgrades[req] || 0) >= 1);
}

export function buyUpgrade(state, upgradeId, deps) {
  const upgrade = UPGRADES[upgradeId];
  if (!upgrade) return;
  if (!canBuyUpgrade(state, upgradeId)) {
    deps.notify?.('warn', 'Upgrade tree locked');
    return;
  }
  const current = state.upgrades[upgradeId] || 0;
  if (current >= upgrade.max) {
    deps.notify?.('warn', 'Max level reached');
    return;
  }
  const cost = upgrade.costs[current];
  if (state.tokens < cost) {
    deps.notify?.('err', `Need ${cost} tokens`);
    return;
  }
  state.tokens -= cost;
  state.upgrades[upgradeId] = current + 1;
  if (state.tutorialStep < 4) state.tutorialStep = 4;
  state.status = `${upgradeLabel(upgrade, state.settings.language)} upgraded`;
  deps.play?.('buy');

  if (upgrade.effect === 'expand6' && state.farmCols < 6) {
    expandFarm(state, 6);
  }
  if (upgrade.effect === 'expand7' && state.farmCols < 7) {
    expandFarm(state, 7);
  }
  checkAchievements(state, deps);
  refreshDerivedState(state);
}

function expandFarm(state, cols) {
  const size = cols * cols;
  while (state.plots.length < size) state.plots.push(createPlot());
  state.farmCols = cols;
  state.farmSize = size;
}

function upgradeLabel(upgrade, lang) {
  return upgrade.name[lang] || upgrade.name.en || upgrade.name['pt-BR'];
}

export function claimContract(state, index, deps) {
  refreshDerivedState(state);
  const contract = state.contracts[index];
  if (!contract || contract.claimed || contract.progress < contract.goal) return;
  const mult = getContractMultiplier(state);
  const tokens = Math.round(contract.rewardTok * mult);
  const xp = Math.round(contract.rewardXp * mult);
  const rep = Math.max(1, Math.round(contract.rewardRep * mult));
  contract.claimed = true;
  addTokens(state, tokens);
  state.reputation += rep;
  state.stats.contractsClaimed += 1;
  awardXp(state, xp, deps);
  state.status = `Contract completed`;
  deps.notify?.('ach', `📋 ${contract.name[state.settings.language] || contract.name.en}`);
  deps.play?.('buy');
  if (!state.dailyBonusClaimed && state.contracts.every(item => item.claimed)) {
    state.dailyBonusClaimed = true;
    addTokens(state, 150);
    state.reputation += 1;
    awardXp(state, 100, deps);
    deps.notify?.('ok', 'Daily set complete');
  }
  refreshDerivedState(state);
}

export function claimGoal(state, index, deps) {
  refreshDerivedState(state);
  const goal = state.goals[index];
  if (!goal || goal.claimed || goal.progress < goal.goal) return;
  goal.claimed = true;
  state.stats.goalsClaimed += 1;
  const rewardMult = state.upgrades.observability ? 1.5 : 1;
  if (goal.reward.tokens) addTokens(state, Math.round(goal.reward.tokens * rewardMult));
  if (goal.reward.prestige) state.prestige += goal.reward.prestige;
  if (goal.reward.reputation) state.reputation += goal.reward.reputation;
  if (goal.reward.xp) awardXp(state, goal.reward.xp, deps);
  state.status = `Goal claimed`;
  deps.notify?.('ach', `🏁 ${goal.name[state.settings.language] || goal.name.en}`);
  deps.play?.('level');
  refreshDerivedState(state);
}

export function maybeTriggerEvent(state, deps, now = Date.now()) {
  if (state.menuOpen || state.paused || state.activeEvent) return;
  if (now < state.nextEventAt) return;
  const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  state.activeEvent = {
    ...event,
    openedAt: now,
    pausedBefore: state.paused,
  };
  state.paused = true;
  state.status = event.title[state.settings.language] || event.title.en;
  deps.play?.('event');
}

export function chooseEvent(state, choiceId, deps) {
  const event = state.activeEvent;
  if (!event) return;
  const choice = event.choices.find(item => item.id === choiceId);
  if (!choice) return;
  applyReward(state, choice.reward, deps);
  state.activeEvent = null;
  state.paused = state.menuOpen;
  state.nextEventAt = Date.now() + 25000 + Math.random() * 30000;
  state.status = deps.t('eventClosed');
  deps.notify?.('info', deps.t('eventClosed'));
}

export function prestigeReset(state, deps) {
  if (state.level < 15) {
    deps.notify?.('warn', 'Need level 15');
    return false;
  }
  const gained = Math.max(1, Math.floor(state.level / 10) + Math.floor(state.reputation / 5));
  state.prestige += gained;
  state.stats.prestiges += 1;
  state.tokens = 20;
  state.level = 1;
  state.xp = 0;
  state.xpToNext = 50;
  state.reputation = 0;
  state.selectedCrop = 'variable';
  state.farmCols = 5;
  state.farmSize = 25;
  state.plots = Array.from({ length: 25 }, createPlot);
  state.upgrades = emptyUpgrades();
  state.inv = emptyInventory();
  state.activeEvent = null;
  state.reviewBonus = false;
  state.hackathonBonus = false;
  state.refactorUntil = 0;
  state.bugShieldUntil = 0;
  state.nextEventAt = Date.now() + 40000;
  state.contractDay = '';
  state.contracts = [];
  state.dailyBonusClaimed = false;
  state.menuOpen = true;
  state.menuSection = 'home';
  state.paused = true;
  state.status = `Prestige +${gained}`;
  refreshDerivedState(state);
  deps.play?.('prestige');
  deps.notify?.('ach', `♻️ +${gained} prestige`);
  return true;
}

export function togglePause(state, paused) {
  state.paused = typeof paused === 'boolean' ? paused : !state.paused;
}

export function openMenu(state, section = 'home') {
  state.menuSection = section;
  state.menuOpen = true;
  state.paused = true;
}

export function closeMenu(state) {
  state.menuOpen = false;
  state.paused = !!state.activeEvent;
}

export function dismissTutorial(state) {
  state.tutorialDismissed = true;
  state.tutorialStep = Math.max(4, state.tutorialStep || 0);
}

export function getTutorialProgress(state) {
  return Math.max(0, Math.min(4, Number(state.tutorialStep) || 0));
}

function maybeGrantEconomyRelief(state, deps, now) {
  const seedStock = Object.values(state.inv || {}).reduce((acc, qty) => acc + (Number(qty) || 0), 0);
  const needsRelief = state.level >= 6 && state.level <= 16 && state.tokens < 25 && seedStock <= 1;
  if (!needsRelief) return false;
  if (now - state.lastEconomyReliefAt < 120000) return false;

  const bonus = Math.round(20 + state.level * 3);
  state.tokens += bonus;
  state.stats.earned += bonus;
  state.lastEconomyReliefAt = now;
  deps.notify?.('info', `Budget patch: +${bonus} tokens`);
  return true;
}

export function setLanguage(state, language) {
  state.settings.language = language;
}

export function setSelectedCrop(state, cropId) {
  if (CROPS[cropId]) state.selectedCrop = cropId;
}

export function setActiveTab(state, tab) {
  state.activeTab = tab;
}

export function setVolume(state, value) {
  state.settings.volume = clamp(Number(value) || 0, 0, 1);
}

export function applySaveTimestamp(state) {
  state.lastSeen = Date.now();
}

export function tick(state, deps, now = Date.now()) {
  let changed = false;
  refreshDerivedState(state);

  if (maybeGrantEconomyRelief(state, deps, now)) {
    changed = true;
  }

  state.plots.forEach((plot, index) => {
    if (plot.state !== 'growing') return;
    const crop = CROPS[plot.crop];
    const elapsed = (now - plot.plantedAt) / 1000;
    const total = Math.max(5, Math.round(crop.t / getSpeedMultiplier(state)));
    plot.progress = clamp(elapsed / total, 0, 1);
    if (plot.progress >= 1) {
      if (state.upgrades.ci_cd) {
        harvest(state, index, deps);
      } else {
        plot.state = 'ready';
      }
      changed = true;
    }
  });

  if (!state.paused && !state.menuOpen && !state.activeEvent && now >= state.nextEventAt) {
    maybeTriggerEvent(state, deps, now);
    state.nextEventAt = now + 25000 + Math.random() * 30000;
    changed = true;
  }

  if (now > state.refactorUntil && state.refactorUntil !== 0 && now - state.refactorUntil > 1) {
    state.refactorUntil = 0;
    changed = true;
  }

  if (now > state.bugShieldUntil && state.bugShieldUntil !== 0 && now - state.bugShieldUntil > 1) {
    state.bugShieldUntil = 0;
    changed = true;
  }

  return changed;
}

export function hasUnlockedAllCrops(state) {
  return getUnlockableCount(state) >= Object.keys(CROPS).length;
}

export function checkAchievements(state, deps) {
  ACHIEVEMENTS.forEach(achievement => {
    if (!state.achievements.includes(achievement.id) && achievement.chk(state)) {
      state.achievements.push(achievement.id);
      deps.notify?.('ach', `${achievement.emoji} ${achievement.name[state.settings.language] || achievement.name.en}`);
    }
  });
  refreshDerivedState(state);
}

export function createStateSummary(state) {
  return {
    version: state.version,
    level: state.level,
    tokens: state.tokens,
    prestige: state.prestige,
    language: state.settings.language,
    savedAt: state.lastSeen,
  };
}

export { cropDesc, cropLabel };
