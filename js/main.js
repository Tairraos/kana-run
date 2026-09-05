/* 启动：数据校验 → 主题 → 事件 → 首屏 */
(function () {
  'use strict';
  const U = window.U, K = window.KANA, STORE = window.STORE, UI = window.UI, SFX = window.SFX;

  // 运行时错误收集（调试/自检用）
  window.__KQ_ERRORS = [];
  window.addEventListener('error', e => {
    window.__KQ_ERRORS.push(String(e.message || e));
  });
  window.addEventListener('unhandledrejection', e => {
    window.__KQ_ERRORS.push('promise: ' + String(e.reason));
  });

  // 边界处校验数据形状：加载即失败可见
  const counts = K.assert();
  console.info('[五十音物語] 假名数据校验通过', counts);

  window.applyTheme = function (id) {
    document.body.dataset.theme = id;
  };
  applyTheme(STORE.state.settings.theme || 'neon');

  // 成就吐司
  STORE.on('achievement', a => UI.achievementToast(a));

  // BGM 需要用户手势后启动
  if (STORE.state.settings.bgm) {
    const kick = () => SFX.startBgm();
    window.addEventListener('pointerdown', kick, { once: true });
  }
  STORE.on('setting', ({ key, value }) => {
    if (key === 'bgm') value ? SFX.startBgm() : SFX.stopBgm();
  });

  // 键盘作答（1-4）
  document.addEventListener('keydown', e => {
    if (['1', '2', '3', '4'].includes(e.key)) {
      const opts = document.querySelectorAll('#screen .q-opt:not([disabled])');
      const idx = parseInt(e.key, 10) - 1;
      if (opts[idx]) opts[idx].click();
    }
    if (e.key === 'Escape') {
      const modalX = document.querySelector('.modal .modal-x');
      if (modalX) modalX.click();
    }
  });

  // 每日翻转（跨午夜挂着时）
  setInterval(() => STORE.tickDaily(), 60 * 1000);

  UI.show('home');

  // 新玩家欢迎
  if (STORE.state.totals.answered === 0 && !localStorage.getItem('kq_welcomed')) {
    localStorage.setItem('kq_welcomed', '1');
    setTimeout(() => {
      UI.toast('欢迎来到五十音物語！从「冒险闯关」的 あ行开始吧', '🏮');
    }, 800);
  }
})();
