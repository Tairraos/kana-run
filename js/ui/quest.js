/* 冒险闯关：章节地图 + 学习卡 → 答题 → 结算 */
window.QuestScreen = (function () {
  'use strict';
  const U = window.U, K = window.KANA, ROWS = window.ROWS, STORE = window.STORE,
    UI = window.UI, FX = window.FX, SFX = window.SFX, QUIZ = window.QUIZ, SRS = window.SRS;

  let selChapter = null;

  /* ============ 地图 ============ */
  function mountMap(root, params) {
    const CH = ROWS.CHAPTERS;
    if (params && params.chapter) selChapter = params.chapter;
    if (selChapter == null) {
      // 默认：第一个未完成的已解锁章节
      selChapter = 0;
      for (let i = 0; i < CH.length; i++) {
        const cleared = STORE.chapterClearedCount(CH[i].id);
        if (STORE.chapterUnlocked(i) && cleared < CH[i].stages.length) { selChapter = i; break; }
      }
    }
    const ch = CH[selChapter];
    const unlocked = STORE.chapterUnlocked(selChapter);

    root.innerHTML = `
      <div class="screen-head">
        <h1 class="screen-title">冒险闯关</h1>
        <p class="screen-sub">沿着灯火小径，逐行点亮五十音</p>
      </div>
      <div class="ch-tabs" id="ch-tabs"></div>
      <div class="ch-body">
        <div class="ch-info">
          <h2>${unlocked ? ch.name : '？？？'}</h2>
          <p>${unlocked ? ch.sub : '通过前一篇 70% 的关卡后解锁'}</p>
          <span class="ch-progress">${STORE.chapterClearedCount(ch.id)}/${ch.stages.length} 关</span>
        </div>
        <div class="stage-path" id="stage-path"></div>
      </div>
    `;

    const tabs = document.getElementById('ch-tabs');
    CH.forEach((c, i) => {
      const un = STORE.chapterUnlocked(i);
      const b = U.el(`<button class="ch-tab ${i === selChapter ? 'on' : ''} ${un ? '' : 'locked'}">
        <span>${un ? c.name : '🔒'}</span><small>${STORE.chapterClearedCount(c.id)}/${c.stages.length}</small>
      </button>`);
      b.addEventListener('click', () => {
        SFX.click();
        if (!un) { UI.toast('先通过前一篇 70% 的关卡吧', '🔒'); return; }
        selChapter = i;
        mountMap(root);
      });
      tabs.appendChild(b);
    });

    const path = document.getElementById('stage-path');
    ROWS.STAGES.filter(s => s.ch === ch.id).forEach((st, i) => {
      const rec = STORE.stageRec(st.id) || { stars: 0 };
      const un = unlocked && STORE.stageUnlocked(st, selChapter);
      const node = U.el(`
        <button class="stage-node ${rec.stars > 0 ? 'cleared' : ''} ${un ? '' : 'locked'}" ${un ? '' : 'disabled'}>
          <span class="stage-lamp">${un ? (rec.stars > 0 ? '🏮' : '🕯') : '🔒'}</span>
          <span class="stage-name">${un ? st.name : '？？？'}</span>
          <span class="stage-meta">${UI.starRow(rec.stars)} · ${st.kana.length} 字 · ${st.q} 题</span>
        </button>`);
      if (un) node.addEventListener('click', () => { SFX.click(); startStage(st.id); });
      path.appendChild(node);
    });
  }

  /* ============ 关卡流程 ============ */
  let session = null, stage = null, phase = null, quizState = null;
  let learnIdx = 0;

  function startStage(stageId) {
    stage = ROWS.byId[stageId];
    learnIdx = 0;
    const script = stage.kana[0].s;
    const stageKeys = new Set(stage.kana.map(x => K.key(x.s, x.k)));
    const reviewPool = STORE.seenEntries().filter(x => !stageKeys.has(K.key(x.s, x.k)) && x.s === script);
    const voiceOk = SFX.hasJapaneseVoice() && STORE.state.settings.voice;
    session = QUIZ.session({
      mainPool: stage.kana,
      reviewPool,
      srsGet: key => STORE.state.srs[key],
      count: stage.q,
      allowListen: voiceOk,
      distractorPool: K.ALL.filter(x => x.s === script)
    });
    UI.show('quest-play');
  }

  function mountPlay(root) {
    phase = 'learn';
    root.innerHTML = `
      <div class="quest-top">
        <button class="btn-ghost" id="q-quit">✕ 离开</button>
        <h2 class="quest-title">${stage.name}</h2>
        <span class="quest-tag">${stage.kana.length} 字 · ${stage.q} 题</span>
      </div>
      <div id="q-body"></div>
    `;
    document.getElementById('q-quit').addEventListener('click', () => confirmQuit());
    renderLearn(document.getElementById('q-body'));
  }

  function confirmQuit() {
    if (phase === 'quiz') {
      const m = UI.modal({
        title: '要离开吗？',
        body: '<p class="modal-text">本回合进度不会保存，学习卡随时可以再看。</p>',
        onClose: null
      });
      const acts = U.el(`<div class="modal-actions">
        <button class="btn btn-ghost" id="m-stay">继续答题</button>
        <button class="btn" id="m-leave">离开</button></div>`);
      m.body.appendChild(acts);
      acts.querySelector('#m-stay').addEventListener('click', () => m.close());
      acts.querySelector('#m-leave').addEventListener('click', () => { m.close(); phase = 'map'; UI.show('quest', { chapter: CHIdxOfStage() }); });
    } else {
      phase = 'map';
      UI.show('quest', { chapter: CHIdxOfStage() });
    }
  }
  function CHIdxOfStage() {
    return ROWS.CHAPTERS.findIndex(c => c.id === stage.ch);
  }

  /* ---- 学习卡 ---- */
  function renderLearn(body) {
    const k = stage.kana[learnIdx];
    const last = learnIdx === stage.kana.length - 1;
    body.innerHTML = `
      <div class="learn-card pop-in">
        <div class="learn-script">${k.s === 'hira' ? '平假名' : '片假名'} · ${k.kind || '清音'}</div>
        <div class="learn-kana-row">
          <span class="learn-kana">${k.k}</span>
          ${UI.speakerBtn(k.k)}
        </div>
        <div class="learn-romaji">${k.r}</div>
        ${k.o ? `<div class="learn-origin">字源「${k.o}」</div>` : ''}
        <p class="learn-memo">${k.m}</p>
        <div class="learn-dots">${stage.kana.map((x, i) =>
          `<i class="${i === learnIdx ? 'on' : i < learnIdx ? 'done' : ''}"></i>`).join('')}</div>
        <div class="learn-actions">
          ${learnIdx > 0 ? '<button class="btn btn-ghost" id="l-prev">上一位</button>' : ''}
          <button class="btn btn-primary" id="l-next">${last ? '开始挑战 ⚔️' : '认识啦，下一位'}</button>
        </div>
      </div>`;
    body.querySelector('#l-next').addEventListener('click', () => {
      SFX.click();
      if (last) beginQuiz();
      else { learnIdx++; renderLearn(body); }
    });
    const prev = body.querySelector('#l-prev');
    if (prev) prev.addEventListener('click', () => { learnIdx--; renderLearn(body); });
    SFX.speak(k.k);
  }

  /* ---- 答题 ---- */
  function beginQuiz() {
    phase = 'quiz';
    quizState = { i: 0, combo: 0, correct: 0, wrong: 0, xp: 0, petals: 0, cur: null, locked: false };
    nextQuestion();
  }

  function nextQuestion() {
    const q = session.next();
    const body = document.getElementById('q-body');
    if (!q) { finish(); return; }
    quizState.cur = q;
    quizState.locked = false;

    const promptHtml = q.promptKind === 'romaji'
      ? `<div class="q-prompt-label">选出它的假名</div><div class="q-prompt q-romaji">${q.prompt}</div>`
      : q.promptKind === 'listen'
        ? `<div class="q-prompt-label">听音辨字</div><button class="q-prompt q-listen" id="q-replay">🔊 再听一次</button>`
        : q.promptKind === 'cross'
          ? `<div class="q-prompt-label">它的${q.crossTarget === 'kata' ? '片假名' : '平假名'}是？</div><div class="q-prompt">${q.prompt}</div><div class="q-prompt-speak">${UI.speakerBtn(q.x.k)}</div>`
          : `<div class="q-prompt-label">这个假名读作？</div><div class="q-prompt">${q.prompt}</div><div class="q-prompt-speak">${UI.speakerBtn(q.x.k)}</div>`;

    body.innerHTML = `
      <div class="quiz-hud">
        <span class="q-progress">第 ${quizState.i + 1}/${stage.q} 题</span>
        <span class="q-combo ${quizState.combo >= 5 ? 'hot' : ''}">${quizState.combo > 0 ? `${quizState.combo} 连击` : '　'}</span>
      </div>
      <div class="q-bar"><i style="width:${quizState.i / stage.q * 100}%"></i></div>
      ${promptHtml}
      <div class="q-options">
        ${q.options.map((o, idx) => `
          <button class="q-opt" data-idx="${idx}">
            <span class="q-opt-main">${q.promptKind === 'romaji' ? o.k : (q.promptKind === 'k2r' ? o.r : o.k)}</span>
          </button>`).join('')}
      </div>
      <div class="q-feedback" id="q-feedback"></div>
    `;

    body.querySelectorAll('.q-opt').forEach(b =>
      b.addEventListener('click', () => answer(parseInt(b.dataset.idx, 10))));
    const replay = document.getElementById('q-replay');
    if (replay) replay.addEventListener('click', () => SFX.speak(q.x.k));

    if (q.promptKind === 'listen') SFX.speak(q.x.k);
    else if (q.promptKind === 'k2r' && STORE.state.settings.voice) SFX.speak(q.x.k);
  }

  function answer(idx) {
    if (quizState.locked) return;
    quizState.locked = true;
    const q = quizState.cur;
    const ok = idx === q.answerIdx;
    const body = document.getElementById('q-body');
    const opts = body.querySelectorAll('.q-opt');
    opts.forEach((b, i) => {
      b.disabled = true;
      if (i === q.answerIdx) b.classList.add('right');
      else if (i === idx) b.classList.add('wrong');
    });

    const entry = q.promptKind === 'cross' ? QUIZ.counterpart(q.x) : q.x;
    const ev = STORE.answer(entry, ok, ok ? quizState.combo + 1 : 0);
    if (ok) {
      quizState.combo++;
      quizState.correct++;
      quizState.xp += ev.xp; quizState.petals += ev.petals;
      SFX.correct(quizState.combo);
      const btn = opts[idx];
      FX.burstAtEl(btn, 'spark');
      if (quizState.combo >= 3) UI.praise(quizState.combo);
      if (quizState.combo > 0 && quizState.combo % 10 === 0) {
        FX.fireworksShow(3);
        FX.shake();
        UI.toast(`${quizState.combo} 连击！言灵在为你鼓掌`, '🎆');
      }
    } else {
      quizState.combo = 0;
      quizState.wrong++;
      SFX.wrong();
      FX.shake();
    }

    const fb = document.getElementById('q-feedback');
    if (fb) {
      fb.innerHTML = ok
        ? `<span class="fb-ok">✔ ${entry.k} = ${entry.r}</span>`
        : `<span class="fb-bad">✘ 正确是 <b>${entry.k}（${entry.r}）</b> · ${entry.m}</span>`;
    }
    // 读一遍正确答案，加深读音记忆
    if (STORE.state.settings.voice) SFX.speak(entry.k);

    if (ev.levelUp) {
      setTimeout(() => {
        FX.fireworksShow(6);
        SFX.levelup();
        UI.toast(`升级！Lv.${ev.level} —— ${STORE.TITLES[Math.min(ev.level - 1, STORE.TITLES.length - 1)]}`, '🎉');
      }, 350);
    }
    UI.syncTopbar();

    quizState.i++;
    setTimeout(() => { if (phase === 'quiz') nextQuestion(); }, ok ? 850 : 1750);
  }

  /* ---- 结算 ---- */
  function finish() {
    const total = quizState.correct + quizState.wrong;
    const acc = total ? quizState.correct / total : 0;
    const stars = acc >= 1 ? 3 : acc >= 0.85 ? 2 : acc >= 0.6 ? 1 : 0;
    const rec = STORE.recordStage(stage.id, stars);
    if (stars > 0) STORE.markRoundCompleted();

    const body = U.el(`
      <div class="result">
        <div class="result-stars ${stars > 0 ? 'stamp-in' : ''}">${UI.starRow(stars)}</div>
        <h3 class="result-title">${stars === 3 ? '完美通关！' : stars > 0 ? '通关！' : '差一点点'}</h3>
        <p class="result-sub">${stars === 3 ? '一字未错，灯火为你全亮' : stars > 0 ? '这一行已经记在你的路上' : '看看助记再战一轮，你已经很近了'}</p>
        <div class="result-grid">
          <div><b>${quizState.correct}/${total}</b><span>答对</span></div>
          <div><b>${Math.round(acc * 100)}%</b><span>正确率</span></div>
          <div><b>+${quizState.xp}</b><span>经验</span></div>
          <div><b>+${quizState.petals}</b><span>花瓣</span></div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="r-map">返回地图</button>
          <button class="btn btn-primary" id="r-again">再来一遍</button>
        </div>
      </div>
    `);
    const m = UI.modal({ title: '关卡结算', body, onClose: null });
    body.querySelector('#r-map').addEventListener('click', () => { m.close(); UI.show('quest', { chapter: CHIdxOfStage() }); });
    body.querySelector('#r-again').addEventListener('click', () => { m.close(); startStage(stage.id); });

    if (stars === 3) { FX.fireworksShow(6); FX.confettiBurst(); SFX.fanfare(); }
    else if (stars > 0) { FX.confettiBurst(); SFX.match(); }
    UI.syncTopbar();
  }

  UI.register('quest', { mount: mountMap });
  UI.register('quest-play', { mount: mountPlay });
  return {};
})();
