/* UI 共享件：路由 / 弹窗 / 吐司 / 顶栏 / 浮空称赞词 */
window.UI = (function () {
  'use strict';
  const U = window.U, STORE = window.STORE;

  const screens = {};
  let current = null;
  let currentName = null;

  const PRAISE = {
    low: ['いいね！', 'ナイス！', 'よし！'],
    mid: ['すごい！', 'お見事！', 'グレート！'],
    high: ['すばらしい！', '完璧！', '流石！']
  };
  const PROVERBS = [
    '継続は力なり —— 坚持就是力量',
    '花は桜木、人は武士 —— 花看樱花，人重风骨',
    '七転び八起き —— 跌倒七次，站起八次',
    '一期一会 —— 珍惜此刻一次的相会',
    '石の上にも三年 —— 功夫下到家，石头也焐热',
    '案ずるより産むが易し —— 想再多，不如先做做看',
    '今日できることを明日にするな —— 今日事，今日毕'
  ];

  function register(name, def) { screens[name] = def; }

  function show(name, params) {
    if (currentName && screens[currentName] && screens[currentName].unmount) {
      try { screens[currentName].unmount(); } catch (e) {}
    }
    const screen = document.getElementById('screen');
    screen.innerHTML = '';
    screen.dataset.name = name;
    currentName = name;
    screens[name].mount(screen, params || {});
    syncTopbar();
    window.scrollTo(0, 0);
  }

  function goHome() { show('home'); }

  /* ---- 顶栏 ---- */
  function syncTopbar() {
    const bar = document.getElementById('topbar');
    if (!bar) return;
    const p = STORE.levelProgress();
    const st = STORE.state;
    bar.innerHTML = `
      <button class="tb-home" id="tb-home" aria-label="回主页" ${currentName === 'home' ? 'disabled' : ''}>
        <span class="tb-home-mark">五十</span>
      </button>
      <div class="tb-level">
        <span class="tb-lv">Lv.${p.level}</span>
        <span class="tb-title">${p.title}</span>
        <div class="tb-xpbar"><i style="width:${Math.round(p.pct * 100)}%"></i></div>
      </div>
      <div class="tb-right">
        <span class="tb-chip ${STORE.buffActive() ? 'buffed' : ''}" title="樱花钱">🌸 ${st.petals}</span>
        <span class="tb-chip" title="连续达标天数">🔥 ${st.streak.count}</span>
        <button class="tb-icon" id="tb-omikuji" title="御神签（每日一抽）" aria-label="御神签">🎋</button>
        <button class="tb-icon" id="tb-settings" title="设置" aria-label="设置">⚙️</button>
      </div>`;
    const homeBtn = document.getElementById('tb-home');
    if (homeBtn) homeBtn.addEventListener('click', goHome);
    document.getElementById('tb-omikuji').addEventListener('click', () => window.Omikuji.open());
    document.getElementById('tb-settings').addEventListener('click', () => window.Settings.open());
  }

  /* ---- 吐司 ---- */
  function toast(msg, icon) {
    const root = document.getElementById('toast-root');
    const t = U.el(`<div class="toast">${icon ? `<span class="toast-icon">${icon}</span>` : ''}<span>${msg}</span></div>`);
    root.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, 2600);
  }

  function achievementToast(a) {
    const root = document.getElementById('toast-root');
    const t = U.el(`<div class="toast toast-achv"><span class="toast-icon">${a.icon}</span><span><b>成就达成 · ${a.name}</b><br><small>${a.desc}</small></span></div>`);
    root.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    window.FX.burstAtEl(t, 'confetti');
    window.SFX.stamp();
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3400);
  }

  /* ---- 弹窗 ---- */
  function modal(opts) {
    const root = document.getElementById('modal-root');
    const wrap = U.el(`<div class="modal-wrap"><div class="modal-backdrop"></div>
      <div class="modal ${opts.wide ? 'modal-wide' : ''}" role="dialog" aria-modal="true">
        <button class="modal-x" aria-label="关闭">✕</button>
        ${opts.title ? `<h3 class="modal-title">${opts.title}</h3>` : ''}
        <div class="modal-body"></div>
      </div></div>`);
    const body = wrap.querySelector('.modal-body');
    if (typeof opts.body === 'string') body.innerHTML = opts.body; else body.appendChild(opts.body);
    const close = () => {
      wrap.classList.add('closing');
      setTimeout(() => wrap.remove(), 240);
      if (opts.onClose) opts.onClose();
    };
    wrap.querySelector('.modal-x').addEventListener('click', close);
    wrap.querySelector('.modal-backdrop').addEventListener('click', close);
    root.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
    return { close, root: wrap, body };
  }

  /* ---- 浮空称赞词 ---- */
  function praise(combo) {
    const tier = combo >= 12 ? 'high' : combo >= 6 ? 'mid' : 'low';
    const el = U.el(`<div class="praise">${U.randItem(PRAISE[tier])}</div>`);
    if (combo >= 6) el.style.color = 'var(--accent)';
    document.getElementById('screen').appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  /* ---- 小组件 ---- */
  function starRow(n, total) {
    total = total == null ? 3 : total;
    let s = '';
    for (let i = 0; i < total; i++) s += i < n ? '★' : '☆';
    return `<span class="stars">${s}</span>`;
  }

  function speakerBtn(kana) {
    return `<button class="speak-btn" data-speak="${kana}" aria-label="朗读">🔊</button>`;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-speak]');
    if (b) { window.SFX.speak(b.dataset.speak); e.stopPropagation(); }
  });

  return {
    register, show, goHome, syncTopbar, toast, achievementToast, modal, praise,
    starRow, speakerBtn, currentName: () => currentName,
    PROVERBS
  };
})();
