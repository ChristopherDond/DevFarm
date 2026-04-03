import { ACHIEVEMENTS, CROPS, UPGRADES, cropDesc, cropLabel } from './data.js';
import { getPrestigeMultiplier, getSpeedMultiplier, getTutorialProgress, getUnlockableCount, hasUnlockedAllCrops } from './game.js';
import { t } from './i18n.js';

function fmt(value) {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${Math.round(value)}`;
}

function fmtTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return minutes > 0 ? `${minutes}m${String(secs).padStart(2, '0')}s` : `${secs}s`;
}

function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

function createShell() {
  return `
    <div class="app">
      <header class="topbar">
        <div class="brand">
          <h1>DevFarm</h1>
          <small>// v2.0.0</small>
          <button class="iconBtn" data-action="openMenu" data-section="home" aria-label="menu">☰</button>
        </div>
        <div class="hud">
          <div class="pill">💰 <strong id="hudTokens">0</strong></div>
          <div class="pill">REP <strong id="hudRep">0</strong></div>
          <div class="pill">PST <strong id="hudPrestige">0</strong></div>
          <div class="pill">LV <strong id="hudLevel">1</strong></div>
          <div class="xpwrap">
            <div class="xpbar"><div class="xpfill" id="hudXp"></div></div>
            <div class="xplabel"><span id="hudXpCur">0</span>/<span id="hudXpMax">50</span></div>
          </div>
        </div>
      </header>

      <main class="main">
        <section class="farmPane">
          <div class="sectionTitle" id="farmTitle"></div>
          <div class="farmGrid" id="farmGrid"></div>
        </section>
        <aside class="sidePane">
          <div class="panel">
            <div class="sectionTitle" id="seedTitle"></div>
            <div id="seedGrid" class="seedGrid"></div>
            <div class="seedInfo" id="seedInfo"></div>
          </div>
          <div class="panel">
            <div class="tabbar" id="tabbar"></div>
          </div>
          <div class="panel" id="tabContent"></div>
        </aside>
      </main>

      <footer class="bottombar">
        <div class="statusFlag"><span class="blink">●</span> <span id="statusText"></span></div>
        <div id="statusRight"></div>
      </footer>

      <div id="toastWrap" class="toastWrap" aria-live="polite"></div>
      <div id="menuLayer" class="menuOverlay hidden"></div>
      <div id="eventLayer" class="eventOverlay hidden"></div>
      <input id="importFile" type="file" accept="application/json" hidden>
    </div>
  `;
}

function getUnlockedSeedCount(state) {
  return Object.keys(CROPS).filter(id => state.level >= CROPS[id].lv).length;
}

function renderSeedGrid(state) {
  const lang = state.settings.language;
  return Object.entries(CROPS).map(([id, crop]) => {
    const unlocked = state.level >= crop.lv;
    const active = state.selectedCrop === id;
    const count = state.inv[id] || 0;
    return `
      <button type="button" class="seedBtn ${active ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-action="selectCrop" data-crop="${id}" style="--seed-color:${crop.color}" ${unlocked ? '' : 'disabled'} aria-label="${cropLabel(crop, lang)}">
        <div class="seedEmoji">${crop.emoji}</div>
        <div class="seedCount">${unlocked ? count : '🔒'}</div>
        ${unlocked ? '' : '<div class="seedLock">🔒</div>'}
      </button>
    `;
  }).join('');
}

function renderSeedInfo(state) {
  const crop = CROPS[state.selectedCrop];
  const lang = state.settings.language;
  const unlocked = state.level >= crop.lv;
  const speed = getSpeedMultiplier(state);
  return `
    <div class="seedName" style="color:${crop.color}">${crop.emoji} ${cropLabel(crop, lang)}</div>
    <div class="seedDesc">${cropDesc(crop, lang)}</div>
    ${unlocked ? `
      <div class="seedStats">
        <div>Yield: <span>${fmt(crop.y)}</span></div>
        <div>Time: <span>${fmtTime(Math.max(5, Math.round(crop.t / speed)))}</span></div>
        <div>Owned: <span>${fmt(state.inv[state.selectedCrop] || 0)}</span></div>
        <div>Cost: <span>${fmt(crop.cost)}</span></div>
      </div>
    ` : `<div class="muted">Lv.${crop.lv} required.</div>`}
  `;
}

function renderFarm(state) {
  const lang = state.settings.language;
  return state.plots.map((plot, index) => {
    const crop = plot.crop ? CROPS[plot.crop] : null;
    const cls = `plot ${plot.state}`;
    if (plot.state === 'empty') {
      return `
        <button type="button" class="${cls}" data-action="plotClick" data-index="${index}" aria-label="Plot ${index + 1}">
          <div class="plotEmoji">+</div>
          <div class="plotMeta">${index + 1}</div>
        </button>
      `;
    }
    if (plot.state === 'bugged') {
      return `
        <button type="button" class="${cls}" data-action="plotClick" data-index="${index}" aria-label="Plot ${index + 1}">
          <div class="plotEmoji">🐛</div>
          <div class="plotBug">DEBUG</div>
        </button>
      `;
    }
    if (plot.state === 'ready') {
      return `
        <button type="button" class="${cls}" data-action="plotClick" data-index="${index}" aria-label="Plot ${index + 1}">
          <div class="plotEmoji">${crop.emoji}</div>
          <div class="plotReady">HARVEST</div>
          <div class="plotBar"><div style="width:100%; background:${crop.color}"></div></div>
        </button>
      `;
    }
    const total = Math.max(5, Math.round(crop.t / getSpeedMultiplier(state)));
    const elapsed = Math.max(0, Math.min(total, (Date.now() - plot.plantedAt) / 1000));
    const progress = Math.min(1, plot.progress || elapsed / total);
    const remaining = Math.max(0, total - elapsed);
    return `
      <button type="button" class="${cls}" data-action="plotClick" data-index="${index}" aria-label="Plot ${index + 1}">
        <div class="plotEmoji">${crop.emoji}</div>
        <div class="plotMeta" style="color:${crop.color}">${crop.sym}</div>
        <div class="plotTimer">${fmtTime(remaining)}</div>
        <div class="plotBar"><div style="width:${(progress * 100).toFixed(1)}%; background:${crop.color}"></div></div>
      </button>
    `;
  }).join('');
}

function renderTabs(state) {
  const tabs = ['shop', 'upgrades', 'contracts', 'goals', 'stats', 'saves', 'achievements', 'tutorial'];
  return tabs.map(tab => `
    <button type="button" class="tabBtn ${state.activeTab === tab ? 'active' : ''}" data-action="setTab" data-tab="${tab}">${t(state, tab)}</button>
  `).join('');
}

function renderShop(state) {
  const lang = state.settings.language;
  return Object.entries(CROPS).map(([id, crop]) => {
    const unlocked = state.level >= crop.lv;
    const affordable = state.tokens >= crop.cost && unlocked;
    return `
      <button type="button" class="actionBtn" data-action="buySeed" data-crop="${id}" ${affordable ? '' : 'disabled'}>
        <div class="actionRow">
          <div>
            <div class="actionTitle" style="color:${crop.color}">${crop.emoji} ${cropLabel(crop, lang)}</div>
            <div class="actionDesc">${unlocked ? cropDesc(crop, lang) : `Lv.${crop.lv} required`}</div>
          </div>
          <div class="tag ${affordable ? 'good' : 'warn'}">${fmt(crop.cost)} 💰</div>
        </div>
        <div class="muted">Owned: ${fmt(state.inv[id] || 0)}</div>
      </button>
    `;
  }).join('');
}

function renderUpgrades(state) {
  const lang = state.settings.language;
  return Object.entries(UPGRADES).map(([id, upgrade]) => {
    const current = state.upgrades[id] || 0;
    const maxed = current >= upgrade.max;
    const cost = upgrade.costs[current];
    const unlocked = upgrade.req.every(req => (state.upgrades[req] || 0) >= 1);
    const affordable = unlocked && !maxed && state.tokens >= cost;
    const dots = Array.from({ length: upgrade.max }, (_, i) => `<span class="tag ${i < current ? 'good' : ''}">●</span>`).join(' ');
    return `
      <button type="button" class="actionBtn" data-action="buyUpgrade" data-upgrade="${id}" ${affordable ? '' : 'disabled'}>
        <div class="actionRow">
          <div>
            <div class="actionTitle">${upgrade.emoji} ${upgrade.name[lang] || upgrade.name.en}</div>
            <div class="actionDesc">${upgrade.desc[lang] || upgrade.desc.en}</div>
          </div>
          <div class="tag ${maxed ? 'good' : affordable ? 'warn' : 'bad'}">${maxed ? 'MAX' : `${fmt(cost)} 💰`}</div>
        </div>
        <div class="muted">${upgrade.req.length ? `Req: ${upgrade.req.map(req => UPGRADES[req].name[lang] || UPGRADES[req].name.en).join(', ')}` : 'No prereqs'}</div>
        <div class="muted">${dots}</div>
      </button>
    `;
  }).join('');
}

function renderContracts(state) {
  const lang = state.settings.language;
  return state.contracts.map((contract, index) => {
    const done = contract.progress >= contract.goal;
    const pct = Math.min(100, (contract.progress / contract.goal) * 100);
    return `
      <button type="button" class="actionBtn" data-action="claimContract" data-index="${index}" ${done && !contract.claimed ? '' : 'disabled'}>
        <div class="actionRow">
          <div>
            <div class="actionTitle">${contract.emoji} ${contract.name[lang] || contract.name.en}</div>
            <div class="actionDesc">${contract.desc[lang] || contract.desc.en}</div>
          </div>
          <div class="tag ${contract.claimed ? '' : done ? 'good' : 'warn'}">${contract.claimed ? 'CLAIMED' : done ? 'CLAIM' : `${contract.progress}/${contract.goal}`}</div>
        </div>
        <div class="bar"><div style="width:${pct.toFixed(1)}%"></div></div>
      </button>
    `;
  }).join('');
}

function renderGoals(state) {
  const lang = state.settings.language;
  return state.goals.map((goal, index) => {
    const done = goal.progress >= goal.goal;
    const pct = Math.min(100, (goal.progress / goal.goal) * 100);
    const rewardText = Object.entries(goal.reward || {}).map(([key, value]) => `${key}:${value}`).join(' • ');
    return `
      <button type="button" class="actionBtn" data-action="claimGoal" data-index="${index}" ${done && !goal.claimed ? '' : 'disabled'}>
        <div class="actionRow">
          <div>
            <div class="actionTitle">${goal.name[lang] || goal.name.en}</div>
            <div class="actionDesc">${goal.desc[lang] || goal.desc.en}</div>
          </div>
          <div class="tag ${goal.claimed ? '' : done ? 'good' : 'warn'}">${goal.claimed ? 'CLAIMED' : done ? 'CLAIM' : `${goal.progress}/${goal.goal}`}</div>
        </div>
        <div class="bar"><div style="width:${pct.toFixed(1)}%"></div></div>
        <div class="muted">${rewardText}</div>
      </button>
    `;
  }).join('');
}

function renderStats(state) {
  const goalsDone = state.goals.filter(goal => goal.claimed).length;
  return `
    <div class="statGrid">
      <div class="statCard"><div class="statLabel">Harvested</div><div class="statValue" style="color:var(--green)">${fmt(state.stats.harvested)}</div></div>
      <div class="statCard"><div class="statLabel">Tokens earned</div><div class="statValue" style="color:var(--yellow)">${fmt(state.stats.earned)}</div></div>
      <div class="statCard"><div class="statLabel">Bugs fixed</div><div class="statValue" style="color:var(--red)">${fmt(state.stats.bugsFixed)}</div></div>
      <div class="statCard"><div class="statLabel">Reputation</div><div class="statValue" style="color:var(--purple)">${fmt(state.reputation)}</div></div>
      <div class="statCard"><div class="statLabel">Prestige</div><div class="statValue" style="color:var(--cyan)">${fmt(state.prestige)}</div></div>
      <div class="statCard"><div class="statLabel">Goals claimed</div><div class="statValue" style="color:var(--blue)">${fmt(goalsDone)}</div></div>
    </div>
    <div style="margin-top:10px" class="muted">Prestige multiplier: x${getPrestigeMultiplier(state).toFixed(2)}</div>
    <div class="muted">Unlocked crops: ${getUnlockableCount(state)}/${Object.keys(CROPS).length}</div>
    <div class="muted">All crops unlocked: ${hasUnlockedAllCrops(state) ? 'yes' : 'no'}</div>
  `;
}

function renderLiveIndicators(state) {
  const tags = [];
  if (state.paused) tags.push('<span class="tag warn">PAUSED</span>');
  if (state.activeEvent) tags.push('<span class="tag bad">EVENT</span>');
  if (state.reviewBonus) tags.push('<span class="tag good">REVIEW x2</span>');
  if (state.hackathonBonus) tags.push('<span class="tag good">HACKATHON</span>');
  if (Date.now() < state.refactorUntil) tags.push('<span class="tag">REFACTOR BOOST</span>');
  if (Date.now() < state.bugShieldUntil) tags.push('<span class="tag good">BUG SHIELD</span>');
  if (state.level >= 15) tags.push('<span class="tag">PRESTIGE READY</span>');

  if (!tags.length) return '<span class="muted">No active modifiers</span>';
  return tags.join(' ');
}

function renderTutorialProgress(state) {
  const progress = getTutorialProgress(state);
  const steps = t(state, 'tutorialSteps') || [];
  return `
    <div class="tutorialBox">
      <div class="actionRow">
        <div class="actionTitle">${t(state, 'tutorial')}</div>
        <div class="tag ${progress >= 4 ? 'good' : 'warn'}">${progress}/4</div>
      </div>
      <div class="bar"><div style="width:${(progress / 4) * 100}%"></div></div>
      <div class="muted" style="margin-top:6px">${steps[Math.max(0, Math.min(3, progress))] || ''}</div>
      ${state.tutorialDismissed ? '<div class="muted">Tutorial completo.</div>' : `<button type="button" class="menuBtn" data-action="dismissTutorial" style="margin-top:8px">${t(state, 'confirm')}</button>`}
    </div>
  `;
}

function renderAchievements(state) {
  const lang = state.settings.language;
  return ACHIEVEMENTS.map(achievement => {
    const done = state.achievements.includes(achievement.id);
    return `
      <div class="actionBtn" style="opacity:${done ? 1 : .45}">
        <div class="actionRow">
          <div>
            <div class="actionTitle">${achievement.emoji} ${achievement.name[lang] || achievement.name.en}</div>
            <div class="actionDesc">${achievement.desc[lang] || achievement.desc.en}</div>
          </div>
          <div class="tag ${done ? 'good' : ''}">${done ? '✓' : 'LOCKED'}</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTutorial(state) {
  const steps = t(state, 'tutorialSteps') || [];
  return `
    <div class="list">
      ${(steps || []).map(step => `<div class="actionBtn"><div class="actionTitle">${step}</div></div>`).join('')}
      <div class="muted">${t(state, 'accessibilityHint')}</div>
    </div>
  `;
}

function renderSaves(state, context) {
  const lang = state.settings.language;
  const slots = context.saves || [];
  return `
    <div class="saveGrid">
      ${slots.map((slot, index) => {
        const label = slot ? `${t(state, 'saveSlot')} ${slot.slot}` : `${t(state, 'saveSlot')} ${index + 1}`;
        const summary = slot ? `Lv.${slot.state.level} • ${fmt(slot.state.tokens)} tok • PST ${fmt(slot.state.prestige)} • ${fmtDate(slot.savedAt)}` : t(state, 'noSave');
        return `
          <div class="saveSlot">
            <h4>${label}</h4>
            <p>${summary}</p>
            <div class="saveSlotActions">
              <button type="button" class="menuBtn" data-action="saveSlot" data-slot="${index + 1}">${t(state, 'save')}</button>
              <button type="button" class="menuBtn" data-action="loadSlot" data-slot="${index + 1}">${t(state, 'load')}</button>
              <button type="button" class="menuBtn" data-action="deleteSlot" data-slot="${index + 1}">${t(state, 'deleteSlot')}</button>
            </div>
          </div>
        `;
      }).join('')}
      <div class="saveSlot">
        <h4>${t(state, 'export')}</h4>
        <p>${t(state, 'backupTip')}</p>
        <div class="saveSlotActions">
          <button type="button" class="menuBtn" data-action="exportSave">${t(state, 'export')}</button>
          <button type="button" class="menuBtn" data-action="importSave">${t(state, 'import')}</button>
        </div>
        <textarea class="miniArea" id="importText" placeholder="${t(state, 'importHint')}"></textarea>
      </div>
    </div>
  `;
}

function renderOptions(state) {
  const lang = state.settings.language;
  return `
    <div class="heroGrid">
      <div class="heroBox">
        <div class="toggleLine">
          <label for="setting-volume">${t(state, 'volume')}</label>
          <span class="muted">${Math.round(state.settings.volume * 100)}%</span>
        </div>
        <input id="setting-volume" class="miniRange" type="range" min="0" max="1" step="0.01" value="${state.settings.volume}" data-setting="volume">
        <div class="muted">${t(state, 'volumeTip')}</div>

        <div class="toggleLine"><label>${t(state, 'sfx')}</label><input type="checkbox" data-setting="sfx" ${state.settings.sfx ? 'checked' : ''}></div>
        <div class="toggleLine"><label>${t(state, 'music')}</label><input type="checkbox" data-setting="music" ${state.settings.music ? 'checked' : ''}></div>
        <div class="toggleLine"><label>${t(state, 'pauseOnBlur')}</label><input type="checkbox" data-setting="pauseOnBlur" ${state.settings.pauseOnBlur ? 'checked' : ''}></div>
        <div class="toggleLine"><label>${t(state, 'fullscreen')}</label><input type="checkbox" data-action="toggleFullscreen" ${document.fullscreenElement ? 'checked' : ''}></div>
      </div>
      <div class="heroBox">
        <div class="toggleLine">
          <label for="setting-language">${t(state, 'language')}</label>
        </div>
        <select id="setting-language" class="miniSelect" data-setting="language">
          <option value="pt-BR" ${lang === 'pt-BR' ? 'selected' : ''}>Português</option>
          <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
        </select>
        <div style="height:12px"></div>
        <div class="muted">${t(state, 'accessibilityHint')}</div>
      </div>
    </div>
  `;
}

function renderMenu(state, context) {
  const lang = state.settings.language;
  const section = state.menuSection || 'home';
  const saves = context.saves || [];
  const home = `
    <div class="heroGrid">
      <div class="heroBox">
        <h2 class="heroTitle">${t(state, 'title')}</h2>
        <p class="heroDesc">${t(state, 'subtitle')}</p>
        <div class="heroActions" style="margin-top:14px">
          <button class="menuBtn primary" data-action="closeMenu">${t(state, 'resume')}</button>
          <button class="menuBtn" data-action="newGame">${t(state, 'newGame')}</button>
          <button class="menuBtn" data-action="openMenu" data-section="options">${t(state, 'options')}</button>
          <button class="menuBtn" data-action="openMenu" data-section="saves">${t(state, 'saves')}</button>
          <button class="menuBtn" data-action="openMenu" data-section="prestige">${t(state, 'prestige')}</button>
          <button class="menuBtn" data-action="openMenu" data-section="help">${t(state, 'tutorial')}</button>
        </div>
        <div class="overlayNote">${t(state, 'tutorial')} • ${t(state, 'accessibilityHint')}</div>
      </div>
      <div class="heroBox">
        <div class="muted">Session</div>
        <div style="font-size:28px;font-weight:800;margin:8px 0">Lv.${fmt(state.level)}</div>
        <div class="muted">Tokens: ${fmt(state.tokens)} • Prestige: ${fmt(state.prestige)}</div>
        <div class="muted">Unlocks: ${getUnlockableCount(state)}/${Object.keys(CROPS).length}</div>
      </div>
    </div>
  `;

  const prestige = `
    <div class="heroGrid">
      <div class="heroBox">
        <h2 class="heroTitle">${t(state, 'prestige')}</h2>
        <p class="heroDesc">${t(state, 'prestigeReset')}</p>
        <div class="heroActions" style="margin-top:14px">
          <button class="menuBtn primary" data-action="prestigeReset">${t(state, 'confirm')}</button>
          <button class="menuBtn" data-action="openMenu" data-section="home">${t(state, 'cancel')}</button>
        </div>
      </div>
      <div class="heroBox">
        <div class="muted">Current prestige: ${fmt(state.prestige)}</div>
        <div class="muted">Prestige multiplier: x${getPrestigeMultiplier(state).toFixed(2)}</div>
        <div class="muted">Requirement: Lv.15+</div>
      </div>
    </div>
  `;

  const savesView = `
    <div class="heroBox">
      <h2 class="heroTitle">${t(state, 'saves')}</h2>
      <p class="heroDesc">${t(state, 'backupTip')}</p>
      <div class="saveGrid">
        ${saves.map((slot, index) => {
          const label = slot ? `${t(state, 'saveSlot')} ${slot.slot}` : `${t(state, 'saveSlot')} ${index + 1}`;
          const summary = slot ? `Lv.${slot.state.level} • ${fmt(slot.state.tokens)} tok • PST ${fmt(slot.state.prestige)} • ${fmtDate(slot.savedAt)}` : t(state, 'noSave');
          return `
            <div class="saveSlot">
              <h4>${label}</h4>
              <p>${summary}</p>
              <div class="saveSlotActions">
                <button type="button" class="menuBtn" data-action="saveSlot" data-slot="${index + 1}">${t(state, 'save')}</button>
                <button type="button" class="menuBtn" data-action="loadSlot" data-slot="${index + 1}">${t(state, 'load')}</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top:12px" class="saveSlot">
        <textarea class="miniArea" id="importText" placeholder="${t(state, 'importHint')}"></textarea>
        <div class="saveSlotActions" style="margin-top:8px">
          <button type="button" class="menuBtn" data-action="exportSave">${t(state, 'export')}</button>
          <button type="button" class="menuBtn" data-action="importSave">${t(state, 'import')}</button>
          <button type="button" class="menuBtn" data-action="openMenu" data-section="home">${t(state, 'back')}</button>
        </div>
      </div>
    </div>
  `;

  const help = `
    <div class="heroBox">
      <h2 class="heroTitle">${t(state, 'tutorial')}</h2>
      <div class="list" style="margin-top:12px">
        ${(t(state, 'tutorialSteps') || []).map(step => `<div class="actionBtn"><div class="actionTitle">${step}</div></div>`).join('')}
      </div>
    </div>
  `;

  const options = renderOptions(state);

  return section === 'options' ? options : section === 'saves' ? savesView : section === 'prestige' ? prestige : section === 'help' ? help : home;
}

function renderEvent(state) {
  if (!state.activeEvent) return '';
  const lang = state.settings.language;
  const event = state.activeEvent;
  return `
    <div class="eventCard">
      <div class="eventHead">
        <div>
          <h3 class="eventTitle">${event.title[lang] || event.title.en}</h3>
          <p class="eventDesc">${event.desc[lang] || event.desc.en}</p>
        </div>
        <div class="tag ${event.kind === 'good' ? 'good' : 'bad'}">${event.kind}</div>
      </div>
      <div class="choiceGrid">
        ${event.choices.map(choice => `
          <button type="button" class="choiceBtn" data-action="chooseEvent" data-choice="${choice.id}">
            <div class="choiceLabel">${choice.label[lang] || choice.label.en}</div>
            <div class="choiceMeta">${Object.entries(choice.reward || {}).map(([key, value]) => `${key}:${value}`).join(' • ')}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function showMenuLayer(state, context) {
  const layer = document.getElementById('menuLayer');
  layer.innerHTML = `
    <div class="card">
      <div class="cardHead">
        <div>
          <h2 class="heroTitle" style="margin:0">${t(state, 'menu')}</h2>
          <p class="heroDesc" style="margin:4px 0 0">${state.menuOpen ? t(state, 'paused') : ''}</p>
        </div>
        <button class="iconBtn" data-action="closeMenu">✕</button>
      </div>
      <div class="cardBody">
        ${renderMenu(state, context)}
      </div>
    </div>
  `;
  layer.classList.remove('hidden');
}

function hideMenuLayer() {
  const layer = document.getElementById('menuLayer');
  layer.classList.add('hidden');
  layer.innerHTML = '';
}

function showEventLayer(state) {
  const layer = document.getElementById('eventLayer');
  layer.innerHTML = renderEvent(state);
  layer.classList.remove('hidden');
}

function hideEventLayer() {
  const layer = document.getElementById('eventLayer');
  layer.classList.add('hidden');
  layer.innerHTML = '';
}

export function createUI(root, api) {
  root.innerHTML = createShell();

  root.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    api.onAction(action, target.dataset, event);
  });

  root.addEventListener('input', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.setting) api.onSetting(target.dataset.setting, target.type === 'checkbox' ? target.checked : target.value);
  });

  root.addEventListener('change', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.id === 'importFile' && target.files?.length) api.onImportFile(target.files[0]);
  });

  function render(state, context = {}) {
    document.documentElement.lang = state.settings.language;

    root.querySelector('#hudTokens').textContent = fmt(state.tokens);
    root.querySelector('#hudRep').textContent = fmt(state.reputation);
    root.querySelector('#hudPrestige').textContent = fmt(state.prestige);
    root.querySelector('#hudLevel').textContent = fmt(state.level);
    root.querySelector('#hudXp').style.width = `${Math.max(0, Math.min(100, (state.xp / state.xpToNext) * 100)).toFixed(1)}%`;
    root.querySelector('#hudXpCur').textContent = fmt(state.xp);
    root.querySelector('#hudXpMax').textContent = fmt(state.xpToNext);
    root.querySelector('#farmTitle').textContent = `${t(state, 'title')} // ${state.farmCols}×${state.farmCols}`;
    root.querySelector('#seedTitle').textContent = `${t(state, 'shop')} // ${state.selectedCrop}`;
    root.querySelector('#farmGrid').innerHTML = renderFarm(state);
    root.querySelector('#seedGrid').innerHTML = renderSeedGrid(state);
    root.querySelector('#seedInfo').innerHTML = renderSeedInfo(state);
    root.querySelector('#seedInfo').insertAdjacentHTML('beforeend', renderTutorialProgress(state));
    root.querySelector('#tabbar').innerHTML = renderTabs(state);
    root.querySelector('#tabContent').innerHTML = renderTabContent(state, context);
    root.querySelector('#statusText').textContent = state.paused ? t(state, 'paused') : state.status;
    root.querySelector('#statusRight').innerHTML = renderLiveIndicators(state);

    if (state.menuOpen) showMenuLayer(state, context);
    else hideMenuLayer();

    if (state.activeEvent) showEventLayer(state);
    else hideEventLayer();

    if (!state.paused) {
      root.querySelector('#statusText').textContent = `${state.status} • ${t(state, 'offline')} ${fmt(getUnlockableCount(state))}/${Object.keys(CROPS).length}`;
    }
  }

  function renderTabContent(state, context) {
    const lang = state.settings.language;
    if (state.activeTab === 'shop') return renderShop(state);
    if (state.activeTab === 'upgrades') return renderUpgrades(state);
    if (state.activeTab === 'contracts') return renderContracts(state);
    if (state.activeTab === 'goals') return renderGoals(state);
    if (state.activeTab === 'stats') return renderStats(state);
    if (state.activeTab === 'saves') return renderSaves(state, context);
    if (state.activeTab === 'achievements') return renderAchievements(state);
    if (state.activeTab === 'tutorial') return renderTutorial(state);
    return `<div class="muted">${lang}</div>`;
  }

  function toast(type, message) {
    const wrap = root.querySelector('#toastWrap');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    wrap.appendChild(el);
    window.setTimeout(() => el.remove(), 3000);
  }

  return {
    render,
    toast,
    openMenuLayer: () => showMenuLayer,
    hideMenuLayer,
    showEventLayer,
    hideEventLayer,
  };
}
