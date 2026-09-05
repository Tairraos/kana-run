/* 配对消除：假名 ↔ 罗马音 记忆翻牌 */
window.MatchScreen = (function () {
  'use strict';
  const U = window.U, K = window.KANA, STORE = window.STORE, UI = window.UI,
    FX = window.FX, SFX = window.SFX;

  let game = null;

  function mount(root) {
    const st = STORE.state;
    root.innerHTML = `
      <div class="screen-head">
        <h1 class="screen-title">配对消除</h1>
        <p class="screen-sub">翻开卡片，让假名和拼音成双</p>
      </div>
      <div class="match-intro">
        <button class="btn btn-primary btn-big" data-pairs="6">轻松局 · 6 对</button>
        <button class="btn btn-primary btn-big" data-pairs="8">进阶局 · 8 对</button>
        <div class="match-best">
          ${st.match.bestMoves['6'] ? `<span>6 对最佳：<b>${st.match.bestMoves['6']}</b> 步</span>` : ''}
          ${st.match.bestMoves['8'] ? `<span>8 对最佳：<b>${st.match.bestMoves['8']}</b> 步</span>` : ''}
          ${!st.match.bestMoves['6'] && !st.match.bestMoves['8'] ? '步数越少，眼力越好' : ''}
        </div>
        <button class="btn btn-ghost" id="mt-back">返回</button>
      </div>
    `;
    root.querySelectorAll('[data-pairs]').forEach(b =>
      b.addEventListener('click', () => start(parseInt(b.dataset.pairs, 10))));
    document.getElementById('mt-back').addEventListener('click', () => UI.goHome());
  }

  function start(pairs) {
    // 选不重复罗马音的假名（避免两张拼音卡都写 a 的歧义）
    const base = U.shuffle(K.ALL.filter(x => !x.you));
    const chosen = [];
    const usedR = new Set();
    for (const x of base) {
      if (usedR.has(x.r)) continue;
      usedR.add(x.r);
      chosen.push(x);
      if (chosen.length >= pairs) break;
    }
    const cards = [];
    chosen.forEach((x, i) => {
      cards.push({ pair: i, kind: 'kana', text: x.k, x });
      cards.push({ pair: i, kind: 'romaji', text: x.r, x });
    });
    game = { pairs, cards: U.shuffle(cards), open: [], matched: 0, moves: 0, t0: Date.now(), lock: false };
    UI.show('match-run');
    const root = document.getElementById('screen');
    root.innerHTML = `
      <div class="match-hud">
        <button class="btn-ghost" id="mt-quit">✕ 结束</button>
        <span class="match-moves">步数 <b id="mt-moves">0</b></span>
        <span class="match-time" id="mt-time">0:00</span>
        <span class="match-left">剩 <b id="mt-left">${pairs}</b> 对</span>
      </div>
      <div class="match-grid cols-${pairs === 6 ? 4 : 4}" id="mt-grid"></div>
    `;
    document.getElementById('mt-quit').addEventListener('click', () => { game = null; UI.show('match'); });
    const grid = document.getElementById('mt-grid');
    game.cards.forEach((c, i) => {
      const el = U.el(`
        <button class="mcard" data-i="${i}">
          <span class="mcard-inner">
            <span class="mcard-face mcard-back">🌸</span>
            <span class="mcard-face mcard-front ${c.kind}">${c.text}</span>
          </span>
        </button>`);
      el.addEventListener('click', () => flip(i));
      grid.appendChild(el);
    });
    tickTime();
  }

  function tickTime() {
    if (!game) return;
    const el = document.getElementById('mt-time');
    if (el) el.textContent = U.fmtTime((Date.now() - game.t0) / 1000);
    setTimeout(tickTime, 500);
  }

  function flip(i) {
    if (!game || game.lock) return;
    const card = game.cards[i];
    const el = document.querySelector(`.mcard[data-i="${i}"]`);
    if (!el || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    SFX.flip();
    el.classList.add('flipped');
    game.open.push({ i, card });
    if (game.open.length < 2) return;

    game.moves++;
    document.getElementById('mt-moves').textContent = game.moves;
    const [a, b] = game.open;
    game.open = [];
    if (a.card.pair === b.card.pair && a.card.kind !== b.card.kind) {
      const eb = document.querySelector(`.mcard[data-i="${b.i}"]`);
      [a, b].forEach(o => {
        document.querySelector(`.mcard[data-i="${o.i}"]`).classList.add('matched');
      });
      game.matched++;
      SFX.match();
      FX.burstAtEl(eb, 'spark');
      const leftEl = document.getElementById('mt-left');
      if (leftEl) leftEl.textContent = game.pairs - game.matched;
      if (game.matched === game.pairs) setTimeout(done, 500);
    } else {
      game.lock = true;
      SFX.wrong();
      setTimeout(() => {
        [a, b].forEach(o => {
          const e = document.querySelector(`.mcard[data-i="${o.i}"]`);
          if (e) e.classList.remove('flipped');
        });
        game.lock = false;
      }, 750);
    }
  }

  function done() {
    const time = (Date.now() - game.t0) / 1000;
    const { pairs, moves } = game;
    STORE.recordMatch(pairs, moves, time);
    STORE.addPetals(pairs * 2);
    STORE.addXp(20);
    STORE.markRoundCompleted();
    const isBest = STORE.state.match.bestMoves[pairs] === moves;
    const g = U.el(`
      <div class="result">
        <div class="result-stars stamp-in">🎴</div>
        <h3 class="result-title">${isBest ? '新纪录！' : '全部配对！'}</h3>
        <div class="result-grid">
          <div><b>${moves}</b><span>步数</span></div>
          <div><b>${U.fmtTime(time)}</b><span>用时</span></div>
          <div><b>+${pairs * 2}</b><span>花瓣</span></div>
          <div><b>+20</b><span>经验</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="md-home">返回</button>
          <button class="btn btn-primary" id="md-again">再来一局</button>
        </div>
      </div>`);
    const m = UI.modal({ title: '配对完成', body: g, onClose: null });
    g.querySelector('#md-home').addEventListener('click', () => { m.close(); game = null; UI.show('match'); });
    g.querySelector('#md-again').addEventListener('click', () => { m.close(); UI.show('match'); setTimeout(() => start(pairs), 60); });
    FX.confettiBurst();
    SFX.fanfare();
    UI.syncTopbar();
  }

  UI.register('match', { mount });
  UI.register('match-run', { mount: () => {} });
  return {};
})();
