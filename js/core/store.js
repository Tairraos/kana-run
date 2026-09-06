/* 全局状态：localStorage 持久化 + XP/等级/花瓣/连击/成就/御神签/扭蛋 */
window.STORE = (function () {
  'use strict';
  const U = window.U, SRS = window.SRS, K = window.KANA, A = window.ACHV;
  const KEY = 'kq_save_v1';

  const TITLES = ['见习旅人', '拾音人', '假名学徒', '音读修行者', '花火师', '夜樱诗人', '墨客', '五十音通', '言灵使', '传说的旅人'];
  const THEMES = [
    { id: 'neon', name: '夜樱', lv: 1 },
    { id: 'dawn', name: '曙樱', lv: 3 },
    { id: 'matcha', name: '抹茶', lv: 5 },
    { id: 'sumi', name: '墨', lv: 7 }
  ];
  const GACHA_COST = 20;
  const DAILY_GOAL = { rounds: 1, correct: 20 };

  // 等级曲线：升到 L 级累计需要 Σ 120·i^1.4
  const CUM = [0, 0];
  for (let i = 1; i < 80; i++) CUM.push(CUM[i] + Math.round(120 * Math.pow(i, 1.4)));

  function defaults() {
    return {
      v: 1,
      xp: 0, petals: 0,
      srs: {},
      stages: {},
      achv: {},
      kotodama: {},
      gacha: { count: 0, sinceEpic: 0 },
      omikuji: { date: null, fortune: null, buffUntil: 0 },
      daily: { date: U.todayKey(), rounds: 0, correct: 0, petalsToday: 0 },
      streak: { lastDate: null, count: 0, best: 0 },
      totals: { answered: 0, correct: 0, maxCombo: 0, playDays: 1 },
      swift: { best: 0, bestCorrect: 0 },
      match: { bestMoves: {}, bestTime: {} },
      settings: { voice: true, sfx: true, bgm: true, theme: 'neon', freeUnlock: false },
      flags: { nightOwl: false, sakuraStorm: false }
    };
  }

  let state = load();
  const listeners = {};
  let saveDirty = false;

  function mergeDefaults(s) {
    const d = defaults();
    // 补齐缺失字段 + 浅合并已有对象，保证任何旧存档形状都能安全加载
    Object.keys(d).forEach(k => {
      if (s[k] === undefined) { s[k] = d[k]; return; }
      if (typeof d[k] === 'object' && !Array.isArray(d[k])) {
        s[k] = Object.assign({}, d[k], s[k]);
      }
    });
    return s;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const s = JSON.parse(raw);
      if (!s || s.v !== 1) return defaults();
      mergeDefaults(s);
      // 一次性迁移：修正早期默认值（朗读/音乐打开）
      if (!s.m201) {
        s.m201 = 1;
        s.settings.voice = true;
        s.settings.bgm = true;
      }
      return s;
    } catch (e) { return defaults(); }
  }

  // 存储可用性探测（隐私模式等场景会失败）
  const storageOk = (() => {
    try {
      localStorage.setItem('__kq_probe', '1');
      localStorage.removeItem('__kq_probe');
      return true;
    } catch (e) { return false; }
  })();

  /* 存档码：跨打开方式（file:// 与本地服务是不同存档位）搬运进度 */
  function exportCode() {
    try {
      return 'KQ1.' + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
    } catch (e) { return null; }
  }
  function importCode(code) {
    try {
      const str = String(code || '').trim();
      if (!str.startsWith('KQ1.')) return false;
      const obj = JSON.parse(decodeURIComponent(escape(atob(str.slice(4)))));
      if (!obj || obj.v !== 1) return false;
      mergeDefaults(obj);
      obj.m201 = 1;
      localStorage.setItem(KEY, JSON.stringify(obj));
      state = obj; // 内存中立即生效（页面随后的刷新会完整重建视图）
      return true;
    } catch (e) { return false; }
  }

  function saveNow() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 隐私模式忽略 */ }
    saveDirty = false;
  }
  const save = U.debounce(saveNow, 250);
  function markSave() { saveDirty = true; save(); }
  window.addEventListener('beforeunload', () => { if (saveDirty) saveNow(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && saveDirty) saveNow(); });

  function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); }
  function emit(evt, data) { (listeners[evt] || []).forEach(fn => { try { fn(data); } catch (e) {} }); }

  /* ---- 等级 ---- */
  function level() {
    let l = 1;
    while (l + 1 < CUM.length && state.xp >= CUM[l + 1]) l++;
    return l;
  }
  function levelProgress() {
    const l = level();
    const cur = state.xp - CUM[l];
    const need = CUM[l + 1] - CUM[l];
    return { level: l, title: TITLES[Math.min(l - 1, TITLES.length - 1)], cur, need, pct: U.clamp(cur / need, 0, 1) };
  }
  function addXp(n) {
    if (buffActive()) n = n * 2;
    state.xp += n;
    const before = level();
    markSave();
    const now = level();
    const out = { xp: n, level: now, levelUp: now > before };
    if (out.levelUp) { emit('levelup', out); checkAchievements(); }
    return out;
  }
  function addPetals(n) {
    state.petals += n;
    state.daily.petalsToday += n;
    markSave();
  }

  /* ---- 每日 ---- */
  function tickDaily() {
    const today = U.todayKey();
    if (state.daily.date !== today) {
      state.daily = { date: today, rounds: 0, correct: 0, petalsToday: 0 };
      state.totals.playDays++;
      markSave();
    }
    const h = new Date().getHours();
    if (h >= 0 && h < 5 && !state.flags.nightOwl) {
      state.flags.nightOwl = true;
      markSave();
      checkAchievements();
    }
  }
  function dailyGoalMet() {
    return state.daily.rounds >= DAILY_GOAL.rounds && state.daily.correct >= DAILY_GOAL.correct;
  }
  function markRoundCompleted() {
    state.daily.rounds++;
    if (dailyGoalMet() && state.streak.lastDate !== state.daily.date) {
      const yest = U.dateKeyOffset(-1);
      state.streak.count = state.streak.lastDate === yest ? state.streak.count + 1 : 1;
      state.streak.lastDate = state.daily.date;
      state.streak.best = Math.max(state.streak.best, state.streak.count);
    }
    markSave();
    checkAchievements();
  }

  /* ---- 作答 ---- */
  function answer(entry, ok, combo) {
    const key = K.key(entry.s, entry.k);
    const now = Date.now();
    state.srs[key] = SRS.update(state.srs[key], ok, now);
    state.totals.answered++;
    if (ok) state.totals.correct++;
    state.daily.correct++;
    if (combo && combo > state.totals.maxCombo) state.totals.maxCombo = combo;
    const events = { key, ok };
    if (ok) {
      events.petals = 1;
      addPetals(1);
      const xp = addXp(10 + (combo && combo >= 5 ? 5 : 0));
      events.xp = xp.xp; events.levelUp = xp.levelUp; events.level = xp.level;
    } else {
      events.xp = 0;
    }
    markSave();
    checkAchievements();
    return events;
  }

  function starsFor(entry) {
    const rec = state.srs[K.key(entry.s, entry.k)];
    return rec ? SRS.stars(rec.b) : -1; // -1 = 未遇见
  }
  function seenEntries(filter) {
    // filter: 'hira'|'kata'|'daku'|'you' 可选
    const out = [];
    K.ALL.forEach(x => {
      if (filter === 'hira' && (x.s !== 'hira' || x.daku || x.you)) return;
      if (filter === 'kata' && (x.s !== 'kata' || x.daku || x.you)) return;
      if (filter === 'daku' && !x.daku) return;
      if (filter === 'you' && !x.you) return;
      if (state.srs[K.key(x.s, x.k)]) out.push(x);
    });
    return out;
  }

  /* ---- 关卡 ---- */
  function stageRec(id) { return state.stages[id] || null; }
  function recordStage(id, stars) {
    const rec = state.stages[id] || { stars: 0, attempts: 0 };
    const improved = stars > rec.stars;
    rec.stars = Math.max(rec.stars, stars);
    rec.attempts++;
    state.stages[id] = rec;
    if (stars > 0) addXp(stars * 30);
    markSave();
    return { improved, stars: rec.stars };
  }
  function chapterClearedCount(chId) {
    const ch = window.ROWS.CHAPTERS.find(c => c.id === chId);
    return ch.stages.filter(st => (state.stages[st.id] || {}).stars > 0).length;
  }
  function chapterUnlocked(chIdx) {
    if (state.settings.freeUnlock) return true;
    if (chIdx === 0) return true;
    const prev = window.ROWS.CHAPTERS[chIdx - 1];
    return chapterClearedCount(prev.id) >= Math.ceil(prev.stages.length * window.ROWS.UNLOCK_RATIO);
  }
  function stageUnlocked(stage, chIdx) {
    if (state.settings.freeUnlock) return true;
    if (!chapterUnlocked(chIdx)) return false;
    const idx = window.ROWS.STAGES.indexOf(stage);
    if (idx <= 0) return true;
    const prev = window.ROWS.STAGES[idx - 1];
    return prev.ch !== stage.ch || (state.stages[prev.id] || {}).stars > 0;
  }

  /* ---- 御神签 ---- */
  const FORTUNES = [
    { id: 'daikichi', name: '大吉', w: 10, line: '诸事皆宜。今日之音，字字入心。' },
    { id: 'chukichi', name: '中吉', w: 20, line: '稳步向前。把生疏的那一行再翻一遍。' },
    { id: 'shokichi', name: '小吉', w: 20, line: '小有惊喜。适合挑战一次速答。' },
    { id: 'kichi', name: '吉', w: 25, line: '平顺安稳。每日一课，水滴石穿。' },
    { id: 'suekichi', name: '末吉', w: 15, line: '先难后易。错了的假名，会在明天开花。' },
    { id: 'kyo', name: '凶', w: 10, line: '宜静不宜躁。慢一点，反而记得牢。' }
  ];
  function omikujiDone() { return state.omikuji.date === U.todayKey(); }
  function drawOmikuji() {
    if (omikujiDone()) return state.omikuji;
    const f = U.weightedPick(FORTUNES.map(x => Object.assign({ w: x.w }, x)));
    state.omikuji = { date: U.todayKey(), fortune: f.id, line: f.line, buffUntil: 0 };
    if (f.id === 'daikichi' || f.id === 'chukichi') {
      const end = new Date(); end.setHours(24, 0, 0, 0);
      state.omikuji.buffUntil = end.getTime();
      if (f.id === 'daikichi') addPetals(30);
    }
    markSave();
    return state.omikuji;
  }
  function buffActive() { return (state.omikuji.buffUntil || 0) > Date.now(); }

  /* ---- 言灵扭蛋 ---- */
  function pull() {
    if (state.petals < GACHA_COST) return null;
    addPetals(-GACHA_COST);
    let item;
    if (state.gacha.sinceEpic >= 10) {
      item = U.randItem(KOTODAMA.LIST.filter(x => x.rarity === 'e'));
      state.gacha.sinceEpic = 0;
    } else {
      item = U.weightedPick(KOTODAMA.LIST.map(x => ({ item: x, w: KOTODAMA.WEIGHT[x.rarity] }))).item;
      state.gacha.sinceEpic = item.rarity === 'e' ? 0 : state.gacha.sinceEpic + 1;
    }
    const dup = !!state.kotodama[item.w];
    state.kotodama[item.w] = (state.kotodama[item.w] || 0) + 1;
    state.gacha.count++;
    let refund = 0;
    if (dup) { refund = 6; addPetals(refund); }
    markSave();
    return { item, dup, refund };
  }
  function kotodamaCount() { return Object.keys(state.kotodama).length; }

  /* ---- 成就 ---- */
  function snapshotStats() {
    const baseHira = K.group('hira', 'base'), baseKata = K.group('kata', 'base');
    const seen = list => list.filter(x => state.srs[K.key(x.s, x.k)]).length;
    const gold = list => list.filter(x => {
      const r = state.srs[K.key(x.s, x.k)];
      return r && SRS.stars(r.b) === 3;
    }).length;
    return {
      answered: state.totals.answered,
      correct: state.totals.correct,
      maxCombo: state.totals.maxCombo,
      level: level(),
      streak: state.streak.count,
      swiftBest: state.swift.best,
      swiftBestCorrect: state.swift.bestCorrect,
      matchBest8: state.match.bestMoves['8'] || null,
      seenHira: seen(baseHira), goldHira: gold(baseHira),
      seenKata: seen(baseKata), goldKata: gold(baseKata),
      nightOwl: state.flags.nightOwl
    };
  }
  const CHECKS = {
    first_correct: s => s.correct >= 1,
    first_stage: () => Object.keys(state.stages).some(id => state.stages[id].stars > 0),
    perfect_stage: () => Object.keys(state.stages).some(id => state.stages[id].stars >= 3),
    combo10: s => s.maxCombo >= 10,
    combo20: s => s.maxCombo >= 20,
    swift30: s => s.swiftBestCorrect >= 30,
    swift_master: s => s.swiftBest >= 600,
    match_perfect: s => s.matchBest8 != null && s.matchBest8 <= 12,
    night_owl: s => s.nightOwl,
    streak7: s => s.streak >= 7,
    streak30: s => s.streak >= 30,
    hira_all: s => s.seenHira >= 46,
    kata_all: s => s.seenKata >= 46,
    hira_master: s => s.goldHira >= 46,
    kata_master: s => s.goldKata >= 46,
    q500: s => s.answered >= 500,
    lvl5: s => s.level >= 5,
    lvl10: s => s.level >= 10
  };
  function checkAchievements() {
    const s = snapshotStats();
    const unlocked = [];
    A.LIST.forEach(a => {
      if (!state.achv[a.id] && CHECKS[a.id] && CHECKS[a.id](s)) {
        state.achv[a.id] = Date.now();
        unlocked.push(a);
      }
    });
    if (unlocked.length) markSave();
    return unlocked;
  }

  /* ---- 设置 / 主题 ---- */
  function setSetting(k, v) {
    state.settings[k] = v;
    markSave();
    emit('setting', { key: k, value: v });
  }
  function themeUnlocked(t) { return level() >= t.lv || state.settings.freeUnlock; }
  function canUseTheme(t) { return themeUnlocked(t); }

  function recordSwift(score, correct) {
    state.swift.best = Math.max(state.swift.best, score);
    state.swift.bestCorrect = Math.max(state.swift.bestCorrect, correct);
    markSave();
    checkAchievements();
  }
  function recordMatch(pairs, moves, time) {
    const prev = state.match.bestMoves[pairs];
    if (prev == null || moves < prev) state.match.bestMoves[pairs] = moves;
    const pt = state.match.bestTime[pairs];
    if (pt == null || time < pt) state.match.bestTime[pairs] = time;
    markSave();
    checkAchievements();
  }

  function reset() {
    localStorage.removeItem(KEY);
    state = defaults();
  }

  tickDaily();

  return {
    get state() { return state; },
    THEMES, TITLES, GACHA_COST, DAILY_GOAL,
    storageOk, exportCode, importCode,
    on, emit, save, markSave,
    level, levelProgress, addXp, addPetals,
    tickDaily, dailyGoalMet, markRoundCompleted,
    answer, starsFor, seenEntries,
    stageRec, recordStage, chapterClearedCount, chapterUnlocked, stageUnlocked,
    omikujiDone, drawOmikuji, buffActive,
    pull, kotodamaCount,
    checkAchievements, snapshotStats,
    setSetting, themeUnlocked, canUseTheme,
    recordSwift, recordMatch, reset
  };
})();
