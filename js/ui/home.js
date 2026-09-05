/* 首页：今日目标 + 御神签 + 模式入口 */
window.HomeScreen = (function () {
  'use strict';
  const U = window.U, STORE = window.STORE, UI = window.UI, FX = window.FX;
  const K = window.KANA, ROWS = window.ROWS;

  function totalStars() {
    let got = 0, max = 0;
    ROWS.STAGES.forEach(s => { max += 3; got += (STORE.stageRec(s.id) || { stars: 0 }).stars; });
    return { got, max };
  }

  function masteryPct() {
    const seen = STORE.seenEntries().length;
    return Math.round(seen / K.ALL.length * 100);
  }

  function mount(root) {
    const st = STORE.state;
    const p = STORE.levelProgress();
    const stars = totalStars();
    const goal = STORE.DAILY_GOAL;
    const omikujiDone = STORE.omikujiDone();
    const buffed = STORE.buffActive();
    const proverb = U.randItem(UI.PROVERBS);
    const omikujiState = omikujiDone
      ? (st.omikuji.fortune === 'daikichi' ? '大吉' : st.omikuji.fortune === 'chukichi' ? '中吉' : st.omikuji.fortune === 'shokichi' ? '小吉' : st.omikuji.fortune === 'kichi' ? '吉' : st.omikuji.fortune === 'suekichi' ? '末吉' : '凶')
      : null;

    root.innerHTML = `
      <section class="hero">
        <div class="hero-kana" aria-hidden="true">あ</div>
        <div class="hero-sun" id="hero-sun" title=""></div>
        <h1 class="hero-title">五十音物語</h1>
        <p class="hero-sub">KANA MONOGATARI —— 在夜樱之下，把五十音刻进记忆</p>
        <div class="hero-badges">
          <span class="badge">Lv.${p.level} · ${p.title}</span>
          <span class="badge">⭐ ${stars.got}/${stars.max}</span>
          <span class="badge">📚 掌握 ${masteryPct()}%</span>
        </div>
      </section>

      <section class="daily-card">
        <div class="daily-head">
          <h2>今日修行</h2>
          ${buffed ? '<span class="buff-tag">签运加护 · XP×2</span>' : ''}
        </div>
        <div class="daily-bars">
          <div class="daily-bar">
            <span>通关回合</span>
            <div class="bar"><i style="width:${Math.min(100, st.daily.rounds / goal.rounds * 100)}%"></i></div>
            <b>${Math.min(st.daily.rounds, goal.rounds)}/${goal.rounds}</b>
          </div>
          <div class="daily-bar">
            <span>答对题数</span>
            <div class="bar"><i style="width:${Math.min(100, st.daily.correct / goal.correct * 100)}%"></i></div>
            <b>${Math.min(st.daily.correct, goal.correct)}/${goal.correct}</b>
          </div>
        </div>
        <button class="omikuji-btn ${omikujiDone ? 'done' : 'glow'}" id="btn-omikuji">
          <span class="omikuji-box">🎋</span>
          <span>${omikujiDone ? `今日运势：${omikujiState}` : '抽取今日御神签'}</span>
        </button>
      </section>

      <section class="mode-grid">
        <button class="mode-card mode-quest" data-mode="quest">
          <span class="mode-icon">⛩️</span>
          <span class="mode-name">冒险闯关</span>
          <span class="mode-desc">四篇廿六关，逐行点亮五十音</span>
          <span class="mode-meta">⭐ ${stars.got}/${stars.max}</span>
        </button>
        <button class="mode-card mode-swift" data-mode="swift">
          <span class="mode-icon">⚡</span>
          <span class="mode-name">极速挑战</span>
          <span class="mode-desc">60 秒连击不停，分数见真章</span>
          <span class="mode-meta">最高 ${st.swift.best}</span>
        </button>
        <button class="mode-card mode-match" data-mode="match">
          <span class="mode-icon">🎴</span>
          <span class="mode-name">配对消除</span>
          <span class="mode-desc">假名与拼音，翻牌成双</span>
          <span class="mode-meta">${st.match.bestMoves['8'] ? `最佳 ${st.match.bestMoves['8']} 步` : '未开始'}</span>
        </button>
        <button class="mode-card mode-learn" data-mode="learn">
          <span class="mode-icon">📖</span>
          <span class="mode-name">五十音图鉴</span>
          <span class="mode-desc">助记 · 字源 · 朗读，随时复习</span>
          <span class="mode-meta">${STORE.seenEntries().length}/${K.ALL.length} 已遇见</span>
        </button>
      </section>

      <section class="stats-strip">
        <button class="stats-link" id="btn-collection">🏆 收藏室 · 言灵 ${STORE.kotodamaCount()}/24 · 成就 ${Object.keys(st.achv).length}/18</button>
      </section>

      <footer class="proverb">${proverb}</footer>
    `;

    root.querySelectorAll('[data-mode]').forEach(b =>
      b.addEventListener('click', () => { window.SFX.click(); UI.show(b.dataset.mode); }));
    document.getElementById('btn-omikuji').addEventListener('click', () => window.Omikuji.open());
    document.getElementById('btn-collection').addEventListener('click', () => { window.SFX.click(); UI.show('collection'); });

    // 彩蛋：连点日之丸三次 → 樱花暴风雪
    const sun = document.getElementById('hero-sun');
    let sunClicks = 0, sunTimer = null;
    sun.addEventListener('click', () => {
      sunClicks++;
      clearTimeout(sunTimer);
      sunTimer = setTimeout(() => { sunClicks = 0; }, 1200);
      if (sunClicks >= 3) {
        sunClicks = 0;
        FX.sakuraStorm();
        UI.toast('樱花暴风雪！🌸🌸🌸', '🌪');
        STORE.markSave();
      }
    });
  }

  UI.register('home', { mount });
  return {};
})();
