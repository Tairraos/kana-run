/* 极速挑战：60 秒限时四选一，连击倍率，速度递增 */
window.SwiftScreen = (function () {
  'use strict';
  const U = window.U, K = window.KANA, STORE = window.STORE, UI = window.UI,
    FX = window.FX, SFX = window.SFX, QUIZ = window.QUIZ;

  const DURATION = 60;
  let timer = null, raf = null, running = false;

  function questionPool() {
    const seen = STORE.seenEntries();
    const base = K.ALL.filter(x => !x.daku && !x.you);
    const pool = seen.length >= 24 ? seen.filter(x => !x.you) : base;
    return pool.length >= 8 ? pool : base;
  }

  function mount(root) {
    const st = STORE.state;
    root.innerHTML = `
      <div class="screen-head">
        <h1 class="screen-title">极速挑战</h1>
        <p class="screen-sub">60 秒，连击不断，分数翻倍</p>
      </div>
      <div class="swift-intro">
        <div class="swift-best">🏆 最高分 <b>${st.swift.best}</b> · 最多答对 <b>${st.swift.bestCorrect}</b> 题</div>
        <ul class="swift-rules">
          <li>答对 +10 分，连击每满 5 额外加分</li>
          <li>10 连击进入「心流」：得分 ×2</li>
          <li>越到后面，换题越快</li>
        </ul>
        <button class="btn btn-primary btn-big" id="sw-start">开始挑战 ⚡</button>
        <button class="btn btn-ghost" id="sw-back">返回</button>
      </div>
    `;
    document.getElementById('sw-start').addEventListener('click', begin);
    document.getElementById('sw-back').addEventListener('click', () => UI.goHome());
  }

  function begin() {
    const pool = questionPool();
    const scriptPools = { hira: pool.filter(x => x.s === 'hira'), kata: pool.filter(x => x.s === 'kata') };
    const state = {
      score: 0, combo: 0, maxCombo: 0, correct: 0, wrong: 0, t0: 0, cur: null, locked: false,
      askAt: 0, waitMs: 1600
    };
    running = true;

    UI.show('swift-run');
    const root = document.getElementById('screen');
    root.innerHTML = `
      <div class="swift-hud">
        <button class="btn-ghost" id="sw-quit">✕ 结束</button>
        <div class="swift-score">得分 <b id="sw-score">0</b></div>
        <div class="swift-combo" id="sw-combo"></div>
      </div>
      <div class="swift-timebar"><i id="sw-time"></i></div>
      <div class="swift-stage ${STORE.buffActive() ? 'buffed' : ''}" id="sw-stage"></div>
      <div class="swift-count" id="sw-count"></div>
    `;
    document.getElementById('sw-quit').addEventListener('click', () => stop(false));

    // 3-2-1 倒计时
    const countEl = document.getElementById('sw-count');
    let n = 3;
    SFX.tick();
    countEl.textContent = n;
    const cd = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(cd);
        countEl.textContent = '行け！';
        setTimeout(() => { countEl.remove(); start(); }, 500);
      } else {
        SFX.tick();
        countEl.textContent = n;
      }
    }, 700);

    function start() {
      state.t0 = performance.now();
      tickTimer();
      nextQ();
      schedule();
    }

    function tickTimer() {
      const el = document.getElementById('sw-time');
      if (!el) return;
      const left = Math.max(0, 1 - (performance.now() - state.t0) / (DURATION * 1000));
      el.style.width = (left * 100) + '%';
      if (left <= 0) { stop(true); return; }
      const remain = Math.ceil(left * DURATION);
      if (remain <= 5 && state.lastRemain !== remain) {
        state.lastRemain = remain;
        SFX.tick();
      }
      raf = requestAnimationFrame(tickTimer);
    }

    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!running) return;
        // 超时未答视为错误
        if (state.cur && !state.locked) markAnswer(-1);
      }, state.waitMs + 80);
    }

    function nextQ() {
      if (!running) return;
      const entries = scriptPools.hira.length && Math.random() < 0.5 ? scriptPools.hira : scriptPools.kata;
      if (!entries.length) { stop(true); return; }
      const items = entries.map(x => ({ x, w: Math.max(0.4, 3 - (STORE.state.srs[K.key(x.s, x.k)] || {}).b * 0.5 + Math.random()) }));
      const x = U.weightedPick(items).x;
      const q = QUIZ.makeQuestion(x, { pool: K.ALL.filter(o => o.s === x.s && !o.you), forceType: 'k2r' });
      state.cur = q; state.locked = false;
      state.waitMs = Math.max(750, 1600 - state.correct * 14); // 速度递增
      renderQ(q);
      schedule();
    }

    function renderQ(q) {
      const stage = document.getElementById('sw-stage');
      if (!stage) return;
      stage.innerHTML = `
        <div class="q-prompt">${q.prompt}</div>
        <div class="q-options q-fast">
          ${q.options.map((o, i) => `<button class="q-opt" data-idx="${i}">${o.r}</button>`).join('')}
        </div>`;
      stage.querySelectorAll('.q-opt').forEach(b =>
        b.addEventListener('click', () => markAnswer(parseInt(b.dataset.idx, 10))));
    }

    function markAnswer(idx) {
      if (state.locked || !state.cur) return;
      state.locked = true;
      clearTimeout(timer);
      const q = state.cur;
      const ok = idx === q.answerIdx;
      const stage = document.getElementById('sw-stage');
      if (stage) {
        const opts = stage.querySelectorAll('.q-opt');
        opts.forEach((b, i) => {
          b.disabled = true;
          if (i === q.answerIdx) b.classList.add('right');
          else if (i === idx) b.classList.add('wrong');
        });
        if (ok) FX.burstAtEl(opts[idx], 'spark');
      }
      const entry = q.x;
      if (ok) {
        state.combo++; state.correct++;
        state.maxCombo = Math.max(state.maxCombo, state.combo);
        const frenzy = state.combo >= 10;
        const mult = frenzy ? 2 : 1;
        const gain = (10 + Math.min(10, Math.floor(state.combo / 5) * 2)) * mult;
        state.score += gain;
        STORE.answer(entry, true, state.combo);
        SFX.correct(state.combo);
        if (state.combo >= 3) UI.praise(state.combo);
        document.getElementById('sw-stage')?.classList.toggle('frenzy', frenzy);
      } else {
        state.combo = 0; state.wrong++;
        STORE.answer(entry, false, 0);
        SFX.wrong(); FX.shake();
        document.getElementById('sw-stage')?.classList.remove('frenzy');
      }
      const scoreEl = document.getElementById('sw-score');
      if (scoreEl) scoreEl.textContent = state.score;
      const comboEl = document.getElementById('sw-combo');
      if (comboEl) comboEl.textContent = state.combo > 0 ? state.combo + ' 连击' : '';
      UI.syncTopbar();
      setTimeout(nextQ, ok ? 220 : 620);
    }

    function stop(natural) {
      if (!running) return;
      running = false;
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
      const isRecord = state.score > STORE.state.swift.best;
      STORE.recordSwift(state.score, state.correct);
      if (natural && state.correct > 0) STORE.markRoundCompleted();
      showResult(state, isRecord);
    }
  }

  function showResult(state, isRecord) {
    const total = state.correct + state.wrong;
    const acc = total ? Math.round(state.correct / total * 100) : 0;
    const root = document.getElementById('screen');
    root.innerHTML = `
      <div class="swift-result pop-in">
        <h1 class="screen-title">${isRecord ? '🏆 新纪录！' : '时间到！'}</h1>
        <div class="swift-final">${state.score}</div>
        <div class="result-grid">
          <div><b>${state.correct}</b><span>答对</span></div>
          <div><b>${acc}%</b><span>正确率</span></div>
          <div><b>${state.maxCombo}</b><span>最高连击</span></div>
          <div><b>${STORE.state.swift.best}</b><span>最高分</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="sr-home">返回</button>
          <button class="btn btn-primary" id="sr-again">再战一局</button>
        </div>
      </div>`;
    document.getElementById('sr-home').addEventListener('click', () => UI.show('swift'));
    document.getElementById('sr-again').addEventListener('click', () => { UI.show('swift'); setTimeout(begin, 50); });
    if (isRecord && state.score > 0) { FX.fireworksShow(6); SFX.fanfare(); }
    UI.syncTopbar();
  }

  UI.register('swift', { mount });
  UI.register('swift-run', { mount: () => {} });
  return {};
})();
