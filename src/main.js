import { createAudioEngine } from './audio.js';
import { createDefaultState, applySaveTimestamp, buySeed, buyUpgrade, claimContract, claimGoal, closeMenu, createStateSummary, dismissTutorial, fixBug, harvest, harvestReadyPlots, maybeTriggerEvent, normalizeState, openMenu, plant, plantSelectedCropInEmptyPlots, prestigeReset, refreshDerivedState, setActiveTab, setLanguage, setSelectedCrop, setVolume, tick, togglePause, chooseEvent } from './game.js';
import { deleteSlot, exportSave, importSave, listSlots, loadSlot, saveSlot } from './storage.js';
import { createUI } from './ui.js';
import { t, tf } from './i18n.js';

const root = document.getElementById('app');
let state = normalizeState(loadInitialState());
let scheduled = false;
let savesCache = listSlots(normalizeState);

function loadInitialState() {
  const slot = Number(localStorage.getItem('devfarm.activeSlot') || '1');
  const saved = loadSlot(slot, normalizeState);
  return saved?.state ? { ...saved.state, saveSlot: slot } : createDefaultState();
}

const audio = createAudioEngine(state.settings);

function requestRender() {
  scheduled = true;
}

function persistState() {
  applySaveTimestamp(state);
  saveSlot(state.saveSlot || 1, state);
  savesCache = listSlots(normalizeState);
}

function updateAudioSettings() {
  audio.bindSettings(state.settings);
  audio.setVolume(state.settings.volume);
  audio.setSfxEnabled(state.settings.sfx);
  audio.setMusicEnabled(state.settings.music);
}

const ui = createUI(root, {
  onAction(action, data) {
    audio.unlock();
    switch (action) {
      case 'plotClick': {
        const index = Number(data.index);
        const plot = state.plots[index];
        if (!plot) return;
        if (plot.state === 'empty') plant(state, index, hooks);
        else if (plot.state === 'ready') harvest(state, index, hooks);
        else if (plot.state === 'bugged') fixBug(state, index, hooks);
        requestRender();
        persistState();
        break;
      }
      case 'plantAll':
        if (plantSelectedCropInEmptyPlots(state, hooks)) {
          requestRender();
          persistState();
        }
        break;
      case 'harvestReady':
        if (harvestReadyPlots(state, hooks)) {
          requestRender();
          persistState();
        }
        break;
      case 'selectCrop':
        setSelectedCrop(state, data.crop);
        requestRender();
        break;
      case 'buySeed':
        buySeed(state, data.crop, hooks);
        requestRender();
        persistState();
        break;
      case 'buyUpgrade':
        buyUpgrade(state, data.upgrade, hooks);
        requestRender();
        persistState();
        break;
      case 'claimContract':
        claimContract(state, Number(data.index), hooks);
        requestRender();
        persistState();
        break;
      case 'claimGoal':
        claimGoal(state, Number(data.index), hooks);
        requestRender();
        persistState();
        break;
      case 'setTab':
        setActiveTab(state, data.tab);
        persistState();
        requestRender();
        break;
      case 'openMenu':
        openMenu(state, data.section || 'home');
        requestRender();
        break;
      case 'closeMenu':
        closeMenu(state);
        requestRender();
        persistState();
        break;
      case 'prestigeReset':
        if (prestigeReset(state, hooks)) {
          requestRender();
          persistState();
        }
        break;
      case 'saveSlot':
        state.saveSlot = Number(data.slot);
        localStorage.setItem('devfarm.activeSlot', String(state.saveSlot));
        persistState();
        ui.toast('ok', tf(state, 'slotSaved', { slot: state.saveSlot }));
        requestRender();
        break;
      case 'loadSlot': {
        const slot = Number(data.slot);
        const loaded = loadSlot(slot, normalizeState);
        if (loaded) {
          state = loaded.state;
          state.saveSlot = slot;
          localStorage.setItem('devfarm.activeSlot', String(slot));
          updateAudioSettings();
          requestRender();
          ui.toast('info', tf(state, 'slotLoaded', { slot }));
        } else {
          ui.toast('warn', tf(state, 'slotEmpty', { slot }));
        }
        break;
      }
      case 'deleteSlot':
        deleteSlot(Number(data.slot));
        savesCache = listSlots(normalizeState);
        requestRender();
        ui.toast('warn', tf(state, 'slotDeleted', { slot: data.slot }));
        break;
      case 'exportSave': {
        const textarea = document.getElementById('importText');
        if (textarea) textarea.value = exportSave(state);
        ui.toast('info', t(state, 'saveExported'));
        break;
      }
      case 'importSave': {
        const textarea = document.getElementById('importText');
        const fileInput = document.getElementById('importFile');
        const raw = textarea?.value?.trim();
        if (raw) {
          try {
            const imported = importSave(raw, normalizeState);
            state = imported.state;
            state.saveSlot = state.saveSlot || 1;
            localStorage.setItem('devfarm.activeSlot', String(state.saveSlot));
            updateAudioSettings();
            requestRender();
            persistState();
            ui.toast('ok', t(state, 'saveImported'));
          } catch (error) {
            ui.toast('err', t(state, 'invalidSaveJson'));
          }
        } else {
          fileInput?.click();
        }
        break;
      }
      case 'toggleFullscreen':
        toggleFullscreen();
        break;
      case 'chooseEvent':
        chooseEvent(state, data.choice, hooks);
        requestRender();
        persistState();
        break;
      case 'dismissTutorial':
        dismissTutorial(state);
        requestRender();
        persistState();
        break;
      case 'newGame':
        state = createDefaultState();
        state.saveSlot = Number(localStorage.getItem('devfarm.activeSlot') || '1');
        updateAudioSettings();
        openMenu(state, 'home');
        requestRender();
        persistState();
        break;
      case 'resumeGame':
        closeMenu(state);
        requestRender();
        break;
      case 'pauseGame':
        togglePause(state, true);
        requestRender();
        break;
      case 'menuHome':
        openMenu(state, 'home');
        requestRender();
        break;
      default:
        break;
    }
  },
  onSetting(setting, value) {
    audio.unlock();
    if (setting === 'volume') {
      setVolume(state, value);
      audio.setVolume(state.settings.volume);
    } else if (setting === 'sfx') {
      state.settings.sfx = !!value;
      audio.setSfxEnabled(state.settings.sfx);
    } else if (setting === 'music') {
      state.settings.music = !!value;
      audio.setMusicEnabled(state.settings.music);
    } else if (setting === 'pauseOnBlur') {
      state.settings.pauseOnBlur = !!value;
    } else if (setting === 'language') {
      setLanguage(state, value);
    }
    requestRender();
    persistState();
  },
  onImportFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importSave(String(reader.result || ''), normalizeState);
        state = imported.state;
        state.saveSlot = state.saveSlot || 1;
        localStorage.setItem('devfarm.activeSlot', String(state.saveSlot));
        updateAudioSettings();
        requestRender();
        persistState();
        ui.toast('ok', t(state, 'saveImported'));
      } catch {
        ui.toast('err', t(state, 'invalidSaveFile'));
      }
    };
    reader.readAsText(file);
  },
});

