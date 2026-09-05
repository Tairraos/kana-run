/* 出题引擎：题型 + 干扰项（同行/形近优先）+ 不变量：同题内罗马音唯一 */
window.QUIZ = (function () {
  'use strict';
  const K = window.KANA;
  const U = window.U;
  const SRS = window.SRS;

  // 平片对应表（三组列表生成顺序一致，按索引配对）
  const PAIR = {};
  (function buildPair() {
    [['base', K.HIRA, K.KATA], ['daku', K.DAKU.hira, K.DAKU.kata], ['you', K.YOU.hira, K.YOU.kata]]
      .forEach(([, hs, ks]) => hs.forEach((h, i) => {
        PAIR[K.key('hira', h.k)] = ks[i].k;
        PAIR[K.key('kata', ks[i].k)] = h.k;
      }));
  })();

  function counterpart(entry) {
    const ck = PAIR[K.key(entry.s, entry.k)];
    return ck ? K.byChar[ck] : null;
  }

  /* 干扰项：排除同字；罗马音全局唯一（正确项 + 彼此之间），同行与形近加权 */
  function distractors(correct, pool, n) {
    const candidates = pool.filter(x =>
      x.k !== correct.k && x.r !== correct.r && x.s === correct.s);
    const picks = [];
    const usedK = new Set([correct.k]);
    const usedR = new Set([correct.r]);
    let guard = 0;
    while (picks.length < n && guard++ < 200) {
      const items = candidates.filter(x => !usedK.has(x.k) && !usedR.has(x.r)).map(x => {
        let w = 1;
        if (x.row === correct.row) w += 3;
        if ((correct.sim || []).includes(x.k)) w += 4;
        if ((x.sim || []).includes(correct.k)) w += 2;
        return { x, w };
      });
      if (!items.length) break;
      const chosen = U.weightedPick(items).x;
      usedK.add(chosen.k);
      usedR.add(chosen.r);
      picks.push(chosen);
    }
    return picks;
  }

  function pickType(entry, opts) {
    const bag = [];
    if (opts.allowCross && counterpart(entry)) bag.push('cross', 'cross');
    if (opts.allowListen) bag.push('listen', 'listen');
    bag.push('k2r', 'k2r', 'k2r', 'r2k', 'r2k');
    return U.randItem(bag);
  }

  function buildOptions(correct, pool, opts, type) {
    let dispPool = pool, correctDisp = correct;
    if (type === 'cross') {
      correctDisp = counterpart(correct);
      if (!correctDisp) type = 'k2r';
      else dispPool = K.group(correctDisp.s, correctDisp.daku ? 'daku' : correctDisp.you ? 'you' : 'base');
    }
    const ds = distractors(correctDisp, dispPool, 3);
    const options = U.shuffle([correctDisp].concat(ds));
    return { options, answerIdx: options.findIndex(o => o.k === correctDisp.k) };
  }

  function makeQuestion(entry, opts) {
    let type = opts.forceType || pickType(entry, opts);
    if (type === 'cross' && !counterpart(entry)) type = 'k2r';
    const { options, answerIdx } = buildOptions(entry, opts.pool, opts, type);
    const q = { type, x: entry, options, answerIdx, done: false };
    if (type === 'k2r') { q.prompt = entry.k; q.promptKind = 'kana'; }
    else if (type === 'r2k') { q.prompt = entry.r; q.promptKind = 'romaji'; }
    else if (type === 'listen') { q.prompt = entry.k; q.promptKind = 'listen'; }
    else { q.prompt = entry.k; q.promptKind = 'cross'; q.crossTarget = counterpart(entry).s; }
    return q;
  }

  /* 会话：主池 70% + 复习池 30%（SRS 加权），不连续重复 */
  function session(cfg) {
    // cfg: { mainPool:[entry], reviewPool:[entry], srsGet(key)->rec, count, allowCross, allowListen, distractorPool }
    const now = () => Date.now();
    const srsGet = cfg.srsGet || (() => null);
    const distractorPool = cfg.distractorPool;
    let lastKey = null;

    function pickFrom(pool, useSrs) {
      const items = pool.filter(x => K.key(x.s, x.k) !== lastKey).map(x => ({
        x, w: useSrs ? SRS.weight(x, srsGet(K.key(x.s, x.k)), now()) : 1
      }));
      if (!items.length) items.push({ x: pool[0], w: 1 });
      return U.weightedPick(items).x;
    }

    return {
      asked: 0,
      next() {
        if (this.asked >= cfg.count) return null;
        let entry;
        const review = cfg.reviewPool && cfg.reviewPool.length &&
          Math.random() < 0.3 && cfg.reviewPool.some(x => K.key(x.s, x.k) !== lastKey);
        entry = review ? pickFrom(cfg.reviewPool, true) : pickFrom(cfg.mainPool, true);
        lastKey = K.key(entry.s, entry.k);
        this.asked++;
        return makeQuestion(entry, {
          pool: distractorPool || cfg.mainPool,
          allowCross: cfg.allowCross !== false,
          allowListen: !!cfg.allowListen && !!(window.SFX && window.SFX.hasJapaneseVoice && window.SFX.hasJapaneseVoice())
        });
      }
    };
  }

  return { makeQuestion, distractors, counterpart, session };
})();
