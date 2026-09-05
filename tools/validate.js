#!/usr/bin/env node
/* 不变量守门员：node tools/validate.js
 * 覆盖：假名数据、关卡覆盖、出题引擎、SRS、存储、经济与成就
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* ---- 沙盒（浏览器桩）---- */
const listeners = {};
const store = new Map();
const sandbox = {
  console,
  Math, Date, JSON, Object, Array, String, Number, Set, Map, RegExp, Error, parseInt, parseFloat, isNaN,
  performance: { now: () => Date.now() },
  setTimeout: (fn) => { fn(); return 0; },   // 同步执行便于断言
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  addEventListener: (t, fn) => { (listeners[t] = listeners[t] || []).push(fn); },
  localStorage: {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: k => store.delete(k)
  },
  document: {
    hidden: false,
    addEventListener: () => {},
    querySelector: () => null,
    createElement: () => ({ style: {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, addEventListener: () => {} }),
    body: { dataset: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }
  },
  SpeechSynthesisUtterance: function () {}
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const FILES = [
  'js/core/util.js',
  'js/data/kana.js',
  'js/data/rows.js',
  'js/data/achievements.js',
  'js/data/kotodama.js',
  'js/core/srs.js',
  'js/core/quiz.js',
  'js/core/store.js'
];
FILES.forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f });
});

const { KANA, ROWS, ACHV, KOTODAMA, SRS, QUIZ, STORE, U } = sandbox;

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) { pass++; }
  else { fail++; console.error('  ✘ ' + msg); }
}
function section(name) { console.log('▸ ' + name); }

/* ================= 1. 假名数据 ================= */
section('假名数据');
const counts = KANA.assert();
ok(counts.hiraBase === 46 && counts.kataBase === 46, '清音平片各 46');
ok(counts.hiraDaku === 25 && counts.kataDaku === 25, '浊音半浊音平片各 25');
ok(counts.hiraYou === 33 && counts.kataYou === 33, '拗音平片各 33');
ok(KANA.ALL.length === 208, '总数 208，实际 ' + KANA.ALL.length);
// 浊音/拗音罗马音抽查
{
  const expect = { 'が':'ga','ざ':'za','だ':'da','ば':'ba','ぱ':'pa','じ':'ji','ぢ':'ji','ず':'zu','づ':'zu',
    'ガ':'ga','ジ':'ji','ヂ':'ji','パ':'pa',
    'きゃ':'kya','しゃ':'sha','ちゃ':'cha','じゃ':'ja','にゃ':'nya','りょ':'ryo','ぴょ':'pyo','みゅ':'myu',
    'キャ':'kya','シャ':'sha','チャ':'cha','ジャ':'ja','ピョ':'pyo' };
  Object.entries(expect).forEach(([k, r]) => {
    const x = KANA.byChar[k];
    ok(x && x.r === r, `罗马音 ${k} -> ${r}（实际 ${x && x.r}）`);
  });
}
// 关键对立假名存在（用于罗马音唯一性测试）
ok(KANA.byChar['お'] && KANA.byChar['を'] && KANA.byChar['じ'] && KANA.byChar['ぢ'], 'お/を/じ/ぢ 均存在');

/* ================= 2. 关卡覆盖 ================= */
section('关卡覆盖');
ok(ROWS.STAGES.length === 31, '31 关，实际 ' + ROWS.STAGES.length);
{
  const inStages = new Set();
  let noDup = true;
  ROWS.STAGES.forEach(s => {
    ok(s.kana.length > 0, '关卡非空 ' + s.id);
    s.kana.forEach(x => {
      const key = KANA.key(x.s, x.k);
      if (inStages.has(key)) noDup = false;
      inStages.add(key);
    });
  });
  ok(noDup, '假名不重复出现在多个关卡');
  ok(inStages.size === KANA.ALL.length, '每个假名恰属一个关卡：' + inStages.size + '/' + KANA.ALL.length);
  const badRef = ROWS.STAGES.filter(s => s.kana.some(x => !KANA.byChar[x.k]));
  ok(badRef.length === 0, '关卡假名均可索引');
}