const hooks = {
  notify(type, message) {
    ui.toast(type, message);
  },
  play(name) {
    audio.play(name);
  },
  t(key) {
    return t(state, key);
  },
  tf(key, vars) {
    return tf(state, key, vars);
  },
};

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen?.().catch(() => {});
}

function refreshActiveEventState() {
  if (state.activeEvent && !state.menuOpen) state.paused = true;
}

function syncDerivedState() {
  refreshDerivedState(state);
  maybeTriggerEvent(state, hooks);
}

window.addEventListener('beforeunload', () => persistState());
window.addEventListener('pagehide', () => persistState());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    persistState();
    if (state.settings.pauseOnBlur) {
      togglePause(state, true);
      requestRender();
    }
  } else if (state.settings.pauseOnBlur && !state.menuOpen && !state.activeEvent) {
    togglePause(state, false);
    requestRender();
  }
});

window.addEventListener('error', event => {
  ui.toast('err', event.message || 'Unexpected error');
});

window.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (state.activeEvent) return;
    if (state.menuOpen) closeMenu(state);
    else openMenu(state, 'home');
    requestRender();
  }
  if (event.key.toLowerCase() === 'h') {
    state.plots.forEach((plot, index) => { if (plot.state === 'ready') harvest(state, index, hooks); });
    requestRender();
    persistState();
  }
  if (event.key.toLowerCase() === 'p') {
    togglePause(state);
    requestRender();
  }
});

function startGameLoop() {
  const now = Date.now();
  const changed = tick(state, hooks, now);
  if (changed) requestRender();
  if (scheduled) {
    scheduled = false;
    ui.render(state, { saves: savesCache, summary: createStateSummary(state) });
  }
}

function boot() {
  updateAudioSettings();
  openMenu(state, state.menuSection || 'home');
  refreshDerivedState(state);
  requestRender();
  ui.render(state, { saves: savesCache, summary: createStateSummary(state) });
  window.setInterval(startGameLoop, 200);
  window.setInterval(() => persistState(), 15000);
}

boot();
