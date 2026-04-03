function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function createAudioEngine(initialSettings) {
  let settings = initialSettings;
  let ctx = null;
  let master = null;
  let musicTimer = null;
  let unlocked = false;
  let musicStep = 0;

  function ensure() {
    if (ctx) return ctx;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
    master = ctx.createGain();
    master.gain.value = clamp01(settings.volume ?? 0.75);
    master.connect(ctx.destination);
    return ctx;
  }

  function playTone(freq, duration, type = 'sine', gain = 0.08) {
    if (!settings.sfx) return;
    const audio = ensure();
    if (!audio || !master) return;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.value = 0;
    osc.connect(amp);
    amp.connect(master);
    const now = audio.currentTime;
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  }

  function playSfx(name) {
    if (!settings.sfx) return;
    const map = {
      plant: [220, 330],
      harvest: [440, 660, 880],
      bug: [140, 90],
      buy: [392, 494],
      level: [523, 659, 784],
      prestige: [294, 392, 523, 659],
      event: [330, 415],
    };
    const notes = map[name] || [440];
    notes.forEach((freq, index) => playTone(freq, 0.12 + index * 0.03, index % 2 ? 'triangle' : 'sine', 0.06));
  }

  function stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function startMusic() {
    if (!settings.music) {
      stopMusic();
      return;
    }
    const audio = ensure();
    if (!audio || musicTimer) return;
    const chord = [261.63, 329.63, 392, 493.88];
    musicTimer = setInterval(() => {
      if (!settings.music || !ctx || !master) return;
      const freq = chord[musicStep % chord.length];
      musicStep += 1;
      playTone(freq, 0.22, 'triangle', 0.025);
      if (musicStep % 4 === 0) playTone(freq / 2, 0.24, 'sine', 0.02);
    }, 1800);
  }

  return {
    bindSettings(nextSettings) {
      settings = nextSettings;
      if (master) master.gain.value = clamp01(settings.volume ?? 0.75);
    },
    unlock() {
      if (unlocked) return;
      unlocked = true;
      ensure();
      if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
      if (settings.music) startMusic();
    },
    setVolume(value) {
      settings.volume = clamp01(value);
      if (master) master.gain.value = settings.volume;
    },
    setSfxEnabled(enabled) {
      settings.sfx = !!enabled;
      if (!settings.sfx) stopMusic();
    },
    setMusicEnabled(enabled) {
      settings.music = !!enabled;
      if (settings.music) startMusic();
      else stopMusic();
    },
    play(name) {
      playSfx(name);
    },
    dispose() {
      stopMusic();
      if (ctx) {
        ctx.close().catch(() => {});
        ctx = null;
        master = null;
      }
    },
  };
}