/* ================= 3. 出题引擎 ================= */
section('出题引擎（含罗马音唯一不变量）');
{
  let generated = 0, bad = 0;
  const pools = {
    all: KANA.ALL,
    base: KANA.HIRA.concat(KANA.KATA),
    small: KANA.HIRA.slice(0, 5),
    you: KANA.YOU.hira
  };
  Object.entries(pools).forEach(([, pool]) => {
    for (let i = 0; i < 400; i++) {
      const entry = U.randItem(pool);
      const types = ['k2r', 'r2k', 'listen', 'cross', undefined];
      const q = QUIZ.makeQuestion(entry, {
        pool: pool.length >= 8 ? pool : KANA.ALL.filter(x => x.s === entry.s),
        allowCross: true, allowListen: true,
        forceType: U.randItem(types)
      });
      generated++;
      const chars = new Set(q.options.map(o => o.k));
      const roms = new Set(q.options.map(o => o.r));
      if (q.options.length !== 4 || chars.size !== 4 || roms.size !== 4) bad++;
      if (q.answerIdx < 0 || q.options[q.answerIdx].k !== (q.type === 'cross' ? QUIZ.counterpart(entry).k : entry.k)) bad++;
      if (q.type === 'cross' && q.options[q.answerIdx].s === entry.s) bad++;
    }
  });
  ok(bad === 0, `随机 ${generated} 题：选项唯一且含正确项（bad=${bad}）`);
  // 小池（5 假名）也能出题
  const q2 = QUIZ.makeQuestion(KANA.HIRA[0], { pool: KANA.HIRA.slice(0, 5), allowCross: false });
  ok(q2.options.length === 4 && new Set(q2.options.map(o => o.r)).size === 4, '小池出题正常');
  // 会话不连续重复
  const sess = QUIZ.session({ mainPool: KANA.HIRA, reviewPool: [], count: 50 });
  let prev = null, dup = 0;
  for (let i = 0; i < 50; i++) {
    const q = sess.next();
    if (!q) break;
    if (prev && q.x.k === prev) dup++;
    prev = q.x.k;
  }
  ok(dup === 0, '会话内不连续重复');
}

/* ================= 4. SRS ================= */
section('SRS（Leitner）');
{
  let rec = null;
  const t0 = 1_000_000;
  for (let i = 0; i < 1000; i++) {
    rec = SRS.update(rec, Math.random() < 0.7, t0 + i * 60000);
    ok(rec.b >= 0 && rec.b <= 5, 'box 有界');
    if (fail) break;
  }
  ok(SRS.stars(0) === 0 && SRS.stars(1) === 0 && SRS.stars(2) === 1 && SRS.stars(3) === 1
    && SRS.stars(4) === 2 && SRS.stars(5) === 3, '星级映射正确');
  ok(SRS.isDue({ due: t0 - 1 }, t0) && !SRS.isDue({ due: t0 + 1 }, t0), '到期判定');
  ok(SRS.weight(KANA.HIRA[0], null, t0) === 3, '新字权重 3');
}

/* ================= 5. 存储 / 经济 / 成就 ================= */
section('存储与经济');
{
  // 重置沙盒内存档
  sandbox.localStorage.removeItem('kq_save_v1');
  const fresh = sandbox.window;
  // 重新载入 store 以获取干净状态
  vm.runInContext('STORE.reset()', sandbox);
  const st = STORE.state;
  ok(st.xp === 0 && st.petals === 0, '初始状态干净');

  const before = STORE.level();
  const r1 = STORE.addXp(50);
  ok(!r1.levelUp && STORE.level() >= before, '加经验不降级');
  let lastLv = STORE.level();
  let monotonic = true;
  for (let i = 0; i < 200; i++) {
    const r = STORE.addXp(37);
    if (STORE.level() < lastLv) monotonic = false;
    lastLv = STORE.level();
  }
  ok(monotonic, '等级随经验单调不减');

  // 作答
  STORE.addPetals(100);
  const entry = KANA.HIRA[0];
  const ev = STORE.answer(entry, true, 1);
  ok(ev.petals === 1 && STORE.state.totals.answered === 1 && STORE.state.totals.correct === 1, '答对记账');
  ok(STORE.state.srs[KANA.key(entry.s, entry.k)], 'SRS 记录生成');
  STORE.answer(entry, false, 0);
  ok(STORE.state.totals.answered === 2 && STORE.state.totals.correct === 1, '答错记账');

  // 关卡
  STORE.recordStage('h1', 3);
  ok(STORE.stageRec('h1').stars === 3, '关卡星级记录');
  STORE.recordStage('h1', 2);
  ok(STORE.stageRec('h1').stars === 3, '星级只增不减');

  // 御神签
  const first = STORE.drawOmikuji();
  const again = STORE.drawOmikuji();
  ok(first.fortune && again.fortune === first.fortune, '御神签每日一次');

  // 扭蛋：花瓣不足返回 null
  STORE.state.petals = 5;
  ok(STORE.pull() === null, '花瓣不足拒抽');
  STORE.state.petals = 1000;
  const pullRes = STORE.pull();
  ok(pullRes && KOTODAMA.byWord[pullRes.item.w], '扭蛋返回合法言灵');

  // 成就数量与检测函数覆盖
  ok(ACHV.LIST.length === 18, '成就共 18 枚');
  const unlockedIds = Object.keys(STORE.state.achv || {});
  ok(unlockedIds.every(id => ACHV.byId[id]), '已解锁成就 id 均可索引');

  // 存档往返
  STORE.markSave();
  const snap = JSON.stringify(STORE.state);
  const loaded = JSON.parse(sandbox.localStorage.getItem('kq_save_v1'));
  ok(JSON.stringify(loaded) === snap, 'save -> localStorage 往返一致');

  // 快照统计
  const s = STORE.snapshotStats();
  ok(typeof s.answered === 'number' && s.seenHira >= 1, '快照统计可用');
}

console.log(`\n结果：${pass} 通过 / ${fail} 失败`);
process.exit(fail ? 1 : 0);
