/* 御神签：每日一抽，摇出运势与当日加护 */
window.Omikuji = (function () {
  'use strict';
  const U = window.U, STORE = window.STORE, UI = window.UI, FX = window.FX, SFX = window.SFX;

  const NAME = { daikichi: '大吉', chukichi: '中吉', shokichi: '小吉', kichi: '吉', suekichi: '末吉', kyo: '凶' };
  const CLS = { daikichi: 'f-best', chukichi: 'f-good', shokichi: 'f-good', kichi: 'f-mid', suekichi: 'f-mid', kyo: 'f-bad' };

  function open() {
    const done = STORE.omikujiDone();
    const body = U.el(`<div class="omikuji"></div>`);
    const m = UI.modal({ title: '御神签 · 每日一抽', body, onClose: null });

    if (done) {
      const o = STORE.state.omikuji;
      body.innerHTML = `
        <div class="omikuji-paper stamp-in ${CLS[o.fortune] || ''}">
          <span class="omikuji-fortune">${NAME[o.fortune] || o.fortune}</span>
          <p class="omikuji-line">${o.line || '今日已参拜。'}</p>
          ${(o.buffUntil || 0) > Date.now() ? '<div class="omikuji-buff">✨ 签运加护生效中：今日 XP ×2</div>' : ''}
        </div>
        <div class="modal-actions"><button class="btn btn-primary" id="om-ok">承蒙关照</button></div>`;
      body.querySelector('#om-ok').addEventListener('click', () => m.close());
      return;
    }

    body.innerHTML = `
      <div class="omikuji-stage">
        <button class="omikuji-box" id="om-box" aria-label="摇签"><span>🎋</span></button>
        <p class="col-tip">心怀一问，点盒子摇签</p>
      </div>`;
    const box = body.querySelector('#om-box');
    box.addEventListener('click', () => {
      if (box.classList.contains('shaking')) return;
      box.classList.add('shaking');
      SFX.omikujiShake();
      setTimeout(() => {
        const o = STORE.drawOmikuji();
        const best = o.fortune === 'daikichi';
        body.innerHTML = `
          <div class="omikuji-paper stamp-in ${CLS[o.fortune] || ''}">
            <span class="omikuji-fortune">${NAME[o.fortune]}</span>
            <p class="omikuji-line">${o.line}</p>
            ${(o.buffUntil || 0) > Date.now() ? '<div class="omikuji-buff">✨ 签运加护：今日 XP ×2</div>' : ''}
            ${best ? '<div class="omikuji-buff">🌸 大吉贺礼：花瓣 +30</div>' : ''}
          </div>
          <div class="modal-actions"><button class="btn btn-primary" id="om-ok">承蒙关照</button></div>`;
        body.querySelector('#om-ok').addEventListener('click', () => { m.close(); UI.syncTopbar(); });
        if (best) { FX.fireworksShow(7); FX.confettiBurst(); SFX.fanfare(); }
        else if (o.fortune === 'chukichi' || o.fortune === 'shokichi') FX.burstAtEl(body.querySelector('.omikuji-paper'), 'confetti');
        SFX.stamp();
        UI.syncTopbar();
      }, 1000);
    });
  }

  return { open };
})();
