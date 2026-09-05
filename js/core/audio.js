/* 音频：WebAudio 全合成音效 + 五声音阶环境 BGM + ja-JP 语音朗读（无外部资源） */
window.SFX = (function () {
  'use strict';
  const U = window.U;

  let ctx = null, master = null, bgmGain = null, bgmTimer = null, bgmOn = false;
  let jaVoice = null;

  function settings() {
    const S = window.STORE;
    return (S && S.state && S.state.settings) || { sfx: true, bgm: false, voice: true };
  }

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    bgmGain = ctx.createGain();
    bgmGain.gain.value = 0.0;
    bgmGain.connect(master);
    return true;
  }

  function tone(freq, dur, opts) {
    if (!ensure() || !settings().sfx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    const t = ctx.currentTime + (opts.delay || 0);
    o.type = opts.type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(opts.glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(opts.vol || 0.2, t + (opts.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function noise(dur, opts) {
    if (!ensure() || !settings().sfx) return;
    const t = ctx.currentTime + (opts.delay || 0);
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = opts.filter || 'lowpass';
    f.frequency.value = opts.freq || 800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.vol || 0.25, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  const PENTA = [0, 2, 4, 7, 9]; // 五声音阶
  const hz = semi => 440 * Math.pow(2, semi / 12);

  const api = {
    unlock() { ensure(); },

    click() { tone(660, 0.06, { type: 'triangle', vol: 0.08 }); },

    correct(combo) {
      const step = PENTA[Math.min(combo || 0, 12) % PENTA.length] + 12 * Math.min(2, Math.floor((combo || 0) / 5));
      tone(hz(step), 0.12, { type: 'triangle', vol: 0.18 });
      tone(hz(step + 7), 0.16, { type: 'triangle', vol: 0.14, delay: 0.07 });
      tone(hz(step + 12), 0.22, { type: 'sine', vol: 0.12, delay: 0.14 });
    },

    wrong() {
      tone(160, 0.2, { type: 'sawtooth', vol: 0.12, glide: 110 });
      noise(0.12, { freq: 300, vol: 0.1 });
    },

    flip() { noise(0.09, { freq: 1200, vol: 0.08, filter: 'bandpass' }); },

    match() { tone(hz(12), 0.1, { type: 'sine', vol: 0.16 }); tone(hz(19), 0.18, { type: 'sine', vol: 0.14, delay: 0.08 }); },

    stamp() { noise(0.08, { freq: 500, vol: 0.3 }); tone(90, 0.15, { type: 'sine', vol: 0.3, glide: 60 }); },

    levelup() {
      [0, 4, 7, 12, 16].forEach((s, i) => tone(hz(s), 0.25, { type: 'triangle', vol: 0.16, delay: i * 0.09 }));
    },

    firework() { noise(0.5, { freq: 900, vol: 0.2 }); tone(700, 0.4, { type: 'sine', vol: 0.06, glide: 120 }); },

    gacha() {
      [0, 7, 12, 19, 24].forEach((s, i) => tone(hz(s), 0.14, { type: 'sine', vol: 0.12, delay: i * 0.06 }));
    },

    omikujiShake() {
      for (let i = 0; i < 5; i++) noise(0.05, { freq: 1800, vol: 0.1, delay: i * 0.12, filter: 'bandpass' });
    },

    tick() { tone(880, 0.05, { type: 'square', vol: 0.05 }); },

    fanfare() {
      [0, 4, 7, 12].forEach((s, i) => tone(hz(s + 12), 0.3, { type: 'triangle', vol: 0.18, delay: i * 0.12 }));
    },

    /* ---- 语音朗读 ---- */
    initVoices() {
      if (!('speechSynthesis' in window)) return;
      const load = () => {
        const vs = window.speechSynthesis.getVoices() || [];
        jaVoice = vs.find(v => v.lang && v.lang.toLowerCase().startsWith('ja')) || null;
      };
      load();
      window.speechSynthesis.onvoiceschanged = load;
    },

    hasJapaneseVoice() { return !!(('speechSynthesis' in window) && jaVoice); },

    speak(text, opts) {
      const o = opts || {};
      if (o.force !== true && !settings().voice) return;
      if (!('speechSynthesis' in window) || !jaVoice) return;
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.voice = jaVoice; u.lang = 'ja-JP'; u.rate = o.rate || 0.85; u.pitch = 1;
        window.speechSynthesis.speak(u);
      } catch (e) { /* 语音失败静默 */ }
    },

    /* ---- 环境 BGM：五声音阶拨弦 ---- */
    startBgm() {
      if (bgmOn || !ensure()) return;
      bgmOn = true;
      bgmGain.gain.setTargetAtTime(settings().sfx ? 0.14 : 0.14, ctx.currentTime, 1.5);
      const roots = [0, -2, 3, -4]; // A G C F 感觉的五声进行
      let bar = 0;
      bgmTimer = setInterval(() => {
        if (!ctx || ctx.state !== 'running') return;
        const root = roots[bar % roots.length]; bar++;
        const notes = [0, 4, 9, 12, 7];
        for (let i = 0; i < 4; i++) {
          const semi = root + U.randItem(notes) + (Math.random() < 0.3 ? 12 : 0);
          const t = ctx.currentTime + i * (0.9 + Math.random() * 0.4);
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = hz(semi - 12);
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
          o.connect(g); g.connect(bgmGain);
          o.start(t); o.stop(t + 1.5);
        }
      }, 4200);
    },
    stopBgm() {
      bgmOn = false;
      if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
      if (bgmGain && ctx) bgmGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
    }
  };

  window.addEventListener('pointerdown', () => api.unlock(), { once: true });
  window.addEventListener('keydown', () => api.unlock(), { once: true });
  api.initVoices();

  return api;
})();
